'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { obtenerHistorialPagos, type ObtenerHistorialPagosResult } from '@/lib/firebase/functions';
import { toast } from 'sonner';

export default function PagosPage() {
  const router = useRouter();
  const [data, setData] = useState<ObtenerHistorialPagosResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setLoading(true);
    try {
      // ⭐ Usar Cloud Function para obtener historial de pagos
      const filtros: any = { limite: 100 };
      
      if (fechaInicio) {
        filtros.fechaInicio = new Date(fechaInicio).getTime();
      }
      if (fechaFin) {
        filtros.fechaFin = new Date(fechaFin).getTime();
      }

      const result = await obtenerHistorialPagos(filtros);
      setData(result);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      toast.error('Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarPagos();
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setSearchTerm('');
  };

  const pagosFiltrados = data?.pagos.filter((pago) => {
    const term = searchTerm.toLowerCase();
    return (
      pago.clienteNombre?.toLowerCase().includes(term) ||
      pago.metodoPago?.toLowerCase().includes(term)
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">Historial de todos los pagos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalPagos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${estadisticas.totalMonto.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Pagado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${estadisticas.totalCapital.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intereses Cobrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${estadisticas.totalIntereses.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mora</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${estadisticas.totalMora.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, método de pago, préstamo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagos */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {pagosFiltrados.map((pago) => (
              <div
                key={pago.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      ${(pago.montoPagado || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {pago.clienteNombre || 'Cliente'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pago.fechaPago || Date.now()).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded font-medium">
                        {pago.metodoPago || 'N/A'}
                      </span>
                      {pago.diasTranscurridos > 0 && (
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {pago.diasTranscurridos} días
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-muted-foreground">Capital:</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        ${(pago.montoACapital || 0).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs text-muted-foreground">Interés:</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ${(pago.montoAInteres || 0).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    {(pago.montoMora || 0) > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-muted-foreground">Mora:</span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          ${(pago.montoMora || 0).toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    Cuota #{pago.numeroCuota || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagosFiltrados.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron pagos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

