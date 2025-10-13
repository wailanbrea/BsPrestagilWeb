'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, AlertCircle, FileText, UserCheck } from 'lucide-react';
import { obtenerEstadisticasDashboard, type ObtenerEstadisticasDashboardResult, type PrestamoReciente } from '@/lib/firebase/functions';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ObtenerEstadisticasDashboardResult | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // ⭐ Usar Cloud Function para obtener estadísticas
      const result = await obtenerEstadisticasDashboard({ periodo: 'TOTAL' });
      setData(result);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Error al cargar estadísticas</p>
      </div>
    );
  }

  const stats = data.estadisticas;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu negocio</p>
      </div>

      {/* Stats Cards - Fila 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prestado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPrestado)}</div>
            <p className="text-xs text-muted-foreground">
              Capital total desembolsado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capital Activo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.totalPrestadoActivo)}
            </div>
            <p className="text-xs text-muted-foreground">
              En préstamos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cobrado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.totalCobrado)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.numeroPagos} pagos recibidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Intereses Generados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.interesesGenerados)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ganancia por intereses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Fila 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Préstamos Activos
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.prestamosActivos}
            </div>
            <p className="text-xs text-muted-foreground">
              En curso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Préstamos Atrasados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.prestamosAtrasados}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cartera Vencida
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(stats.carteraVencida)}
            </div>
            <p className="text-xs text-muted-foreground">
              Capital en mora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Préstamos Completados
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.prestamosCompletados}
            </div>
            <p className="text-xs text-muted-foreground">
              Finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Fila 3 */}
      <div className="grid gap-4 md:grid-cols-2">
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
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cobradores
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCobradores}</div>
            <p className="text-xs text-muted-foreground">
              Cobradores activos
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
          {data.prestamosRecientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay préstamos recientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.prestamosRecientes.map((prestamo) => (
                <div 
                  key={prestamo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{prestamo.clienteNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(prestamo.fechaInicio)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pendiente: {formatCurrency(prestamo.capitalPendiente)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}


