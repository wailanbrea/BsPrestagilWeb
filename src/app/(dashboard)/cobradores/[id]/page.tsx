'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, DollarSign, TrendingUp, FileText, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { calcularComisiones, pagarComision } from '@/lib/firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatCurrency } from '@/lib/utils/formatters';
import { toast } from 'sonner';

export default function CobradorDetallePage() {
  const router = useRouter();
  const params = useParams();
  const cobradorId = params.id as string;

  const [cobrador, setCobrador] = useState<any>(null);
  const [comisiones, setComisiones] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPagarDialog, setShowPagarDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pagoData, setPagoData] = useState({
    montoPagado: '',
    metodoPago: 'EFECTIVO',
    notas: '',
  });

  useEffect(() => {
    if (cobradorId) {
      cargarDatos();
    }
  }, [cobradorId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar cobrador
      const cobradorDoc = await getDoc(doc(db, 'usuarios', cobradorId));
      if (cobradorDoc.exists()) {
        setCobrador({ id: cobradorDoc.id, ...cobradorDoc.data() });
      }

      // ⭐ Calcular comisiones con Cloud Function
      const comisionesResult = await calcularComisiones({
        cobradorId: cobradorId,
        incluirDetalles: true,
      });
      setComisiones(comisionesResult);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar información del cobrador');
    } finally {
      setLoading(false);
    }
  };

  const handlePagarComision = async () => {
    try {
      if (!pagoData.montoPagado) {
        toast.error('Ingresa el monto a pagar');
        return;
      }

      const monto = parseFloat(pagoData.montoPagado);
      if (isNaN(monto) || monto <= 0) {
        toast.error('Ingresa un monto válido');
        return;
      }

      setIsSubmitting(true);

      // ⭐ Llamar a Cloud Function para pagar comisión
      const result = await pagarComision({
        cobradorId: cobradorId,
        montoPagado: monto,
        metodoPago: pagoData.metodoPago,
        notas: pagoData.notas || undefined,
      });

      if (result.success) {
        toast.success('Comisión pagada exitosamente');
        toast.info(`Nuevo saldo pendiente: $${result.cobrador.saldoPendiente.toFixed(2)}`);
        setShowPagarDialog(false);
        setPagoData({ montoPagado: '', metodoPago: 'EFECTIVO', notas: '' });
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error pagando comisión:', error);
      toast.error(error.message || 'Error al pagar comisión');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cobrador || !comisiones) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cobrador no encontrado</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const comisionPendiente = comisiones.total.comision - (cobrador.totalComisionesPagadas || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cobrador.nombre}</h1>
            <p className="text-muted-foreground">Información y comisiones del cobrador</p>
          </div>
        </div>
        {comisionPendiente > 0 && (
          <Button onClick={() => setShowPagarDialog(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Pagar Comisión
          </Button>
        )}
      </div>

      {/* Información del Cobrador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{cobrador.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{cobrador.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">% Comisión</p>
                <p className="font-medium">{cobrador.porcentajeComision || 0}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comisiones - Fila 1 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(comisiones.total.comision)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comisiones.total.numeroPagos} pagos - ${comisiones.total.totalCobrado.toLocaleString('es-MX')} cobrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(comisiones.mes.comision)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comisiones.mes.numeroPagos} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión de la Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(comisiones.semana.comision)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comisiones.semana.numeroPagos} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisión de Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(comisiones.hoy.comision)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comisiones.hoy.numeroPagos} pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Pagos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comisiones Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(cobrador.totalComisionesPagadas || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total abonado al cobrador
            </p>
          </CardContent>
        </Card>

        <Card className={comisionPendiente > 0 ? 'bg-yellow-500/5 border-yellow-500/20' : ''}>
          <CardHeader>
            <CardTitle>Comisión Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(comisionPendiente)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Por pagar al cobrador
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diálogo Pagar Comisión */}
      <Dialog open={showPagarDialog} onOpenChange={setShowPagarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Comisión</DialogTitle>
            <DialogDescription>
              Registra el pago de comisión a {cobrador.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Comisión Total Generada:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(comisiones.total.comision)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Pagado:</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(cobrador.totalComisionesPagadas || 0)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Saldo Pendiente:</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(comisionPendiente)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Monto a Pagar *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={pagoData.montoPagado}
                onChange={(e) => setPagoData({ ...pagoData, montoPagado: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Máximo disponible: {formatCurrency(comisionPendiente)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago *</Label>
              <Select
                value={pagoData.metodoPago}
                onValueChange={(value) => setPagoData({ ...pagoData, metodoPago: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="Notas adicionales..."
                value={pagoData.notas}
                onChange={(e) => setPagoData({ ...pagoData, notas: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPagarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePagarComision} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

