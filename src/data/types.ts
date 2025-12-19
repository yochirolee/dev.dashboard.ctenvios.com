import { z } from "zod";
import { isValidCubanCI } from "@/lib/cents-utils";

export const customerSchema = z.object({
   id: z.number().optional(),
   first_name: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
   middle_name: z.string().optional(),
   last_name: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
   second_last_name: z.string().optional(),
   email: z.string().email().optional().or(z.literal("")),
   identity_document: z.string().optional().or(z.literal("")),
   mobile: z
      .string()
      .regex(/^(\+53)?[5-9]\d{7}$/, "Formato inválido. Use +53 seguido de 8 dígitos")
      .or(z.literal(""))
      .optional(),
   phone: z
      .string()
      .regex(/^(\+53)?[5-9]\d{7}$/, "Formato inválido. Use +53 seguido de 8 dígitos")
      .or(z.literal(""))
      .optional(),
   address: z.string().optional(),
});
export const receiverSchema = z
   .object({
      id: z.number().optional(),
      first_name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
      middle_name: z.string().optional(),
      last_name: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
      second_last_name: z
         .string()
         .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
         .regex(/^[a-zA-Z]+$/, "Solo se permiten letras"),
      email: z.string().email().or(z.literal("")).optional().nullable(),
      phone: z
         .string()
         .regex(/^(\+53)?[5-9]\d{7}$/, "Formato inválido. Use +53 seguido de 8 dígitos")
         .or(z.literal(""))
         .optional(),
      mobile: z
         .string()
         .regex(/^(\+53)?[5-9]\d{7}$/, "Formato inválido. Use +53 seguido de 8 dígitos")
         .or(z.literal(""))
         .optional(),
      address: z.string().min(3, "La dirección debe tener al menos 3 caracteres"),
      ci: z
         .string()
         .length(11, "El CI debe tener exactamente 11 dígitos")
         .refine((ci) => /^[0-9]+$/.test(ci), {
            message: "El CI solo puede contener números",
         })
         .refine(isValidCubanCI, {
            message: "El CI no es válido según su fecha o dígito de control",
         }),
      province_id: z.number({ message: "La provincia es requerida" }),
      passport: z.string().nullable().optional(),
      city_id: z.number({ message: "La ciudad es requerida" }),
      city: z.string().optional(),
      province: z.string().optional(),
   })
   .refine((data) => data.phone || data.mobile, {
      message: "El teléfono o el celular es requerido",
      path: ["phone", "mobile"],
   });

export const shippingRateSchema = z.object({
   id: z.number().optional(),
   product_id: z.number(),
   name: z.string(),
   description: z.string(),
   buyer_agency_id: z.number(),
   seller_agency_id: z.number(),
   service_id: z.number(),
   price_in_cents: z.number(),
   cost_in_cents: z.number(),
   is_active: z.boolean(),
   unit: z.enum(["PER_LB", "FIXED"]),
   min_weight: z.number(),
   max_weight: z.number(),
});

export const paymentSchema = z.object({
   id: z.number().optional(),
   amount_in_cents: z.number().min(0),
   charge_in_cents: z.number().min(0).optional(),
   method: z.string().min(1, "You must select a payment method to continue."),
   reference: z.string().min(0).optional(),
   notes: z.string().min(0).optional(),
});
export const discountSchema = z.object({
   id: z.number().optional(),
   discount_in_cents: z.number().min(0),
   description: z.string().min(0).optional(),
   type: z.enum(["CASH", "PERCENT", "RATE"]),
   rate: z.number().optional(),
});
export type Discount = z.infer<typeof discountSchema>;
export const productSchema = z.object({
   id: z.number().optional(),
   name: z.string().min(1, "El nombre es requerido"),
   provider_id: z.number().min(1),
   description: z.string().min(1, "La descripción es requerida"),
   unit: z.enum(["PER_LB", "FIXED"]),
   type: z.enum(["SHIPPING", "CUSTOMS", "DELIVERY"]),
   length: z.number().min(0).optional(),
   width: z.number().min(0).optional(),
   height: z.number().min(0).optional(),
   is_active: z.boolean().default(true),
});

