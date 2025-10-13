'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, TrendingUp, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { obtenerEstadisticasCliente, type ObtenerEstadisticasClienteResult } from '@/lib/firebase/functions';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { toast } from 'sonner';

export default function ClienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const clienteId = params.id as string;
  
  const [data, setData] = useState<ObtenerEstadisticasClienteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clienteId) {
      cargarDatosCliente();
    }
  }, [clienteId]);

  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      // ⭐ Usar Cloud Function para obtener estadísticas del cliente
      const result = await obtenerEstadisticasCliente({ clienteId });
      setData(result);
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
      toast.error('Error al cargar información del cliente');
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
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No se pudo cargar la información del cliente</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const { cliente, estadisticas, prestamos } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
          <p className="text-muted-foreground">Información detallada del cliente</p>
        </div>
      </div>

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{cliente.telefono}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{cliente.email || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente desde</p>
                <p className="font-medium">{formatDate(cliente.fechaRegistro)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Total Préstamos</p>
                <p className="font-medium">
                  {estadisticas.prestamosActivos + estadisticas.prestamosCompletados + estadisticas.prestamosAtrasados}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Financieras - Fila 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prestado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estadisticas.totalPrestado)}</div>
            <p className="text-xs text-muted-foreground">Monto total histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(estadisticas.totalPagado)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.pagosRealizados} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Pendiente</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(estadisticas.capitalPendiente)}
            </div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio de Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(estadisticas.promedioMontoPago)}</div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Financieras - Fila 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Activos</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.prestamosActivos}
            </div>
            <p className="text-xs text-muted-foreground">En curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {estadisticas.prestamosAtrasados}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio: {estadisticas.diasPromedioAtraso} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos Completados</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.prestamosCompletados}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Pago</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas.ultimoPago ? formatDate(estadisticas.ultimoPago) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Fecha más reciente</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Préstamos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          {prestamos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay préstamos registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prestamos.map((prestamo) => (
                <div
                  key={prestamo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => router.push(`/prestamos/${prestamo.id}`)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatCurrency(prestamo.montoOriginal)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(prestamo.fechaInicio)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prestamo.cuotasPagadas} / {prestamo.numeroCuotas} cuotas pagadas
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">
                      Pendiente: {formatCurrency(prestamo.capitalPendiente)}
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

