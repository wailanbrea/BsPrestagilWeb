'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { usePrestamos } from '@/lib/hooks/usePrestamos';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const { prestamos } = usePrestamos();
  const [stats, setStats] = useState({
    totalClientes: 0,
    prestamosActivos: 0,
    capitalActivo: 0,
    interesesGenerados: 0,
  });

  useEffect(() => {
    loadStats();
  }, [prestamos]);

  const loadStats = async () => {
    try {
      // Contar clientes
      const clientesSnapshot = await getDocs(
        query(collection(db, 'clientes'), where('activo', '==', true))
      );
      
      // Calcular estadísticas de préstamos
      const prestamosActivos = prestamos.filter(p => 
        p.estado === 'ACTIVO' || p.estado === 'ATRASADO'
      );
      
      const capitalActivo = prestamosActivos.reduce(
        (sum, p) => sum + p.capitalPendiente, 0
      );
      
      const interesesGenerados = prestamos.reduce(
        (sum, p) => sum + (p.totalInteresesPagados || 0), 0
      );
      
      setStats({
        totalClientes: clientesSnapshot.size,
        prestamosActivos: prestamosActivos.length,
        capitalActivo,
        interesesGenerados,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Préstamos Activos
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prestamosActivos}</div>
            <p className="text-xs text-muted-foreground">
              En curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capital Activo
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.capitalActivo)}
            </div>
            <p className="text-xs text-muted-foreground">
              Capital pendiente de cobro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Intereses Generados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.interesesGenerados)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cobrado en intereses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Loans */}
      <Card>
        <CardHeader>
          <CardTitle>Préstamos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prestamos.slice(0, 5).map(prestamo => (
              <div 
                key={prestamo.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <p className="font-medium">{prestamo.clienteNombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(prestamo.fechaInicio)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">
                    {formatCurrency(prestamo.montoOriginal)}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    prestamo.estado === 'ACTIVO' 
                      ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' 
                      : prestamo.estado === 'ATRASADO' 
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                      : prestamo.estado === 'COMPLETADO' 
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {prestamo.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

