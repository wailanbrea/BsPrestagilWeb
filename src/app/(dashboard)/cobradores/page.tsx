'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, UserCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Usuario } from '@/types/usuario';
import { Pago } from '@/types/pago';
import { calcularComisiones } from '@/lib/firebase/functions';

// ⭐ Tipo extendido con comisiones calculadas desde Cloud Function
interface CobradorConComisiones extends Usuario {
  totalComisionCalculada: number;
  comisionPendiente: number;
}

export default function CobradoresPage() {
  const router = useRouter();
  const [cobradores, setCobradores] = useState<CobradorConComisiones[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCobradoresConComisiones();
  }, []);

  // ⭐ Función para obtener cobradores con comisiones desde Cloud Function
  const loadCobradoresConComisiones = async () => {
    try {
      setLoading(true);

      // 1. Obtener todos los cobradores
      const cobradoresQuery = query(
        collection(db, 'usuarios'),
        where('rol', '==', 'COBRADOR')
      );
      const cobradoresSnapshot = await getDocs(cobradoresQuery);
      const cobradoresData = cobradoresSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Usuario[];

      // 2. ⭐ Calcular comisiones para cada cobrador usando Cloud Function (nueva interfaz)
      const cobradoresConComisionesPromises = cobradoresData.map(async (cobrador) => {
        try {
          // Llamar a Cloud Function para calcular comisiones con la nueva interfaz
          const comisionesResult = await calcularComisiones({
            cobradorId: cobrador.id,
            incluirDetalles: false,
          });

          return {
            ...cobrador,
            totalComisionCalculada: comisionesResult.total.comision,
            comisionPendiente: comisionesResult.total.comision - (cobrador.totalComisionesPagadas || 0),
          } as CobradorConComisiones;
        } catch (error) {
          console.error(`Error calculando comisiones para ${cobrador.nombre}:`, error);
          // En caso de error, retornar con comisiones en 0
          return {
            ...cobrador,
            totalComisionCalculada: 0,
            comisionPendiente: 0,
          } as CobradorConComisiones;
        }
      });

      const cobradoresConComisiones = await Promise.all(cobradoresConComisionesPromises);

      // 3. Ordenar por nombre
      cobradoresConComisiones.sort((a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '')
      );

      setCobradores(cobradoresConComisiones);
    } catch (error) {
      console.error('Error loading cobradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const cobradoresFiltrados = cobradores.filter((cobrador) =>
    cobrador.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cobrador.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ⭐ Estadísticas usando comisiones calculadas desde pagos
  const estadisticas = {
    total: cobradores.length,
    activos: cobradores.filter((c) => c.activo).length,
    totalComisiones: cobradores.reduce((sum, c) => sum + (c.totalComisionCalculada || 0), 0),
    comisionesPendientes: cobradores.reduce((sum, c) => sum + (c.comisionPendiente || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cobradores</h1>
          <p className="text-muted-foreground">Gestiona el equipo de cobradores</p>
        </div>
        <Button onClick={() => router.push('/cobradores/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cobrador
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.activos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Generadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${estadisticas.totalComisiones.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ${estadisticas.comisionesPendientes.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cobrador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de Cobradores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cobradoresFiltrados.map((cobrador) => {
          return (
            <Card
              key={cobrador.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/cobradores/${cobrador.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{cobrador.nombre}</p>
                      <p className="text-xs text-muted-foreground">{cobrador.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      cobrador.activo
                        ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {cobrador.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">% Comisión:</span>
                    <span className="font-medium">{cobrador.porcentajeComision || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Comisiones generadas:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      ${(cobrador.totalComisionCalculada || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Comisiones pagadas:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      ${(cobrador.totalComisionesPagadas || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {cobrador.comisionPendiente > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Pendiente de pago:</span>
                      <span className="font-bold text-yellow-600 dark:text-yellow-400">
                        ${cobrador.comisionPendiente.toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cobradoresFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron cobradores</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

