// src/types/prestamo.ts

export type EstadoPrestamo = 'ACTIVO' | 'ATRASADO' | 'COMPLETADO' | 'CANCELADO';
export type FrecuenciaPago = 'DIARIO' | 'QUINCENAL' | 'MENSUAL';
export type TipoAmortizacion = 'FRANCES' | 'ALEMAN';

export interface Prestamo {
  // Identificación
  id: string;
  
  // Información del Cliente
  clienteId: string;
  clienteNombre: string;
  
  // Información del Cobrador (opcional)
  cobradorId?: string;
  cobradorNombre?: string;
  
  // Detalles del Préstamo
  montoOriginal: number;              // Monto inicial del préstamo
  capitalPendiente: number;           // Capital que falta por pagar
  tasaInteresPorPeriodo: number;      // Tasa de interés por período (%)
  frecuenciaPago: FrecuenciaPago;     // DIARIO | QUINCENAL | MENSUAL
  tipoAmortizacion: TipoAmortizacion; // FRANCES | ALEMAN
  numeroCuotas: number;               // Total de cuotas
  montoCuotaFija?: number;            // Cuota fija (solo para sistema francés)
  
  // Progreso
  cuotasPagadas: number;              // Cuotas que ya se pagaron
  
  // Fechas
  fechaInicio: number;                // Timestamp de inicio
  fechaVencimiento: number;           // Timestamp de vencimiento
  ultimaFechaPago?: number;           // Timestamp del último pago
  
  // Estado
  estado: EstadoPrestamo;             // ACTIVO | ATRASADO | COMPLETADO | CANCELADO
  
  // Totales
  totalInteresesPagados: number;      // Total de intereses pagados
  totalCapitalPagado: number;         // Total de capital pagado
  totalMorasPagadas: number;          // Total de moras pagadas
  
  // Garantía (opcional)
  garantiaId?: string;
  
  // Metadata
  notas?: string;
  fechaCreacion?: number;
  fechaActualizacion?: number;
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
}

export interface Cuota {
  id: string;
  prestamoId: string;
  numeroCuota: number;
  fechaVencimiento: number;
  montoACapital: number;
  montoAInteres: number;
  montoCuotaMinimo: number;
  capitalPendienteInicio: number;
  capitalPendienteFinal: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'ATRASADA';
  montoPagado?: number;
  fechaPago?: number;
  montoMora?: number;
}

