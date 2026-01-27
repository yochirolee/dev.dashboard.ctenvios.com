import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { InputGroupButton } from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eye, EyeOff, Key } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { useAgencies } from "@/hooks/use-agencies";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AgenciesIntegrationsPage = () => {
   const [searchParams] = useSearchParams();
   const agencyId = Number(searchParams.get("agencyId") ?? 0);
   const { data: integrations = [], isLoading } = useAgencies.getIntegrations(agencyId);
   console.log(integrations);
   const hasIntegrations = Array.isArray(integrations) && integrations.length > 0;

   return (
      <div className="flex flex-col container max-w-screen-xl mx-auto gap-4 items-center p-2 md:p-4">
         <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
               <h3 className=" font-bold">Api Integrations</h3>
               <p className="text-sm text-gray-500 "> Manage API Keys and explore endpoints documentation</p>
            </div>
            {!agencyId ? (
               <Empty>
                  <EmptyHeader>
                     <EmptyMedia variant="icon">
                        <Key className="size-6" />
                     </EmptyMedia>
                     <EmptyTitle>Selecciona una agencia</EmptyTitle>
                     <EmptyDescription>Abre integraciones desde la agencia seleccionada.</EmptyDescription>
                  </EmptyHeader>
               </Empty>
            ) : !isLoading && !hasIntegrations ? (
               <Empty>
                  <EmptyHeader>
                     <EmptyMedia variant="icon">
                        <Key className="size-6" />
                     </EmptyMedia>
                     <EmptyTitle>Sin integraciones</EmptyTitle>
                     <EmptyDescription>Esta agencia no tiene integraciones configuradas.</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                     <IntegrationCreateDialog agencyId={agencyId} />
                  </EmptyContent>
               </Empty>
            ) : (
               <Tabs defaultValue="api-keys">
                  <TabsList>
                     <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                     <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="api-keys">
                     <ApiKeys integrations={integrations} />
                  </TabsContent>
                  <TabsContent value="documentation">
                     <Documentation />
                  </TabsContent>
               </Tabs>
            )}
         </div>
      </div>
   );
};

const IntegrationCreateDialog = ({ agencyId }: { agencyId: number }) => {
   const [open, setOpen] = useState(false);
   const [formValues, setFormValues] = useState({
      name: "",
      email: "",
      contact_name: "",
      phone: "",
      rate_limit: "1000",
      forwarder_id: "1",
   });
   const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
   const { mutate: createIntegration, isPending: isCreating } = useAgencies.createIntegration(agencyId, {
      onSuccess: (data) => {
         const apiKey = data?.api_key || data?.apiKey || data?.key || null;
         if (apiKey) {
            setCreatedApiKey(String(apiKey));
         } else {
            setOpen(false);
         }
      },
   });

   const handleCreateIntegration = (e: React.FormEvent) => {
      e.preventDefault();
      setCreatedApiKey(null);
      createIntegration({
         name: formValues.name.trim(),
         email: formValues.email.trim(),
         contact_name: formValues.contact_name.trim(),
         phone: formValues.phone.trim(),
         agency_id: agencyId,
         rate_limit: Number(formValues.rate_limit) || 0,
         forwarder_id: Number(formValues.forwarder_id) || 0,
      });
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="outline">
               <Key className="w-4 h-4" /> Crear integración
            </Button>
         </DialogTrigger>
         <DialogContent className="max-w-2xl">
            <DialogHeader>
               <DialogTitle>Crear integración</DialogTitle>
               <DialogDescription>Agrega un partner API para esta agencia.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateIntegration}>
               {createdApiKey && (
                  <div className="md:col-span-2">
                     <Card>
                        <CardHeader>
                           <CardTitle>API Key</CardTitle>
                           <CardDescription>Copia y guarda esta clave. Solo se muestra una vez.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-row gap-2">
                              <InputGroup>
                                 <InputGroupInput type="text" value={createdApiKey} readOnly />
                                 <InputGroupButton
                                    variant="ghost"
                                    onClick={() => navigator.clipboard.writeText(createdApiKey)}
                                 >
                                    <Copy className="mr-1" />
                                 </InputGroupButton>
                              </InputGroup>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               )}
               <Field>
                  <FieldLabel htmlFor="integration-name">Nombre</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-name"
                        value={formValues.name}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="DimeCuba-Integration"
                        required
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="integration-email">Email</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-email"
                        type="email"
                        value={formValues.email}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="test@dimecuba.com"
                        required
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="integration-contact">Contacto</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-contact"
                        value={formValues.contact_name}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, contact_name: e.target.value }))}
                        placeholder="Integration-DimeCuba"
                        required
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="integration-phone">Teléfono</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-phone"
                        value={formValues.phone}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="7867620266"
                        required
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="integration-rate-limit">Rate limit</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-rate-limit"
                        type="number"
                        min={1}
                        value={formValues.rate_limit}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, rate_limit: e.target.value }))}
                        required
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="integration-forwarder">Forwarder ID</FieldLabel>
                  <FieldContent>
                     <Input
                        id="integration-forwarder"
                        type="number"
                        min={1}
                        value={formValues.forwarder_id}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, forwarder_id: e.target.value }))}
                        required
                     />
                  </FieldContent>
               </Field>
               <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={isCreating}>
                     <Key className="w-4 h-4" />
                     {isCreating ? "Creando..." : "Crear integración"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
};

