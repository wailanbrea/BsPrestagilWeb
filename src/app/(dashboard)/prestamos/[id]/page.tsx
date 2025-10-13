'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, UserCog, AlertTriangle, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  actualizarPrestamo,
  asignarCobradorAPrestamo,
  eliminarPrestamo,
} from '@/lib/firebase/functions';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { toast } from 'sonner';

export default function PrestamoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const prestamoId = params.id as string;

  const [prestamo, setPrestamo] = useState<any>(null);
  const [cobradores, setCobradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para diálogos
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAsignarDialog, setShowAsignarDialog] = useState(false);
  const [showEliminarDialog, setShowEliminarDialog] = useState(false);

  // Estados para formularios
  const [editData, setEditData] = useState({
    tasaInteresPorPeriodo: '',
    notas: '',
  });
  const [cobradorSeleccionado, setCobradorSeleccionado] = useState('');
  const [motivoEliminacion, setMotivoEliminacion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prestamoId) {
      cargarDatos();
    }
  }, [prestamoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar préstamo
      const prestamoDoc = await getDoc(doc(db, 'prestamos', prestamoId));
      if (prestamoDoc.exists()) {
        const prestamoData = { id: prestamoDoc.id, ...prestamoDoc.data() };
        setPrestamo(prestamoData);
        setEditData({
          tasaInteresPorPeriodo: prestamoData.tasaInteresPorPeriodo?.toString() || '',
          notas: prestamoData.notas || '',
        });
        setCobradorSeleccionado(prestamoData.cobradorId || '');
      }

      // Cargar cobradores
      const cobradoresQuery = query(
        collection(db, 'usuarios'),
        where('rol', '==', 'COBRADOR'),
        where('activo', '==', true)
      );
      const cobradoresSnapshot = await getDocs(cobradoresQuery);
      const cobradoresData = cobradoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCobradores(cobradoresData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar información del préstamo');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarPrestamo = async () => {
    try {
      setIsSubmitting(true);

      const cambios: any = {};
      
      if (editData.tasaInteresPorPeriodo && editData.tasaInteresPorPeriodo !== prestamo.tasaInteresPorPeriodo?.toString()) {
        cambios.tasaInteresPorPeriodo = parseFloat(editData.tasaInteresPorPeriodo);
      }
      
      if (editData.notas !== prestamo.notas) {
        cambios.notas = editData.notas;
      }

      if (Object.keys(cambios).length === 0) {
        toast.info('No hay cambios para actualizar');
        setShowEditDialog(false);
        return;
      }

      // ⭐ Llamar a Cloud Function
      const result = await actualizarPrestamo({
        prestamoId: prestamoId,
        cambios,
      });

      if (result.success) {
        toast.success('Préstamo actualizado exitosamente');
        setShowEditDialog(false);
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error actualizando préstamo:', error);
      toast.error(error.message || 'Error al actualizar préstamo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAsignarCobrador = async () => {
    try {
      if (!cobradorSeleccionado) {
        toast.error('Selecciona un cobrador');
        return;
      }

      if (cobradorSeleccionado === prestamo.cobradorId) {
        toast.info('El préstamo ya está asignado a este cobrador');
        setShowAsignarDialog(false);
        return;
      }

      setIsSubmitting(true);

      // ⭐ Llamar a Cloud Function
      const result = await asignarCobradorAPrestamo({
        prestamoId: prestamoId,
        cobradorId: cobradorSeleccionado,
      });

      if (result.success) {
        toast.success(`Préstamo asignado a ${result.prestamo.cobradorNombre}`);
        setShowAsignarDialog(false);
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error asignando cobrador:', error);
      toast.error(error.message || 'Error al asignar cobrador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminarPrestamo = async () => {
    try {
      if (!motivoEliminacion.trim()) {
        toast.error('Proporciona un motivo para eliminar');
        return;
      }

      setIsSubmitting(true);

      // ⭐ Llamar a Cloud Function
      const result = await eliminarPrestamo({
        prestamoId: prestamoId,
        motivo: motivoEliminacion,
      });

      if (result.success) {
        toast.success('Préstamo eliminado exitosamente');
        toast.info(`Eliminados: ${result.eliminados.cuotas} cuotas, ${result.eliminados.pagos} pagos`);
        router.push('/prestamos');
      }
    } catch (error: any) {
      console.error('Error eliminando préstamo:', error);
      toast.error(error.message || 'Error al eliminar préstamo');
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

  if (!prestamo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Préstamo no encontrado</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Préstamo #{prestamo.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">{prestamo.clienteNombre}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEditDialog(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={() => setShowAsignarDialog(true)} variant="outline">
            <UserCog className="h-4 w-4 mr-2" />
            Reasignar
          </Button>
          <Button onClick={() => setShowEliminarDialog(true)} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Original</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(prestamo.montoOriginal)}</div>
            <p className="text-xs text-muted-foreground">{prestamo.numeroCuotas} cuotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(prestamo.capitalPendiente)}
            </div>
            <p className="text-xs text-muted-foreground">
              {prestamo.cuotasPagadas || 0} cuotas pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
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
            <p className="text-xs text-muted-foreground mt-2">
              Tasa: {prestamo.tasaInteresPorPeriodo}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha Inicio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(prestamo.fechaInicio)}</div>
            <p className="text-xs text-muted-foreground">
              {prestamo.frecuenciaPago}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información Adicional */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{prestamo.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente ID:</span>
              <span className="font-medium text-sm">{prestamo.clienteId}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Cobrador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cobrador:</span>
              <span className="font-medium">{prestamo.cobradorNombre || 'Sin asignar'}</span>
            </div>
            {prestamo.cobradorId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cobrador ID:</span>
                <span className="font-medium text-sm">{prestamo.cobradorId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {prestamo.notas && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prestamo.notas}</p>
          </CardContent>
        </Card>
      )}

      {/* Diálogo Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Préstamo</DialogTitle>
            <DialogDescription>
              Actualiza la información del préstamo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tasa de Interés (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.tasaInteresPorPeriodo}
                onChange={(e) => setEditData({ ...editData, tasaInteresPorPeriodo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={editData.notas}
                onChange={(e) => setEditData({ ...editData, notas: e.target.value })}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActualizarPrestamo} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Asignar Cobrador */}
      <Dialog open={showAsignarDialog} onOpenChange={setShowAsignarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Cobrador</DialogTitle>
            <DialogDescription>
              Selecciona un cobrador para este préstamo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cobrador</Label>
              <Select value={cobradorSeleccionado} onValueChange={setCobradorSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cobrador" />
                </SelectTrigger>
                <SelectContent>
                  {cobradores.map((cobrador) => (
                    <SelectItem key={cobrador.id} value={cobrador.id}>
                      {cobrador.nombre} - {cobrador.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAsignarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAsignarCobrador} disabled={isSubmitting}>
              {isSubmitting ? 'Asignando...' : 'Asignar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Eliminar */}
      <Dialog open={showEliminarDialog} onOpenChange={setShowEliminarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Eliminar Préstamo
            </DialogTitle>
            <DialogDescription>
              Esta acción es permanente y eliminará el préstamo, todas sus cuotas y pagos asociados.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Advertencia:</strong> Esta operación no se puede deshacer.
            </AlertDescription>
          </Alert>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo de Eliminación *</Label>
              <Input
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                placeholder="Ejemplo: Cliente solicitó cancelación..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEliminarDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEliminarPrestamo} 
              disabled={isSubmitting || !motivoEliminacion.trim()}
            >
              {isSubmitting ? 'Eliminando...' : 'Eliminar Préstamo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

