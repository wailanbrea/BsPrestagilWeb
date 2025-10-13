'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: ('PRESTAMISTA' | 'ADMIN' | 'COBRADOR')[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas según el rol del usuario
 * 
 * @example
 * // En una página que solo pueden ver prestamistas:
 * export default function GarantiasPage() {
 *   return (
 *     <ProtectedRoute requiredRole={['PRESTAMISTA', 'ADMIN']}>
 *       <div>Contenido de garantías</div>
 *     </ProtectedRoute>
 *   );
 * }
 * 
 * @example
 * // En una página que solo pueden ver cobradores:
 * export default function CobradorDashboard() {
 *   return (
 *     <ProtectedRoute requiredRole={['COBRADOR']}>
 *       <div>Dashboard de cobrador</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine de cargar
    if (loading) return;

    // Si no hay usuario, redirigir a login
    if (!user) {
      router.push('/login');
      return;
    }

    // Si se requiere un rol específico, verificar
    if (requiredRole && usuario) {
      const userRole = usuario.rol || 'PRESTAMISTA';

      // Si el rol del usuario no está en la lista de roles permitidos
      if (!requiredRole.includes(userRole as any)) {
        // Redirigir según el rol
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Redirección por defecto según rol
          if (userRole === 'COBRADOR') {
            router.push('/cobrador/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [user, usuario, loading, requiredRole, redirectTo, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar contenido (ya redirigió)
  if (!user) {
    return null;
  }

  // Si se requiere un rol y el usuario no lo tiene, no mostrar contenido
  if (requiredRole && usuario) {
    const userRole = usuario.rol || 'PRESTAMISTA';
    if (!requiredRole.includes(userRole as any)) {
      return null;
    }
  }

  // Mostrar contenido protegido
  return <>{children}</>;
}

/**
 * HOC para proteger páginas completas
 * 
 * @example
 * const GarantiasPage = withProtectedRoute(
 *   () => <div>Contenido de garantías</div>,
 *   { requiredRole: ['PRESTAMISTA', 'ADMIN'] }
 * );
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

