'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientes } from '@/lib/hooks/useClientes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, loading } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
        </div>
        <Button onClick={() => router.push('/clientes/nuevo')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map(cliente => (
          <Card 
            key={cliente.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/clientes/${cliente.id}`)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                {cliente.fotoUrl ? (
                  <img
                    src={cliente.fotoUrl}
                    alt={cliente.nombre}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                  {cliente.telefono && (
                    <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {cliente.email && (
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div>
                    <span className="text-muted-foreground">Dirección: </span>
                    <span className="font-medium truncate">{cliente.direccion}</span>
                  </div>
                )}
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-muted-foreground">Préstamos activos:</span>
                  <span className="font-bold text-lg text-primary">{cliente.prestamosActivos || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    cliente.historialPagos === 'AL_DIA' 
                      ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' 
                      : cliente.historialPagos === 'ATRASADO' 
                      ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' 
                      : cliente.historialPagos === 'MOROSO' 
                      ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {cliente.historialPagos?.replace('_', ' ') || 'AL DÍA'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Registrado: {formatDate(cliente.fechaRegistro || cliente.fechaCreacion || Date.now())}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClientes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No se encontraron clientes</p>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primer cliente'}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/clientes/nuevo')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

