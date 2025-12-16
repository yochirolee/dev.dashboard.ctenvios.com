import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { OrderItems } from "@/data/types";

const formSchema = z
   .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      type: z.nativeEnum(issueType).optional(),
      priority: z.nativeEnum(issuePriority).optional(),
      order_id: z.number().positive("Order ID is required"),
      affected_parcel_ids: z.array(z.number().positive()).min(1, "At least one parcel must be selected"),
   })
   .refine((data) => data.order_id && data.affected_parcel_ids.length > 0, {
      message: "Order ID and at least one parcel must be selected",
   });

type FormValues = z.infer<typeof formSchema>;

interface CreateIssueFormProps {
   initialOrderId?: number;
   initialParcelId?: number;
   onSuccess?: () => void;
}

export function CreateIssueForm({ initialOrderId, initialParcelId, onSuccess }: CreateIssueFormProps) {
   const navigate = useNavigate();
   const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId?.toString() || "");
   const [selectedParcelIds, setSelectedParcelIds] = useState<number[]>([]);

   const {
      data: orderParcels,
      isLoading: isLoadingParcels,
      error: orderParcelsError,
   } = useOrders.getParcelsByOrderId(Number(orderIdInput) || 0);

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: "",
         description: "",
         type: undefined,
         priority: undefined,
         order_id: initialOrderId,
         affected_parcel_ids: [],
      },
   });

   // Update form when order changes
   useEffect(() => {
      if (orderParcels?.id) {
         const currentOrderId = form.getValues("order_id");
         if (currentOrderId !== orderParcels.id) {
            form.setValue("order_id", orderParcels.id, { shouldValidate: true, shouldDirty: false });
         }
         // Pre-select initial parcel if provided and order is loaded
         if (initialParcelId && orderParcels.parcels) {
            const parcelExists = orderParcels.parcels.some((item: OrderItems) => item.id === initialParcelId);
            if (parcelExists && !selectedParcelIds.includes(initialParcelId)) {
               setSelectedParcelIds([initialParcelId]);
            }
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [orderParcels?.id, initialParcelId]);

   // Update form when selected parcels change - use JSON string comparison to avoid reference issues
   const prevSelectedParcelIdsStringRef = useRef<string>("");

   useEffect(() => {
      const currentIdsString = JSON.stringify([...selectedParcelIds].sort((a, b) => a - b));
      const prevString = prevSelectedParcelIdsStringRef.current;
      if (prevString !== currentIdsString) {
         form.setValue("affected_parcel_ids", selectedParcelIds, { shouldValidate: true, shouldDirty: false });
         prevSelectedParcelIdsStringRef.current = currentIdsString;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedParcelIds]);

   const handleSelectAllParcels = () => {
      if (!orderParcels?.parcels) return;
      const allParcelIds = orderParcels.parcels.map((item: OrderItems) => item.id);
      const newIds = selectedParcelIds.length === allParcelIds.length ? [] : allParcelIds;
      setSelectedParcelIds(newIds);
   };

   const createIssueMutation = useIssues.create({
      onSuccess: async (data) => {
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

   const orderItems = orderParcels?.parcels || [];

   return (
      <Card className="p-4 ">
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
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
                              form.setValue("affected_parcel_ids", [], { shouldValidate: true });
                           }}
                           placeholder="Enter order ID"
                        />
                        {isLoadingParcels && <Spinner />}
                     </div>
                     {orderParcelsError && (
                        <p className="text-sm text-destructive mt-1">Order not found. Please check the order ID.</p>
                     )}
                     {orderParcels && (
                        <p className="text-sm text-muted-foreground mt-1">
                           Order #{orderParcels.id} • {orderItems.length} parcel{orderItems.length !== 1 ? "s" : ""}
                        </p>
                     )}
                     <FieldError>{form.formState.errors.order_id?.message}</FieldError>
                  </FieldContent>
               </Field>

               {/* Parcels Selection */}
               {orderParcels && orderItems.length > 0 && (
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
                    
                     <FieldError>{form.formState.errors.affected_parcel_ids?.message}</FieldError>
                  </Card>
               )}

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
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-4 border-t p-2 md:p-4">
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
               <Button
                  type="submit"
                  disabled={
                     createIssueMutation.isPending ||
                     !orderParcels ||
                     !orderParcels.parcels ||
                     selectedParcelIds.length === 0
                  }
               >
                  {createIssueMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Issue
               </Button>
            </div>
         </form>
      </Card>
   );
}
