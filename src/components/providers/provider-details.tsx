import { useProviders } from "@/hooks/use-providers";
import type { Product, Provider } from "@/data/types";
import { Skeleton } from "../ui/skeleton";
import ServicesList from "./services/services-list";
import { ProviderCardDetails } from "./provider-card-details";
import { useProducts } from "@/hooks/use-products";
import { ProductList } from "./products/product-list";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Separator } from "../ui/separator";
import { EmptyProducts } from "./products/empty-products";
export const ProviderDetails = ({ providerId }: { providerId: number }) => {
   const { data: provider, isPending } = useProviders.getById(providerId ?? 0);
   const { data: products } = useProducts.get();
   if (isPending)
      return (
         <div className="space-y-4 container max-w-screen-lg mx-auto">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
         </div>
      );
   return (
      <div className="space-y-4 container max-w-screen-lg mx-auto">
         <ProviderCardDetails provider={provider as Provider} />
         <ServicesList provider={provider as Provider} services={provider?.services as unknown as []} />
         <Card>
            <CardHeader>
               <CardTitle>Productos</CardTitle>
               <CardDescription>Listado de productos disponibles para {provider?.name}.</CardDescription>
               
            </CardHeader>
            <Separator />
            <CardContent>
               {products?.length === 0 ? (
                  <EmptyProducts />
               ) : (
                  <ProductList products={products as unknown as Product[]} />
               )}
            </CardContent>
         </Card>
      </div>
   );
};
