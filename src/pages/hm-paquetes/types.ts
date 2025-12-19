/**
 * Tipos específicos para el módulo de tracking HM Paquetes
 */

export interface Manifest {
   manifiesto: string;
}

export interface ManifestResponse {
   success: boolean;
   datos: Manifest[];
}

export interface HistorialEvent {
   tipo: string;
   fecha: string;
   evento: string;
   detalle: string;
   usuario: string;
}

export interface Shipment {
   envio: {
      id: number;
      codigo: string;
      estado: string;
      destinatario: string;
   };
   historial: HistorialEvent[];
   ultima_actualizacion: string;
}

export interface ManifestHistoryResponse {
   success: boolean;
   manifiesto: {
      id: number;
      codigo: string;
      agencia: string;
   };
   envios: Shipment[];
}

