// src/lib/utils/amortizacion.ts
import { TipoAmortizacion, FrecuenciaPago } from '@/types/prestamo';
import { Cuota } from '@/types/cuota';

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
  fechaInicio: number
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
      
      cuotas.push({
        id: `${prestamoId}_cuota_${i}`,
        prestamoId,
        numeroCuota: i,
        fechaVencimiento,
        montoCuotaMinimo: interes,        // Mínimo a pagar (el interés)
        capitalPendienteAlInicio: saldoPendiente,
        montoPagado: 0,
        montoAInteres: 0,
        montoACapital: 0,
        montoMora: 0,
        estado: 'PENDIENTE',
        notas: `Interés proyectado: $${interes.toFixed(2)}, Capital: $${amortizacion.toFixed(2)}`,
        lastSyncTime: Date.now(),
      });
      
      saldoPendiente = Math.max(0, saldoPendiente - amortizacion);
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
      
      cuotas.push({
        id: `${prestamoId}_cuota_${i}`,
        prestamoId,
        numeroCuota: i,
        fechaVencimiento,
        montoCuotaMinimo: interes,        // Mínimo a pagar (el interés)
        capitalPendienteAlInicio: saldoPendiente,
        montoPagado: 0,
        montoAInteres: 0,
        montoACapital: 0,
        montoMora: 0,
        estado: 'PENDIENTE',
        notas: `Interés proyectado: $${interes.toFixed(2)}, Capital: $${amortizacion.toFixed(2)}`,
        lastSyncTime: Date.now(),
      });
      
      saldoPendiente = Math.max(0, saldoPendiente - amortizacion);
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
      
      cuotasRecalculadas.push({
        ...cuota,
        montoCuotaMinimo: interes,
        capitalPendienteAlInicio: saldoPendiente,
        notas: `Interés proyectado: $${interes.toFixed(2)}, Capital: $${amortizacion.toFixed(2)}`,
        lastSyncTime: Date.now(),
      });
      
      saldoPendiente = Math.max(0, saldoPendiente - amortizacion);
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
      
      cuotasRecalculadas.push({
        ...cuota,
        montoCuotaMinimo: interes,
        capitalPendienteAlInicio: saldoPendiente,
        notas: `Interés proyectado: $${interes.toFixed(2)}, Capital: $${amortizacion.toFixed(2)}`,
        lastSyncTime: Date.now(),
      });
      
      saldoPendiente = Math.max(0, saldoPendiente - amortizacion);
    });
  }
  
  return cuotasRecalculadas;
}
