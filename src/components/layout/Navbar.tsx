'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/theme-selector';
import { LogOut, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { usuario, signOut } = useAuth();
  const router = useRouter();

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
          {/* Notificaciones (placeholder) */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </Button>
          
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

