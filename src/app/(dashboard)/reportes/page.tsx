'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Prestamo } from '@/types/prestamo';
import { Pago } from '@/types/pago';
import { toast } from 'sonner';

export default function ReportesPage() {
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporte, setReporte] = useState<any>(null);

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    setLoading(true);

    try {
      const inicio = new Date(fechaInicio).getTime();
      const fin = new Date(fechaFin).getTime();

      // Obtener préstamos del período
      const prestamosQuery = query(
        collection(db, 'prestamos'),
        where('fechaInicio', '>=', inicio),
        where('fechaInicio', '<=', fin)
      );
      const prestamosSnapshot = await getDocs(prestamosQuery);
      const prestamos = prestamosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Prestamo[];

      // Obtener pagos del período
      const pagosQuery = query(
        collection(db, 'pagos'),
        where('fechaPago', '>=', inicio),
        where('fechaPago', '<=', fin)
      );
      const pagosSnapshot = await getDocs(pagosQuery);
      const pagos = pagosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pago[];

      // Calcular estadísticas
      const totalPrestamos = prestamos.length;
      const montoTotalPrestado = prestamos.reduce((sum, p) => sum + p.montoOriginal, 0);
      const totalPagos = pagos.length;
      const montoCobrado = pagos.reduce((sum, p) => sum + p.monto, 0);
      const capitalCobrado = pagos.reduce((sum, p) => sum + p.montoCapital, 0);
      const interesesCobrados = pagos.reduce((sum, p) => sum + p.montoInteres, 0);

      // Préstamos por estado
      const prestamosActivos = prestamos.filter((p) => p.estado === 'ACTIVO').length;
      const prestamosAtrasados = prestamos.filter((p) => p.estado === 'ATRASADO').length;
      const prestamosCompletados = prestamos.filter((p) => p.estado === 'COMPLETADO').length;

      setReporte({
        periodo: {
          inicio: fechaInicio,
          fin: fechaFin,
        },
        prestamos: {
          total: totalPrestamos,
          activos: prestamosActivos,
          atrasados: prestamosAtrasados,
          completados: prestamosCompletados,
          montoTotal: montoTotalPrestado,
        },
        pagos: {
          total: totalPagos,
          montoCobrado,
          capitalCobrado,
          interesesCobrados,
        },
        detalles: {
          prestamos,
          pagos,
        },
      });

      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    toast.info('Función de exportar PDF en desarrollo');
  };

  const exportarExcel = () => {
    toast.info('Función de exportar Excel en desarrollo');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-muted-foreground">Genera reportes detallados de tu negocio</p>
      </div>

      {/* Generador de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generarReporte} disabled={loading} className="w-full">
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporte Generado */}
      {reporte && (
        <>
          {/* Resumen de Préstamos */}
          <div>
            <h2 className="text-xl font-bold mb-4">Resumen del Período</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Préstamos Otorgados</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporte.prestamos.total}</div>
                  <p className="text-xs text-muted-foreground">
                    ${reporte.prestamos.montoTotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporte.pagos.total}</div>
                  <p className="text-xs text-muted-foreground">
                    ${reporte.pagos.montoCobrado.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Capital Cobrado</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${reporte.pagos.capitalCobrado.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Intereses Cobrados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${reporte.pagos.interesesCobrados.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Estado de Préstamos */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Préstamos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-500/10 dark:bg-green-500/20 rounded-lg border border-green-500/20">
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {reporte.prestamos.activos}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-500/10 dark:bg-red-500/20 rounded-lg border border-red-500/20">
                  <p className="text-sm text-muted-foreground">Atrasados</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {reporte.prestamos.atrasados}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-muted-foreground">Completados</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {reporte.prestamos.completados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones de Exportación */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={exportarPDF} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar como PDF
                </Button>
                <Button onClick={exportarExcel} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar como Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje inicial */}
      {!reporte && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Selecciona un rango de fechas y genera un reporte para ver los resultados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

