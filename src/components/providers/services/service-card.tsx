import type { Service, Provider, Product } from "@/data/types";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { ProductList } from "../products/product-list";
import { useState } from "react";
import { CreateProductForm } from "../products/create-product.form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { BoxIcon } from "lucide-react";
import { EmptyProducts } from "../products/empty-products";

interface ServiceWithProducts extends Service {
   products: Product[];
}

export const ServiceCard = ({ service, provider }: { service: ServiceWithProducts; provider: Provider }) => {
   const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
   const products = service.products;

   return (
      <Card key={service?.id} className="flex flex-col mb-4">
         <CardHeader className="flex  justify-between items-center">
            <div className="flex items-center gap-2">
               <h1 className="text-lg font-bold">{provider?.name}</h1>
               <Badge variant="outline">{service?.service_type}</Badge>
               <p className="text-sm text-muted-foreground">{service?.description}</p>
            </div>
            <Dialog open={openCreateProductDialog} onOpenChange={setOpenCreateProductDialog}>
               <DialogTrigger asChild>
                  <Button variant="outline">
                     <BoxIcon className="w-4 h-4" />
                     <span>Crear Producto</span>
                  </Button>
               </DialogTrigger>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Crear Producto</DialogTitle>
                     <DialogDescription>Agrega un nuevo producto para {service.name}</DialogDescription>
                  </DialogHeader>
                  <CreateProductForm
                     serviceId={service.id ?? 0}
                     providerId={provider.id ?? 0}
                     setOpen={setOpenCreateProductDialog}
                  />
               </DialogContent>
            </Dialog>
         </CardHeader>
         <CardContent>{products.length === 0 ? <EmptyProducts /> : <ProductList products={products} />}</CardContent>
      </Card>
   );
};
