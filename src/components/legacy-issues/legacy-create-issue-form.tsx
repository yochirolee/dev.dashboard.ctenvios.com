import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useLegacyIssues } from "@/hooks/use-legacy-issues";
import { useDebounce } from "use-debounce";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

const formSchema = z.object({
   title: z.string().min(1, "Title is required"),
   description: z.string().min(1, "Description is required"),
   legacy_order_id: z.number().positive("Order ID is required"),
   affected_parcel_ids: z.array(z.number().positive()).min(1, "At least one parcel must be selected"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateIssueFormProps {
   initialOrderId?: number;
   initialParcelId?: number;
   onSuccess?: () => void;
}
interface LegacyParcel {
   id: number;
   legacy_parcel_id?: number;
   tracking_number: string;
   description: string;
   weight: number;
}

export function LegacyCreateIssueForm({ initialOrderId, initialParcelId, onSuccess }: CreateIssueFormProps) {
   const navigate = useNavigate();
   const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId?.toString() || "");
   const [debouncedOrderIdInput] = useDebounce(orderIdInput, 500);
   const [selectedParcelIds, setSelectedParcelIds] = useState<number[]>([]);

   const {
      data: orderParcels,
      isLoading: isLoadingParcels,
      error: orderParcelsError,
   } = useLegacyIssues.getParcelsByOrderId(Number(debouncedOrderIdInput) || 0);

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: "",
         description: "",
         legacy_order_id: initialOrderId || undefined,
         affected_parcel_ids: [],
      },
   });

   // Update form when orderIdInput changes - set order_id immediately if valid
   useEffect(() => {
      const parsedOrderId = Number(orderIdInput);
      if (parsedOrderId > 0 && !isNaN(parsedOrderId)) {
         const currentOrderId = form.getValues("legacy_order_id");
         if (currentOrderId !== parsedOrderId) {
            form.setValue("legacy_order_id", parsedOrderId, { shouldValidate: true, shouldDirty: false });
         }
      } else if (orderIdInput === "" && initialOrderId) {
         // If input is cleared but we have an initialOrderId, keep it
         const currentOrderId = form.getValues("legacy_order_id");
         if (currentOrderId !== initialOrderId) {
            form.setValue("legacy_order_id", initialOrderId, { shouldValidate: true, shouldDirty: false });
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [orderIdInput]);

   // Update form when order parcels are loaded - ensure order_id matches
   useEffect(() => {
      if (orderParcels) {
         // Try both id and order_id fields to handle different API response structures
         const orderId = (orderParcels as any).order_id || orderParcels.id;
         if (orderId) {
            const currentOrderId = form.getValues("legacy_order_id");
            if (currentOrderId !== orderId) {
               form.setValue("legacy_order_id", orderId, { shouldValidate: true, shouldDirty: false });
            }
         }
         // Pre-select initial parcel if provided and order is loaded
         if (initialParcelId && orderParcels.parcels) {
            const parcelExists = orderParcels.parcels.some((item: LegacyParcel) => item.id === initialParcelId);
            if (parcelExists && !selectedParcelIds.includes(initialParcelId)) {
               setSelectedParcelIds([initialParcelId]);
            }
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [orderParcels, initialParcelId]);

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
      const allParcelIds = orderParcels.parcels.map((item: LegacyParcel) => item.id);
      const newIds = selectedParcelIds.length === allParcelIds.length ? [] : allParcelIds;
      setSelectedParcelIds(newIds);
   };

   const createIssueMutation = useLegacyIssues.create({
      onSuccess: async (data) => {
         toast.success("Issue created successfully");
         onSuccess?.();
         navigate(`/legacy-issues/${data.id}`);
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to create issue");
      },
   });

   function onSubmit(data: FormValues) {
      // Ensure legacy_order_id is set from input if not already set
      const parsedInputId = Number(orderIdInput);
      const orderId = data.legacy_order_id || (parsedInputId > 0 && !isNaN(parsedInputId) ? parsedInputId : undefined);

      if (!orderId || orderId <= 0 || isNaN(orderId)) {
         toast.error("Order ID is required");
         return;
      }

      if (!data.affected_parcel_ids || data.affected_parcel_ids.length === 0) {
         toast.error("At least one parcel must be selected");
         return;
      }

      // Ensure all parcel IDs are valid numbers
      const validParcelIds = data.affected_parcel_ids.map((id) => Number(id)).filter((id) => id > 0 && !isNaN(id));

      if (validParcelIds.length !== data.affected_parcel_ids.length) {
         toast.error("Some parcel IDs are invalid");
         return;
      }

      // Build payload with only defined values
      const payload: Record<string, unknown> = {
         title: data.title,
         description: data.description,
         legacy_order_id: Number(orderId),
         affected_parcel_ids: validParcelIds,
      };

      createIssueMutation.mutate(payload as any);
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
                     <InputGroup>
                        <InputGroupAddon align="inline-start">
                           <Search className="w-4 h-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                           value={orderIdInput}
                           onChange={(e) => setOrderIdInput(e.target.value)}
                           placeholder="Enter order ID"
                        />
                        <InputGroupAddon align="inline-end">
                           {isLoadingParcels && <Spinner className="w-4 h-4" />}
                        </InputGroupAddon>
                     </InputGroup>

                     {orderParcelsError && (
                        <FieldError className="text-sm text-destructive mt-1">
                           Order not found. Please check the order ID.
                        </FieldError>
                     )}
                     {orderParcels && (
                        <p className="text-sm text-muted-foreground mt-1">
                           Order #{(orderParcels as any).order_id || orderParcels.id} • {orderItems.length} parcel
                           {orderItems.length !== 1 ? "s" : ""}
                        </p>
                     )}
                     <FieldError>{form.formState.errors.legacy_order_id?.message}</FieldError>
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
                        {orderItems.map((item: LegacyParcel) => (
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
                                 aria-label={`Select parcel ${item.tracking_number}`}
                              />
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium">HBL: {item.tracking_number}</span>
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
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-4 border-t p-2 md:p-4">
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                     onSuccess?.();
                     navigate("/legacy-issues");
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
