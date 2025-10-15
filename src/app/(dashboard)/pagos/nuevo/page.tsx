'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Prestamo, Cuota } from '@/types/prestamo';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface CuotaExtendida extends Cuota {
  saldoCuota: number;
}

interface Distribucion {
  montoAInteres: number;
  montoACapital: number;
  mensaje: string;
  tipo: 'success' | 'warning' | 'info';
  interesProyectado: number;
  capitalProyectado: number;
}

export default function NuevoPagoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prestamoIdParam = searchParams.get('prestamoId');
  const { adminId, usuario } = useAuth();
  
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [prestamo, setPrestamo] = useState<Prestamo | null>(null);
  const [cuotas, setCuotas] = useState<CuotaExtendida[]>([]);
  
  // Estados del formulario
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<CuotaExtendida | null>(null);
  const [montoPagado, setMontoPagado] = useState('');
  const [montoMora, setMontoMora] = useState('0');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [notas, setNotas] = useState('');
  const [numeroRecibo, setNumeroRecibo] = useState('');

  // Calcular distribución en tiempo real
  const distribucion = useMemo<Distribucion | null>(() => {
    if (!cuotaSeleccionada || !montoPagado || parseFloat(montoPagado) <= 0) {
      return null;
    }
    
    return calcularDistribucion(parseFloat(montoPagado), cuotaSeleccionada);
  }, [montoPagado, cuotaSeleccionada]);

  // Función para calcular distribución
  function calcularDistribucion(monto: number, cuota: CuotaExtendida): Distribucion {
    // Usar la distribución del cronograma (ya viene en la cuota)
    const interesProyectado = cuota.montoAInteres;
    const capitalProyectado = cuota.montoACapital;
    
    let montoAInteres: number;
    let montoACapital: number;
    let mensaje: string = '';
    let tipo: 'success' | 'warning' | 'info' = 'info';
    
    if (monto >= cuota.saldoCuota) {
      // PAGO COMPLETO O EXCEDENTE
      const excedente = monto - cuota.saldoCuota;
      montoAInteres = interesProyectado - (cuota.montoPagado || 0) * (interesProyectado / cuota.montoCuotaMinimo);
      montoACapital = capitalProyectado - (cuota.montoPagado || 0) * (capitalProyectado / cuota.montoCuotaMinimo) + excedente;
      
      if (excedente > 0.01) {
        tipo = 'success';
        mensaje = `✅ Pago completo. Excedente de $${excedente.toFixed(2)} se aplicará al capital.`;
      } else {
        tipo = 'success';
        mensaje = `✅ Pago completo de la cuota.`;
      }
    } else if (monto > 0) {
      // PAGO PARCIAL
      const proporcion = monto / cuota.saldoCuota;
      const interesRestante = interesProyectado - (cuota.montoPagado || 0) * (interesProyectado / cuota.montoCuotaMinimo);
      const capitalRestante = capitalProyectado - (cuota.montoPagado || 0) * (capitalProyectado / cuota.montoCuotaMinimo);
      
      montoAInteres = interesRestante * proporcion;
      montoACapital = capitalRestante * proporcion;
      
      tipo = 'warning';
      mensaje = `⚠️ Pago parcial (${(proporcion * 100).toFixed(1)}%). Falta $${(cuota.saldoCuota - monto).toFixed(2)} para completar la cuota.`;
    } else {
      montoAInteres = 0;
      montoACapital = 0;
      tipo = 'info';
      mensaje = 'Ingrese un monto para ver la distribución.';
    }
    
    return {
      montoAInteres,
      montoACapital,
      mensaje,
      tipo,
      interesProyectado,
      capitalProyectado
    };
  }

  // Cargar datos iniciales
  useEffect(() => {
    async function cargarDatos() {
      if (!prestamoIdParam || !adminId) {
        toast.error('Falta información del préstamo');
        return;
      }

      setLoadingData(true);
      try {
        // 1. Cargar préstamo
        const prestamosQuery = query(
          collection(db, 'prestamos'),
          where('adminId', '==', adminId)
        );
        const prestamosSnapshot = await getDocs(prestamosQuery);
        const prestamoDoc = prestamosSnapshot.docs.find(doc => doc.id === prestamoIdParam);
        
        if (!prestamoDoc) {
          toast.error('Préstamo no encontrado');
          router.push('/pagos');
          return;
        }

        const prestamoData = {
          id: prestamoDoc.id,
          firebaseId: prestamoDoc.id,
          ...prestamoDoc.data()
        } as Prestamo;
        setPrestamo(prestamoData);
        
        // 2. Cargar cuotas del préstamo
        const cuotasQuery = query(
          collection(db, 'cuotas'),
          where('prestamoId', '==', prestamoIdParam),
          where('adminId', '==', adminId),
          orderBy('numeroCuota', 'asc')
        );
        const cuotasSnapshot = await getDocs(cuotasQuery);
        const cuotasData = cuotasSnapshot.docs.map(doc => {
          const data = doc.data();
          const montoPagado = data.montoPagado || 0;
          const saldoCuota = data.montoCuotaMinimo - montoPagado;
          
          return {
            id: doc.id,
            ...data,
            montoPagado,
            saldoCuota: Math.max(saldoCuota, 0),
          } as CuotaExtendida;
        });
        setCuotas(cuotasData);
        
        // 3. Seleccionar primera cuota pendiente/parcial/vencida
        const primeraNoCompletada = cuotasData.find(c => 
          c.estado === 'PARCIAL' || c.estado === 'VENCIDA' || c.estado === 'PENDIENTE'
        );
        setCuotaSeleccionada(primeraNoCompletada || null);
        
      } catch (error: any) {
        console.error('Error al cargar datos:', error);
        toast.error('Error al cargar los datos del préstamo');
      } finally {
        setLoadingData(false);
      }
    }
    
    if (prestamoIdParam && adminId) {
      cargarDatos();
    }
  }, [prestamoIdParam, adminId, router]);

  // Validaciones
  function validarPago(): { valido: boolean; error?: string } {
    if (!cuotaSeleccionada) {
      return { valido: false, error: 'Debe seleccionar una cuota' };
    }
    
    const monto = parseFloat(montoPagado);
    if (isNaN(monto) || monto <= 0) {
      return { valido: false, error: 'El monto debe ser mayor a cero' };
    }
    
    if (!prestamo) {
      return { valido: false, error: 'No se encontró el préstamo' };
    }
    
    // Monto no excesivo
    const maximoPermitido = prestamo.capitalPendiente + cuotaSeleccionada.montoAInteres + 1000;
    if (monto > maximoPermitido) {
      return { 
        valido: false, 
        error: `El monto excede el límite permitido ($${maximoPermitido.toFixed(2)})` 
      };
    }
    
    if (!metodoPago) {
      return { valido: false, error: 'Debe seleccionar un método de pago' };
    }
    
    return { valido: true };
  }

  // Registrar pago
  async function registrarPago() {
    // Validar
    const validacion = validarPago();
    if (!validacion.valido) {
      toast.error(validacion.error);
      return;
    }
    
    if (!prestamo || !cuotaSeleccionada || !usuario || !distribucion) {
      toast.error('Faltan datos necesarios');
      return;
    }

    setLoading(true);
    
    try {
      const monto = parseFloat(montoPagado);
      const mora = parseFloat(montoMora) || 0;
      
      // Calcular días transcurridos
      const diasTranscurridos = Math.floor(
        (Date.now() - (prestamo.ultimaFechaPago || prestamo.fechaInicio || Date.now())) / (1000 * 60 * 60 * 24)
      );
      
      // Crear el pago
      const nuevoPago = {
        id: uuidv4(),
        adminId: adminId!,
        prestamoId: prestamo.id,
        cuotaId: cuotaSeleccionada.id,
        numeroCuota: cuotaSeleccionada.numeroCuota,
        clienteId: prestamo.clienteId,
        clienteNombre: prestamo.clienteNombre,
        montoPagado: monto,
        montoAInteres: distribucion.montoAInteres,
        montoACapital: distribucion.montoACapital,
        montoMora: mora,
        diasTranscurridos: diasTranscurridos,
        interesCalculado: distribucion.interesProyectado,
        capitalPendienteAntes: prestamo.capitalPendiente,
        capitalPendienteDespues: prestamo.capitalPendiente - distribucion.montoACapital,
        metodoPago: metodoPago,
        fechaPago: Timestamp.now().toMillis(),
        recibidoPor: usuario.email,
        notas: notas || '',
        numeroRecibo: numeroRecibo || undefined,
        reciboUrl: '',
        pendingSync: false,
        lastSyncTime: Timestamp.now().toMillis()
      };
      
      // Guardar pago en Firestore
      await addDoc(collection(db, 'pagos'), nuevoPago);
      
      // Actualizar la cuota
      const montoPagadoCuota = (cuotaSeleccionada.montoPagado || 0) + monto;
      const saldoCuota = cuotaSeleccionada.saldoCuota - monto;
      const cuotaCompletada = saldoCuota <= 0.01;
      
      await updateDoc(doc(db, 'cuotas', cuotaSeleccionada.id), {
        montoPagado: montoPagadoCuota,
        saldoCuota: Math.max(saldoCuota, 0),
        estado: cuotaCompletada ? 'PAGADA' : 'PARCIAL',
        fechaPago: cuotaCompletada ? Timestamp.now().toMillis() : cuotaSeleccionada.fechaPago || null,
        lastSyncTime: Timestamp.now().toMillis()
      });
      
      // Actualizar el préstamo
      const nuevoCapitalPendiente = prestamo.capitalPendiente - distribucion.montoACapital;
      const prestamoCompletado = nuevoCapitalPendiente <= 0.01;
      
      await updateDoc(doc(db, 'prestamos', prestamo.firebaseId || prestamo.id), {
        capitalPendiente: Math.max(nuevoCapitalPendiente, 0),
        totalCapitalPagado: (prestamo.totalCapitalPagado || 0) + distribucion.montoACapital,
        totalInteresesPagados: (prestamo.totalInteresesPagados || 0) + distribucion.montoAInteres,
        cuotasPagadas: cuotaCompletada ? (prestamo.cuotasPagadas || 0) + 1 : prestamo.cuotasPagadas,
        ultimaFechaPago: Timestamp.now().toMillis(),
        estado: prestamoCompletado ? 'COMPLETADO' : prestamo.estado,
        lastSyncTime: Timestamp.now().toMillis()
      });
      
      // Éxito
      toast.success('✅ Pago registrado exitosamente');
      toast.success(`Capital: $${distribucion.montoACapital.toFixed(2)} | Interés: $${distribucion.montoAInteres.toFixed(2)}`);
      router.push(`/prestamos/${prestamo.id}`);
      
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      toast.error('❌ Error al registrar el pago. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!prestamo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No se encontró el préstamo</p>
            <Button onClick={() => router.push('/pagos')} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const frecuenciaTexto = {
    'DIARIO': 'diario',
    'DIARIA': 'diario',
    'SEMANAL': 'semanal',
    'QUINCENAL': 'quincenal',
    'MENSUAL': 'mensual'
  }[prestamo.frecuenciaPago] || prestamo.frecuenciaPago;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Registrar Pago</h1>
          <p className="text-muted-foreground">Préstamo de {prestamo.clienteNombre}</p>
        </div>
      </div>

      {/* Información del Préstamo */}
        <Card>
          <CardHeader>
          <CardTitle>Información del Préstamo</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Cliente</Label>
              <p className="font-medium">{prestamo.clienteNombre}</p>
              </div>
            <div>
              <Label className="text-muted-foreground">Monto original</Label>
              <p className="font-medium">${prestamo.montoOriginal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Capital pendiente</Label>
              <p className="text-red-600 font-bold text-lg">
                ${prestamo.capitalPendiente.toLocaleString('es-MX', {minimumFractionDigits: 2})}
              </p>
                    </div>
            <div>
              <Label className="text-muted-foreground">Tasa de interés</Label>
              <p className="font-medium">{prestamo.tasaInteresPorPeriodo}% {frecuenciaTexto}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sistema</Label>
              <p className="font-medium">
                {prestamo.tipoAmortizacion === 'ALEMAN' ? 'Alemán (Capital Fijo)' : 'Francés (Cuota Fija)'}
              </p>
                </div>
            <div>
              <Label className="text-muted-foreground">Cuotas pagadas</Label>
              <p className="font-medium">{prestamo.cuotasPagadas || 0} de {prestamo.numeroCuotas}</p>
                  </div>
              </div>
          </CardContent>
        </Card>

      {/* Formulario de Pago */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Selección de Cuota */}
          <div>
            <Label htmlFor="cuota">Seleccionar cuota a pagar *</Label>
            <Select
              value={cuotaSeleccionada?.id || ''}
              onValueChange={(cuotaId) => {
                const cuota = cuotas.find(c => c.id === cuotaId);
                setCuotaSeleccionada(cuota || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una cuota..." />
              </SelectTrigger>
              <SelectContent>
                {cuotas
                  .filter(c => c.estado !== 'PAGADA')
                  .map(cuota => {
                    const vencimiento = new Date(cuota.fechaVencimiento);
                    const estadoColor: Record<string, string> = {
                      'PENDIENTE': 'text-blue-600',
                      'PARCIAL': 'text-orange-600',
                      'VENCIDA': 'text-red-600',
                      'ATRASADA': 'text-red-600',
                      'PAGADA': 'text-green-600'
                    };
                    const color = estadoColor[cuota.estado] || 'text-muted-foreground';
                    
                    return (
                      <SelectItem key={cuota.id} value={cuota.id}>
                        <div className="flex justify-between gap-4 w-full">
                          <span className="font-medium">Cuota {cuota.numeroCuota}</span>
                          <span className="text-green-600">${cuota.saldoCuota.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">
                            {vencimiento.toLocaleDateString('es-MX')}
                          </span>
                          <span className={`text-sm font-medium ${color}`}>
                            {cuota.estado}
                          </span>
              </div>
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            {cuotaSeleccionada && (
              <p className="text-sm text-muted-foreground mt-1">
                Saldo de la cuota: ${cuotaSeleccionada.saldoCuota.toFixed(2)}
              </p>
            )}
            </div>

          {/* Monto a Pagar */}
          <div>
            <Label htmlFor="monto">Monto a pagar *</Label>
                <Input
              id="monto"
                  type="number"
                  step="0.01"
              min="0.01"
                  placeholder="0.00"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="text-lg font-semibold"
                />
              </div>

          {/* Método de Pago */}
          <div>
            <Label htmlFor="metodoPago">Método de pago *</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                <SelectItem value="EFECTIVO">💵 Efectivo</SelectItem>
                <SelectItem value="TRANSFERENCIA">🏦 Transferencia</SelectItem>
                <SelectItem value="CHEQUE">📄 Cheque</SelectItem>
                <SelectItem value="OTRO">➕ Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

          {/* Mora */}
          <div>
            <Label htmlFor="mora">Mora (opcional)</Label>
            <Input
              id="mora"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={montoMora}
              onChange={(e) => setMontoMora(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cobro adicional por retraso en el pago
            </p>
          </div>

          {/* Número de Recibo */}
          <div>
            <Label htmlFor="recibo">Número de recibo (opcional)</Label>
            <Input
              id="recibo"
              type="text"
              placeholder="REC-001"
              value={numeroRecibo}
              onChange={(e) => setNumeroRecibo(e.target.value)}
            />
            </div>

          {/* Notas */}
          <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
                id="notas"
              placeholder="Comentarios adicionales sobre el pago..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              />
            </div>
          </CardContent>
        </Card>

      {/* Vista Previa del Pago */}
      {cuotaSeleccionada && montoPagado && distribucion && (
        <Card className={`border-2 ${
          distribucion.tipo === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
          distribucion.tipo === 'warning' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' :
          'border-blue-500 bg-blue-50 dark:bg-blue-950'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Distribución del pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mensaje principal */}
            <Alert className={
              distribucion.tipo === 'success' ? 'bg-green-100 dark:bg-green-900' : 
              'bg-orange-100 dark:bg-orange-900'
            }>
              <AlertDescription className="font-medium">
                {distribucion.mensaje}
              </AlertDescription>
            </Alert>
            
            {/* Distribución detallada */}
            <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Monto total</p>
                <p className="text-xl font-bold">${parseFloat(montoPagado).toFixed(2)}</p>
              </div>
              
              <div className="border-l pl-4">
                <p className="text-sm text-muted-foreground">→ A interés</p>
                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                  ${distribucion.montoAInteres.toFixed(2)}
                </p>
              </div>
              
              <div className="col-span-2 border-t pt-3">
                <p className="text-sm text-muted-foreground">→ A capital</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ${distribucion.montoACapital.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Proyección del cronograma */}
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold mb-2">Del cronograma original:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">Interés proyectado:</p>
                  <p className="font-medium">${distribucion.interesProyectado.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capital proyectado:</p>
                  <p className="font-medium">${distribucion.capitalProyectado.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Capital resultante */}
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Capital pendiente después del pago:</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                ${(prestamo.capitalPendiente - distribucion.montoACapital).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                (Actualmente: ${prestamo.capitalPendiente.toFixed(2)})
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
          disabled={loading}
          >
            Cancelar
          </Button>
        
          <Button 
          onClick={registrarPago}
          disabled={loading || !cuotaSeleccionada || !montoPagado || parseFloat(montoPagado) <= 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Registrar Pago
            </>
          )}
          </Button>
        </div>
    </div>
  );
}
