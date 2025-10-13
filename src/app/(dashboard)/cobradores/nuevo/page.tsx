'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { crearCobrador } from '@/lib/firebase/functions';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function NuevoCobradorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    porcentajeComision: '5',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para el diálogo de éxito
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [credencialesGeneradas, setCredencialesGeneradas] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validar campos
      if (!formData.nombre || !formData.email || !formData.telefono) {
        throw new Error('Todos los campos son requeridos');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Email inválido');
      }

      // ⭐ Llamar a la Cloud Function
      const result = await crearCobrador({
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        porcentajeComision: parseFloat(formData.porcentajeComision) || 5,
      });

      if (result.success) {
        // Guardar credenciales para mostrar en el diálogo
        setCredencialesGeneradas({
          email: result.email || formData.email,
          password: result.password || '',
        });
        
        // Mostrar diálogo de éxito
        setShowSuccessDialog(true);
        
        toast.success('Cobrador creado exitosamente');
      } else {
        throw new Error(result.message || 'Error al crear cobrador');
      }
    } catch (err: any) {
      console.error('Error creating cobrador:', err);
      setError(err.message || 'Error al crear cobrador');
      toast.error(err.message || 'Error al crear cobrador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    router.push('/cobradores');
  };

  return (
    <>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nuevo Cobrador</h1>
            <p className="text-muted-foreground">Agregar un nuevo cobrador al equipo</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Cobrador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se generará una contraseña automáticamente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+52 999 123 4567"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="porcentajeComision">Porcentaje de Comisión (%)</Label>
                <Input
                  id="porcentajeComision"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={formData.porcentajeComision}
                  onChange={(e) =>
                    setFormData({ ...formData, porcentajeComision: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Porcentaje de comisión por cada pago cobrado
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información importante */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ℹ️ Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Se creará un usuario con acceso limitado al sistema</p>
              <p>• El cobrador recibirá credenciales de acceso</p>
              <p>• En el primer inicio de sesión deberá cambiar su contraseña</p>
              <p>• Solo podrá ver los préstamos asignados a él</p>
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
              {isSubmitting ? 'Creando...' : 'Crear Cobrador'}
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo de Éxito con Credenciales */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ Cobrador Creado Exitosamente</DialogTitle>
            <DialogDescription>
              El cobrador ha sido creado correctamente. Guarda estas credenciales:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input 
                  value={credencialesGeneradas.email} 
                  readOnly 
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(credencialesGeneradas.email);
                    toast.success('Email copiado');
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña Temporal</Label>
              <div className="flex gap-2">
                <Input 
                  value={credencialesGeneradas.password} 
                  readOnly 
                  className="bg-muted font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(credencialesGeneradas.password);
                    toast.success('Contraseña copiada');
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                ⚠️ Guarda estas credenciales. La contraseña no se volverá a mostrar.
                El cobrador deberá cambiarla en su primer inicio de sesión.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCloseSuccess} className="w-full">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

