import { CreateIssueForm } from "@/components/issues/create-issue-form";
import { useSearchParams } from "react-router-dom";

export default function NewIssuePage() {
   const [searchParams] = useSearchParams();
   const orderId = searchParams.get("order_id");
   const parcelId = searchParams.get("parcel_id");

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-col">
            <h3 className="font-bold">Create New Issue</h3>
            <p className="text-sm text-gray-500">Report a new issue or problem</p>
         </div>
         <CreateIssueForm
            initialOrderId={orderId ? Number(orderId) : undefined}
            initialParcelId={parcelId ? Number(parcelId) : undefined}
         />
      </div>
   );
}

