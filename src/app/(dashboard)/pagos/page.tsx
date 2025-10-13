'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, DollarSign, RefreshCw, Filter } from 'lucide-react';
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
      toast.success('Pagos cargados exitosamente');
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
    cargarPagos();
  };

  const pagosFiltrados = data?.pagos.filter((pago) => {
    const term = searchTerm.toLowerCase();
    return (
      pago.clienteNombre?.toLowerCase().includes(term) ||
      pago.metodoPago?.toLowerCase().includes(term)
    );
  }) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de Pagos</h1>
          <p className="text-muted-foreground">Consulta todos los pagos recibidos</p>
        </div>
        <Button onClick={cargarPagos} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cliente o método..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={aplicarFiltros} disabled={loading} className="flex-1">
                Aplicar
              </Button>
              <Button onClick={limpiarFiltros} variant="outline">
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {data && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totales.numeroPagos}</div>
              <p className="text-xs text-muted-foreground">Pagos registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.totales.totalPagado.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">Total recibido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${data.totales.totalCapital.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">A capital</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intereses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${data.totales.totalInteres.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">Ganancia</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${data.totales.totalMoras.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">Por atrasos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pagos Recibidos ({pagosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay pagos que mostrar</p>
            </div>
          ) : (
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
                        ${pago.montoPagado.toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {pago.clienteNombre}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(pago.fechaPago).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded font-medium">
                          {pago.metodoPago}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Cuota #{pago.numeroCuota}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Capital: <span className="font-medium text-blue-600 dark:text-blue-400">
                          ${pago.montoACapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Interés: <span className="font-medium text-green-600 dark:text-green-400">
                          ${pago.montoAInteres.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </p>
                      {pago.montoMora > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Mora: <span className="font-medium text-red-600 dark:text-red-400">
                            ${pago.montoMora.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Por: {pago.recibidoPor}
                      </p>
                    </div>
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
