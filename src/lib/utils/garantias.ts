// src/lib/utils/garantias.ts

export interface GarantiaInfo {
  id: string;
  descripcion: string;
}

/**
 * Parsea las garantías múltiples desde el campo notas de un préstamo
 * Las garantías se almacenan en formato:
 * Garantías:
 * Garantía 1: Descripción (ID: id123)
 * Garantía 2: Descripción (ID: id456)
 */
export function parseGarantiasFromNotas(notas?: string): GarantiaInfo[] {
  if (!notas) return [];
  
  // Buscar la sección de garantías
  const garantiasMatch = notas.match(/Garantías:([\s\S]*?)(?:\n\n|$)/);
  if (!garantiasMatch) return [];
  
  const garantiasTexto = garantiasMatch[1];
  const lineas = garantiasTexto.split('\n').filter(l => l.trim());
  
  return lineas
    .map(linea => {
      const match = linea.match(/Garantía \d+: (.+?) \(ID: (.+?)\)/);
      if (!match) return null;
      
      return {
        descripcion: match[1],
        id: match[2]
      };
    })
    .filter(Boolean) as GarantiaInfo[];
}

/**
 * Formatea múltiples garantías para guardarlas en el campo notas
 */
export function formatGarantiasToNotas(
  garantias: GarantiaInfo[],
  notasOriginales?: string
): string {
  // Si no hay garantías adicionales, retornar las notas originales
  if (garantias.length <= 1) {
    return notasOriginales || '';
  }

  // Formatear garantías
  const garantiasTexto = garantias
    .map((g, index) => `Garantía ${index + 1}: ${g.descripcion} (ID: ${g.id})`)
    .join('\n');
  
  // Combinar con notas existentes
  if (notasOriginales && notasOriginales.trim()) {
    return `${notasOriginales}\n\nGarantías:\n${garantiasTexto}`;
  } else {
    return `Garantías:\n${garantiasTexto}`;
  }
}

/**
 * Obtiene todas las garantías de un préstamo (primera + adicionales)
 */
export function getAllGarantias(
  garantiaId?: string,
  garantiaDescripcion?: string,
  notas?: string
): GarantiaInfo[] {
  const garantias: GarantiaInfo[] = [];
  
  // Agregar primera garantía si existe
  if (garantiaId) {
    garantias.push({
      id: garantiaId,
      descripcion: garantiaDescripcion || 'Garantía principal'
    });
  }
  
  // Agregar garantías adicionales desde notas
  const garantiasAdicionales = parseGarantiasFromNotas(notas);
  if (garantiasAdicionales.length > 0) {
    // Omitir la primera si ya está en garantiaId
    const garantiasParaAgregar = garantiaId 
      ? garantiasAdicionales.slice(1) 
      : garantiasAdicionales;
    
    garantias.push(...garantiasParaAgregar);
  }
  
  return garantias;
}

/**
 * Extrae las notas sin la sección de garantías
 */
export function getNotasSinGarantias(notas?: string): string {
  if (!notas) return '';
  
  // Eliminar la sección de garantías
  return notas.replace(/\n?\n?Garantías:[\s\S]*?(?=\n\n|$)/, '').trim();
}

