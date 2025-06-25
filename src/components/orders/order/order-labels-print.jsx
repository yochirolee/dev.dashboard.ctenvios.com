import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useGetInvoiceById } from "@/hooks/use-invoices";
import { PrinterIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

const Label = React.forwardRef(({ invoice }, ref) => {
	console.log(invoice, "invoice on label");
	if (!invoice) return <div></div>;

	return (
		<div
			ref={ref}
			className=" print:block  mx-auto space-y-4 print:mx-auto print:w-[384px]  h-[576px] print:h-[576px]"
		>
			{invoice.items.map((item, index) => (
				<div key={index}>
					<div
						key={index}
						className="print:block mx-auto border     print:break-before-page p-4  w-[384px] print:mx-auto  h-[570px]  "
					>
						<div className="grid grid-cols-2 ">
							<h2 className="font-medium">{invoice?.agency?.name}</h2>{" "}
							<div className="flex flex-col text-right  ">
								<span className="">{invoice?.service?.name}</span>
								<span className="font-medium ">{invoice?.service?.serviceType}</span>
							</div>
						</div>
						<div className="flex flex-row items-center justify-between">
							<Barcode
								value={item?.hbl}
								height={40}
								width={1.3}
								format="CODE128"
								className="my-2"
								font="helvetica"
								fontSize={16}
								bgColor="transparent"
							/>
							<div className="flex flex-col items-end gap-2 justify-end  ">
								<div className="inline-flex gap-4 ">
									<div className="flex flex-col  items-center  ">
										<span className="text-2xl   ">{invoice?.id}</span>
										<h3 className=" text-xs ">Invoice</h3>
									</div>
									<div className="flex flex-col  items-center  ">
										<span className="text-2xl  ">
											{index + 1}-{invoice?.items?.length}
										</span>
										<h3 className=" text-xs">Pack</h3>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-2  text-left">
							<span className=" text-lg font-semibold ">{item?.description}</span>
							<span className="text-xs font-semibold">
								Peso: {parseFloat(item?.weight).toFixed(2)} Lbs /{" "}
								{parseFloat(item?.weight / 2.2).toFixed(2)} Kgs
							</span>
							<span className="text-xs font-semibold">
								Envia:{" "}
								{invoice?.customer?.first_name +
									" " +
									invoice?.customer?.last_name +
									" " +
									invoice?.customer?.second_last_name}
							</span>
						</div>
						<div className="flex border-t border-dashed  justify-between mt-4 pt-4 ">
							<div className="  flex flex-col gap-2 text-sm">
								<div className="grid grid-cols-8 gap-4  items-center ">
									<span className="col-span-2 text-xs text-right">Recibe:</span>
									<span className="col-span-6 font-semibold">
										{invoice?.receipt?.first_name +
											" " +
											invoice?.receipt?.last_name +
											" " +
											invoice?.receipt?.second_last_name}
									</span>
								</div>
								<div className="grid grid-cols-8 gap-4  items-center ">
									<span className="col-span-2 text-xs text-right">CI:</span>
									<span className="col-span-6  ">{invoice?.receipt?.ci}</span>
								</div>
								<div className="grid grid-cols-8 gap-4  items-center ">
									<span className="col-span-2 text-xs text-right">Telefonos:</span>
									<span className="col-span-6  ">{invoice?.receipt?.phone}</span>
								</div>
								<div className="grid grid-cols-8 gap-4  items-center">
									<span className="col-span-2 text-xs text-right">Direccion:</span>
									<span className="col-span-6 ">{invoice?.receipt?.address}</span>
								</div>
								<div className="grid grid-cols-8 gap-4 items-center">
									<span className="col-span-2 text-xs text-right">Provincia:</span>
									<span className="col-span-6">
										{invoice?.receipt?.state?.name} / {invoice?.receipt?.city?.name}
									</span>
								</div>
							</div>
						</div>
						<div className=" grid grid-cols-2  pt-6  items-center  gap-4 mt-6 border-t border-dashed ">
							<div className="flex flex-col mx-auto text-center my-auto  ">
								<QRCode value={JSON.stringify(item?.hbl)} size={100} />
								<span className="text-xs my-2">{invoice?.service?.name}</span>
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
});

export const OrderLabelsPrint = () => {
	const componentRef = useRef();
	const params = useParams();

	const { data: invoice, isLoading, isError } = useGetInvoiceById(params.invoiceId);

	if (isLoading) return <div>Loading...</div>;
	if (isError) return <div>Error</div>;

	console.log(invoice, "invoice");
	console.log(isError, "isError");

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
	});

	return (
		<div>
			<button
				onClick={handlePrint}
				className="inline-flex gap-2 border rounded-lg text-sm p-2 bg-indigo-700 text-white"
			>
				<PrinterIcon className="inline-flex h-5 w-5" />
				Etiquetas
			</button>

			<Label invoice={invoice} ref={componentRef} />
		</div>
	);
};
