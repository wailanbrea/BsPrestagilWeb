// src/lib/utils/pagos.ts

/**
 * Extrae la distribución de interés y capital del cronograma guardado en las notas de una cuota
 * Formato esperado: "Interés proyectado: $4,000.00, Capital: $3,333.00"
 */
export function extraerDistribucionCronograma(notasCuota: string): {
  interesProyectado: number;
  capitalProyectado: number;
} {
  try {
    const interesMatch = notasCuota.match(/Interés proyectado: \$([0-9,]+\.[0-9]{2})/);
    const capitalMatch = notasCuota.match(/Capital: \$([0-9,]+\.[0-9]{2})/);
    
    return {
      interesProyectado: parseFloat(interesMatch?.[1].replace(/,/g, '') || '0'),
      capitalProyectado: parseFloat(capitalMatch?.[1].replace(/,/g, '') || '0')
    };
  } catch (error) {
    console.error('Error al extraer distribución:', error);
    return { interesProyectado: 0, capitalProyectado: 0 };
  }
}

/**
 * Calcula la distribución de un pago según el monto pagado y la distribución del cronograma
 */
export function calcularDistribucionPago(
  montoPagado: number,
  montoCuotaMinimo: number,
  interesProyectado: number,
  capitalProyectado: number
): {
  montoAInteres: number;
  montoACapital: number;
} {
  if (montoPagado >= montoCuotaMinimo) {
    // Pago completo o con excedente
    const excedente = montoPagado - montoCuotaMinimo;
    return {
      montoAInteres: interesProyectado,          // Exacto del cronograma
      montoACapital: capitalProyectado + excedente, // Capital + extra
    };
  } else {
    // Pago parcial - distribución proporcional
    const proporcion = montoPagado / montoCuotaMinimo;
    return {
      montoAInteres: interesProyectado * proporcion,
      montoACapital: capitalProyectado * proporcion,
    };
  }
}

/**
 * Calcula los días transcurridos entre dos fechas
 */
export function calcularDiasTranscurridos(
  fechaInicio: number,
  fechaFin: number
): number {
  const dias = Math.floor((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
  return Math.max(dias, 0);
}

/**
 * Determina el estado de una cuota después de aplicar un pago
 */
export function determinarEstadoCuota(
  montoPagadoTotal: number,
  montoCuotaMinimo: number,
  fechaVencimiento: number
): 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'VENCIDA' {
  const saldoCuota = montoCuotaMinimo - montoPagadoTotal;
  const ahora = Date.now();

  if (saldoCuota <= 0.01) {
    return 'PAGADA';
  } else if (montoPagadoTotal > 0) {
    return 'PARCIAL';
  } else if (fechaVencimiento < ahora) {
    return 'VENCIDA';
  } else {
    return 'PENDIENTE';
  }
}

/**
 * Formatea un monto en pesos mexicanos
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(monto);
}

