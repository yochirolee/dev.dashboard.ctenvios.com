import { z } from "zod";
import { isValidCubanCI } from "@/lib/utils";

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
		first_name: z.string().min(2, { message: "First name must be at least 2 characters long" }),
		middle_name: z.string().optional(),
		last_name: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
		second_last_name: z
			.string()
			.min(2, { message: "Last name must be at least 2 characters long" })
			.regex(/^[a-zA-Z]+$/, "Only letters are allowed"),
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
		province_id: z.number(),
		passport: z.string().nullable().optional(),
		city_id: z.number(),
		city: z.string().optional(),
		province: z.string().optional(),
	})
	.refine((data) => data.phone || data.mobile, {
		message: "El teléfono o el celular es requerido",
		path: ["phone", "mobile"],
	});

export const shippingRateSchema = z
	.object({
		id: z.number().optional(),
		agency_id: z.number(),
		name: z.string(),
		service_id: z.number(),
		rate_in_cents: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
		cost_in_cents: z.number().min(0, { message: "El precio de costo debe ser mayor a 0" }),
		is_active: z.boolean().default(true),
		rate_type: z.enum(["WEIGHT", "FIXED"]),
	})
	.refine((data) => data.rate_in_cents >= data.cost_in_cents, {
		message: "El precio público debe ser mayor o igual al precio de la agencia",
		path: ["rate_in_cents"],
	});
export const productRateSchema = z.object({
	id: z.number(),
	name: z.string(),
	rate_in_cents: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
	cost_in_cents: z.number().min(0, { message: "El precio de costo debe ser mayor a 0" }),
	rate_id: z.number().min(0),
	is_active: z.boolean().default(true),
	agency_id: z.number(),
	service_id: z.number(),
	rate_type: z.enum(["WEIGHT", "FIXED"]),
});
export const paymentSchema = z.object({
	id: z.number().optional(),
	amount_in_cents: z.number().min(0),
	charge_in_cents: z.number().min(0).optional(),
	method: z.string(),
	reference: z.string().min(0).optional(),
	notes: z.string().min(0).optional(),
});

export const itemsSchema = z.object({
	description: z.string().min(1),
	weight: z.number().min(0).optional(),
	customs_id: z.number().min(0),
	customs_fee_in_cents: z.number().min(0).optional(),
	insurance_fee_in_cents: z.number().min(0).optional(),
	rate_in_cents: z.number().min(0),
	rate_id: z.number().min(0),
});
export const invoiceSchema = z.object({
	id: z.number().optional(),
	customer_id: z.number().min(0),
	receiver_id: z.number().min(0),
	agency_id: z.number().min(0),
	user_id: z.string().min(0),
	service_id: z.number().min(0),
	items: z.array(itemsSchema).min(1, "La factura debe tener al menos 1 item"),
	charge_in_cents: z.number().min(0).optional(),
	total_in_cents: z.number().min(0),
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
	min_weight: z.number().optional().default(0),
	max_weight: z.number().optional().default(0),
	max_quantity: z.number().optional().default(0),
});

export const agencySchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "El nombre es requerido"),
	address: z.string().min(1, "La dirección es requerida"),
	phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
	contact: z.string().optional(),
	email: z.string().email().optional(),
	website: z.string().url().optional(),
	logo: z.string().url().optional(),
	agency_type: z.enum(["FORWARDER", "AGENCY", "RESELLER"]).optional(),
	parent_agency_id: z.number(),
});

export const providerSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "El nombre es requerido"),
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
		id: z.number().optional(),
		email: z.string().email("Email inválido"),
		image: z.string().url().optional(),
		password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
		repeat_password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
		role: z.string().min(1, "El rol es requerido"),
		phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
		agency_id: z.string().optional(),
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
export type Item = z.infer<typeof itemsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
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

export type ProductRate = z.infer<typeof productRateSchema>;
