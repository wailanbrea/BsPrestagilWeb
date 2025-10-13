import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './config';

// Inicializar Firebase Functions
const functions = getFunctions(app, 'us-central1');

// ⭐ Tipos para las funciones
interface CrearCobradorData {
  nombre: string;
  email: string;
  telefono: string;
  password?: string;
  porcentajeComision?: number;
}

interface CrearCobradorResult {
  success: boolean;
  userId?: string;
  email?: string;
  password?: string;
  message?: string;
}

interface RegistrarPagoData {
  prestamoId: string;
  clienteId: string;
  montoPagado: number;
  montoAInteres: number;
  montoACapital: number;
  montoMora: number;
  metodoPago: string;
  notas?: string;
  clienteNombre: string;
  diasTranscurridos: number;
  interesCalculado: number;
  capitalPendienteAntes: number;
  capitalPendienteDespues: number;
  numeroCuota: number;
}

interface RegistrarPagoResult {
  success: boolean;
  pagoId?: string;
  message?: string;
}

/**
 * ⭐ Función para crear un cobrador con Firebase Cloud Function
 * 
 * @param data - Datos del cobrador a crear
 * @returns Resultado con userId y credenciales
 * 
 * @example
 * const result = await crearCobrador({
 *   nombre: 'Juan Pérez',
 *   email: 'juan@email.com',
 *   telefono: '+52 999 123 4567',
 *   porcentajeComision: 5
 * });
 */
export async function crearCobrador(
  data: CrearCobradorData
): Promise<CrearCobradorResult> {
  try {
    const crearCobradorFunction = httpsCallable<CrearCobradorData, CrearCobradorResult>(
      functions,
      'crearCobrador'
    );

    const result = await crearCobradorFunction(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling crearCobrador function:', error);
    throw new Error(error.message || 'Error al crear cobrador');
  }
}

/**
 * ⭐ Función para registrar un pago con Firebase Cloud Function
 * 
 * @param data - Datos del pago a registrar
 * @returns Resultado con pagoId
 * 
 * @example
 * const result = await registrarPago({
 *   prestamoId: 'prestamo123',
 *   clienteId: 'cliente456',
 *   montoPagado: 1000,
 *   montoAInteres: 50,
 *   montoACapital: 950,
 *   montoMora: 0,
 *   metodoPago: 'EFECTIVO',
 *   clienteNombre: 'Juan Pérez',
 *   diasTranscurridos: 30,
 *   interesCalculado: 50,
 *   capitalPendienteAntes: 10000,
 *   capitalPendienteDespues: 9050,
 *   numeroCuota: 1
 * });
 */
export async function registrarPago(
  data: RegistrarPagoData
): Promise<RegistrarPagoResult> {
  try {
    const registrarPagoFunction = httpsCallable<RegistrarPagoData, RegistrarPagoResult>(
      functions,
      'registrarPago'
    );

    const result = await registrarPagoFunction(data);
    return result.data;
  } catch (error: any) {
    console.error('Error calling registrarPago function:', error);
    throw new Error(error.message || 'Error al registrar pago');
  }
}

