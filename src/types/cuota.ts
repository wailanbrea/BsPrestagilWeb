// src/types/cuota.ts

export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'VENCIDA' | 'CANCELADA';

export interface Cuota {
  // Identificación
  id: string;
  prestamoId: string;                 // FK → Prestamo
  numeroCuota: number;                // 1, 2, 3... (ordinal)
  
  // Fechas
  fechaVencimiento: number;           // Timestamp cuándo debe pagar
  fechaPago?: number;                 // Timestamp cuándo pagó (null si no ha pagado)
  
  // Montos Proyectados
  montoCuotaMinimo: number;           // Mínimo a pagar (interés del período)
  capitalPendienteAlInicio: number;   // Capital al inicio de esta cuota
  
  // Montos Reales Pagados
  montoPagado: number;                // 0 si no ha pagado, monto real si pagó
  montoAInteres: number;              // Cuánto del pago fue a interés
  montoACapital: number;              // Cuánto del pago fue a capital
  montoMora: number;                  // Mora cobrada (si hubo retraso)
  
  // Estado
  estado: EstadoCuota;                // "PENDIENTE" | "PAGADA" | "PARCIAL" | "VENCIDA" | "CANCELADA"
  
  // Notas
  notas: string;                      // Info adicional
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
}
