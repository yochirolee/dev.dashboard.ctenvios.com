import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { InputGroupButton } from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, Key, Trash } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const AgenciesIntegrationsPage = () => {
   return (
      <div className="flex flex-col container max-w-screen-xl mx-auto gap-4 items-center p-2 md:p-4">
         <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
               <h3 className=" font-bold">Api Integrations</h3>
               <p className="text-sm text-gray-500 "> Manage API Keys and explore endpoints documentation</p>
            </div>
            <Tabs defaultValue="api-keys">
               <TabsList>
                  <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
               </TabsList>
               <TabsContent value="api-keys">
                  <ApiKeys />
               </TabsContent>
               <TabsContent value="documentation">
                  <Documentation />
               </TabsContent>
            </Tabs>
         </div>
      </div>
   );
};

export const ApiKeys = () => {
   return (
      <Card>
         <CardHeader className="flex ">
            <div className="flex flex-1 flex-col gap-2">
               <CardTitle>Api Keys</CardTitle>
               <CardDescription>Add or remove API keys for your agency</CardDescription>
            </div>
            <Button variant="outline">
               <Key className="w-4 h-4" /> Add API Key
            </Button>
         </CardHeader>
         <CardContent className="flex flex-col gap-4">
            <Card>
               <CardHeader>
                  <CardTitle>API Key</CardTitle>
                  <CardDescription>API Key for your agency</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="flex flex-row gap-2">
                     <InputGroup>
                        <InputGroupInput type="text" placeholder="API Key" />
                        <InputGroupButton variant="ghost">
                           <Eye className="mr-1" />
                        </InputGroupButton>
                     </InputGroup>
                     <Button variant="outline">
                        <Copy className="w-4 h-4" /> Copy
                     </Button>
                     <Button variant="outline">
                        <Trash className="w-4 h-4" /> Delete
                     </Button>
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                  <CardDescription>Quick start guide for your agency</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                     <h1>Authentication</h1>
                     <p className="text-sm text-muted-foreground">
                        To authenticate your requests, include the API key in the Authorization header. Use the Bearer
                        scheme:
                     </p>

                     <pre className="bg-muted p-2 text-xs rounded-md">
                        <code>Authorization: Bearer YOUR_API_KEY</code>
                     </pre>
                  </div>
                  <div className="flex flex-col gap-2">
                     <h1>Base URL</h1>
                     <p className="text-sm text-muted-foreground">The base URL for the API is:</p>

                     <pre className="bg-muted p-2 text-xs rounded-md">
                        <code>https://api.ctenvios.com/v1</code>
                     </pre>
                  </div>
                  <div className="flex flex-col gap-2">
                     <h1>Rate Limit</h1>
                     <p className="text-sm text-muted-foreground">
                        The rate limit for the API is 100 requests per minute.
                     </p>

                     <pre className="bg-muted p-2 text-xs rounded-md">
                        <code>100 requests per minute</code>
                     </pre>
                  </div>
               </CardContent>
            </Card>
         </CardContent>
      </Card>
   );
};

interface EndpointInfo {
   method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
   path: string;
   name: string;
   description?: string;
   queryParams?: Array<{ name: string; type: string; required?: boolean; description?: string }>;
   pathParams?: Array<{ name: string; type: string; description?: string }>;
   bodyParams?: string;
   exampleBody?: string;
}

interface ResourceGroup {
   name: string;
   endpoints: EndpointInfo[];
}

const getMethodBadgeClassName = (method: string): string => {
   const baseClasses = "shrink-0 font-semibold";
   switch (method) {
      case "GET":
         return `${baseClasses} bg-black/80 dark:bg-black border border-green-400 text-green-400`;
      case "POST":
         return `${baseClasses} bg-black/80 dark:bg-black border border-blue-400 text-blue-400`;
      case "PUT":
      case "PATCH":
         return `${baseClasses} bg-black/80 dark:bg-black border border-amber-400 text-amber-400`;
      case "DELETE":
         return `${baseClasses} bg-black/80 dark:bg-black border border-red-400 text-red-400`;
      default:
         return `${baseClasses} bg-black/80 dark:bg-black border border-gray-400 text-gray-400`;
   }
};

