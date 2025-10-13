import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { app } from '@/lib/firebase/config';
import { useState } from 'react';

const functions = getFunctions(app, 'us-central1');

/**
 * Hook personalizado para llamar a Firebase Cloud Functions
 * 
 * @example
 * const { callFunction, loading, error } = useFunctions();
 * 
 * const handleSubmit = async () => {
 *   const result = await callFunction('crearPrestamo', {
 *     clienteId: '123',
 *     monto: 10000,
 *     // ...
 *   });
 *   
 *   if (result?.success) {
 *     console.log('Préstamo creado:', result.prestamoId);
 *   }
 * };
 */
export function useFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Llama a una Cloud Function
   * 
   * @param functionName - Nombre de la función a llamar
   * @param data - Datos a enviar a la función
   * @returns Respuesta de la función o null si hay error
   */
  const callFunction = async <T, R>(
    functionName: string,
    data: T
  ): Promise<R | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const fn = httpsCallable<T, R>(functions, functionName);
      const result = await fn(data);
      
      return result.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`Error calling ${functionName}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { callFunction, loading, error };
}

