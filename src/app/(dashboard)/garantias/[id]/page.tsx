'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shield, Calendar, DollarSign, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Garantia } from '@/types/garantia';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

export default function GarantiaDetallePage() {
  const router = useRouter();
  const params = useParams();
  const garantiaId = params.id as string;
  const { rol } = useAuth();

  const [garantia, setGarantia] = useState<Garantia | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (garantiaId) {
      cargarGarantia();
    }
  }, [garantiaId]);

  const cargarGarantia = async () => {
    try {
      setLoading(true);
      const garantiaDoc = await getDoc(doc(db, 'garantias', garantiaId));
      
      if (garantiaDoc.exists()) {
        setGarantia({
          id: garantiaDoc.id,
          ...garantiaDoc.data(),
        } as Garantia);
      } else {
        toast.error('Garantía no encontrada');
        router.push('/garantias');
      }
    } catch (error) {
      console.error('Error cargando garantía:', error);
      toast.error('Error al cargar garantía');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // ✅ Verificar que solo ADMIN puede eliminar
    if (rol !== 'ADMIN') {
      toast.error('Solo los administradores pueden eliminar garantías');
      return;
    }

    try {
      setDeleting(true);
      await deleteDoc(doc(db, 'garantias', garantiaId));
      toast.success('Garantía eliminada exitosamente');
      router.push('/garantias');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar garantía');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!garantia) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Garantía no encontrada</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4">
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const tipoIcono = 
    garantia.tipo === 'VEHICULO' ? '🚗' :
    garantia.tipo === 'ELECTRODOMESTICO' ? '🏠' :
    garantia.tipo === 'ELECTRONICO' ? '💻' :
    garantia.tipo === 'JOYA' ? '💍' :
    garantia.tipo === 'MUEBLE' ? '🪑' :
    '📦';

  const tipoTexto = 
    garantia.tipo === 'ELECTRODOMESTICO' ? 'Electrodoméstico' :
    garantia.tipo === 'ELECTRONICO' ? 'Electrónico' :
    garantia.tipo || 'N/A';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{garantia.descripcion}</h1>
          <p className="text-muted-foreground">Detalles de la garantía</p>
        </div>
        {/* ✅ Botón de eliminar solo para ADMIN */}
        {rol === 'ADMIN' && (
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Estado y Tipo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              garantia.estado === 'DISPONIBLE' ? 'text-green-600 dark:text-green-400' :
              garantia.estado === 'EN_USO' ? 'text-orange-600 dark:text-orange-400' :
              garantia.estado === 'LIBERADA' ? 'text-blue-600 dark:text-blue-400' :
              ''
            }`}>
              {garantia.estado === 'RETENIDA' ? 'RETENIDA' :
               garantia.estado === 'DEVUELTA' ? 'DEVUELTA' :
               garantia.estado === 'EJECUTADA' ? 'EJECUTADA' :
               garantia.estado === 'DISPONIBLE' ? 'DISPONIBLE' :
               garantia.estado === 'EN_USO' ? 'EN USO' :
               garantia.estado === 'LIBERADA' ? 'LIBERADA' :
               garantia.estado}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {garantia.estado === 'DISPONIBLE' && 'Disponible para asignar'}
              {garantia.estado === 'EN_USO' && 'Asignada a un préstamo'}
              {garantia.estado === 'LIBERADA' && 'Liberada de préstamo'}
              {garantia.estado === 'RETENIDA' && 'En posesión'}
              {garantia.estado === 'DEVUELTA' && 'Devuelta al cliente'}
              {garantia.estado === 'EJECUTADA' && 'Ejecutada por impago'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${garantia.valorEstimado?.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Valor estimado</p>
          </CardContent>
        </Card>
      </div>

      {/* Información Detallada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">{tipoIcono}</span>
            Información Detallada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{tipoTexto}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="font-medium">{garantia.descripcion}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Registro</p>
              <p className="font-medium">
                {new Date(garantia.fechaRegistro || Date.now()).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {garantia.prestamoId && (
              <div>
                <p className="text-sm text-muted-foreground">Préstamo Asociado</p>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => router.push(`/prestamos/${garantia.prestamoId}`)}
                >
                  Ver préstamo
                </Button>
              </div>
            )}
          </div>

          {garantia.notas && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notas</p>
              <p className="text-sm">{garantia.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotografías */}
      {garantia.fotosUrls && garantia.fotosUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotografías ({garantia.fotosUrls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {garantia.fotosUrls.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={url}
                    alt={`Foto ${index + 1} de ${garantia.descripcion}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar garantía?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta garantía? Esta acción no se puede deshacer.
              {garantia.estado === 'EN_USO' && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Esta garantía está asignada a un préstamo activo.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