export const orderItemSchema = z.object({
   description: z.string().min(1, "La descripción es requerida"),
   weight: z.number().min(0, "El peso es requerido"),
   customs_id: z.number().min(0),
   customs_fee_in_cents: z.number().min(0).optional(),
   insurance_fee_in_cents: z.number().min(0).optional(),
   charge_fee_in_cents: z.number().min(0).optional(),
   delivery_fee_in_cents: z.number().min(0).optional(),
   price_in_cents: z.number().min(0),
   cost_in_cents: z.number().min(0),
   rate_id: z.number().min(0),
   unit: z.enum(["PER_LB", "FIXED"]),
});
export const orderSchema = z.object({
   id: z.number().optional(),
   customer_id: z.number().min(0),
   receiver_id: z.number().min(0),
   agency_id: z.number().min(0),
   user_id: z.string().min(0),
   service_id: z.number().min(0),
   order_items: z.array(orderItemSchema).min(1, "La orden debe tener al menos 1 item"),
   charge_in_cents: z.number().min(0).optional(),
   total_in_cents: z.number().optional().default(0),
   total_delivery_fee_in_cents: z.number().min(0).optional().default(0),
   paid_in_cents: z.number().min(0).optional().default(0),
   created_at: z.string().optional(),
   updated_at: z.string().optional(),
});

export const customsRatesSchema = z.object({
   id: z.number().optional(),
   country_id: z.number().min(1, "Country ID is required"),
   name: z.string().min(1, "Name is required"),
   description: z.string().optional(),
   chapter: z.string().optional(),
   fee_type: z.enum(["UNIT", "WEIGHT", "VALUE"]).optional().default("UNIT"),
   fee_in_cents: z.number().min(0, "Fee must be greater than 0"),
   custom_value: z.number().min(0, "Custom value must be greater than 0").optional().default(0),
   min_weight: z.number().optional().default(0),
   max_weight: z.number().optional().default(0),
   max_quantity: z.number().optional().default(0),
});

export const agencySchema = z
   .object({
      id: z.number().optional(),
      name: z.string().min(1, "El nombre es requerido"),
      address: z.string().min(1, "La dirección es requerida"),
      agency_id: z.number().optional(),
      service_id: z.number().optional(),
      phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
      contact: z.string(),
      email: z.string().optional(),
      website: z.string().optional(),
      logo: z.string().url().optional(),
      agency_type: z.enum(["FORWARDER", "AGENCY", "RESELLER"]).optional(),
      parent_agency_id: z.number().optional().nullable(),
   })
   .refine(
      (data) => {
         // parent_agency_id is required for AGENCY and RESELLER types, but only if they're explicitly set
         if (data.agency_type && data.agency_type !== "FORWARDER" && !data.parent_agency_id) {
            return false;
         }
         return true;
      },
      {
         message: "La agencia padre es requerida para tipos AGENCY y RESELLER",
         path: ["parent_agency_id"],
      }
   );

export const providerSchema = z.object({
   id: z.number().optional(),
   name: z.string().min(1, "El nombre es requerido"),
   contact: z.string().optional(),
   address: z.string().min(1, "La dirección es requerida"),
   phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
   email: z.string().email().optional(),
   website: z.string().url().optional(),
   logo: z.string().url().optional(),
});

export const serviceSchema = z.object({
   id: z.number().optional(),
   name: z.string().min(1, "El nombre es requerido"),
   description: z.string().min(1, "La descripción es requerida"),
   service_type: z.enum(["MARITIME", "AIR"]),
   is_active: z.boolean().default(true),
   provider_id: z.number().min(1, "El proveedor es requerido"),
   forwarder_id: z.number().min(1, "El forwarder es requerido"),
});
export const userSchema = z
   .object({
      id: z.string().optional(),
      email: z.string().email({ message: "Email inválido" }),
      image: z.string().url().optional(),
      password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
      repeat_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
      role: z.string().min(1, "El rol es requerido"),
      phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
      name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
      agency_id: z.number().optional(),
   })
   .refine((data) => data.password === data.repeat_password, {
      message: "Las contraseñas no coinciden",
      path: ["repeat_password"],
   });