const apiDocumentation: ResourceGroup[] = [
   {
      name: "Partner API",
      endpoints: [
         {
            method: "GET",
            path: "/services",
            name: "Get Services",
            description: "Get available services and rates via Partner API. Requires API key authentication.",
         },
         {
            method: "POST",
            path: "/orders",
            name: "Create Order",
            description:
               "Create a new order via Partner API. Requires API key authentication and partner authentication.",
            bodyParams: "PartnerOrderSchema",
            exampleBody: `{
  "order_items": [
    {
      "weight": 80,
      "rate_id": 3,
      "description": "Televisor"
    },
    {
      "weight": 56,
      "rate_id": 5,
      "description": "Caja Alimentos/Aseo-Food/PCare"
    },
    {
      "weight": 56,
      "rate_id": 5,
      "description": "Caja Alimentos/Aseo-Food/PCare"
    }
  ],
  "customer": {
    "mobile": "7867287425",
    "last_name": "Garcia",
    "first_name": "Abel"
  },
  "receiver": {
    "ci": "67031304462",
    "city": "La Lisa",
    "phone": "72609928",
    "mobile": "52945522",
    "address": "CALLE 210  #5504 entre 55 Y 57 LA LISA",
    "province": "La Habana",
    "last_name": "Blanco",
    "first_name": "Carlos",
    "second_last_name": "Perez"
  },
  "service_id": 1,
  "partner_order_id": "3434"
}`,
         },
         {
            method: "GET",
            path: "/orders/{id}",
            name: "Get Order Details",
            description:
               "Get order details via Partner API. Returns order information including customer, receiver, service, and order items. Requires API key authentication. Only returns orders that belong to the authenticated partner's agency.",
            pathParams: [{ name: "id", type: "number", description: "Order ID" }],
         },
      ],
   },
];

