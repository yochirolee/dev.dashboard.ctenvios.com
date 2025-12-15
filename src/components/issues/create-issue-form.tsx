import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
   Field,
   FieldContent,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
   FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueType, issuePriority } from "@/data/types";
import { useIssues } from "@/hooks/use-issues";
import { useOrders } from "@/hooks/use-orders";
import { Loader2, Plus, X, Paperclip } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { OrderItems } from "@/data/types";

const addCommentSchema = z.object({
   content: z.string().min(1, "Content is required"),
   is_internal: z.boolean().optional(),
});

const formSchema = z
   .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      type: z.nativeEnum(issueType).optional(),
      priority: z.nativeEnum(issuePriority).optional(),
      order_id: z.number().positive("Order ID is required"),
      affected_parcel_ids: z.array(z.number().positive()).min(1, "At least one parcel must be selected"),
      comments: z.array(addCommentSchema).optional(),
      images: z.array(z.instanceof(File)).optional(),
   })
   .refine((data) => data.order_id && data.affected_parcel_ids.length > 0, {
      message: "Order ID and at least one parcel must be selected",
   });

type FormValues = z.infer<typeof formSchema>;

interface CreateIssueFormProps {
   initialOrderId?: number;
   onSuccess?: () => void;
}

export function CreateIssueForm({ initialOrderId, onSuccess }: CreateIssueFormProps) {
   const navigate = useNavigate();
   const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId?.toString() || "");
   const [selectedParcelIds, setSelectedParcelIds] = useState<number[]>([]);
   const [imageFiles, setImageFiles] = useState<File[]>([]);

   const { data: order, isLoading: isLoadingOrder, error: orderError } = useOrders.getById(Number(orderIdInput) || 0);

   const addCommentMutation = useIssues.addComment({});
   const addAttachmentMutation = useIssues.addAttachment({});

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: "",
         description: "",
         type: undefined,
         priority: undefined,
         order_id: initialOrderId,
         affected_parcel_ids: [],
         comments: [],
         images: [],
      },
   });

   const {
      fields: commentFields,
      append: appendComment,
      remove: removeComment,
   } = useFieldArray({
      control: form.control,
      name: "comments",
   });

   // Update form when order changes
   useEffect(() => {
      if (order?.id) {
         const currentOrderId = form.getValues("order_id");
         if (currentOrderId !== order.id) {
            form.setValue("order_id", order.id, { shouldValidate: false, shouldDirty: false });
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [order?.id]);

   // Update form when selected parcels change - use JSON string comparison to avoid reference issues
   const prevSelectedParcelIdsStringRef = useRef<string>("");
   const isUpdatingFromCheckboxRef = useRef(false);

   useEffect(() => {
      if (isUpdatingFromCheckboxRef.current) {
         isUpdatingFromCheckboxRef.current = false;
         return;
      }

      const currentIdsString = JSON.stringify([...selectedParcelIds].sort((a, b) => a - b));
      const prevString = prevSelectedParcelIdsStringRef.current;
      if (prevString !== currentIdsString) {
         form.setValue("affected_parcel_ids", selectedParcelIds, { shouldValidate: false, shouldDirty: false });
         prevSelectedParcelIdsStringRef.current = currentIdsString;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedParcelIds]);

   // Update form when images change
   const prevImageFilesRef = useRef<File[]>([]);
   useEffect(() => {
      if (prevImageFilesRef.current.length !== imageFiles.length) {
         form.setValue("images", imageFiles, { shouldValidate: false, shouldDirty: false });
         prevImageFilesRef.current = [...imageFiles];
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [imageFiles]);

   const handleSelectAllParcels = () => {
      if (!order?.order_items) return;
      const allParcelIds = order.order_items.map((item: OrderItems) => item.id);
      const newIds = selectedParcelIds.length === allParcelIds.length ? [] : allParcelIds;
      setSelectedParcelIds(newIds);
   };

   const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      setImageFiles((prev) => [...prev, ...imageFiles]);
   };

   const removeImage = (index: number) => {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
   };

   // Convert File to base64 or upload to get URL
   const uploadImageAndGetUrl = async (file: File): Promise<string> => {
      // For now, convert to base64 data URL
      // In production, you'd upload to a file storage service and get a URL
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onloadend = () => {
            resolve(reader.result as string);
         };
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });
   };

   const createIssueMutation = useIssues.create({
      onSuccess: async (data) => {
         // Upload images and create attachments
         if (imageFiles.length > 0) {
            for (const imageFile of imageFiles) {
               const fileUrl = await uploadImageAndGetUrl(imageFile);
               await addAttachmentMutation.mutateAsync({
                  id: data.id,
                  data: {
                     file_url: fileUrl,
                     file_name: imageFile.name,
                     file_type: imageFile.type,
                     file_size: imageFile.size,
                     description: `Image attachment: ${imageFile.name}`,
                  },
               });
            }
         }

         // Add comments if any
         if (form.getValues("comments") && form.getValues("comments")!.length > 0) {
            for (const comment of form.getValues("comments")!) {
               await addCommentMutation.mutateAsync({
                  id: data.id,
                  data: { content: comment.content, is_internal: comment.is_internal || false },
               });
            }
         }

         toast.success("Issue created successfully");
         onSuccess?.();
         navigate(`/issues/${data.id}`);
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to create issue");
      },
   });

   function onSubmit(data: FormValues) {
      createIssueMutation.mutate({
         title: data.title,
         description: data.description,
         type: data.type,
         priority: data.priority,
         order_id: data.order_id,
         affected_parcel_ids: data.affected_parcel_ids,
      });
   }

   const orderItems = order?.order_items || [];

   return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <FieldGroup>
               {/* Order ID Input */}
               <Field>
                  <FieldLabel>Order ID *</FieldLabel>
                  <FieldContent>
                     <div className="flex gap-2">
                        <Input
                           type="number"
                           value={orderIdInput}
                           onChange={(e) => {
                              setOrderIdInput(e.target.value);
                              setSelectedParcelIds([]);
                           }}
                           placeholder="Enter order ID"
                        />
                        {isLoadingOrder && <Spinner />}
                     </div>
                     {orderError && (
                        <p className="text-sm text-destructive mt-1">Order not found. Please check the order ID.</p>
                     )}
                     {order && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="font-semibold">Order #{order.id}</p>
                                 <p className="text-sm text-muted-foreground">
                                    {orderItems.length} parcel{orderItems.length !== 1 ? "s" : ""} found
                                 </p>
                              </div>
                              <Badge variant="outline">{order.status}</Badge>
                           </div>
                        </div>
                     )}
                     <FieldError>{form.formState.errors.order_id?.message}</FieldError>
                  </FieldContent>
               </Field>

               {/* Parcels Selection */}
               {order && orderItems.length > 0 && (
                  <Card className="p-4">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                           <FieldLabel>Select Parcels with Issues *</FieldLabel>
                           <FieldDescription>Select the parcels that have issues</FieldDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleSelectAllParcels}>
                           {selectedParcelIds.length === orderItems.length ? "Deselect All" : "Select All"}
                        </Button>
                     </div>
                     <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {orderItems.map((item: OrderItems) => (
                           <div
                              key={item.id}
                              className={cn(
                                 "flex items-center gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors",
                                 selectedParcelIds.includes(item.id) && "bg-muted border-primary"
                              )}
                           >
                              <Checkbox
                                 checked={selectedParcelIds.includes(item.id)}
                                 onCheckedChange={(checked) => {
                                    const parcelId = item.id; // Capture item.id in closure
                                    isUpdatingFromCheckboxRef.current = true;
                                    if (checked === true) {
                                       setSelectedParcelIds((prev) => {
                                          if (prev.includes(parcelId)) return prev;
                                          return [...prev, parcelId];
                                       });
                                    } else if (checked === false) {
                                       setSelectedParcelIds((prev) => prev.filter((id) => id !== parcelId));
                                    }
                                 }}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                 }}
                                 aria-label={`Select parcel ${item.hbl}`}
                              />
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium">HBL: {item.hbl}</span>
                                    <Badge variant="secondary">{item.weight} lbs</Badge>
                                 </div>
                                 <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     {selectedParcelIds.length === 0 && (
                        <p className="text-sm text-destructive mt-2">Please select at least one parcel</p>
                     )}
                     <FieldError>{form.formState.errors.affected_parcel_ids?.message}</FieldError>
                  </Card>
               )}

               <FieldSeparator />

               <Field>
                  <FieldLabel>Title *</FieldLabel>
                  <FieldContent>
                     <Input {...form.register("title")} placeholder="Enter issue title" />
                     <FieldError>{form.formState.errors.title?.message}</FieldError>
                  </FieldContent>
               </Field>

               <Field>
                  <FieldLabel>Description *</FieldLabel>
                  <FieldContent>
                     <Textarea {...form.register("description")} placeholder="Describe the issue in detail" rows={4} />
                     <FieldError>{form.formState.errors.description?.message}</FieldError>
                  </FieldContent>
               </Field>

               <FieldSeparator />

               <div className="grid grid-cols-2 gap-4">
                  <Field>
                     <FieldLabel>Type</FieldLabel>
                     <FieldContent>
                        <Controller
                           control={form.control}
                           name="type"
                           render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {Object.values(issueType).map((type) => (
                                       <SelectItem key={type} value={type}>
                                          {type}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           )}
                        />
                        <FieldError>{form.formState.errors.type?.message}</FieldError>
                     </FieldContent>
                  </Field>

                  <Field>
                     <FieldLabel>Priority</FieldLabel>
                     <FieldContent>
                        <Controller
                           control={form.control}
                           name="priority"
                           render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {Object.values(issuePriority).map((priority) => (
                                       <SelectItem key={priority} value={priority}>
                                          {priority}
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                           )}
                        />
                        <FieldError>{form.formState.errors.priority?.message}</FieldError>
                     </FieldContent>
                  </Field>
               </div>

               <FieldSeparator />

               {/* Comments Section */}
               <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                        <FieldLabel>Comments</FieldLabel>
                        <FieldDescription>Add initial comments to the issue</FieldDescription>
                     </div>
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendComment({ content: "", is_internal: false })}
                     >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Comment
                     </Button>
                  </div>

                  {commentFields.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-4">No comments added</p>
                  ) : (
                     <div className="space-y-3">
                        {commentFields.map((field, index) => (
                           <Card key={field.id} className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                 <div className="flex-1 space-y-2">
                                    <Textarea
                                       {...form.register(`comments.${index}.content`)}
                                       placeholder="Comment content"
                                       rows={2}
                                    />
                                    <div className="flex items-center gap-2">
                                       <Controller
                                          control={form.control}
                                          name={`comments.${index}.is_internal`}
                                          render={({ field: checkboxField }) => (
                                             <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                   type="checkbox"
                                                   checked={checkboxField.value || false}
                                                   onChange={(e) => checkboxField.onChange(e.target.checked)}
                                                   className="rounded"
                                                />
                                                <span>Internal only</span>
                                             </label>
                                          )}
                                       />
                                    </div>
                                 </div>
                                 <Button type="button" variant="ghost" size="icon" onClick={() => removeComment(index)}>
                                    <X className="w-4 h-4" />
                                 </Button>
                              </div>
                           </Card>
                        ))}
                     </div>
                  )}
               </Card>

               {/* Image Upload Section */}
               <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                     <div>
                        <FieldLabel>Images</FieldLabel>
                        <FieldDescription>Upload images related to the issue</FieldDescription>
                     </div>
                     <div>
                        <input
                           type="file"
                           accept="image/*"
                           multiple
                           onChange={handleImageUpload}
                           className="hidden"
                           id="image-upload"
                        />
                        <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => document.getElementById("image-upload")?.click()}
                        >
                           <Paperclip className="w-4 h-4 mr-2" />
                           Upload Images
                        </Button>
                     </div>
                  </div>

                  {imageFiles.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-4">No images uploaded</p>
                  ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {imageFiles.map((file, index) => (
                           <div key={`${file.name}-${file.size}-${index}`} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                 <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                              <Button
                                 type="button"
                                 variant="destructive"
                                 size="icon"
                                 className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                 onClick={() => removeImage(index)}
                              >
                                 <X className="w-3 h-3" />
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 truncate" title={file.name}>
                                 {file.name}
                              </p>
                           </div>
                        ))}
                     </div>
                  )}
               </Card>
            </FieldGroup>
         </ScrollArea>

         <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
               type="button"
               variant="outline"
               onClick={() => {
                  onSuccess?.();
                  navigate("/issues");
               }}
            >
               Cancel
            </Button>
            <Button type="submit" disabled={createIssueMutation.isPending || !order || selectedParcelIds.length === 0}>
               {createIssueMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Create Issue
            </Button>
         </div>
      </form>
   );
}
