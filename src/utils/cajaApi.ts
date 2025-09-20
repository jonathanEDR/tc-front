/// <reference types="vite/client" />
import axios from 'axios';
import { 
  IMovimientoCaja, 
  IFormularioMovimiento, 
  IFiltrosCaja, 
  IResponseCaja, 
  IResponseMovimiento,
  IResumenReporte 
} from '../types/caja';

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

    if (isDev) {
      console.log('Token status:', token ? 'PRESENT' : 'MISSING');
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (error) {
    if (isDev) {
      console.error('Error obteniendo token de Clerk:', error);
    }
    return {};
  }
};

// Crear nuevo movimiento
export const crearMovimiento = async (datos: IFormularioMovimiento): Promise<IResponseMovimiento> => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${BASE_URL}/caja`, datos, { headers });
  return response.data;
};

// Obtener lista de movimientos con filtros
export const obtenerMovimientos = async (filtros: IFiltrosCaja = {}): Promise<IResponseCaja> => {
  const params = new URLSearchParams();
  
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/caja?${params.toString()}`, { headers });
  return response.data;
};

// Obtener detalle de un movimiento
export const obtenerMovimiento = async (id: string): Promise<IResponseMovimiento> => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/caja/${id}`, { headers });
  return response.data;
};

// Actualizar movimiento
export const actualizarMovimiento = async (
  id: string, 
  datos: Partial<IFormularioMovimiento>
): Promise<IResponseMovimiento> => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${BASE_URL}/caja/${id}`, datos, { headers });
  return response.data;
};

// Eliminar movimiento
export const eliminarMovimiento = async (id: string): Promise<{ success: boolean; message: string }> => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${BASE_URL}/caja/${id}`, { headers });
  return response.data;
};

// Obtener resumen de reportes
export const obtenerResumenReportes = async (
  fechaInicio?: string, 
  fechaFin?: string
): Promise<{ success: boolean; data: IResumenReporte }> => {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);

  const headers = await getAuthHeaders();
  const response = await axios.get(`${BASE_URL}/caja/reportes/resumen?${params.toString()}`, { headers });
  return response.data;
};

// Utilidades para formateo
export const formatearMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
};

export const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatearFechaHora = (fecha: string): string => {
  return new Date(fecha).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};