type IntegrationRecord = {
   id?: number;
   partner_id?: number;
   name?: string;
   email?: string;
   contact_name?: string;
   phone?: string;
};

type IntegrationApiKey = {
   id?: number;
   name?: string;
   key?: string;
   prefix?: string;
   environment?: string;
   expires_at?: string;
   created_at?: string;
};

export const ApiKeys = ({ integrations }: { integrations: IntegrationRecord[] }) => {
   const [createdKeys, setCreatedKeys] = useState<Record<number, string[]>>({});

   const handleCreatedKey = (partnerId: number, key: string) => {
      setCreatedKeys((prev) => ({
         ...prev,
         [partnerId]: [key, ...(prev[partnerId] ?? [])],
      }));
   };

   return (
      <Card>
         <CardHeader className="flex ">
            <div className="flex flex-1 flex-col gap-2">
               <CardTitle>Api Keys</CardTitle>
               <CardDescription>Add or remove API keys for your agency</CardDescription>
            </div>
         </CardHeader>
         <CardContent className="flex flex-col gap-4">
            {integrations.map((integration) => {
               const partnerId = integration.id ?? integration.partner_id ?? 0;
               const newKeys = createdKeys[partnerId] ?? [];
               return (
                  <Card key={integration.id ?? integration.partner_id ?? integration.email}>
                     <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                           <CardTitle>{integration.name || "Integration"}</CardTitle>
                           <CardDescription>
                              {integration.email || integration.contact_name || integration.phone}
                           </CardDescription>
                        </div>
                        <CreateApiKeyDialog
                           partnerId={partnerId}
                           defaultName={integration.name}
                           onCreated={(key) => handleCreatedKey(partnerId, key)}
                        />
                     </CardHeader>
                     <IntegrationApiKeysList partnerId={partnerId} newKeys={newKeys} />
                  </Card>
               );
            })}
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

const CreateApiKeyDialog = ({
   partnerId,
   defaultName,
   onCreated,
}: {
   partnerId: number;
   defaultName?: string;
   onCreated?: (key: string) => void;
}) => {
   const [open, setOpen] = useState(false);
   const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
   const [keyName, setKeyName] = useState(defaultName ? `${defaultName} Key` : "");
   const [environment, setEnvironment] = useState<"live" | "test">("live");
   const [expiresInDays, setExpiresInDays] = useState("");
   const { mutate: createApiKey, isPending } = useAgencies.createApiKey(partnerId, {
      onSuccess: (data) => {
         const apiKey = data?.api_key?.key || data?.apiKey || data?.key || data?.api_key || null;
         const nextKey = apiKey ? String(apiKey) : null;
         setCreatedApiKey(nextKey);
         if (nextKey) {
            onCreated?.(nextKey);
         }
      },
   });

   const handleCreate = (e?: React.FormEvent) => {
      e?.preventDefault();
      setCreatedApiKey(null);
      const expiresValue = Number(expiresInDays);
      createApiKey({
         name: keyName.trim() || undefined,
         environment,
         expires_in_days: expiresInDays ? (Number.isNaN(expiresValue) ? undefined : expiresValue) : undefined,
      });
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="outline" disabled={!partnerId}>
               <Key className="w-4 h-4" /> Add API Key
            </Button>
         </DialogTrigger>
         <DialogContent className="max-w-xl">
            <DialogHeader>
               <DialogTitle>Crear API Key</DialogTitle>
               <DialogDescription>Esta clave solo se mostrará una vez.</DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleCreate}>
               {createdApiKey && (
                  <InputGroup>
                     <InputGroupInput type="text" value={createdApiKey} readOnly />
                     <InputGroupButton variant="ghost" onClick={() => navigator.clipboard.writeText(createdApiKey)}>
                        <Copy className="mr-1" />
                     </InputGroupButton>
                  </InputGroup>
               )}
               <Field>
                  <FieldLabel htmlFor="api-key-name">Nombre (opcional)</FieldLabel>
                  <FieldContent>
                     <Input
                        id="api-key-name"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="DimeCuba Key"
                     />
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="api-key-environment">Environment</FieldLabel>
                  <FieldContent>
                     <Select value={environment} onValueChange={(value) => setEnvironment(value as "live" | "test")}>
                        <SelectTrigger id="api-key-environment" className="w-full">
                           <SelectValue placeholder="Selecciona un ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="live">Live</SelectItem>
                           <SelectItem value="test">Test</SelectItem>
                        </SelectContent>
                     </Select>
                  </FieldContent>
               </Field>
               <Field>
                  <FieldLabel htmlFor="api-key-expires">Expira en (días)</FieldLabel>
                  <FieldContent>
                     <Input
                        id="api-key-expires"
                        type="number"
                        min={1}
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(e.target.value)}
                        placeholder="30"
                     />
                  </FieldContent>
               </Field>
               <div className="flex justify-end">
                  <Button type="submit" disabled={isPending}>
                     <Key className="w-4 h-4" />
                     {isPending ? "Creando..." : createdApiKey ? "Crear otra API Key" : "Crear API Key"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
};

const ApiKeyDisplay = ({ value }: { value: string }) => {
   const [visible, setVisible] = useState(false);
   return (
      <Card>
         <CardHeader className="pb-2">
            <CardTitle className="text-sm">API Key</CardTitle>
            <CardDescription>Guarda esta clave. Solo se muestra una vez.</CardDescription>
         </CardHeader>
         <CardContent>
            <InputGroup>
               <InputGroupInput type={visible ? "text" : "password"} value={value} readOnly />
               <InputGroupButton
                  variant="ghost"
                  onClick={() => setVisible((prev) => !prev)}
                  aria-label={visible ? "Ocultar API Key" : "Mostrar API Key"}
                  className="gap-1 text-xs"
               >
                  {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {visible ? "Ocultar" : "Mostrar"}
               </InputGroupButton>
               <InputGroupButton variant="ghost" onClick={() => navigator.clipboard.writeText(value)}>
                  <Copy className="mr-1" />
               </InputGroupButton>
            </InputGroup>
         </CardContent>
      </Card>
   );
};

const ExistingApiKeyDisplay = ({ apiKey }: { apiKey: IntegrationApiKey }) => {
   const label = apiKey.name || apiKey.prefix || "API Key";
   const [visible, setVisible] = useState(false);
   const expiresAt = apiKey.expires_at ? new Date(apiKey.expires_at) : null;
   return (
      <div className="grid grid-cols-2  items-center justify-between rounded-md border px-3 py-2 text-sm">
         <div className="flex flex-row  items-center gap-2">
            <span className="font-medium">{label}</span>
            {apiKey.prefix && <span className="text-xs text-muted-foreground">Prefix: {apiKey.prefix}</span>}
            {expiresAt && (
               <span className="text-xs text-muted-foreground">Expira: {expiresAt.toLocaleDateString()}</span>
            )}
         </div>
         <div className="flex flex-row items-center gap-2 ">
            {apiKey.key && (
               <InputGroup>
                  <InputGroupInput type={visible ? "text" : "password"} value={apiKey.key} readOnly />
                  <InputGroupButton
                     variant="ghost"
                     onClick={() => setVisible((prev) => !prev)}
                     aria-label={visible ? "Ocultar API Key" : "Mostrar API Key"}
                     className="gap-1 text-xs"
                  >
                     {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                     {visible ? "Ocultar" : "Mostrar"}
                  </InputGroupButton>
                  <InputGroupButton variant="ghost" onClick={() => navigator.clipboard.writeText(apiKey.key ?? "")}>
                     <Copy className="mr-1" />
                  </InputGroupButton>
               </InputGroup>
            )}
         </div>
      </div>
   );
};

const IntegrationApiKeysList = ({ partnerId, newKeys }: { partnerId: number; newKeys: string[] }) => {
   const { data } = useAgencies.getApiKeys(partnerId);
   const apiKeys = Array.isArray(data) ? data : (data?.api_keys ?? data?.apiKeys ?? []);
   const normalizedKeys = Array.isArray(apiKeys) ? apiKeys : [];
   if (normalizedKeys.length === 0 && newKeys.length === 0) return null;

   return (
      <CardContent className="flex flex-col gap-3">
         <div className="text-xs font-semibold text-muted-foreground">API Keys</div>
         {newKeys.map((key) => (
            <ApiKeyDisplay key={`${partnerId}-${key}`} value={key} />
         ))}
         {normalizedKeys.map((key: IntegrationApiKey) => (
            <ExistingApiKeyDisplay key={key.id ?? key.prefix ?? key.name} apiKey={key} />
         ))}
      </CardContent>
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
   exampleQueryParams?: Record<string, string>;
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
            method: "GET",
            path: "/customs-rates",
            name: "Get Customs Rates",
            description: "Get customs rates via Partner API. Requires API key authentication.",
            queryParams: [{ name: "query", type: "string", description: "Search query" }],
            exampleQueryParams: { query: "televisor" },
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
   const rawBaseUrl = import.meta.env.VITE_API_URL || "https://api.ctenvios.com/api/v1";
   const baseUrl = rawBaseUrl.includes("/partners") ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, "")}/partners`;
   const [apiKey, setApiKey] = useState("");
   const [responses, setResponses] = useState<Record<string, string>>({});
   const [loading, setLoading] = useState<Record<string, boolean>>({});
   const [exampleQueryOverrides, setExampleQueryOverrides] = useState<Record<string, string>>({});

   const getRequiredQuery = (endpoint: EndpointInfo): string => {
      if (!endpoint.queryParams || endpoint.queryParams.length === 0) return "";
      return endpoint.queryParams
         .filter((p) => p.required)
         .map((p, i) => `${p.name}=example${i > 0 ? "&" : ""}`)
         .join("&");
   };

   const buildExampleUrl = (endpoint: EndpointInfo, useExampleQuery: boolean): string => {
      const path = endpoint.path.replace(/\{[^}]+\}/g, (match) => {
         const paramName = match.slice(1, -1);
         const pathParam = endpoint.pathParams?.find((p) => p.name === paramName);
         return pathParam?.type === "number" ? "123" : "example";
      });
      const requiredQuery = getRequiredQuery(endpoint);
      const overrideKey = `${endpoint.method}-${endpoint.path}-example-query`;
      const overrideValue = exampleQueryOverrides[overrideKey]?.trim();
      const exampleQueryValue = overrideValue;
      const exampleQuery = exampleQueryValue ? `query=${encodeURIComponent(exampleQueryValue)}` : "";
      const query = useExampleQuery ? exampleQuery || requiredQuery : requiredQuery;
      const queryPrefix = query ? `?${query}` : "";
      return `${baseUrl}${path}${queryPrefix}`;
   };

   const runExample = async (endpoint: EndpointInfo): Promise<void> => {
      const overrideKey = `${endpoint.method}-${endpoint.path}-example-query`;
      const useExampleQuery = Boolean(exampleQueryOverrides[overrideKey]?.trim());
      const key = `${endpoint.method}-${endpoint.path}-default`;
      setLoading((prev) => ({ ...prev, [key]: true }));
      try {
         const url = buildExampleUrl(endpoint, useExampleQuery);
         const headers: Record<string, string> = { "Content-Type": "application/json" };
         if (apiKey.trim()) {
            headers.Authorization = `Bearer ${apiKey.trim()}`;
         }
         const response = await fetch(url, {
            method: endpoint.method,
            headers,
            body: endpoint.method === "POST" && endpoint.exampleBody ? endpoint.exampleBody : undefined,
         });
         const contentType = response.headers.get("content-type") || "";
         const payload = contentType.includes("application/json") ? await response.json() : await response.text();
         setResponses((prev) => ({
            ...prev,
            [key]: JSON.stringify(payload, null, 2),
         }));
      } catch (error) {
         setResponses((prev) => ({
            ...prev,
            [key]: JSON.stringify({ error: (error as Error).message }, null, 2),
         }));
      } finally {
         setLoading((prev) => ({ ...prev, [key]: false }));
      }
   };

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
            <div className="flex flex-col gap-2">
               <Field>
                  <FieldLabel htmlFor="partner-api-key">API Key (opcional para ejemplos)</FieldLabel>
                  <FieldContent>
                     <Input
                        id="partner-api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Pega tu API Key para probar ejemplos"
                     />
                  </FieldContent>
               </Field>
            </div>

            <Accordion type="multiple" className="w-full">
               {apiDocumentation.flatMap((resource) =>
                  resource.endpoints.map((endpoint, idx) => {
                     const accordionKey = `${resource.name}-${endpoint.method}-${endpoint.path}-${idx}`;
                     return (
                        <AccordionItem key={accordionKey} value={accordionKey}>
                           <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline" className={getMethodBadgeClassName(endpoint.method)}>
                                    {endpoint.method}
                                 </Badge>
                                 <span className="font-semibold">{endpoint.name}</span>
                              </div>
                           </AccordionTrigger>
                           <AccordionContent>
                              <div className="flex flex-col gap-3 pt-2">
                                 {endpoint.description && (
                                    <div className="text-sm text-muted-foreground">{endpoint.description}</div>
                                 )}
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
                                       <div className="text-xs font-semibold text-muted-foreground">Request Body:</div>
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
                                    <div className="text-xs font-semibold text-muted-foreground">Example Request:</div>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                       <code>
                                          {(() => {
                                             const useExampleQuery = Boolean(
                                                exampleQueryOverrides[
                                                   `${endpoint.method}-${endpoint.path}-example-query`
                                                ]?.trim(),
                                             );
                                             const url = buildExampleUrl(endpoint, useExampleQuery);
                                             return `${endpoint.method} ${url}`;
                                          })()}
                                       </code>
                                    </pre>
                                    {endpoint.exampleQueryParams && (
                                       <div className="flex flex-col gap-2">
                                          <Field>
                                             <FieldLabel
                                                htmlFor={`example-query-${endpoint.method}-${endpoint.path}`}
                                                className="text-xs"
                                             >
                                                Search query
                                             </FieldLabel>
                                             <FieldContent>
                                                <Input
                                                   id={`example-query-${endpoint.method}-${endpoint.path}`}
                                                   value={
                                                      exampleQueryOverrides[
                                                         `${endpoint.method}-${endpoint.path}-example-query`
                                                      ] ?? endpoint.exampleQueryParams.query
                                                   }
                                                   onChange={(e) =>
                                                      setExampleQueryOverrides((prev) => ({
                                                         ...prev,
                                                         [`${endpoint.method}-${endpoint.path}-example-query`]:
                                                            e.target.value,
                                                      }))
                                                   }
                                                   placeholder="televisor"
                                                />
                                             </FieldContent>
                                          </Field>
                                       </div>
                                    )}
                                    <div className="flex items-center mt-2 gap-2">
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          type="button"
                                          onClick={(e) => {
                                             e.preventDefault();
                                             e.stopPropagation();
                                             runExample(endpoint);
                                          }}
                                          disabled={loading[`${endpoint.method}-${endpoint.path}-default`]}
                                       >
                                          {loading[`${endpoint.method}-${endpoint.path}-default`]
                                             ? "Ejecutando..."
                                             : "Test"}
                                       </Button>
                                    </div>
                                    {responses[`${endpoint.method}-${endpoint.path}-default`] && (
                                       <div className="flex flex-col gap-1 mt-2">
                                          <div className="text-xs font-semibold text-muted-foreground">
                                             Live Response:
                                          </div>
                                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                             <code>{responses[`${endpoint.method}-${endpoint.path}-default`]}</code>
                                          </pre>
                                       </div>
                                    )}
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
                                             Note: For better readability, use the formatted JSON from the Example Body
                                             section above.
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </AccordionContent>
                        </AccordionItem>
                     );
                  }),
               )}
            </Accordion>
         </CardContent>
      </Card>
   );
};
