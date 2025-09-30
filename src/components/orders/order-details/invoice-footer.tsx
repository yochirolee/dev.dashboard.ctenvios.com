import { Separator } from "@/components/ui/separator";
import { PaymentForm } from "@/components/orders/payments/payment-form";
import type{ OrderInvoice } from "@/data/types";



export function InvoiceFooter({ invoice }: { invoice: OrderInvoice }) {
   const shouldShowPaymentForm = invoice.payment_status === "PENDING" || invoice.payment_status === "PARTIALLY_PAID";

   return (
      <>
         <Separator className="my-4 print:hidden" />
         <div className="print:hidden mx-auto w-full xl:w-1/6">
            {shouldShowPaymentForm && <PaymentForm invoice={invoice} />}
         </div>

         <div className="mt-24 text-center text-gray-500 text-sm">
            <p>{invoice.agency.website}</p>
            <p>Thank you for your business!</p>
            <p>Payment is due within 30 days. Please process this invoice within that time.</p>
         </div>
      </>
   );
}
