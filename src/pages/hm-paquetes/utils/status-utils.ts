import type { Shipment, HistorialEvent } from "../types";

/**
 * Normaliza el nombre del estado para mostrar en la UI
 */
export function normalizeStatusName(status: string): string {
   if (status === "Recibido") {
      return "En Almacén";
   }
   return status;
}

/**
 * Extrae el nombre del almacén del detalle de un evento
 * Patrones comunes:
 * - "Se da entrada en el almacén [NOMBRE]"
 * - "Transferido del almacén [NOMBRE] a [OTRO]"
 * - "Transferido del almacén [NOMBRE] a [OTRO]"
 */
function extractWarehouseFromDetail(detalle: string): string | null {
   if (!detalle) return null;

   // Patrón: "Se da entrada en el almacén [NOMBRE]"
   const entradaMatch = detalle.match(/Se da entrada en el almacén\s+([^.]+)/i);
   if (entradaMatch) {
      return entradaMatch[1].trim();
   }

   // Patrón: "Transferido del almacén [NOMBRE] a [OTRO]"
   const transferenciaMatch = detalle.match(/Transferido del almacén\s+([^.]+?)\s+a\s+([^.]+)/i);
   if (transferenciaMatch) {
      // Retornar el almacén destino (el segundo)
      return transferenciaMatch[2].trim();
   }

   // Patrón: "Transferido del almacén [NOMBRE]"
   const transferenciaSimpleMatch = detalle.match(/Transferido del almacén\s+([^.]+)/i);
   if (transferenciaSimpleMatch) {
      return transferenciaSimpleMatch[1].trim();
   }

   return null;
}

/**
 * Obtiene la prioridad de un evento para determinar el estado efectivo
 * Mayor número = mayor prioridad (estado más avanzado)
 */
function getEventPriority(event: HistorialEvent): number {
   const evento = event.evento.toLowerCase();
   const tipo = event.tipo?.toLowerCase() || "";
   const detalle = event.detalle?.toLowerCase() || "";

   // Prioridad 5: Entregas (estado final)
   if (
      evento === "entrega exitosa" ||
      evento === "desconocido" ||
      detalle.includes("entrega confirmada") ||
      detalle.includes("entrega exitosa") ||
      tipo.includes("entrega")
   ) {
      return 5;
   }

   // Prioridad 4: Despachado (en tránsito)
   if (evento === "despachado" || tipo.includes("despacho")) {
      return 4;
   }

   // Prioridad 3: Transferencia (movimiento entre almacenes)
   if (evento === "transferencia" || tipo.includes("transferencia") || detalle.includes("transferido")) {
      return 3;
   }

   // Prioridad 2: Entrada (en almacén)
   if (evento === "entrada" || tipo.includes("entrada") || detalle.includes("se da entrada")) {
      return 2;
   }

   // Prioridad 1: Otros eventos
   return 1;
}

/**
 * Obtiene el estado efectivo de un envío basado en el evento más relevante del historial
 * Busca el evento con mayor prioridad lógica, no necesariamente el más reciente por fecha
 */
export function getEffectiveStatus(shipment: Shipment): string {
   if (!shipment.historial || shipment.historial.length === 0) {
      return shipment.envio.estado;
   }

   // Encontrar el evento con mayor prioridad
   let highestPriorityEvent: HistorialEvent | null = null;
   let highestPriority = 0;

   for (const event of shipment.historial) {
      const priority = getEventPriority(event);
      if (priority > highestPriority) {
         highestPriority = priority;
         highestPriorityEvent = event;
      }
   }

   if (!highestPriorityEvent) {
      return shipment.envio.estado;
   }

   const evento = highestPriorityEvent.evento.toLowerCase();
   const tipo = highestPriorityEvent.tipo?.toLowerCase() || "";
   const detalle = highestPriorityEvent.detalle?.toLowerCase() || "";

   // Si el evento más relevante es una entrega, retornar "Entregado"
   if (
      evento === "entrega exitosa" ||
      evento === "desconocido" ||
      detalle.includes("entrega confirmada") ||
      detalle.includes("entrega exitosa") ||
      tipo.includes("entrega")
   ) {
      return "Entregado";
   }

   // Si el evento más relevante es "Despachado", retornar "Despachado"
   if (evento === "despachado" || tipo.includes("despacho")) {
      return "Despachado";
   }

   // De lo contrario, usar el estado original del envío
   return shipment.envio.estado;
}

/**
 * Obtiene el almacén actual de un envío basado en el historial
 * Busca el evento más relevante que mencione un almacén (priorizando eventos de entrada/transferencia)
 */
export function getCurrentWarehouse(shipment: Shipment): string | null {
   if (!shipment.historial || shipment.historial.length === 0) {
      return null;
   }

   // Priorizar eventos de entrada y transferencia para obtener el almacén actual
   const warehouseEvents = shipment.historial
      .map((event) => ({
         event,
         warehouse: extractWarehouseFromDetail(event.detalle),
         priority: getEventPriority(event),
      }))
      .filter((item) => item.warehouse !== null)
      .sort((a, b) => b.priority - a.priority);

   // Retornar el almacén del evento con mayor prioridad que tenga almacén
   if (warehouseEvents.length > 0) {
      return warehouseEvents[0].warehouse;
   }

   return null;
}

/**
 * Extrae todos los almacenes únicos del historial de un envío
 */
export function getAllWarehousesFromShipment(shipment: Shipment): string[] {
   const warehouses = new Set<string>();
   shipment.historial.forEach((event) => {
      const warehouse = extractWarehouseFromDetail(event.detalle);
      if (warehouse) {
         warehouses.add(warehouse);
      }
   });
   return Array.from(warehouses);
}

/**
 * Extrae todos los almacenes únicos de una lista de envíos
 * Busca en todo el historial de cada envío
 */
export function getAllWarehousesFromShipments(shipments: Shipment[]): string[] {
   const warehouses = new Set<string>();
   shipments.forEach((shipment) => {
      shipment.historial.forEach((event) => {
         const warehouse = extractWarehouseFromDetail(event.detalle);
         if (warehouse) {
            warehouses.add(warehouse);
         }
      });
   });
   return Array.from(warehouses).sort();
}

/**
 * Obtiene el evento más relevante del historial basado en prioridad lógica
 */
export function getMostRelevantEvent(shipment: Shipment): HistorialEvent | null {
   if (!shipment.historial || shipment.historial.length === 0) {
      return null;
   }

   let highestPriorityEvent: HistorialEvent | null = null;
   let highestPriority = 0;

   for (const event of shipment.historial) {
      const priority = getEventPriority(event);
      if (priority > highestPriority) {
         highestPriority = priority;
         highestPriorityEvent = event;
      }
   }

   return highestPriorityEvent;
}

