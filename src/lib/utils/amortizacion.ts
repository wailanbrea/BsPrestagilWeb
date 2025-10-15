// src/lib/utils/amortizacion.ts
import { TipoAmortizacion, FrecuenciaPago, Cuota } from '@/types/prestamo';

const TOLERANCIA_DECIMAL = 0.01;

export function calcularMontoCuotaFija(
  capital: number,
  tasaPeriodo: number,
  numeroCuotas: number
): number {
  if (tasaPeriodo === 0) return capital / numeroCuotas;
  
  const tasaDecimal = tasaPeriodo / 100;
  const factor = Math.pow(1 + tasaDecimal, numeroCuotas);
  return (capital * tasaDecimal * factor) / (factor - 1);
}

export function generarCronograma(
  prestamoId: string,
  capital: number,
  tasaPeriodo: number,
  numeroCuotas: number,
  tipoAmortizacion: TipoAmortizacion,
  frecuenciaPago: FrecuenciaPago,
  fechaInicio: number,
  adminId: string = ''
): Cuota[] {
  const cuotas: Cuota[] = [];
  const tasaDecimal = tasaPeriodo / 100;
  let saldoPendiente = capital;
  
  // Calcular días entre cuotas
  const diasEntreCuotas = 
    frecuenciaPago === 'DIARIO' ? 1 :
    frecuenciaPago === 'QUINCENAL' ? 15 :
    30; // MENSUAL

  if (tipoAmortizacion === 'FRANCES') {
    // Sistema Francés: Cuota fija
    const montoCuota = calcularMontoCuotaFija(capital, tasaPeriodo, numeroCuotas);
    
    for (let i = 1; i <= numeroCuotas; i++) {
      const interes = saldoPendiente * tasaDecimal;
      let amortizacion = montoCuota - interes;
      
      // Ajuste final
      if (i === numeroCuotas || saldoPendiente - amortizacion < TOLERANCIA_DECIMAL) {
        amortizacion = saldoPendiente;
      }
      
      const fechaVencimiento = fechaInicio + (diasEntreCuotas * i * 24 * 60 * 60 * 1000);
      const saldoFinal = Math.max(0, saldoPendiente - amortizacion);
      
      cuotas.push({
        id: `${prestamoId}_cuota_${i}`,
        adminId: adminId,
        prestamoId,
        numeroCuota: i,
        fechaVencimiento,
        montoCuotaMinimo: montoCuota,
        capitalPendienteInicio: saldoPendiente,
        capitalPendienteFinal: saldoFinal,
        montoAInteres: 0,
        montoACapital: 0,
        estado: 'PENDIENTE',
      });
      
      saldoPendiente = saldoFinal;
    }
  } else {
    // Sistema Alemán: Capital fijo
    const capitalFijo = capital / numeroCuotas;
    
    for (let i = 1; i <= numeroCuotas; i++) {
      const interes = saldoPendiente * tasaDecimal;
      let amortizacion = capitalFijo;
      
      // Ajuste final
      if (i === numeroCuotas) {
        amortizacion = saldoPendiente;
      }
      
      const fechaVencimiento = fechaInicio + (diasEntreCuotas * i * 24 * 60 * 60 * 1000);
      const montoCuota = interes + amortizacion;
      const saldoFinal = Math.max(0, saldoPendiente - amortizacion);
      
      cuotas.push({
        id: `${prestamoId}_cuota_${i}`,
        adminId: adminId,
        prestamoId,
        numeroCuota: i,
        fechaVencimiento,
        montoCuotaMinimo: montoCuota,
        capitalPendienteInicio: saldoPendiente,
        capitalPendienteFinal: saldoFinal,
        montoAInteres: 0,
        montoACapital: 0,
        estado: 'PENDIENTE',
      });
      
      saldoPendiente = saldoFinal;
    }
  }
  
  return cuotas;
}

export function recalcularCuotasFuturas(
  cuotasPendientes: Cuota[],
  capitalRestante: number,
  tasaPeriodo: number,
  tipoAmortizacion: TipoAmortizacion
): Cuota[] {
  if (cuotasPendientes.length === 0) return [];
  
  const tasaDecimal = tasaPeriodo / 100;
  let saldoPendiente = capitalRestante;
  const cuotasRecalculadas: Cuota[] = [];
  
  if (tipoAmortizacion === 'FRANCES') {
    const nuevaMontoCuota = calcularMontoCuotaFija(
      capitalRestante,
      tasaPeriodo,
      cuotasPendientes.length
    );
    
    cuotasPendientes.forEach((cuota, index) => {
      const interes = saldoPendiente * tasaDecimal;
      let amortizacion = nuevaMontoCuota - interes;
      
      if (index === cuotasPendientes.length - 1 || 
          saldoPendiente - amortizacion < TOLERANCIA_DECIMAL) {
        amortizacion = saldoPendiente;
      }
      
      const saldoFinal = Math.max(0, saldoPendiente - amortizacion);
      
      cuotasRecalculadas.push({
        ...cuota,
        montoCuotaMinimo: nuevaMontoCuota,
        capitalPendienteInicio: saldoPendiente,
        capitalPendienteFinal: saldoFinal,
      });
      
      saldoPendiente = saldoFinal;
    });
  } else {
    // Sistema Alemán: reducir intereses
    const capitalFijo = capitalRestante / cuotasPendientes.length;
    
    cuotasPendientes.forEach((cuota, index) => {
      const interes = saldoPendiente * tasaDecimal;
      let amortizacion = capitalFijo;
      
      if (index === cuotasPendientes.length - 1) {
        amortizacion = saldoPendiente;
      }
      
      const montoCuota = interes + amortizacion;
      const saldoFinal = Math.max(0, saldoPendiente - amortizacion);
      
      cuotasRecalculadas.push({
        ...cuota,
        montoCuotaMinimo: montoCuota,
        capitalPendienteInicio: saldoPendiente,
        capitalPendienteFinal: saldoFinal,
      });
      
      saldoPendiente = saldoFinal;
    });
  }
  
  return cuotasRecalculadas;
}
