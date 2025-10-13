// src/lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Usuario } from '@/types/usuario';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Cargar datos extendidos del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          if (userDoc.exists()) {
            setUsuario({ id: userDoc.id, ...userDoc.data() } as Usuario);
          }
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      } else {
        setUsuario(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar si es primer login
      const userDoc = await getDoc(doc(db, 'usuarios', result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.primerLogin) {
          return { requirePasswordChange: true, user: result.user };
        }
      }
      
      return { requirePasswordChange: false, user: result.user };
    } catch (err: any) {
      const errorMessage = 
        err.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        err.code === 'auth/wrong-password' ? 'Contraseña incorrecta' :
        err.code === 'auth/invalid-email' ? 'Email inválido' :
        'Error al iniciar sesión';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil
      await updateProfile(result.user, { displayName: nombre });
      
      // Crear documento en Firestore
      await setDoc(doc(db, 'usuarios', result.user.uid), {
        nombre,
        email,
        rol: 'ADMIN',
        activo: true,
        fechaCreacion: Date.now(),
        porcentajeComision: 0,
        totalComisionesGeneradas: 0,
        totalComisionesPagadas: 0,
        ultimoPagoComision: 0,
        primerLogin: false,
      });
      
      // Enviar email de verificación
      await sendEmailVerification(result.user);
      
      return result.user;
    } catch (err: any) {
      const errorMessage = 
        err.code === 'auth/email-already-in-use' ? 'El email ya está registrado' :
        err.code === 'auth/weak-password' ? 'La contraseña es muy débil' :
        'Error al registrar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const errorMessage = 
        err.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        'Error al enviar email de recuperación';
      throw new Error(errorMessage);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await updatePassword(user, newPassword);
      
      // Actualizar primer login
      await setDoc(
        doc(db, 'usuarios', user.uid),
        { primerLogin: false },
        { merge: true }
      );
    } catch (err) {
      throw err;
    }
  };

  // ⭐ NUEVAS FUNCIONES: Helpers para verificar roles
  const getUserRole = (): string => {
    return usuario?.rol || 'PRESTAMISTA';
  };

  const isUserCobrador = (): boolean => {
    return usuario?.rol === 'COBRADOR';
  };

  const isUserPrestamista = (): boolean => {
    const rol = usuario?.rol || 'PRESTAMISTA';
    return rol === 'PRESTAMISTA' || rol === 'ADMIN';
  };

  return {
    user,
    usuario,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    changePassword,
    // ⭐ NUEVOS: Helpers de roles
    getUserRole,
    isUserCobrador,
    isUserPrestamista,
  };
}

