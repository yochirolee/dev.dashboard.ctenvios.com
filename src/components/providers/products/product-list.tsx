import type { Product } from "@/data/types";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "../../ui/table";
import { PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProductList = ({ products }: { products: Product[] }) => {
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Nombre</TableHead>
               <TableHead>Descripción</TableHead>
               <TableHead>Tipo</TableHead>
               <TableHead>Unidad</TableHead>
               <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {products?.map((product: Product) => (
               <ProductRow key={product.id} product={product} />
            ))}
         </TableBody>
      </Table>
   );
};

const ProductRow = ({ product }: { product: Product }) => {
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
         <TableCell className="w-10 text-right">
            <Button variant="outline">
               <PencilIcon className="w-4 h-4" />
            </Button>
         </TableCell>
      </TableRow>
   );
};
