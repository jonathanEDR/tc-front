// Utilidades para el módulo de herramientas

/**
 * Procesa un texto de etiquetas y las convierte en un array
 * @param texto - Texto con etiquetas separadas por comas
 * @returns Array de etiquetas procesadas
 */
export const procesarEtiquetas = (texto: string): string[] => {
  if (!texto.trim()) return [];
  
  return texto
    .split(',')
    .map(etiqueta => etiqueta.trim())
    .filter(etiqueta => etiqueta.length > 0)
    .map(etiqueta => etiqueta.toLowerCase());
};

/**
 * Valida un array de etiquetas
 * @param etiquetas - Array de etiquetas a validar
 * @returns Resultado de la validación
 */
export const validarEtiquetas = (etiquetas: string[]): { esValido: boolean; error?: string } => {
  if (etiquetas.length === 0) {
    return { esValido: true };
  }

  // Verificar duplicados
  const etiquetasUnicas = new Set(etiquetas);
  if (etiquetasUnicas.size !== etiquetas.length) {
    return { 
      esValido: false, 
      error: 'No se permiten etiquetas duplicadas' 
    };
  }

  // Verificar longitud máxima de cada etiqueta
  const LONGITUD_MAXIMA_ETIQUETA = 20;
  const etiquetaLarga = etiquetas.find(etiqueta => etiqueta.length > LONGITUD_MAXIMA_ETIQUETA);
  if (etiquetaLarga) {
    return { 
      esValido: false, 
      error: `La etiqueta "${etiquetaLarga}" excede ${LONGITUD_MAXIMA_ETIQUETA} caracteres` 
    };
  }

  // Verificar caracteres válidos
  const REGEX_ETIQUETA_VALIDA = /^[a-zA-Z0-9áéíóúñü\s-]+$/;
  const etiquetaInvalida = etiquetas.find(etiqueta => !REGEX_ETIQUETA_VALIDA.test(etiqueta));
  if (etiquetaInvalida) {
    return { 
      esValido: false, 
      error: `La etiqueta "${etiquetaInvalida}" contiene caracteres no válidos` 
    };
  }

  return { esValido: true };
};

/**
 * Formatea un monto para mostrar
 * @param monto - Monto a formatear
 * @returns Monto formateado
 */
export const formatearMonto = (monto?: number): string => {
  if (monto === undefined || monto === null) return '-';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto);
};

/**
 * Genera un color para una etiqueta basado en su texto
 * @param etiqueta - Texto de la etiqueta
 * @returns Clases CSS para el color
 */
export const obtenerColorEtiqueta = (etiqueta: string): string => {
  const colores = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-red-100 text-red-800',
    'bg-gray-100 text-gray-800'
  ];

  // Usar el hash del texto para determinar el color
  let hash = 0;
  for (let i = 0; i < etiqueta.length; i++) {
    const char = etiqueta.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }

  const indice = Math.abs(hash) % colores.length;
  return colores[indice];
};