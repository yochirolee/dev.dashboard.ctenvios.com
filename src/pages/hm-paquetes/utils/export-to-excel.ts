import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Shipment } from "../types";
import { getEffectiveStatus, getCurrentWarehouse, normalizeStatusName, getMostRelevantEvent } from "./status-utils";

/**
 * Exporta los envíos filtrados a un archivo Excel
 */
export function exportShipmentsToExcel(shipments: Shipment[], manifestName: string): void {
   // Preparar los datos para Excel
   const excelData = shipments.map((shipment) => {
      const mostRelevantEvent = getMostRelevantEvent(shipment);
      const effectiveStatus = getEffectiveStatus(shipment);
      const currentWarehouse = getCurrentWarehouse(shipment);

      return {
         Código: shipment.envio.codigo,
         Destinatario: shipment.envio.destinatario,
         Estado: normalizeStatusName(effectiveStatus),
         Almacén: currentWarehouse || "-",
         "Última Actualización": format(new Date(shipment.ultima_actualizacion), "yyyy-MM-dd HH:mm:ss"),
         "Último Evento": mostRelevantEvent?.evento || "-",
         "Detalle Evento": mostRelevantEvent?.detalle || "-",
         "Usuario Evento": mostRelevantEvent?.usuario || "-",
         "Fecha Evento": mostRelevantEvent ? format(new Date(mostRelevantEvent.fecha), "yyyy-MM-dd HH:mm:ss") : "-",
      };
   });

   // Crear un nuevo libro de trabajo
   const wb = XLSX.utils.book_new();

   // Crear una hoja de cálculo con los datos
   const ws = XLSX.utils.json_to_sheet(excelData);

   // Ajustar el ancho de las columnas
   const columnWidths = [
      { wch: 20 }, // Código
      { wch: 30 }, // Destinatario
      { wch: 15 }, // Estado
      { wch: 20 }, // Almacén
      { wch: 20 }, // Última Actualización
      { wch: 20 }, // Último Evento
      { wch: 50 }, // Detalle Evento
      { wch: 15 }, // Usuario Evento
      { wch: 20 }, // Fecha Evento
   ];
   ws["!cols"] = columnWidths;

   // Agregar la hoja al libro
   XLSX.utils.book_append_sheet(wb, ws, "Envíos");

   // Generar el nombre del archivo (limpiar caracteres especiales)
   const cleanManifestName = manifestName.replace(/[^a-zA-Z0-9]/g, "_");
   const fileName = `${cleanManifestName}_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.xlsx`;

   // Escribir el archivo
   XLSX.writeFile(wb, fileName);
}

