'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Garantia } from '@/types/garantia';
import { useAuth } from '@/lib/hooks/useAuth';

export default function GarantiasPage() {
  const router = useRouter();
  const { adminId } = useAuth();
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    // ✅ Filtrar por adminId para multi-tenant
    const q = query(
      collection(db, 'garantias'),
      where('adminId', '==', adminId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const garantiasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Garantia[];

      // Ordenar en el cliente
      garantiasData.sort((a, b) => (b.fechaRegistro || 0) - (a.fechaRegistro || 0));

      setGarantias(garantiasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminId]);

  const garantiasFiltradas = garantias.filter((garantia) =>
    garantia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garantia.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estadisticas = {
    total: garantias.length,
    disponibles: garantias.filter((g) => g.estado === 'DISPONIBLE').length,
    enUso: garantias.filter((g) => g.estado === 'EN_USO' || g.estado === 'RETENIDA').length,
    liberadas: garantias.filter((g) => g.estado === 'LIBERADA' || g.estado === 'DEVUELTA').length,
    ejecutadas: garantias.filter((g) => g.estado === 'EJECUTADA').length,
    valorTotal: garantias.reduce((sum, g) => sum + (g.valorEstimado || 0), 0),
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
          <h1 className="text-3xl font-bold">Garantías</h1>
          <p className="text-muted-foreground">Gestiona las garantías de los préstamos</p>
        </div>
        <Button onClick={() => router.push('/garantias/nueva')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Garantía
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Garantías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.disponibles}</div>
            <p className="text-xs text-muted-foreground">Para asignar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{estadisticas.enUso}</div>
            <p className="text-xs text-muted-foreground">Asignadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liberadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.liberadas}</div>
            <p className="text-xs text-muted-foreground">Devueltas</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Valor Total */}
      <Card>
        <CardHeader>
          <CardTitle>Valor Total de Garantías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            ${estadisticas.valorTotal.toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Valor estimado total del inventario
          </p>
        </CardContent>
      </Card>

      {/* Buscador */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar garantía o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid de Garantías */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {garantiasFiltradas.map((garantia) => {
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
            <Card
              key={garantia.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/garantias/${garantia.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{tipoIcono}</span>
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      garantia.estado === 'DISPONIBLE'
                        ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                        : garantia.estado === 'EN_USO' || garantia.estado === 'RETENIDA'
                        ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
                        : garantia.estado === 'LIBERADA' || garantia.estado === 'DEVUELTA'
                        ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        : garantia.estado === 'EJECUTADA'
                        ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {garantia.estado || 'N/A'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold">{garantia.descripcion || 'Sin descripción'}</p>
                    <p className="text-sm text-muted-foreground">{garantia.clienteNombre || 'Sin cliente'}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Valor estimado:</span>
                    <span className="font-bold text-lg">
                      ${(garantia.valorEstimado || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <span className="text-sm font-medium">{tipoTexto}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Registro:</span>
                    <span>{new Date(garantia.fechaRegistro || Date.now()).toLocaleDateString('es-MX')}</span>
                  </div>
                  {garantia.fotosUrls && garantia.fotosUrls.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
                      <span>📷</span>
                      <span>{garantia.fotosUrls.length} foto(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {garantiasFiltradas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron garantías</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

