'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBar, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Prestamo } from '@/types/prestamo';
import { Pago } from '@/types/pago';
import { calcularComisiones } from '@/lib/firebase/functions';

interface Stats {
  prestamosAsignados: number;
  totalACobrarHoy: number;
  pagosCobradosHoy: number;
  clientesAtrasados: number;
  // ⭐ Comisiones calculadas desde pagos
  porcentajeComision: number;
  comisionTotal: number;
  comisionMes: number;
  comisionHoy: number;
  totalCobrado: number;
}

export default function CobradorDashboardPage() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState<Stats>({
    prestamosAsignados: 0,
    totalACobrarHoy: 0,
    pagosCobradosHoy: 0,
    clientesAtrasados: 0,
    porcentajeComision: 0,
    comisionTotal: 0,
    comisionMes: 0,
    comisionHoy: 0,
    totalCobrado: 0,
  });
  const [loading, setLoading] = useState(true);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  useEffect(() => {
    if (usuario?.id) {
      loadCobradorData();
    }
  }, [usuario?.id]);

  const loadCobradorData = async () => {
    try {
      setLoading(true);

      // 1. ⭐ Usar Cloud Function para calcular comisiones
      const comisionesResult = await calcularComisiones(usuario?.id || '');

      console.log('📊 Comisiones desde Cloud Function:', comisionesResult);

      // 2. Obtener préstamos asignados
      const prestamosQuery = query(
        collection(db, 'prestamos'),
        where('cobradorId', '==', usuario?.id)
      );

      const prestamosSnapshot = await getDocs(prestamosQuery);
      const prestamosData = prestamosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Prestamo[];

      setPrestamos(prestamosData);

      // 3. Calcular estadísticas de préstamos
      const clientesAtrasados = prestamosData.filter(
        (p) => p.estado === 'ATRASADO'
      ).length;

      const totalACobrarHoy = prestamosData.reduce((sum, prestamo) => {
        if (prestamo.estado === 'ACTIVO') {
          return sum + (prestamo.montoCuotaFija || 0);
        }
        return sum;
      }, 0);

      // 4. Actualizar estado con datos de la Cloud Function
      setStats({
        prestamosAsignados: prestamosData.length,
        totalACobrarHoy,
        pagosCobradosHoy: comisionesResult.totalCobrado, // Total cobrado del cobrador
        clientesAtrasados,
        porcentajeComision: comisionesResult.porcentajeComision,
        comisionTotal: comisionesResult.comisionTotal,
        comisionMes: comisionesResult.comisionMes,
        comisionHoy: comisionesResult.comisionHoy,
        totalCobrado: comisionesResult.totalCobrado,
      });
    } catch (error) {
      console.error('Error loading cobrador data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Dashboard de Cobrador</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido {usuario?.nombre}. Aquí están tus métricas del día.
        </p>
      </div>

      {/* ⭐ Card de Comisión Total (destacada) */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <h2 className="text-lg font-semibold">Comisión Total</h2>
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                ${stats.comisionTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.porcentajeComision}% de ${stats.totalCobrado.toLocaleString('es-MX')} cobrado
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Mes: <span className="font-semibold text-foreground">${stats.comisionMes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                Hoy: ${stats.comisionHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Préstamos Asignados
            </CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prestamosAsignados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Préstamos bajo tu gestión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total a Cobrar Hoy
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalACobrarHoy.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monto estimado del día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Cobrados Hoy
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.pagosCobradosHoy.toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cobrado hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Atrasados
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.clientesAtrasados}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Préstamos Asignados */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Préstamos Asignados</CardTitle>
        </CardHeader>
        <CardContent>
          {prestamos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tienes préstamos asignados actualmente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prestamos.map((prestamo) => (
                <div
                  key={prestamo.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{prestamo.clienteNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      ${prestamo.montoOriginal.toLocaleString('es-MX')} -{' '}
                      {prestamo.numeroCuotas} cuotas
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        prestamo.estado === 'ACTIVO'
                          ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                          : prestamo.estado === 'ATRASADO'
                          ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {prestamo.estado}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prestamo.cuotasPagadas || 0} / {prestamo.numeroCuotas}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

