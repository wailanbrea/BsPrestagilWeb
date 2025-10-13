// src/types/cliente.ts

export type EstadoPagos = 'AL_DIA' | 'ATRASADO' | 'MOROSO';

export interface Referencia {
  nombre: string;                // "María López"
  telefono: string;              // "+52 999 888 7766"
  relacion: string;              // "Hermana", "Amigo", "Padre", etc.
}

export interface Cliente {
  // Identificación
  id: string;
  
  // Información Personal
  nombre: string;                // "Juan Pérez García"
  telefono: string;              // "+52 999 123 4567"
  direccion: string;             // "Calle 60 #123, Centro"
  email: string;                 // "juan@email.com"
  fotoUrl: string;               // URL de foto de perfil
  
  // Referencias (hasta 2)
  referencias: Referencia[];     // Array de objetos Referencia
  
  // Metadata
  fechaRegistro: number;         // Timestamp (milisegundos)
  prestamosActivos: number;      // Contador de préstamos activos
  historialPagos: EstadoPagos;   // "AL_DIA" | "ATRASADO" | "MOROSO"
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
  
  // Campos opcionales (compatibilidad con versiones antiguas)
  documento?: string;
  notas?: string;
  activo?: boolean;
  fechaCreacion?: number;
  fechaActualizacion?: number;
}

export interface ClienteConPrestamos extends Cliente {
  totalDeuda: number;
  ultimoPago?: number;
}

