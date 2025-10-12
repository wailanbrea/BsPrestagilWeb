// src/types/pago.ts

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';

export interface Pago {
  // Identificación
  id: string;
  prestamoId: string;                 // FK → Prestamo
  cuotaId?: string;                   // FK → Cuota (vinculación opcional)
  numeroCuota: number;                // Número de cuota para reportes
  clienteId: string;                  // FK → Cliente
  clienteNombre: string;              // Desnormalizado
  
  // Montos Detallados
  montoPagado: number;                // Total que dio el cliente: 2550.00
  montoAInteres: number;              // Cuánto se aplicó al interés: 2000.00
  montoACapital: number;              // Cuánto se aplicó al capital: 500.00
  montoMora: number;                  // Mora cobrada (si hubo): 50.00
  
  // Contexto del Pago
  fechaPago: number;                  // Timestamp del pago
  diasTranscurridos: number;          // Días desde el último pago: 32
  interesCalculado: number;           // Interés calculado del período: 2000.00
  
  // Estados de Capital
  capitalPendienteAntes: number;      // Capital antes del pago: 10000.00
  capitalPendienteDespues: number;    // Capital después del pago: 9500.00
  
  // Detalles de la Transacción
  metodoPago: MetodoPago;             // "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO"
  recibidoPor: string;                // Email del usuario que recibió el pago
  notas: string;                      // Observaciones
  reciboUrl: string;                  // URL del recibo PDF (opcional)
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
}
