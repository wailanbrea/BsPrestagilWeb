// src/types/usuario.ts

export type RolUsuario = 'ADMIN' | 'COBRADOR' | 'SUPERVISOR' | 'PRESTAMISTA';

export interface Usuario {
  // Identificación (Firebase Auth)
  id: string;                         // UID de Firebase Auth
  
  // Información Personal
  nombre: string;                     // "Pedro Martínez"
  email: string;                      // "pedro@prestagil.com"
  telefono?: string;                  // Teléfono del usuario
  
  // Rol
  rol: RolUsuario;                    // "ADMIN" | "PRESTAMISTA" | "COBRADOR" | "SUPERVISOR"
  activo: boolean;                    // Si el usuario está activo
  
  // Sistema de comisiones (para cobradores)
  porcentajeComision: number;         // % de comisión
  totalComisionesGeneradas: number;   // Total histórico generado
  totalComisionesPagadas: number;     // Total histórico pagado
  ultimoPagoComision: number;         // Fecha del último pago de comisión
  
  // Control de primer login
  primerLogin?: boolean;              // true si debe cambiar contraseña
  
  // Metadata
  fechaCreacion: number;              // Timestamp
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
}
