'use client';

export const dynamic = 'force-dynamic';

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
import { calcularTablaAmortizacion, crearPrestamo as crearPrestamoFn } from '@/lib/firebase/functions';
import type { CalcularTablaAmortizacionResult } from '@/lib/firebase/functions';
import { TipoAmortizacion, FrecuenciaPago } from '@/types/prestamo';
import { toast } from 'sonner';

export default function NuevoPrestamoPage() {
  const router = useRouter();
  const { clientes, loading: loadingClientes } = useClientes();

  const [formData, setFormData] = useState({
    clienteId: '',
    montoOriginal: '',
    tasaInteresPorPeriodo: '',
    frecuenciaPago: 'MENSUAL' as FrecuenciaPago,
    tipoAmortizacion: 'FRANCES' as TipoAmortizacion,
    numeroCuotas: '',
    notas: '',
  });

  const [simulacion, setSimulacion] = useState<CalcularTablaAmortizacionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimular = async () => {
    const { montoOriginal, tasaInteresPorPeriodo, numeroCuotas, tipoAmortizacion } = formData;

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

    setIsSimulating(true);

    try {
      // ⭐ Usar la función de Firebase para calcular la tabla
      const result = await calcularTablaAmortizacion({
        capitalInicial: monto,
        tasaInteresPorPeriodo: tasa,
        numeroCuotas: cuotas,
        tipoAmortizacion: tipoAmortizacion,
      });

      if (result.success) {
        setSimulacion(result);
        toast.success('Simulación generada');
      } else {
        throw new Error('Error al calcular simulación');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al generar simulación');
      console.error('Error simulando préstamo:', error);
    } finally {
      setIsSimulating(false);
    }
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

      // ⭐ Usar la función de Firebase para crear el préstamo
      const result = await crearPrestamoFn({
        clienteId: formData.clienteId,
        clienteNombre: cliente?.nombre || '',
        monto: parseFloat(formData.montoOriginal),
        tasaInteresPorPeriodo: parseFloat(formData.tasaInteresPorPeriodo),
        frecuenciaPago: formData.frecuenciaPago,
        tipoAmortizacion: formData.tipoAmortizacion,
        numeroCuotas: parseInt(formData.numeroCuotas),
        notas: formData.notas,
      });

      if (result.success) {
        toast.success(`Préstamo creado exitosamente con ${result.cuotasCreadas} cuotas`);
        router.push('/prestamos');
      } else {
        throw new Error(result.mensaje || 'Error al crear préstamo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear préstamo');
      console.error('Error creando préstamo:', error);
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

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSimular} 
              className="w-full"
              disabled={isSimulating}
            >
              <Calculator className="mr-2 h-4 w-4" />
              {isSimulating ? 'Simulando...' : 'Simular Préstamo'}
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
                    ${simulacion.resumen.capitalInicial.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${simulacion.resumen.totalAPagar.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total intereses</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${simulacion.resumen.totalIntereses.toLocaleString('es-MX', {
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
                    ${simulacion.resumen.montoCuotaFija.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Cronograma ({simulacion.tabla.length} cuotas)
                </p>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-right">Capital</th>
                        <th className="p-2 text-right">Interés</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulacion.tabla.slice(0, 5).map((cuota) => (
                        <tr key={cuota.numeroCuota} className="border-b">
                          <td className="p-2">{cuota.numeroCuota}</td>
                          <td className="p-2 text-right">
                            ${cuota.capital.toFixed(2)}
                          </td>
                          <td className="p-2 text-right">
                            ${cuota.interes.toFixed(2)}
                          </td>
                          <td className="p-2 text-right font-medium">
                            ${cuota.cuotaFija.toFixed(2)}
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            ${cuota.balanceRestante.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {simulacion.tabla.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      ... y {simulacion.tabla.length - 5} cuotas más
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

