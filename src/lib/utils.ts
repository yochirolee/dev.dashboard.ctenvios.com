import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string) {
	return phoneNumber.replace(/^(\+535|535)?/, "");
}

export function isValidCubanCI(ci: string): boolean {
	if (!/^\d{11}$/.test(ci)) return false;

	const digits = ci.split("").map(Number);
	const year = parseInt(ci.slice(0, 2), 10);
	const month = parseInt(ci.slice(2, 4), 10);
	const day = parseInt(ci.slice(4, 6), 10);
	const fullYear = year >= 30 ? 1900 + year : 2000 + year;

	// Validar fecha
	const date = new Date(fullYear, month - 1, day);
	const isValidDate =
		date.getFullYear() === fullYear && date.getMonth() === month - 1 && date.getDate() === day;

	if (!isValidDate) return false;

	// Si es antes de 2014 no se exige dígito de control
	if (fullYear < 2014) return true;

	const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
	const sum = weights.reduce((acc, weight, i) => {
		const product = digits[i] * weight;
		return acc + (product < 10 ? product : Math.floor(product / 10) + (product % 10));
	}, 0);

	const controlDigit = (10 - (sum % 10)) % 10;
	return controlDigit === digits[10];
}
