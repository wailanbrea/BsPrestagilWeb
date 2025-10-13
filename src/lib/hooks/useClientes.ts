// src/lib/hooks/useClientes.ts
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Cliente } from '@/types/cliente';
import { uploadClientePhoto } from '@/lib/firebase/storage';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sin orderBy para evitar requerir índice
    const q = collection(db, 'clientes');

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clientesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Cliente[];
        
        // Ordenar en el cliente (soporta ambos nombres de campo)
        clientesData.sort((a, b) => 
          (b.fechaRegistro || b.fechaCreacion || 0) - (a.fechaRegistro || a.fechaCreacion || 0)
        );
        
        setClientes(clientesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading clientes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const crearCliente = async (data: {
    nombre: string;
    telefono?: string;
    direccion?: string;
    documento?: string;
    notas?: string;
    foto?: File;
  }) => {
    try {
      let fotoUrl = undefined;
      
      // Crear cliente primero para obtener el ID
      const clienteRef = await addDoc(collection(db, 'clientes'), {
        nombre: data.nombre,
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        email: '',
        fotoUrl: '',
        referencias: [],
        fechaRegistro: Timestamp.now().toMillis(),
        prestamosActivos: 0,
        historialPagos: 'AL_DIA',
        lastSyncTime: Timestamp.now().toMillis(),
      });
      
      // Subir foto si existe
      if (data.foto) {
        fotoUrl = await uploadClientePhoto(clienteRef.id, data.foto);
        await updateDoc(clienteRef, { fotoUrl });
      }
      
      return clienteRef.id;
    } catch (err: any) {
      console.error('Error creating cliente:', err);
      throw new Error(err.message || 'Error al crear cliente');
    }
  };

  const actualizarCliente = async (id: string, data: {
    nombre?: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    referencias?: any[];
    foto?: File;
  }) => {
    try {
      const updateData: any = {
        ...data,
        lastSyncTime: Timestamp.now().toMillis(),
      };
      
      // Subir nueva foto si existe
      if (data.foto) {
        const fotoUrl = await uploadClientePhoto(id, data.foto);
        updateData.fotoUrl = fotoUrl;
      }
      
      const clienteRef = doc(db, 'clientes', id);
      await updateDoc(clienteRef, updateData);
    } catch (err: any) {
      console.error('Error updating cliente:', err);
      throw new Error(err.message || 'Error al actualizar cliente');
    }
  };

  const eliminarCliente = async (id: string) => {
    try {
      // Eliminar directamente (no soft delete)
      const clienteRef = doc(db, 'clientes', id);
      await deleteDoc(clienteRef);
    } catch (err: any) {
      console.error('Error deleting cliente:', err);
      throw new Error(err.message || 'Error al eliminar cliente');
    }
  };

  return {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  };
}


