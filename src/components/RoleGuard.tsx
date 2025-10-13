'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('PRESTAMISTA' | 'ADMIN' | 'COBRADOR')[];
  fallback?: ReactNode;
}

/**
 * Componente para mostrar/ocultar UI según el rol del usuario
 * 
 * @example
 * <RoleGuard allowedRoles={['PRESTAMISTA', 'ADMIN']}>
 *   <button onClick={handleDelete}>Eliminar Cliente</button>
 * </RoleGuard>
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { usuario } = useAuth();
  
  // Si no hay usuario, no mostrar nada
  if (!usuario) return <>{fallback}</>;
  
  // Verificar si el rol del usuario está en la lista de roles permitidos
  const userRole = usuario.rol || 'PRESTAMISTA';
  
  if (!allowedRoles.includes(userRole as any)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Hook helper para verificar permisos dentro de componentes
 * 
 * @example
 * const { canAccess } = useRolePermissions();
 * 
 * if (canAccess(['PRESTAMISTA'])) {
 *   // Hacer algo solo para prestamistas
 * }
 */
export function useRolePermissions() {
  const { usuario } = useAuth();
  
  const canAccess = (allowedRoles: ('PRESTAMISTA' | 'ADMIN' | 'COBRADOR')[]): boolean => {
    if (!usuario) return false;
    
    const userRole = usuario.rol || 'PRESTAMISTA';
    return allowedRoles.includes(userRole as any);
  };
  
  const isPrestamista = () => {
    if (!usuario) return false;
    const rol = usuario.rol || 'PRESTAMISTA';
    return rol === 'PRESTAMISTA' || rol === 'ADMIN';
  };
  
  const isCobrador = () => {
    return usuario?.rol === 'COBRADOR';
  };
  
  return {
    canAccess,
    isPrestamista,
    isCobrador,
    userRole: usuario?.rol || 'PRESTAMISTA',
  };
}

