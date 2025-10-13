// src/lib/hooks/usePrestamos.ts
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Prestamo, TipoAmortizacion, FrecuenciaPago } from '@/types/prestamo';
import { generarCronograma } from '@/lib/utils/amortizacion';

export function usePrestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sin orderBy para evitar requerir índice
    const q = collection(db, 'prestamos');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prestamosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Prestamo[];
        
        // Ordenar en el cliente
        prestamosData.sort((a, b) => (b.fechaInicio || 0) - (a.fechaInicio || 0));
        
        setPrestamos(prestamosData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading prestamos:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const crearPrestamo = async (data: {
    clienteId: string;
    clienteNombre: string;
    cobradorId?: string;
    cobradorNombre?: string;
    montoOriginal: number;
    tasaInteresPorPeriodo: number;
    frecuenciaPago: FrecuenciaPago;
    tipoAmortizacion: TipoAmortizacion;
    numeroCuotas: number;
    garantiaId?: string;
    notas?: string;
  }) => {
    try {
      const fechaInicio = Date.now();
      const prestamoId = `prestamo_${Date.now()}`;
      
      // Calcular fecha de vencimiento
      const diasEntreCuotas = 
        data.frecuenciaPago === 'DIARIO' ? 1 :
        data.frecuenciaPago === 'QUINCENAL' ? 15 :
        30;
      const fechaVencimiento = fechaInicio + 
        (diasEntreCuotas * data.numeroCuotas * 24 * 60 * 60 * 1000);
      
      // Calcular monto cuota fija si es sistema francés
      let montoCuotaFija = undefined;
      if (data.tipoAmortizacion === 'FRANCES') {
        const tasaDecimal = data.tasaInteresPorPeriodo / 100;
        const factor = Math.pow(1 + tasaDecimal, data.numeroCuotas);
        montoCuotaFija = (data.montoOriginal * tasaDecimal * factor) / (factor - 1);
      }
      
      // Crear préstamo
      const prestamoRef = await addDoc(collection(db, 'prestamos'), {
        ...data,
        capitalPendiente: data.montoOriginal,
        montoCuotaFija,
        cuotasPagadas: 0,
        fechaInicio,
        fechaVencimiento,
        ultimaFechaPago: fechaInicio,
        estado: 'ACTIVO',
        totalInteresesPagados: 0,
        totalCapitalPagado: 0,
        totalMorasPagadas: 0,
        lastSyncTime: Timestamp.now().toMillis(),
      });
      
      // Generar cronograma de cuotas
      const cuotas = generarCronograma(
        prestamoRef.id,
        data.montoOriginal,
        data.tasaInteresPorPeriodo,
        data.numeroCuotas,
        data.tipoAmortizacion,
        data.frecuenciaPago,
        fechaInicio
      );
      
      // Guardar cuotas en Firestore
      const cuotasPromises = cuotas.map(cuota =>
        addDoc(collection(db, 'cuotas'), cuota)
      );
      await Promise.all(cuotasPromises);
      
      return prestamoRef.id;
    } catch (err: any) {
      console.error('Error creating prestamo:', err);
      throw new Error(err.message || 'Error al crear préstamo');
    }
  };

  const actualizarPrestamo = async (id: string, data: Partial<Prestamo>) => {
    try {
      const prestamoRef = doc(db, 'prestamos', id);
      await updateDoc(prestamoRef, {
        ...data,
        fechaActualizacion: Timestamp.now().toMillis(),
      });
    } catch (err: any) {
      console.error('Error updating prestamo:', err);
      throw new Error(err.message || 'Error al actualizar préstamo');
    }
  };

  return {
    prestamos,
    loading,
    error,
    crearPrestamo,
    actualizarPrestamo,
  };
}


