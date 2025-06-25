import { z } from "zod";
import { isValidCubanCI } from "@/lib/utils";

export const customerSchema = z.object({
	id: z.number().optional(),
	first_name: z
		.string()
		.min(3, { message: "First name must be at least 3 characters long" })
		.regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
	second_name: z.string().optional(),
	identity_document: z.string().optional(),
	last_name: z
		.string()
		.min(1)
		.regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
	second_last_name: z
		.string()
		.min(1)
		.regex(/^[a-zA-Z\s]+$/, "Only letters and spaces are allowed"),
	email: z.string().email().optional().or(z.literal("")),
	phone: z
		.string()
		.regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
		.min(10, "Phone number must be at least 10 digits long")
		.max(10, "Phone number must be less than 10 digits long"),
	address: z.string().optional(),
});
export const receiptShema = z.object({
	id: z.number().optional(),
	first_name: z.string().min(2, { message: "First name must be at least 2 characters long" }),
	second_name: z.string().optional(),
	last_name: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
	second_last_name: z
		.string()
		.min(2, { message: "Last name must be at least 2 characters long" })
		.regex(/^[a-zA-Z]+$/, "Only letters are allowed"),
	email: z.string().email().optional().nullable(),
	phone: z
		.string()
		.regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
		.min(10, "Phone number must be at least 10 digits long")
		.max(10, "Phone number must be less than 10 digits long"),
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
});

export const rateSchema = z.object({
	id: z.number(),
	service_id: z.number(),
	agency_id: z.number().default(1),
	min_weight: z.number(),
	max_weight: z.number(),
	public_rate: z.number(),
	is_sale_by_pounds: z.boolean(),
});

export const itemsSchema = z.object({
	id: z.number(),
	description: z.string().min(1, "La descripción es requerida"),
	price: z.number(),
	quantity: z.number(),
	weight: z.number().min(1, "El peso es requerido"),
	subtotal: z.number(),
	custom_fee: z.number(),
});
export const invoiceSchema = z.object({
	id: z.number().optional(),
	customer: customerSchema,
	receipt: receiptShema,
	serviceId: z.number().min(1, "El servicio es requerido"),
	agencyId: z.number().min(1, "La agencia es requerida"),
	rate: rateSchema,
	items: z.array(itemsSchema),
	total_amount: z.number(),
});

export const customsSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
	country_id: z.number().min(1, "El país es requerido").default(1),
	chapter: z.string().optional(),
	fee_type: z.enum(["UNIT", "WEIGHT", "VALUE"]).default("UNIT"),
	fee: z.number().min(0, "El fee es requerido"),
	max_quantity: z.number().optional(),
});

export type Receipt = z.infer<typeof receiptShema>;
export type Customer =
	| (z.infer<typeof customerSchema> & {
			id: string;
			setSelectedCustomer: (customer: Customer) => void;
	  })
	| null;
export type Item = z.infer<typeof itemsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

export interface Province {
	id: number;
	name: string;
	cities: City[];
}

export interface City {
	id: number;
	name: string;
}

export interface Rate {
	id: number;
	agency_id: number;
	service_id: number;
	min_weight: number;
	max_weight: number;
	public_rate: number;
	is_sale_by_pounds: boolean;
}

export type Customs = z.infer<typeof customsSchema>;
