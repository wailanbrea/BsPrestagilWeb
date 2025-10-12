'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePrestamos } from '@/lib/hooks/usePrestamos';
import { Prestamo } from '@/types/prestamo';

export default function PrestamosPage() {
  const router = useRouter();
  const { prestamos, loading } = usePrestamos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  const prestamosFiltrados = prestamos.filter((prestamo) => {
    const matchesSearch = (prestamo.clienteNombre || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'TODOS' || prestamo.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  const estadisticas = {
    total: prestamos.length,
    activos: prestamos.filter((p) => p.estado === 'ACTIVO').length,
    atrasados: prestamos.filter((p) => p.estado === 'ATRASADO').length,
    completados: prestamos.filter((p) => p.estado === 'COMPLETADO').length,
    capitalActivo: prestamos
      .filter((p) => p.estado === 'ACTIVO' || p.estado === 'ATRASADO')
      .reduce((sum, p) => sum + (p.capitalPendiente || 0), 0),
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
          <h1 className="text-3xl font-bold">Préstamos</h1>
          <p className="text-muted-foreground">Gestiona todos los préstamos</p>
        </div>
        <Button onClick={() => router.push('/prestamos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Préstamo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Préstamos</CardTitle>
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
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticas.atrasados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.completados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="ATRASADO">Atrasado</option>
              <option value="COMPLETADO">Completado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Préstamos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prestamosFiltrados.map((prestamo) => (
          <Card
            key={prestamo.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/prestamos/${prestamo.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{prestamo.clienteNombre || 'Cliente'}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(prestamo.fechaInicio || Date.now()).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    prestamo.estado === 'ACTIVO'
                      ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                      : prestamo.estado === 'ATRASADO'
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                      : prestamo.estado === 'COMPLETADO'
                      ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {prestamo.estado || 'N/A'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto original:</span>
                  <span className="font-medium">
                    ${(prestamo.montoOriginal || 0).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capital pendiente:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${(prestamo.capitalPendiente || 0).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cuotas:</span>
                  <span>{prestamo.cuotasPagadas || 0} / {prestamo.numeroCuotas || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasa:</span>
                  <span>{prestamo.tasaInteresPorPeriodo || 0}% {prestamo.frecuenciaPago?.toLowerCase() || ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sistema:</span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded font-medium">
                    {prestamo.tipoAmortizacion === 'FRANCES' ? 'Francés' : 'Alemán'}
                  </span>
                </div>
                {prestamo.cobradorNombre && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cobrador:</span>
                    <span>{prestamo.cobradorNombre}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {prestamosFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron préstamos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

