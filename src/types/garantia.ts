// src/types/garantia.ts

// 🔄 Estados de la Garantía
export type EstadoGarantia = 'DISPONIBLE' | 'EN_USO' | 'LIBERADA' | 'RETENIDA' | 'DEVUELTA' | 'EJECUTADA';

// 🏷️ Tipos de Garantía
export type TipoGarantia = 
  | 'VEHICULO'           // 🚗 Carros, motos
  | 'ELECTRODOMESTICO'   // 🏠 Refrigeradores, lavadoras
  | 'ELECTRONICO'        // 💻 Laptops, celulares, tablets
  | 'JOYA'              // 💍 Anillos, collares
  | 'MUEBLE'            // 🪑 Mesas, sillas, armarios
  | 'OTRO';             // 📦 Cualquier otro artículo

export interface Garantia {
  // Identificación
  id: string;
  adminId: string;                    // ID del administrador (multi-tenant)
  
  // Información del Artículo
  tipo: TipoGarantia;                 // "VEHICULO" | "ELECTRONICO" | "JOYA" | etc.
  descripcion: string;                // "Laptop Dell Inspiron 15 Core i7, 16GB RAM"
  valorEstimado: number;              // 15000.00
  
  // Documentación
  fotosUrls: string[];                // Array de URLs de fotos
  
  // Estado
  estado: EstadoGarantia;             // "RETENIDA" | "DEVUELTA" | "EJECUTADA"
  
  // Metadata
  fechaRegistro: number;              // Timestamp
  notas: string;                      // Observaciones
  
  // Sincronización
  pendingSync?: boolean;
  lastSyncTime?: number;
  firebaseId?: string;
  
  // Campos opcionales (pueden venir de relaciones o joins)
  clienteId?: string;
  clienteNombre?: string;
  prestamoId?: string;
}



