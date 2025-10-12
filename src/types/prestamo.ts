// src/types/prestamo.ts

export type EstadoPrestamo = 'ACTIVO' | 'ATRASADO' | 'COMPLETADO' | 'CANCELADO';
export type FrecuenciaPago = 'DIARIO' | 'QUINCENAL' | 'MENSUAL';
export type TipoAmortizacion = 'FRANCES' | 'ALEMAN';

export interface Prestamo {
  // Identificación
  id: string;
  clienteId: string;
  clienteNombre: string;              // Desnormalizado para queries rápidas
  
  // Asignación de Cobrador
  cobradorId?: string;                // FK → Usuario (rol COBRADOR)
  cobradorNombre?: string;            // Nombre del cobrador
  
  // Montos Principales
  montoOriginal: number;              // Capital inicial prestado
  capitalPendiente: number;           // Capital que aún debe
  
  // Condiciones del Préstamo
  tasaInteresPorPeriodo: number;      // 20.0 = 20% mensual
  frecuenciaPago: FrecuenciaPago;     // "DIARIO" | "QUINCENAL" | "MENSUAL"
  tipoAmortizacion: TipoAmortizacion; // "FRANCES" | "ALEMAN"
  numeroCuotas: number;               // 12 cuotas
  montoCuotaFija: number;             // Cuota fija (Francés) o primera cuota (Alemán)
  cuotasPagadas: number;              // Cuántas cuotas completadas
  
  // Garantía
  garantiaId?: string;                // FK → Garantia (opcional)
  
  // Fechas
  fechaInicio: number;                // Timestamp inicio del préstamo
  ultimaFechaPago: number;            // Timestamp del último pago (para cálculos)
  
  // Estado
  estado: EstadoPrestamo;             // "ACTIVO" | "ATRASADO" | "COMPLETADO" | "CANCELADO"
  
  // Históricos (acumulados)
  totalInteresesPagados: number;      // Total histórico de intereses pagados
  totalCapitalPagado: number;         // Total histórico de capital pagado
  totalMorasPagadas: number;          // Total histórico de moras pagadas
  
  // Notas
  notas: string;                      // Observaciones adicionales
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
}
