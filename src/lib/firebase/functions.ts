import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

// Inicializar Firebase Functions
const functions = getFunctions(app, 'us-central1');

// ============================================================================
// 🔐 1. USUARIOS Y AUTENTICACIÓN
// ============================================================================

interface CrearCobradorData {
  nombre: string;
  email: string;
  telefono: string;
  rol: 'ADMIN' | 'COBRADOR' | 'SUPERVISOR';
  password: string;
}

interface CrearCobradorResult {
  success: boolean;
  uid: string;
  mensaje: string;
  usuario: {
    uid: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

/**
 * Crea un usuario cobrador con cuenta de Firebase Authentication
 */
export async function crearCobrador(
  data: CrearCobradorData
): Promise<CrearCobradorResult> {
  try {
    const fn = httpsCallable<CrearCobradorData, CrearCobradorResult>(
      functions,
      'crearCobrador'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling crearCobrador:', error);
    throw new Error(error.message || 'Error al crear cobrador');
  }
}

// ============================================================================
// 💰 2. COMISIONES Y COBRADORES
// ============================================================================

interface CalcularComisionesData {
  cobradorId?: string;
  incluirDetalles?: boolean;
}

interface CalcularComisionesResult {
  success: boolean;
  porcentajeComision: number;
  hoy: {
    totalCobrado: number;
    comision: number;
    numeroPagos: number;
  };
  semana: {
    totalCobrado: number;
    comision: number;
    numeroPagos: number;
  };
  mes: {
    totalCobrado: number;
    comision: number;
    numeroPagos: number;
  };
  total: {
    totalCobrado: number;
    comision: number;
    numeroPagos: number;
  };
  detallesPagos?: Array<any>;
}

/**
 * Calcula las comisiones de un cobrador por período
 */
export async function calcularComisiones(
  data: CalcularComisionesData = {}
): Promise<CalcularComisionesResult> {
  try {
    const fn = httpsCallable<CalcularComisionesData, CalcularComisionesResult>(
      functions,
      'calcularComisiones'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling calcularComisiones:', error);
    throw new Error(error.message || 'Error al calcular comisiones');
  }
}

interface PagarComisionData {
  cobradorId: string;
  montoPagado: number;
  metodoPago: string;
  notas?: string;
}

interface PagarComisionResult {
  success: boolean;
  pagoId: string;
  mensaje: string;
  cobrador: {
    id: string;
    nombre: string;
    totalComisionesPagadas: number;
    totalComisionesGeneradas: number;
    saldoPendiente: number;
  };
}

/**
 * Registra el pago de comisión a un cobrador
 */
export async function pagarComision(
  data: PagarComisionData
): Promise<PagarComisionResult> {
  try {
    const fn = httpsCallable<PagarComisionData, PagarComisionResult>(
      functions,
      'pagarComision'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling pagarComision:', error);
    throw new Error(error.message || 'Error al pagar comisión');
  }
}

interface ReporteCobradorItem {
  cobradorId: string;
  cobradorNombre: string;
  porcentajeComision: number;
  totalCobrado: number;
  numeroPagos: number;
  comisionGenerada: number;
  comisionPendiente: number;
  prestamosAsignados: number;
  prestamosActivos: number;
}

interface GenerarReporteCobradoresData {
  periodo: 'SEMANA' | 'MES' | 'TOTAL';
  fechaInicio?: number;
  fechaFin?: number;
}

interface GenerarReporteCobradoresResult {
  success: boolean;
  periodo: string;
  fechaInicio: number;
  fechaFin: number;
  cobradores: ReporteCobradorItem[];
  totales: {
    totalCobrado: number;
    totalComisiones: number;
    totalComisionesPendientes: number;
    numeroPagos: number;
  };
}

/**
 * Genera reporte de comisiones de todos los cobradores
 */
export async function generarReporteCobradores(
  data: GenerarReporteCobradoresData
): Promise<GenerarReporteCobradoresResult> {
  try {
    const fn = httpsCallable<GenerarReporteCobradoresData, GenerarReporteCobradoresResult>(
      functions,
      'generarReporteCobradores'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling generarReporteCobradores:', error);
    throw new Error(error.message || 'Error al generar reporte');
  }
}

// ============================================================================
// 💳 3. PRÉSTAMOS Y PAGOS
// ============================================================================

interface CrearPrestamoData {
  clienteId: string;
  clienteNombre: string;
  monto: number;
  tasaInteresPorPeriodo: number;
  frecuenciaPago: 'DIARIO' | 'QUINCENAL' | 'MENSUAL';
  tipoAmortizacion: 'FRANCES' | 'ALEMAN';
  numeroCuotas: number;
  cobradorId?: string;
  cobradorNombre?: string;
  garantiaId?: string;
  notas?: string;
}

interface CrearPrestamoResult {
  success: boolean;
  prestamoId: string;
  mensaje: string;
  prestamo: {
    id: string;
    montoOriginal: number;
    numeroCuotas: number;
    montoCuotaFija: number;
    totalIntereses: number;
    totalAPagar: number;
  };
  cuotasCreadas: number;
}

/**
 * Crea un préstamo con su tabla de amortización completa
 */
export async function crearPrestamo(
  data: CrearPrestamoData
): Promise<CrearPrestamoResult> {
  try {
    const fn = httpsCallable<CrearPrestamoData, CrearPrestamoResult>(
      functions,
      'crearPrestamo'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling crearPrestamo:', error);
    throw new Error(error.message || 'Error al crear préstamo');
  }
}

interface RegistrarPagoData {
  prestamoId: string;
  cuotaId?: string;
  numeroCuota: number;
  clienteId: string;
  clienteNombre: string;
  montoPagado: number;
  montoMora?: number;
  metodoPago: string;
  notas?: string;
}

interface RegistrarPagoResult {
  success: boolean;
  pagoId: string;
  mensaje: string;
  pago: {
    montoPagado: number;
    montoAInteres: number;
    montoACapital: number;
    montoMora: number;
    capitalPendienteAntes: number;
    capitalPendienteDespues: number;
    diasTranscurridos: number;
  };
}

/**
 * Registra un pago de préstamo con cálculos automáticos
 */
export async function registrarPago(
  data: RegistrarPagoData
): Promise<RegistrarPagoResult> {
  try {
    const fn = httpsCallable<RegistrarPagoData, RegistrarPagoResult>(
      functions,
      'registrarPago'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling registrarPago:', error);
    throw new Error(error.message || 'Error al registrar pago');
  }
}

interface CuotaAmortizacion {
  numeroCuota: number;
  cuotaFija: number;
  capital: number;
  interes: number;
  balanceRestante: number;
}

interface CalcularTablaAmortizacionData {
  capitalInicial: number;
  tasaInteresPorPeriodo: number;
  numeroCuotas: number;
  tipoAmortizacion: 'FRANCES' | 'ALEMAN';
}

interface CalcularTablaAmortizacionResult {
  success: boolean;
  tabla: CuotaAmortizacion[];
  resumen: {
    capitalInicial: number;
    numeroCuotas: number;
    tasaInteresPorPeriodo: number;
    tipoAmortizacion: string;
    totalAPagar: number;
    totalIntereses: number;
    montoCuotaFija: number;
  };
}

/**
 * Calcula la tabla de amortización de un préstamo (para previsualización)
 */
export async function calcularTablaAmortizacion(
  data: CalcularTablaAmortizacionData
): Promise<CalcularTablaAmortizacionResult> {
  try {
    const fn = httpsCallable<CalcularTablaAmortizacionData, CalcularTablaAmortizacionResult>(
      functions,
      'calcularTablaAmortizacion'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling calcularTablaAmortizacion:', error);
    throw new Error(error.message || 'Error al calcular tabla de amortización');
  }
}

// ============================================================================
// 📊 4. DASHBOARD Y ESTADÍSTICAS
// ============================================================================

interface EstadisticasRequest {
  periodo?: 'HOY' | 'SEMANA' | 'MES' | 'TOTAL';
}

interface PrestamoReciente {
  id: string;
  clienteNombre: string;
  montoOriginal: number;
  capitalPendiente: number;
  estado: string;
  fechaInicio: number;
}

interface ObtenerEstadisticasDashboardResult {
  success: boolean;
  estadisticas: {
    totalPrestado: number;
    totalPrestadoActivo: number;
    interesesGenerados: number;
    totalCobrado: number;
    carteraVencida: number;
    prestamosActivos: number;
    prestamosAtrasados: number;
    prestamosCompletados: number;
    totalClientes: number;
    totalCobradores: number;
    numeroPagos: number;
  };
  prestamosRecientes: PrestamoReciente[];
}

/**
 * Obtiene estadísticas generales del sistema para el dashboard administrativo
 */
export async function obtenerEstadisticasDashboard(
  data: EstadisticasRequest = {}
): Promise<ObtenerEstadisticasDashboardResult> {
  try {
    const fn = httpsCallable<EstadisticasRequest, ObtenerEstadisticasDashboardResult>(
      functions,
      'obtenerEstadisticasDashboard'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling obtenerEstadisticasDashboard:', error);
    throw new Error(error.message || 'Error al obtener estadísticas');
  }
}

// ============================================================================
// 👥 5. CLIENTES
// ============================================================================

interface EstadisticasClienteRequest {
  clienteId: string;
}

interface PrestamoCliente {
  id: string;
  montoOriginal: number;
  capitalPendiente: number;
  estado: string;
  fechaInicio: number;
  cuotasPagadas: number;
  numeroCuotas: number;
}

interface ObtenerEstadisticasClienteResult {
  success: boolean;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email: string;
    fechaRegistro: number;
  };
  estadisticas: {
    prestamosActivos: number;
    prestamosCompletados: number;
    prestamosAtrasados: number;
    totalPrestado: number;
    totalPagado: number;
    capitalPendiente: number;
    pagosRealizados: number;
    ultimoPago: number | null;
    promedioMontoPago: number;
    diasPromedioAtraso: number;
  };
  prestamos: PrestamoCliente[];
}

/**
 * Obtiene estadísticas detalladas de un cliente específico
 */
export async function obtenerEstadisticasCliente(
  data: EstadisticasClienteRequest
): Promise<ObtenerEstadisticasClienteResult> {
  try {
    const fn = httpsCallable<EstadisticasClienteRequest, ObtenerEstadisticasClienteResult>(
      functions,
      'obtenerEstadisticasCliente'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling obtenerEstadisticasCliente:', error);
    throw new Error(error.message || 'Error al obtener estadísticas del cliente');
  }
}

interface BuscarClientesRequest {
  query: string;
  limite?: number;
}

interface ClienteBuscado {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  prestamosActivos: number;
  fechaRegistro: number;
}

interface BuscarClientesResult {
  success: boolean;
  clientes: ClienteBuscado[];
}

/**
 * Busca clientes por nombre, teléfono o email
 */
export async function buscarClientes(
  data: BuscarClientesRequest
): Promise<BuscarClientesResult> {
  try {
    const fn = httpsCallable<BuscarClientesRequest, BuscarClientesResult>(
      functions,
      'buscarClientes'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling buscarClientes:', error);
    throw new Error(error.message || 'Error al buscar clientes');
  }
}

// ============================================================================
// 🔧 6. GESTIÓN DE PRÉSTAMOS
// ============================================================================

interface ActualizarPrestamoData {
  prestamoId: string;
  cambios: {
    cobradorId?: string;
    cobradorNombre?: string;
    tasaInteresPorPeriodo?: number;
    notas?: string;
    estado?: 'ACTIVO' | 'ATRASADO' | 'COMPLETADO' | 'CANCELADO';
  };
}

interface ActualizarPrestamoResult {
  success: boolean;
  mensaje: string;
  prestamo: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Actualiza los datos de un préstamo (cobrador, notas, estado)
 */
export async function actualizarPrestamo(
  data: ActualizarPrestamoData
): Promise<ActualizarPrestamoResult> {
  try {
    const fn = httpsCallable<ActualizarPrestamoData, ActualizarPrestamoResult>(
      functions,
      'actualizarPrestamo'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling actualizarPrestamo:', error);
    throw new Error(error.message || 'Error al actualizar préstamo');
  }
}

interface EliminarPrestamoData {
  prestamoId: string;
  motivo?: string;
}

interface EliminarPrestamoResult {
  success: boolean;
  mensaje: string;
  eliminados: {
    prestamo: boolean;
    cuotas: number;
    pagos: number;
  };
}

/**
 * Elimina un préstamo y todos sus datos relacionados (cuotas, pagos)
 * ⚠️ OPERACIÓN DESTRUCTIVA
 */
export async function eliminarPrestamo(
  data: EliminarPrestamoData
): Promise<EliminarPrestamoResult> {
  try {
    const fn = httpsCallable<EliminarPrestamoData, EliminarPrestamoResult>(
      functions,
      'eliminarPrestamo'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling eliminarPrestamo:', error);
    throw new Error(error.message || 'Error al eliminar préstamo');
  }
}

interface AsignarCobradorData {
  prestamoId: string;
  cobradorId: string;
}

interface AsignarCobradorResult {
  success: boolean;
  mensaje: string;
  prestamo: {
    id: string;
    cobradorId: string;
    cobradorNombre: string;
  };
}

/**
 * Asigna o reasigna un cobrador a un préstamo
 */
export async function asignarCobradorAPrestamo(
  data: AsignarCobradorData
): Promise<AsignarCobradorResult> {
  try {
    const fn = httpsCallable<AsignarCobradorData, AsignarCobradorResult>(
      functions,
      'asignarCobradorAPrestamo'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling asignarCobradorAPrestamo:', error);
    throw new Error(error.message || 'Error al asignar cobrador');
  }
}

// ============================================================================
// 📝 7. HISTORIAL Y CONSULTAS
// ============================================================================

interface HistorialPagosRequest {
  prestamoId?: string;
  clienteId?: string;
  cobradorId?: string;
  fechaInicio?: number;
  fechaFin?: number;
  limite?: number;
}

interface PagoHistorial {
  id: string;
  prestamoId: string;
  clienteNombre: string;
  montoPagado: number;
  montoAInteres: number;
  montoACapital: number;
  montoMora: number;
  fechaPago: number;
  recibidoPor: string;
  metodoPago: string;
  numeroCuota: number;
}

interface ObtenerHistorialPagosResult {
  success: boolean;
  pagos: PagoHistorial[];
  totales: {
    totalPagado: number;
    totalInteres: number;
    totalCapital: number;
    totalMoras: number;
    numeroPagos: number;
  };
}

/**
 * Obtiene historial de pagos con filtros opcionales
 */
export async function obtenerHistorialPagos(
  data: HistorialPagosRequest = {}
): Promise<ObtenerHistorialPagosResult> {
  try {
    const fn = httpsCallable<HistorialPagosRequest, ObtenerHistorialPagosResult>(
      functions,
      'obtenerHistorialPagos'
    );
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling obtenerHistorialPagos:', error);
    throw new Error(error.message || 'Error al obtener historial de pagos');
  }
}

// ============================================================================
// 📤 EXPORTAR TIPOS
// ============================================================================

export type {
  // Cobradores
  CrearCobradorData,
  CrearCobradorResult,
  CalcularComisionesData,
  CalcularComisionesResult,
  PagarComisionData,
  PagarComisionResult,
  GenerarReporteCobradoresData,
  GenerarReporteCobradoresResult,
  ReporteCobradorItem,
  // Préstamos
  CrearPrestamoData,
  CrearPrestamoResult,
  RegistrarPagoData,
  RegistrarPagoResult,
  CalcularTablaAmortizacionData,
  CalcularTablaAmortizacionResult,
  CuotaAmortizacion,
  // Dashboard
  EstadisticasRequest,
  ObtenerEstadisticasDashboardResult,
  PrestamoReciente,
  // Clientes
  EstadisticasClienteRequest,
  ObtenerEstadisticasClienteResult,
  PrestamoCliente,
  BuscarClientesRequest,
  BuscarClientesResult,
  ClienteBuscado,
  // Gestión de préstamos
  ActualizarPrestamoData,
  ActualizarPrestamoResult,
  EliminarPrestamoData,
  EliminarPrestamoResult,
  AsignarCobradorData,
  AsignarCobradorResult,
  // Historial
  HistorialPagosRequest,
  ObtenerHistorialPagosResult,
  PagoHistorial,
};