export const Documentation = () => {
   const baseUrl = import.meta.env.VITE_API_URL || "https://api.ctenvios.com/api/v1/partners";

   return (
      <Card>
         <CardHeader>
            <CardTitle>Partner API Documentation</CardTitle>
            <CardDescription>
               Complete reference for Partner API endpoints. All endpoints require API key authentication.
            </CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 p-4 bg-muted rounded-lg">
               <div className="font-semibold">Base URL</div>
               <code className="text-sm">{baseUrl}</code>
            </div>

            <Accordion type="multiple" className="w-full">
               {apiDocumentation.map((resource) => (
                  <AccordionItem key={resource.name} value={resource.name}>
                     <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold">{resource.name}</span>
                           <Badge variant="outline" className="text-xs">
                              {resource.endpoints.length} endpoint{resource.endpoints.length !== 1 ? "s" : ""}
                           </Badge>
                        </div>
                     </AccordionTrigger>
                     <AccordionContent>
                        <div className="flex flex-col gap-4 pt-2">
                           {resource.endpoints.map((endpoint, idx) => (
                              <div key={idx} className="flex flex-col gap-3 pb-4 border-b last:border-b-0">
                                 <div className="flex items-start gap-3">
                                    <Badge variant="outline" className={getMethodBadgeClassName(endpoint.method)}>
                                       {endpoint.method}
                                    </Badge>
                                    <div className="flex-1 flex flex-col gap-1">
                                       <div className="font-medium">{endpoint.name}</div>
                                       {endpoint.description && (
                                          <div className="text-sm text-muted-foreground">{endpoint.description}</div>
                                       )}
                                    </div>
                                 </div>

                                 <div className="flex flex-col gap-2 pl-11">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-mono text-muted-foreground">Path:</span>
                                       <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                          {endpoint.path}
                                       </code>
                                    </div>

                                    {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                                       <div className="flex flex-col gap-1">
                                          <div className="text-xs font-semibold text-muted-foreground">
                                             Path Parameters:
                                          </div>
                                          <div className="flex flex-col gap-1 pl-2">
                                             {endpoint.pathParams.map((param, pIdx) => (
                                                <div key={pIdx} className="text-xs">
                                                   <code className="bg-muted px-1 py-0.5 rounded">{param.name}</code>
                                                   <span className="text-muted-foreground ml-2">({param.type})</span>
                                                   {param.description && (
                                                      <span className="text-muted-foreground ml-2">
                                                         - {param.description}
                                                      </span>
                                                   )}
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                                       <div className="flex flex-col gap-1">
                                          <div className="text-xs font-semibold text-muted-foreground">
                                             Query Parameters:
                                          </div>
                                          <div className="flex flex-col gap-1 pl-2">
                                             {endpoint.queryParams.map((param, qIdx) => (
                                                <div key={qIdx} className="text-xs">
                                                   <code className="bg-muted px-1 py-0.5 rounded">{param.name}</code>
                                                   <span className="text-muted-foreground ml-2">({param.type})</span>
                                                   {param.required && (
                                                      <Badge variant="outline" className="ml-2 text-xs">
                                                         required
                                                      </Badge>
                                                   )}
                                                   {param.description && (
                                                      <span className="text-muted-foreground ml-2">
                                                         - {param.description}
                                                      </span>
                                                   )}
                                                </div>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {endpoint.bodyParams && (
                                       <div className="flex flex-col gap-1">
                                          <div className="text-xs font-semibold text-muted-foreground">
                                             Request Body:
                                          </div>
                                          <div className="text-xs pl-2">
                                             <code className="bg-muted px-1 py-0.5 rounded">{endpoint.bodyParams}</code>
                                          </div>
                                          {endpoint.exampleBody && (
                                             <div className="flex flex-col gap-1 mt-2">
                                                <div className="text-xs font-semibold text-muted-foreground">
                                                   Example Body:
                                                </div>
                                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                   <code>{endpoint.exampleBody}</code>
                                                </pre>
                                             </div>
                                          )}
                                       </div>
                                    )}

                                    <div className="flex flex-col gap-1 mt-1">
                                       <div className="text-xs font-semibold text-muted-foreground">
                                          Example Request:
                                       </div>
                                       <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                          <code>
                                             {endpoint.method} {baseUrl}
                                             {endpoint.path.replace(/\{[^}]+\}/g, (match) => {
                                                const paramName = match.slice(1, -1);
                                                const pathParam = endpoint.pathParams?.find(
                                                   (p) => p.name === paramName
                                                );
                                                return pathParam?.type === "number" ? "123" : "example";
                                             })}
                                             {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                                                <>
                                                   {"?"}
                                                   {endpoint.queryParams
                                                      .filter((p) => p.required)
                                                      .map((p, i) => `${p.name}=example${i > 0 ? "&" : ""}`)
                                                      .join("&")}
                                                </>
                                             )}
                                          </code>
                                       </pre>
                                       {endpoint.method === "POST" && endpoint.exampleBody && (
                                          <div className="flex flex-col gap-1 mt-2">
                                             <div className="text-xs font-semibold text-muted-foreground">
                                                cURL Example:
                                             </div>
                                             <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                <code>
                                                   {`curl -X POST '${baseUrl}${endpoint.path}' \\
  --header 'Content-Type: application/json' \\
  --header 'Authorization: Bearer YOUR_API_KEY' \\
  --data '${endpoint.exampleBody.replace(/\n\s*/g, " ").replace(/\s+/g, " ").trim()}'`}
                                                </code>
                                             </pre>
                                             <div className="text-xs text-muted-foreground mt-1">
                                                Note: For better readability, use the formatted JSON from the Example
                                                Body section above.
                                             </div>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </AccordionContent>
                  </AccordionItem>
               ))}
            </Accordion>
         </CardContent>
      </Card>
   );
};
