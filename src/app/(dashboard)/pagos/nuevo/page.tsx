'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registrarPago } from '@/lib/firebase/functions';
import { usePrestamos } from '@/lib/hooks/usePrestamos';
import { useClientes } from '@/lib/hooks/useClientes';
import { toast } from 'sonner';

export default function NuevoPagoPage() {
  const router = useRouter();
  const { prestamos, loading: loadingPrestamos } = usePrestamos();
  const { clientes } = useClientes();
  
  const [formData, setFormData] = useState({
    prestamoId: '',
    clienteId: '',
    clienteNombre: '',
    numeroCuota: '',
    montoPagado: '',
    montoMora: '0',
    metodoPago: 'EFECTIVO',
    notas: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar préstamos activos
  const prestamosActivos = prestamos.filter(p => 
    p.estado === 'ACTIVO' || p.estado === 'ATRASADO'
  );

  // Filtrar por búsqueda
  const prestamosFiltrados = prestamosActivos.filter(p =>
    p.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const prestamoSeleccionado = prestamos.find(p => p.id === formData.prestamoId);

  useEffect(() => {
    if (prestamoSeleccionado) {
      setFormData(prev => ({
        ...prev,
        clienteId: prestamoSeleccionado.clienteId,
        clienteNombre: prestamoSeleccionado.clienteNombre,
      }));
    }
  }, [prestamoSeleccionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.prestamoId || !formData.montoPagado || !formData.numeroCuota) {
        throw new Error('Completa todos los campos requeridos');
      }

      const montoPagado = parseFloat(formData.montoPagado);
      const montoMora = parseFloat(formData.montoMora);
      const numeroCuota = parseInt(formData.numeroCuota);

      if (isNaN(montoPagado) || montoPagado <= 0) {
        throw new Error('Ingresa un monto válido');
      }

      if (isNaN(numeroCuota) || numeroCuota <= 0) {
        throw new Error('Ingresa un número de cuota válido');
      }

      setIsSubmitting(true);

      // ⭐ Llamar a Cloud Function para registrar pago
      const result = await registrarPago({
        prestamoId: formData.prestamoId,
        clienteId: formData.clienteId,
        clienteNombre: formData.clienteNombre,
        numeroCuota: numeroCuota,
        montoPagado: montoPagado,
        montoMora: montoMora,
        metodoPago: formData.metodoPago,
        notas: formData.notas || undefined,
      });

      if (result.success) {
        toast.success('Pago registrado exitosamente');
        toast.info(`Capital: $${result.pago.montoACapital.toFixed(2)} | Interés: $${result.pago.montoAInteres.toFixed(2)}`);
        router.push('/pagos');
      }
    } catch (err: any) {
      console.error('Error registrando pago:', err);
      setError(err.message || 'Error al registrar pago');
      toast.error(err.message || 'Error al registrar pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPrestamos) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Registrar Pago</h1>
          <p className="text-muted-foreground">Registra un nuevo pago de préstamo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Préstamo */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Préstamo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Buscar Préstamo</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestamoId">Préstamo Activo *</Label>
              <Select
                value={formData.prestamoId}
                onValueChange={(value) => setFormData({ ...formData, prestamoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un préstamo" />
                </SelectTrigger>
                <SelectContent>
                  {prestamosFiltrados.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No hay préstamos activos
                    </div>
                  ) : (
                    prestamosFiltrados.map((prestamo) => (
                      <SelectItem key={prestamo.id} value={prestamo.id}>
                        {prestamo.clienteNombre} - ${prestamo.montoOriginal.toLocaleString()} 
                        (Pendiente: ${prestamo.capitalPendiente.toLocaleString()})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {prestamoSeleccionado && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{prestamoSeleccionado.clienteNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monto Original:</span>
                  <span className="font-medium">${prestamoSeleccionado.montoOriginal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Capital Pendiente:</span>
                  <span className="font-medium text-yellow-600">${prestamoSeleccionado.capitalPendiente.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cuotas Pagadas:</span>
                  <span className="font-medium">{prestamoSeleccionado.cuotasPagadas} / {prestamoSeleccionado.numeroCuotas}</span>
                </div>
                {prestamoSeleccionado.montoCuotaFija && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cuota Sugerida:</span>
                    <span className="font-medium text-green-600">${prestamoSeleccionado.montoCuotaFija.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Pago */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroCuota">Número de Cuota *</Label>
                <Input
                  id="numeroCuota"
                  type="number"
                  placeholder="1"
                  value={formData.numeroCuota}
                  onChange={(e) => setFormData({ ...formData, numeroCuota: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="montoPagado">Monto Pagado *</Label>
                <Input
                  id="montoPagado"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.montoPagado}
                  onChange={(e) => setFormData({ ...formData, montoPagado: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montoMora">Monto de Mora</Label>
                <Input
                  id="montoMora"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.montoMora}
                  onChange={(e) => setFormData({ ...formData, montoMora: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago *</Label>
                <Select
                  value={formData.metodoPago}
                  onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">El sistema calculará automáticamente:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Distribución entre capital e interés</li>
                  <li>Actualización del saldo pendiente</li>
                  <li>Días transcurridos desde último pago</li>
                  <li>Registro de comisión para el cobrador</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.prestamoId} 
            className="flex-1"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </div>
      </form>
    </div>
  );
}



