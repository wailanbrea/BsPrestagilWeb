'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet, 
  Shield, 
  UserCircle, 
  FileText,
  ChartBar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

// ⭐ Menú para PRESTAMISTAS (acceso completo)
const prestamistasMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Préstamos',
    href: '/prestamos',
    icon: CreditCard,
  },
  {
    title: 'Pagos',
    href: '/pagos',
    icon: Wallet,
  },
  {
    title: 'Garantías',
    href: '/garantias',
    icon: Shield,
  },
  {
    title: 'Cobradores',
    href: '/cobradores',
    icon: UserCircle,
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: FileText,
  },
];

// ⭐ Menú para COBRADORES (limitado, sin Settings)
const cobradoresMenuItems = [
  {
    title: 'Mi Dashboard',
    href: '/cobrador/dashboard',
    icon: ChartBar,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Préstamos',
    href: '/prestamos',
    icon: CreditCard,
  },
  {
    title: 'Pagos',
    href: '/pagos',
    icon: Wallet,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario } = useAuth(); // ⭐ Obtener usuario con rol
  
  // ⭐ Determinar qué menú mostrar según el rol
  const menuItems = usuario?.rol === 'COBRADOR' 
    ? cobradoresMenuItems 
    : prestamistasMenuItems;

  return (
    <div className="w-64 bg-background border-r min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BsPrestagil</h1>
            {/* ⭐ NUEVO: Mostrar rol del usuario */}
            <p className="text-xs text-muted-foreground">
              {usuario?.rol === 'COBRADOR' ? 'Cobrador' : 'Administrador'}
            </p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 py-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>v1.0.0</p>
          <p>© 2024 BsPrestagil</p>
        </div>
      </div>
    </div>
  );
}


