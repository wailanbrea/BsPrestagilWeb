'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/hooks/useAuth';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { TipoGarantia, EstadoGarantia } from '@/types/garantia';
import { toast } from 'sonner';

export default function NuevaGarantiaPage() {
  const router = useRouter();
  const { adminId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'ELECTRONICO' as TipoGarantia,
    descripcion: '',
    valorEstimado: '',
    notas: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminId) {
      toast.error('No se pudo obtener el adminId');
      return;
    }

    if (!formData.descripcion || !formData.valorEstimado) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const valorEstimado = parseFloat(formData.valorEstimado);
    if (isNaN(valorEstimado) || valorEstimado <= 0) {
      toast.error('Ingresa un valor estimado válido');
      return;
    }

    try {
      setIsSubmitting(true);

      const nuevaGarantia = {
        adminId: adminId,  // ✅ Multi-tenant
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        valorEstimado: valorEstimado,
        fotosUrls: [],
        estado: 'DISPONIBLE' as EstadoGarantia,
        fechaRegistro: Timestamp.now().toMillis(),
        notas: formData.notas || '',
        pendingSync: false,
        lastSyncTime: Timestamp.now().toMillis(),
      };

      await addDoc(collection(db, 'garantias'), nuevaGarantia);
      
      toast.success('Garantía registrada exitosamente');
      router.push('/garantias');
    } catch (error: any) {
      console.error('Error creando garantía:', error);
      toast.error(error.message || 'Error al crear garantía');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Garantía</h1>
          <p className="text-muted-foreground">Registra una nueva garantía</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de la Garantía */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Garantía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Garantía *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoGarantia) =>
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VEHICULO">🚗 Vehículo</SelectItem>
                  <SelectItem value="ELECTRODOMESTICO">🏠 Electrodoméstico</SelectItem>
                  <SelectItem value="ELECTRONICO">💻 Electrónico</SelectItem>
                  <SelectItem value="JOYA">💍 Joya</SelectItem>
                  <SelectItem value="MUEBLE">🪑 Mueble</SelectItem>
                  <SelectItem value="OTRO">📦 Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Input
                id="descripcion"
                placeholder="Ej: Laptop Dell Inspiron 15, Core i7, 16GB RAM"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorEstimado">Valor Estimado *</Label>
              <Input
                id="valorEstimado"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.valorEstimado}
                onChange={(e) =>
                  setFormData({ ...formData, valorEstimado: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input
                id="notas"
                placeholder="Notas adicionales sobre la garantía..."
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Fotos */}
        <Card>
          <CardHeader>
            <CardTitle>Fotografías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                La funcionalidad de carga de fotos estará disponible próximamente
              </p>
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
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Registrando...' : 'Registrar Garantía'}
          </Button>
        </div>
      </form>
    </div>
  );
}

