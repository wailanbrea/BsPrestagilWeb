// src/lib/firebase/storage.ts
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function uploadClientePhoto(
  clienteId: string,
  file: File
): Promise<string> {
  const path = `fotos_clientes/${clienteId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
}

export async function uploadGarantiaPhoto(
  garantiaId: string,
  file: File
): Promise<string> {
  const path = `fotos_garantias/${garantiaId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
}




