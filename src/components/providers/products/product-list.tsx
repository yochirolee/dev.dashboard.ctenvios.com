import type { Product, Service } from "@/data/types";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "../../ui/table";
import { ProductCardActions } from "./product-card-actions";
import { EmptyProducts } from "./empty-products";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ProductWithServices extends Product {
   services: Service[];
}

export const ProductList = ({ serviceId }: { serviceId: number }) => {
   const { data: products, isLoading } = useProducts.get();
   if (isLoading) {
      return <Skeleton className="h-[200px] w-full" />;
   }
   if (products?.length === 0) {
      return <EmptyProducts />;
   }
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Nombre</TableHead>
               <TableHead>Descripción</TableHead>
               <TableHead>Tipo</TableHead>
               <TableHead>Unidad</TableHead>
               <TableHead>Estado</TableHead>
               <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {products?.map((product: ProductWithServices) => (
               <ProductRow key={product.id} product={product} serviceId={serviceId} />
            ))}
         </TableBody>
      </Table>
   );
};

const ProductRow = ({ product, serviceId }: { product: ProductWithServices; serviceId: number }) => {
   const { mutate: addService } = useProducts.addService(product?.id ?? 0, serviceId, {
      onSuccess: () => {
         toast.success("Producto agregado al servicio");
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });
  
   return (
      <TableRow key={product.id} className="border-b-0">
         <TableCell>
            <p>{product?.name}</p>
         </TableCell>
         <TableCell>
            <p>{product?.description}</p>
         </TableCell>
         <TableCell>
            <Badge variant="outline">{product?.type}</Badge>
         </TableCell>
         <TableCell>
            <Badge variant="secondary">{product?.unit}</Badge>
         </TableCell>
         <TableCell>
            <Switch
               checked={product?.services.some((service) => service.id === serviceId)}
               onCheckedChange={() => addService()}
            />
         </TableCell>
         <TableCell className="w-10 text-right">
            <ProductCardActions />
         </TableCell>
      </TableRow>
   );
};
