'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generarReporteCobradores, type GenerarReporteCobradoresResult } from '@/lib/firebase/functions';
import { toast } from 'sonner';

export default function ReportesPage() {
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState<'SEMANA' | 'MES' | 'TOTAL'>('MES');
  const [reporte, setReporte] = useState<GenerarReporteCobradoresResult | null>(null);

  const generarReporte = async () => {
    setLoading(true);

    try {
      // ⭐ Usar Cloud Function para generar reporte de cobradores
      const result = await generarReporteCobradores({ periodo });
      setReporte(result);
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
        <h1 className="text-3xl font-bold">Reportes de Cobradores</h1>
        <p className="text-muted-foreground">Genera reportes de comisiones y desempeño</p>
      </div>

      {/* Generador de Reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte de Cobradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEMANA">Última Semana</SelectItem>
                  <SelectItem value="MES">Último Mes</SelectItem>
                  <SelectItem value="TOTAL">Total Histórico</SelectItem>
                </SelectContent>
              </Select>
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
          {/* Resumen del Período */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Resumen del Período: {reporte.periodo}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(reporte.fechaInicio).toLocaleDateString('es-MX')} - {new Date(reporte.fechaFin).toLocaleDateString('es-MX')}
            </p>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${reporte.totales.totalCobrado.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reporte.totales.numeroPagos} pagos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${reporte.totales.totalComisiones.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Comisiones Pendientes</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    ${reporte.totales.totalComisionesPendientes.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por pagar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobradores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reporte.cobradores.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de cobradores
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabla de Cobradores */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle por Cobrador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Cobrador</th>
                      <th className="text-right p-3">% Comisión</th>
                      <th className="text-right p-3">Total Cobrado</th>
                      <th className="text-right p-3">Pagos</th>
                      <th className="text-right p-3">Comisión Generada</th>
                      <th className="text-right p-3">Comisión Pendiente</th>
                      <th className="text-right p-3">Préstamos Activos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.cobradores.map((cobrador) => (
                      <tr key={cobrador.cobradorId} className="border-b hover:bg-accent">
                        <td className="p-3 font-medium">{cobrador.cobradorNombre}</td>
                        <td className="p-3 text-right">{cobrador.porcentajeComision}%</td>
                        <td className="p-3 text-right text-green-600 dark:text-green-400">
                          ${cobrador.totalCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right">{cobrador.numeroPagos}</td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400 font-semibold">
                          ${cobrador.comisionGenerada.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right text-yellow-600 dark:text-yellow-400">
                          ${cobrador.comisionPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right">
                          {cobrador.prestamosActivos} / {cobrador.prestamosAsignados}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              Selecciona un período y genera un reporte para ver el desempeño de los cobradores
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

