'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientes } from '@/lib/hooks/useClientes';
import { usePrestamos } from '@/lib/hooks/usePrestamos';
import { generarCronograma, calcularMontoCuotaFija } from '@/lib/utils/amortizacion';
import { TipoAmortizacion, FrecuenciaPago } from '@/types/prestamo';
import { toast } from 'sonner';

export default function NuevoPrestamoPage() {
  const router = useRouter();
  const { clientes, loading: loadingClientes } = useClientes();
  const { crearPrestamo } = usePrestamos();

  const [formData, setFormData] = useState({
    clienteId: '',
    montoOriginal: '',
    tasaInteresPorPeriodo: '',
    frecuenciaPago: 'MENSUAL' as FrecuenciaPago,
    tipoAmortizacion: 'FRANCES' as TipoAmortizacion,
    numeroCuotas: '',
    notas: '',
  });

  const [simulacion, setSimulacion] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSimular = () => {
    const { montoOriginal, tasaInteresPorPeriodo, numeroCuotas, frecuenciaPago, tipoAmortizacion } = formData;

    if (!montoOriginal || !tasaInteresPorPeriodo || !numeroCuotas) {
      toast.error('Completa todos los campos para simular');
      return;
    }

    const monto = parseFloat(montoOriginal);
    const tasa = parseFloat(tasaInteresPorPeriodo);
    const cuotas = parseInt(numeroCuotas);

    if (isNaN(monto) || isNaN(tasa) || isNaN(cuotas) || monto <= 0 || cuotas <= 0) {
      toast.error('Ingresa valores válidos');
      return;
    }

    const fechaInicio = Date.now();
    const prestamoId = 'temp';

    const cronograma = generarCronograma(
      prestamoId,
      monto,
      tasa,
      cuotas,
      tipoAmortizacion,
      frecuenciaPago,
      fechaInicio
    );

    const totalIntereses = cronograma.reduce((sum, cuota) => sum + cuota.montoInteres, 0);
    const montoCuota = tipoAmortizacion === 'FRANCES' 
      ? calcularMontoCuotaFija(monto, tasa, cuotas)
      : cronograma[0].montoTotal;

    setSimulacion({
      cronograma,
      totalIntereses,
      montoCuota,
      totalAPagar: monto + totalIntereses,
    });

    toast.success('Simulación generada');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clienteId) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (!simulacion) {
      toast.error('Genera una simulación primero');
      return;
    }

    setIsSubmitting(true);

    try {
      const cliente = clientes.find((c) => c.id === formData.clienteId);

      await crearPrestamo({
        clienteId: formData.clienteId,
        clienteNombre: cliente?.nombre || '',
        montoOriginal: parseFloat(formData.montoOriginal),
        tasaInteresPorPeriodo: parseFloat(formData.tasaInteresPorPeriodo),
        frecuenciaPago: formData.frecuenciaPago,
        tipoAmortizacion: formData.tipoAmortizacion,
        numeroCuotas: parseInt(formData.numeroCuotas),
        notas: formData.notas,
      });

      toast.success('Préstamo creado exitosamente');
      router.push('/prestamos');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear préstamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Préstamo</h1>
          <p className="text-muted-foreground">Crear un nuevo préstamo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes
                    .filter((c) => c.activo)
                    .map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del Préstamo */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Préstamo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montoOriginal">Monto del préstamo *</Label>
                <Input
                  id="montoOriginal"
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={formData.montoOriginal}
                  onChange={(e) =>
                    setFormData({ ...formData, montoOriginal: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasaInteresPorPeriodo">Tasa de interés (%) *</Label>
                <Input
                  id="tasaInteresPorPeriodo"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={formData.tasaInteresPorPeriodo}
                  onChange={(e) =>
                    setFormData({ ...formData, tasaInteresPorPeriodo: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroCuotas">Número de cuotas *</Label>
                <Input
                  id="numeroCuotas"
                  type="number"
                  placeholder="12"
                  value={formData.numeroCuotas}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroCuotas: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frecuenciaPago">Frecuencia de pago *</Label>
                <Select
                  value={formData.frecuenciaPago}
                  onValueChange={(value: FrecuenciaPago) =>
                    setFormData({ ...formData, frecuenciaPago: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIARIO">Diario</SelectItem>
                    <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoAmortizacion">Sistema de amortización *</Label>
              <Select
                value={formData.tipoAmortizacion}
                onValueChange={(value: TipoAmortizacion) =>
                  setFormData({ ...formData, tipoAmortizacion: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FRANCES">
                    Sistema Francés (Cuota fija)
                  </SelectItem>
                  <SelectItem value="ALEMAN">
                    Sistema Alemán (Capital fijo)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input
                id="notas"
                placeholder="Notas adicionales..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>

            <Button type="button" variant="outline" onClick={handleSimular} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Simular Préstamo
            </Button>
          </CardContent>
        </Card>

        {/* Simulación */}
        {simulacion && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Simulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monto del préstamo</p>
                  <p className="text-2xl font-bold">
                    ${parseFloat(formData.montoOriginal).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${simulacion.totalAPagar.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total intereses</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${simulacion.totalIntereses.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {formData.tipoAmortizacion === 'FRANCES'
                      ? 'Cuota fija'
                      : 'Primera cuota'}
                  </p>
                  <p className="text-2xl font-bold">
                    ${simulacion.montoCuota.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Cronograma ({simulacion.cronograma.length} cuotas)
                </p>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-right">Capital</th>
                        <th className="p-2 text-right">Interés</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulacion.cronograma.slice(0, 5).map((cuota: any) => (
                        <tr key={cuota.numero} className="border-b">
                          <td className="p-2">{cuota.numero}</td>
                          <td className="p-2 text-right">
                            ${cuota.montoCapital.toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            ${cuota.montoInteres.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-medium">
                            ${cuota.montoTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {simulacion.cronograma.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      ... y {simulacion.cronograma.length - 5} cuotas más
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !simulacion} className="flex-1">
            {isSubmitting ? 'Creando...' : 'Crear Préstamo'}
          </Button>
        </div>
      </form>
    </div>
  );
}