export type Agency = z.infer<typeof agencySchema>;
export type Provider = z.infer<typeof providerSchema>;
export type Receiver = z.infer<typeof receiverSchema>;
export type Customer =
   | (z.infer<typeof customerSchema> & {
        id: string;
        setSelectedCustomer: (customer: Customer) => void;
     })
   | null;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Service = z.infer<typeof serviceSchema>;

export interface Province {
   id: number;
   name: string;
   cities: City[];
}

export interface City {
   id: number;
   name: string;
}

export type Payment = z.infer<typeof paymentSchema>;

export type Customs = z.infer<typeof customsRatesSchema>;

export type User = z.infer<typeof userSchema>;

export type ShippingRate = z.infer<typeof shippingRateSchema>;

export type Product = z.infer<typeof productSchema>;

export interface OrderHistory {
   id: number;
   payment_status: string;
   agency: Agency;
   customer: Customer;
   receiver: Receiver;
   service: Service;
   order_items: OrderItem[];
   total_in_cents: number;
   paid_in_cents: number;
   created_at: string;
   updated_at: string;
   user: User;
   events: Event[];
   charge_in_cents: number;
   shipping_fee_in_cents: number;
   tax_in_cents: number;
   discount_in_cents: number;
}
export interface OrderItems {
   id: number;
   hbl: string;
   description: string;
   weight: number;
   price_in_cents: number;
   rate_id: number;
   unit: string;
   insurance_fee_in_cents: number;
   delivery_fee_in_cents: number;
   customs_fee_in_cents: number;
   customs_id: number;
   charge_fee_in_cents: number;
   rate: ShippingRate;
   subtotal: number;
}

/// DISPATCH
export const dispatchStatus = {
   DRAFT: "DRAFT",
   DISPACHED: "DISPACHED",
   RECEIVED: "RECEIVED",
   DISCREPANCY: "DISCREPANCY",
   CANCELLED: "CANCELLED",
} as const;
export const paymentStatus = {
   PENDING: "PENDING",
   PAID: "PAID",
   PARTIALLY_PAID: "PARTIALLY_PAID",
   CANCELLED: "CANCELLED",
} as const;

export const parcelStatus = {
   IN_AGENCY: "IN_AGENCY",
   IN_PALLLET: "IN_PALLLET",
   IN_DISPATCH: "IN_DISPATCH",
   RECEIVED_IN_DISPATCH: "RECEIVED_IN_DISPATCH",
   IN_CONTAINER: "IN_CONTAINER",
} as const;
export type ParcelStatus = (typeof parcelStatus)[keyof typeof parcelStatus];
export type DispatchStatus = (typeof dispatchStatus)[keyof typeof dispatchStatus];
export type PaymentStatus = (typeof paymentStatus)[keyof typeof paymentStatus];

// Issue Types
export const issueType = {
   COMPLAINT: "Reclamación", // Reclamación
   DAMAGE: "Daño", // Daño
   LOSS: "Pérdida", // Pérdida
   DELAY: "Retraso", // Retraso
   MISSING_ITEM: "Artículo faltante", // Artículo faltante
   WRONG_ADDRESS: "Dirección incorrecta", // Dirección incorrecta
   OTHER: "Otro", // Otro
} as const;

export const issuePriority = {
   LOW: "Bajo",
   MEDIUM: "Medio",
   HIGH: "Alto",
   URGENT: "Urgente",
} as const;

export const issueStatus = {
   OPEN: "OPEN",
   IN_PROGRESS: "IN_PROGRESS",
   RESOLVED: "RESOLVED",
   CLOSED: "CLOSED",
} as const;

export type IssueType = keyof typeof issueType; // Use keys (COMPLAINT, DAMAGE, etc.) since DB stores keys
export type IssuePriority = keyof typeof issuePriority; // Use keys (LOW, MEDIUM, etc.) since DB stores keys
export type IssueStatus = (typeof issueStatus)[keyof typeof issueStatus];

export interface IssueComment {
   id: number;
   content: string;
   is_internal: boolean;
   created_at: string;
   updated_at: string;
   user: {
      id: string;
      name: string;
      email: string;
   };
}

export interface IssueAttachment {
   id: number;
   file_url: string;
   file_name: string;
   file_type: string;
   file_size?: number;
   description?: string;
   created_at: string;
   created_by: {
      id: string;
      name: string;
   };
}

