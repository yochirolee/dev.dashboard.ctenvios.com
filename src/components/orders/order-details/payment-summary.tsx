import { Separator } from "@/components/ui/separator";
import type{ OrderInvoice } from "@/data/types";
import { centsToDollars, cn } from "@/lib/utils";

interface PaymentSummaryProps {
    invoice: OrderInvoice;
    subtotal: number;
    balance: number;
}

export function PaymentSummary({ invoice, subtotal, balance }: PaymentSummaryProps) {
    const getPaymentStatusStyles = (status: string) => {
        switch (status) {
            case "PAID":
                return "text-green-500 bg-green-500/10 border-green-500";
            case "PARTIALLY_PAID":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500";
            default:
                return "text-red-500 bg-red-500/10 border-red-500";
        }
    };

    return (
        <div className="relative">
            <div className="absolute p-4 inset-0 flex items-center justify-center pointer-events-none">
                <span
                    className={`xl:text-[90px] text-4xl rounded-2xl p-4 border font-extrabold opacity-10 rotate-[-30deg] ${getPaymentStatusStyles(
                        invoice.payment_status
                    )}`}
                >
                    {invoice.payment_status}
                </span>
            </div>
            <div className="flex justify-end my-8">
                <ul className="flex flex-col w-1/2 xl:w-1/4 xl:mr-4 py-4 justify-end gap-2 border-t border-dashed">
                    <li className="flex items-center gap-4 justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${centsToDollars(subtotal).toFixed(2)}</span>
                    </li>

                    <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>${centsToDollars(invoice.shipping_fee_in_cents).toFixed(2)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span>${centsToDollars(invoice.tax_in_cents).toFixed(2)}</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Charge</span>
                        <span>$0.00</span>
                    </li>

                    <li className="flex items-center justify-between font-semibold">
                        <span className="text-muted-foreground">Total</span>
                        <span>${centsToDollars(invoice.total_in_cents).toFixed(2)}</span>
                    </li>
                    <Separator />
                    <li className="flex text-sm items-center justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span
                            className={cn(
                                invoice.payment_status === "PAID" ? "text-green-500/80" : "text-muted-foreground"
                            )}
                        >
                            ${centsToDollars(invoice.paid_in_cents).toFixed(2)}
                        </span>
                    </li>
                    <li className="flex text-sm items-center justify-between">
                        <span className="text-muted-foreground">Balance</span>
                        <span
                            className={cn(
                                invoice.payment_status !== "PAID" ? "text-red-500/60" : "text-muted-foreground"
                            )}
                        >
                            ${centsToDollars(balance).toFixed(2)}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
