// src/lib/hooks/useRealtimeSync.ts
'use client';

import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from './useAuth';

/**
 * Hook para sincronización en tiempo real de todas las colecciones
 * Este hook establece listeners para detectar cambios en Firebase
 * y actualiza automáticamente los datos en la aplicación web
 */
export function useRealtimeSync() {
  const { adminId } = useAuth();

  useEffect(() => {
    if (!adminId) return;

    const unsubscribers: (() => void)[] = [];

    // 1. Listener para Clientes
    const clientesUnsub = onSnapshot(
      query(collection(db, 'clientes'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nuevo cliente:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Cliente actualizado:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Cliente eliminado:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de clientes:', error);
      }
    );
    unsubscribers.push(clientesUnsub);

    // 2. Listener para Préstamos
    const prestamosUnsub = onSnapshot(
      query(collection(db, 'prestamos'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nuevo préstamo:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Préstamo actualizado:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Préstamo eliminado:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de préstamos:', error);
      }
    );
    unsubscribers.push(prestamosUnsub);

    // 3. Listener para Pagos
    const pagosUnsub = onSnapshot(
      query(collection(db, 'pagos'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nuevo pago:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Pago actualizado:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Pago eliminado:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de pagos:', error);
      }
    );
    unsubscribers.push(pagosUnsub);

    // 4. Listener para Cuotas
    const cuotasUnsub = onSnapshot(
      query(collection(db, 'cuotas'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nueva cuota:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Cuota actualizada:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Cuota eliminada:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de cuotas:', error);
      }
    );
    unsubscribers.push(cuotasUnsub);

    // 5. Listener para Garantías
    const garantiasUnsub = onSnapshot(
      query(collection(db, 'garantias'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nueva garantía:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Garantía actualizada:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Garantía eliminada:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de garantías:', error);
      }
    );
    unsubscribers.push(garantiasUnsub);

    // 6. Listener para Usuarios (cobradores/supervisores)
    const usuariosUnsub = onSnapshot(
      query(collection(db, 'usuarios'), where('adminId', '==', adminId)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'added') {
            console.log('✅ Nuevo usuario:', data);
          } else if (change.type === 'modified') {
            console.log('🔄 Usuario actualizado:', data);
          } else if (change.type === 'removed') {
            console.log('🗑️ Usuario eliminado:', data.id);
          }
        });
      },
      (error) => {
        console.error('Error en listener de usuarios:', error);
      }
    );
    unsubscribers.push(usuariosUnsub);

    console.log('🔄 Sincronización en tiempo real activada para adminId:', adminId);

    // Cleanup: Desuscribirse de todos los listeners
    return () => {
      unsubscribers.forEach(unsub => unsub());
      console.log('🔴 Sincronización en tiempo real desactivada');
    };
  }, [adminId]);
}

