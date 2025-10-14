'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/theme-selector';
import { LogOut, User, Bell, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface Notificacion {
  id: string;
  tipo: 'prestamo_atrasado' | 'pago_vencido' | 'comision_pendiente';
  titulo: string;
  mensaje: string;
  link?: string;
  icono: any;
}

export default function Navbar() {
  const { usuario, signOut } = useAuth();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario?.id) {
      cargarNotificaciones();
    }
  }, [usuario?.id]);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const notifs: Notificacion[] = [];

      // ⭐ Notificación 1: Préstamos Atrasados
      const prestamosQuery = query(
        collection(db, 'prestamos'),
        where('estado', '==', 'ATRASADO')
      );
      const prestamosSnapshot = await getDocs(prestamosQuery);
      
      if (prestamosSnapshot.size > 0) {
        notifs.push({
          id: 'prestamos-atrasados',
          tipo: 'prestamo_atrasado',
          titulo: `${prestamosSnapshot.size} Préstamos Atrasados`,
          mensaje: 'Requieren seguimiento urgente',
          link: '/prestamos',
          icono: AlertCircle,
        });
      }

      // ⭐ Notificación 2: Comisiones Pendientes (solo para admin)
      if (usuario?.rol === 'ADMIN' || usuario?.rol === 'PRESTAMISTA') {
        const cobradoresQuery = query(
          collection(db, 'usuarios'),
          where('rol', '==', 'COBRADOR')
        );
        const cobradoresSnapshot = await getDocs(cobradoresQuery);
        let totalComisionesPendientes = 0;

        cobradoresSnapshot.forEach(doc => {
          const data = doc.data();
          const pendiente = (data.totalComisionesGeneradas || 0) - (data.totalComisionesPagadas || 0);
          if (pendiente > 0) {
            totalComisionesPendientes += pendiente;
          }
        });

        if (totalComisionesPendientes > 0) {
          notifs.push({
            id: 'comisiones-pendientes',
            tipo: 'comision_pendiente',
            titulo: 'Comisiones Pendientes',
            mensaje: `$${totalComisionesPendientes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} por pagar`,
            link: '/cobradores',
            icono: DollarSign,
          });
        }
      }

      setNotificaciones(notifs);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="bg-background border-b px-6 py-4 sticky top-0 z-10 backdrop-blur-sm bg-background/95">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Bienvenido</h2>
          {usuario && (
            <p className="text-sm text-muted-foreground">
              {usuario.nombre} - {usuario.rol}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificaciones.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {notificaciones.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                {loading && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notificaciones.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                notificaciones.map((notif) => {
                  const IconComponent = notif.icono;
                  return (
                    <DropdownMenuItem
                      key={notif.id}
                      className="cursor-pointer p-4"
                      onClick={() => {
                        if (notif.link) {
                          router.push(notif.link);
                        }
                      }}
                    >
                      <div className="flex gap-3 w-full">
                        <div className={`p-2 rounded-full ${
                          notif.tipo === 'prestamo_atrasado' 
                            ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            : notif.tipo === 'comision_pendiente'
                            ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                            : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notif.titulo}</p>
                          <p className="text-xs text-muted-foreground">{notif.mensaje}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
              
              {notificaciones.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer justify-center text-xs text-muted-foreground"
                    onClick={cargarNotificaciones}
                  >
                    Actualizar notificaciones
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Selector de tema */}
          <ThemeSelector />
          
          {/* Perfil */}
          <div className="hidden md:flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50">
            <User className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{usuario?.email}</span>
          </div>
          
          {/* Cerrar sesión */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}


