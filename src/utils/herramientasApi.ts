/// <reference types="vite/client" />
import axios from 'axios';
import { 
  ICatalogoGasto, 
  IFormularioCatalogoGasto, 
  IFiltrosCatalogo, 
  IResponseCatalogo, 
  IResponseGasto,
  IResumenCatalogo,
  CategoriaGasto
} from '../types/herramientas';

// Configurar base URL para las API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

const isDev = import.meta.env.DEV;

// Función helper para obtener token de Clerk
const getAuthHeaders = async () => {
  try {
    // Intentar obtener el token de diferentes maneras
    let token = null;

    // Método 1: Desde window.Clerk (cuando está disponible)
    if ((window as any).Clerk?.session) {
      token = await (window as any).Clerk.session.getToken();
    }

    // Método 2: Desde el store de Clerk si está disponible
    if (!token && (window as any).__clerk_token) {
      token = (window as any).__clerk_token;
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    if (isDev) {
      console.error('[HERRAMIENTAS] Error obteniendo token de Clerk:', error);
    }
    return {};
  }
};

// === FUNCIONES CRUD PARA CATÁLOGO ===

// Crear nuevo gasto en el catálogo
export const crearGastoCatalogo = async (datos: IFormularioCatalogoGasto): Promise<IResponseGasto> => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${BASE_URL}/herramientas/catalogo`, datos, { headers });
  return response.data;
};

// Obtener lista de gastos del catálogo con filtros
export const obtenerCatalogoGastos = async (filtros: IFiltrosCatalogo = {}): Promise<IResponseCatalogo> => {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/catalogo?${params.toString()}`, { headers });
  return response.data;
};

// Obtener detalle de un gasto específico
export const obtenerGastoCatalogo = async (id: string): Promise<IResponseGasto> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/catalogo/${id}`, { headers });
  return response.data;
};

// Actualizar gasto del catálogo
export const actualizarGastoCatalogo = async (
  id: string, 
  datos: Partial<IFormularioCatalogoGasto>
): Promise<IResponseGasto> => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${BASE_URL}/herramientas/catalogo/${id}`, datos, { headers });
  return response.data;
};

// Eliminar gasto del catálogo (soft delete - archiva el gasto)
export const eliminarGastoCatalogo = async (id: string): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${BASE_URL}/herramientas/catalogo/${id}`, { headers });
  return response.data;
};

// === FUNCIONES ESPECIALIZADAS ===

// Obtener solo gastos activos (para selects y listas)
export const obtenerGastosActivos = async (): Promise<{ success: boolean; data: ICatalogoGasto[] }> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/catalogo/activos`, { headers });
  return response.data;
};

// Obtener gastos por categoría específica
export const obtenerGastosPorCategoria = async (categoria: CategoriaGasto): Promise<{ success: boolean; data: ICatalogoGasto[] }> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/catalogo/categoria/${categoria}`, { headers });
  return response.data;
};

// Buscar gastos por texto
export const buscarGastosPorTexto = async (texto: string): Promise<{ success: boolean; data: ICatalogoGasto[] }> => {
  if (!texto || texto.trim().length < 2) {
    throw new Error('El texto de búsqueda debe tener al menos 2 caracteres');
  }
  
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/catalogo/buscar/${encodeURIComponent(texto.trim())}`, { headers });
  return response.data;
};

// Obtener resumen estadístico del catálogo
export const obtenerResumenCatalogo = async (): Promise<{ success: boolean; data: IResumenCatalogo }> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/herramientas/resumen/estadisticas`, { headers });
  return response.data;
};

// === UTILIDADES DE FORMATEO ===

// Formatear monto en soles peruanos
export const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(monto);
};

// Formatear fecha para Perú
export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Formatear fecha y hora para Perú
export const formatearFechaHora = (fecha: string): string => {
  return new Date(fecha).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validar si un texto es válido para búsqueda
export const esTextoValidoParaBusqueda = (texto: string): boolean => {
  return !!texto && texto.trim().length >= 2;
};

// Limpiar filtros vacíos
export const limpiarFiltros = (filtros: IFiltrosCatalogo): IFiltrosCatalogo => {
  const filtrosLimpios: any = {};
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filtrosLimpios[key] = value;
    }
  });
  
  return filtrosLimpios;
};

// Construir query string para filtros
export const construirQueryFiltros = (filtros: IFiltrosCatalogo): string => {
  const filtrosLimpios = limpiarFiltros(filtros);
  const params = new URLSearchParams();
  
  Object.entries(filtrosLimpios).forEach(([key, value]) => {
    params.append(key, value.toString());
  });
  
  return params.toString();
};

// === UTILIDADES PARA ETIQUETAS ===

// Procesar etiquetas de string a array
export const procesarEtiquetas = (etiquetasString: string): string[] => {
  if (!etiquetasString || etiquetasString.trim() === '') return [];
  
  return etiquetasString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Máximo 10 etiquetas
};

// Convertir array de etiquetas a string
export const etiquetasAString = (etiquetas: string[]): string => {
  return etiquetas ? etiquetas.join(', ') : '';
};

// Validar etiquetas
export const validarEtiquetas = (etiquetas: string[]): { validas: boolean; error?: string } => {
  if (!etiquetas || etiquetas.length === 0) {
    return { validas: true };
  }
  
  if (etiquetas.length > 10) {
    return { validas: false, error: 'No se pueden agregar más de 10 etiquetas' };
  }
  
  const etiquetaInvalida = etiquetas.find(tag => tag.length > 50);
  if (etiquetaInvalida) {
    return { validas: false, error: `La etiqueta "${etiquetaInvalida}" excede 50 caracteres` };
  }
  
  return { validas: true };
};