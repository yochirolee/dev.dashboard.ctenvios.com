import { useNavigate } from "react-router-dom";
import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function OrderNotFound() {
  const navigate = useNavigate();

  return (
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