export interface Issue {
   id: number;
   legacy_order_id?: number;
   title: string;
   description: string;
   type: IssueType;
   priority: IssuePriority;
   status: IssueStatus;
   order_id?: number;
   parcel_id?: number;
   affected_parcel_ids?: number[];
   order_item_hbl?: string;
   assigned_to_id?: string;
   assigned_to?: {
      id: string;
      name: string;
      email: string;
   };
   created_by: {
      id: string;
      name: string;
      email: string;
   };
   resolution_notes?: string;
   created_at: string;
   updated_at: string;
   comments?: IssueComment[];
   attachments?: IssueAttachment[];
   order?: {
      id: number;
      partner_order_id?: string;
   };
   parcel?: {
      id: number;
      hbl: string;
   };
   _count?: {
      comments?: number;
      attachments?: number;
   };
}

export const createIssueSchema = z
   .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      type: z.nativeEnum(issueType).optional(),
      priority: z.nativeEnum(issuePriority).optional(),
      order_id: z.number().positive().optional(),
      parcel_id: z.number().positive().optional(),
      affected_parcel_ids: z.array(z.number().positive()).optional(),
      order_item_hbl: z.string().optional(),
      assigned_to_id: z.string().uuid().optional(),
   })
   .refine(
      (data) => data.order_id || data.parcel_id || (data.affected_parcel_ids && data.affected_parcel_ids.length > 0),
      { message: "Either order_id, parcel_id, or affected_parcel_ids must be provided" }
   )
   .refine((data) => !data.affected_parcel_ids || data.order_id, {
      message: "affected_parcel_ids requires order_id",
   });

export const createLegacyIssueSchema = z
   .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      type: z.nativeEnum(issueType).optional(),
      priority: z.nativeEnum(issuePriority).optional(),
      legacy_order_id: z.number().positive().optional(),
      parcel_id: z.number().positive().optional(),
      affected_parcel_ids: z.array(z.number().positive()).optional(),
      order_item_hbl: z.string().optional(),
      assigned_to_id: z.string().uuid().optional(),
   })
   .refine(
      (data) =>
         data.legacy_order_id || data.parcel_id || (data.affected_parcel_ids && data.affected_parcel_ids.length > 0),
      { message: "Either legacy_order_id, parcel_id, or affected_parcel_ids must be provided" }
   )
   .refine((data) => !data.affected_parcel_ids || data.legacy_order_id, {
      message: "affected_parcel_ids requires legacy_order_id",
   });

export const updateIssueSchema = z.object({
   title: z.string().min(1).optional(),
   description: z.string().min(1).optional(),
   type: z.nativeEnum(issueType).optional(),
   priority: z.nativeEnum(issuePriority).optional(),
   status: z.nativeEnum(issueStatus).optional(),
   assigned_to_id: z.string().uuid().nullable().optional(),
   resolution_notes: z.string().optional(),
});

export const addCommentSchema = z.object({
   content: z.string().min(1, "Content is required"),
   is_internal: z.boolean().optional(),
});

export const addAttachmentSchema = z.object({
   file_url: z.string().url("Invalid file URL"),
   file_name: z.string().min(1, "File name is required"),
   file_type: z.string().min(1, "File type is required"),
   file_size: z.number().positive().optional(),
   description: z.string().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type CreateLegacyIssueInput = z.infer<typeof createLegacyIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type AddAttachmentInput = z.infer<typeof addAttachmentSchema>;

export interface Dispatch {
   id: number;
   status: DispatchStatus;
   sender_agency: {
      id: number;
      name: string;
   };
   receiver_agency: {
      id: number;
      name: string;
   };
   user: {
      id: number;
      name: string;
   };
   declared_parcels_count: number;
   received_parcels_count: number;
   declared_weight: number;
   weight: number;
   declared_cost_in_cents: number;
   cost_in_cents: number;
   payment_status: PaymentStatus;

   created_at: string;
   updated_at: string;
   created_by: {
      id: number;
      name: string;
   };
   received_by: {
      id: number;
      name: string;
   };
   paid_by: {
      id: number;
      name: string;
   };
   _count: {
      order_items: number;
   };
}

