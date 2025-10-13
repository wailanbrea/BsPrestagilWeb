// src/constants/frecuencias.ts
export const FRECUENCIAS_PAGO = {
  DIARIO: 'DIARIO',
  QUINCENAL: 'QUINCENAL',
  MENSUAL: 'MENSUAL',
} as const;

export const TIPOS_AMORTIZACION = {
  FRANCES: 'FRANCES',
  ALEMAN: 'ALEMAN',
} as const;

export const TIPOS_PAGO = {
  COMPLETO: 'COMPLETO',
  PARCIAL: 'PARCIAL',
  EXTRAORDINARIO: 'EXTRAORDINARIO',
} as const;

export const METODOS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  TARJETA: 'TARJETA',
  OTRO: 'OTRO',
} as const;


