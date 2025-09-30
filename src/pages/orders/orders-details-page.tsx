import { Link, useNavigate, useParams } from "react-router-dom";
import { useInvoices } from "@/hooks/use-invoices";
import {
  MapPin,
  Phone,
  User,
  Trash2,
  PrinterIcon,
  Plane,
  Ship,
  Edit,
  FileWarning,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { PaymentForm } from "@/components/orders/payments/payment-form";
import {
  cn,
  centsToDollars,
  calculate_row_subtotal,
  formatFullName,
} from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loading } from "@/components/shares/loading";
import { OrderLog } from "@/components/orders/order/order-log";
import type { OrderItem } from "@/data/types";

const baseUrl = import.meta.env.VITE_API_URL;

export default function OrdersDetailsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInvoices.getById(Number(invoiceId));
  const invoice = data?.rows[0] || null;

  console.log(invoice, "invoice");

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const subtotal = invoice?.items.reduce(
    (acc: number, item: OrderItem) =>
      acc +
      calculate_row_subtotal(
        item?.rate_in_cents,
        item?.weight,
        item?.customs_fee_in_cents,
        item?.charge_fee_in_cents,
        item?.rate?.rate_type
      ),
    0
  );

  console.log(subtotal, "subtotal");
  const total_weight = invoice?.items.reduce(
    (acc: number, item: any) => acc + item?.weight || 0,
    0
  );

  console.log(invoice, error);

  if (isLoading) return <Loading />;
  return invoice ? (
    <div className="space-y-6 ">
      <div className="flex flex-col gap-2 md:flex-row lg:justify-between lg:items-center print:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                {invoice?.service.service_type === "MARITIME" ? (
                  <Ship size={24} className="text-blue-500" />
                ) : (
                  <Plane size={24} className="text-blue-500" />
                )}
                <Separator orientation="vertical" className="min-h-6 mx-2" />

                <div>
                  <div>
                    <span className="text-sm">
                      {invoice?.service?.provider?.name}
                    </span>
                    <Badge
                      variant={
                        invoice?.status === "pending" ? "default" : "outline"
                      }
                      className="print:hidden"
                    >
                      {invoice?.status}
                    </Badge>
                  </div>
                  <div className="flex  gap-2">
                    <span className="text-sm text-muted-foreground">
                      Facturado por:
                    </span>
                    <span className="text-sm"> {invoice?.user?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex  items-center lg:justify-end gap-2">
          <Link target="_blank" to={`${baseUrl}/invoices/${invoiceId}/pdf`}>
            <Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
              <PrinterIcon className=" h-4 w-4" />
              Print Invoice
            </Button>
          </Link>
          <Link target="_blank" to={`${baseUrl}/invoices/${invoiceId}/labels`}>
            <Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
              <PrinterIcon className=" h-4 w-4" />
              Print Labels
            </Button>
          </Link>

          <Separator orientation="vertical" className="min-h-6 ml-2" />
          <div className="flex items-center ">
            <Link to={`/orders/${invoiceId}/edit`}>
              <Button variant="ghost" className="print:hidden">
                <Edit />
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="print:hidden group hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="group-hover:text-red-400" />
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="p-4 col-span-1 xl:col-span-9  print:shadow-none bg-card print:bg-white print:py-0 print:text-gray-500">
          <div className="flex flex-col xl:flex-row justify-between items-start ">
            <div className="flex items-center gap-4">
              {invoice?.agency?.logo ? (
                <img
                  src={invoice?.agency?.logo}
                  alt={invoice?.agency?.name}
                  className="w-20 h-20  p-2 object-center object-scale-down rounded-full  border"
                />
              ) : (
                <div className=" bg-muted min-h-20 min-w-20 object-cover rounded-full border"></div>
              )}

              <div>
                <h1 className="text-xl  font-bold ">
                  {" "}
                  {invoice?.agency?.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Address: {invoice?.agency?.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: {invoice?.agency?.phone}
                </p>
              </div>
            </div>

            <div className=" flex w-full flex-col  justify-end text-center xl:text-end">
              <h1 className="xl:text-xl text-end font-bold ">
                Invoice {invoice?.id}
              </h1>
              <div className="flex items-center gap-2 text-end justify-end">
                <span className="xl:text-lg text-end">
                  {total_weight?.toFixed(2) || 0} lbs
                </span>
                <span className="xl:text-lg text-end">
                  Items: {invoice?.items?.length || 0}
                </span>
              </div>
              <time className="text-sm text-end text-muted-foreground">
                Fecha:{" "}
                {format(new Date(invoice?.created_at), "dd/MM/yyyy HH:mm a")}
              </time>
            </div>
          </div>
          <div className="grid grid-cols-1 text-sm font-light  xl:grid-cols-2 items-start justify-between gap-10 xl:gap-20 mb-4 xl:mb-8">
            <ul className="grid gap-3 ">
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <User size={16} />
                </span>
                <span>
                  {formatFullName(
                    invoice?.customer?.first_name,
                    invoice?.customer?.middle_name,
                    invoice?.customer?.last_name,
                    invoice?.customer?.second_last_name
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <Phone size={16} />
                </span>
                <span>{invoice?.customer?.mobile}</span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <MapPin size={16} />
                </span>
                <span>{invoice?.customer?.address}</span>
              </li>
            </ul>

            <ul className="grid gap-3  ">
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <User size={16} />
                </span>
                <span>
                  {formatFullName(
                    invoice?.receiver?.first_name,
                    invoice?.receiver?.middle_name,
                    invoice?.receiver?.last_name,
                    invoice?.receiver?.second_last_name
                  )}
                </span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <Phone size={16} />
                </span>
                <span>
                  {invoice?.receiver?.phone || invoice?.receiver?.mobile}
                </span>
              </li>
              <li className="flex items-center gap-2 justify-start">
                <span className="text-muted-foreground">
                  <MapPin size={16} />
                </span>
                <span>{invoice?.receiver?.address}</span>
              </li>
            </ul>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-muted-foreground">
                  HBL
                </TableHead>
                <TableHead className="w-full text-muted-foreground">
                  Descripción
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Seguro
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Cargo
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Arancel
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Rate
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Peso
                </TableHead>
                <TableHead className="text-right w-14 text-muted-foreground">
                  Subtotal
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice?.items.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="">{item?.hbl}</TableCell>
                  <TableCell className="">{item?.description}</TableCell>
                  <TableCell
                    className={`text-right ${
                      item?.insurance_fee_in_cents === 0
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    ${centsToDollars(item?.insurance_fee_in_cents).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      item?.delivery_fee_in_cents === 0
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    ${centsToDollars(item?.delivery_fee_in_cents).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      item?.customs_fee_in_cents === 0
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    ${centsToDollars(item?.customs_fee_in_cents).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      item?.rate_in_cents === 0 ? "text-muted-foreground" : ""
                    }`}
                  >
                    ${centsToDollars(item?.rate_in_cents).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item?.weight?.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      item?.subtotal === 0 ? "text-muted-foreground" : ""
                    }`}
                  >
                    $
                    {centsToDollars(
                      calculate_row_subtotal(
                        item?.rate_in_cents,
                        item?.weight,
                        item?.customs_fee_in_cents,
                        item?.charge_fee_in_cents,
                        item.rate.rate_type
                      )
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="relative">
            <div className="absolute p-4 inset-0 flex items-center justify-center pointer-events-none">
              <span
                className={`xl:text-[90px] text-4xl rounded-2xl p-4 border font-extrabold  opacity-10 rotate-[-30deg]  ${
                  invoice?.payment_status === "PAID"
                    ? "text-green-500 bg-green-500/10 border-green-500"
                    : invoice?.payment_status === "PARTIALLY_PAID"
                    ? "text-yellow-500 bg-yellow-500/10 border-yellow-500"
                    : "text-red-500 bg-red-500/10 border-red-500"
                }`}
              >
                {invoice?.payment_status}
              </span>
            </div>
            <div className="flex justify-end my-8 ">
              <ul className="flex flex-col w-1/2  xl:w-1/4 xl:mr-4 py-4 justify-end gap-2 border-t border-dashed  ">
                <li className="flex items-center gap-4 justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${centsToDollars(subtotal)?.toFixed(2) ?? 0.0}</span>
                </li>

                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    ${invoice?.shipping_fee_in_cents?.toFixed(2) ?? 0.0}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>${invoice?.tax_in_cents?.toFixed(2) ?? 0.0}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">Charge</span>
                  <span>$ 0.00</span>
                </li>

                <li className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Total</span>
                  <span>
                    ${centsToDollars(invoice?.total_in_cents)?.toFixed(2)}
                  </span>
                </li>
                <Separator />
                <li className="flex text-sm items-center justify-between ">
                  <span className="text-muted-foreground">Paid</span>
                  <span
                    className={cn(
                      invoice?.payment_status === "PAID" &&
                        "text-muted-foreground"
                        ? "text-green-500/80"
                        : "text-muted-foreground"
                    )}
                  >
                    ${centsToDollars(invoice?.paid_in_cents)?.toFixed(2) ?? 0.0}
                  </span>
                </li>
                <li className="flex text-sm items-center justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span
                    className={cn(
                      invoice?.payment_status !== "PAID"
                        ? "text-red-500/60"
                        : "text-muted-foreground"
                    )}
                  >
                    $
                    {centsToDollars(
                      invoice?.total_in_cents - invoice?.paid_in_cents
                    )?.toFixed(2) ?? 0.0}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-4 print:hidden" />
          <div className="print:hidden mx-auto w-full xl:w-1/6">
            {invoice?.payment_status === "PENDING" ||
            invoice?.payment_status === "PARTIALLY_PAID" ? (
              <PaymentForm invoice={invoice} />
            ) : null}
          </div>

          <div className="mt-4 text-center text-gray-500 text-sm">
            <p>{invoice?.agency?.website}</p>
            <p>Thank you for your business!</p>
            <p>
              Payment is due within 30 days. Please process this invoice within
              that time.
            </p>
          </div>
        </Card>

        <OrderLog events={invoice?.events} />
      </div>
    </div>
  ) : (
    <Card className="flex justify-center items-center h-full">
      <CardContent className="flex flex-col gap-4 items-center">
        <FileWarning className="w-10 h-10 text-red-500" />
        <h2 className="text-center font-bold">No invoice found</h2>
        <p className="text-center text-muted-foreground">
          Please try again later
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate("/orders/list")}>
            Go to orders
          </Button>
          <Button onClick={() => navigate("/orders/new")}>Create order</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
