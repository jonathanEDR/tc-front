/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axios from 'axios';
import { IUsuariosResponse, IEstadisticasUsuariosResponse } from '../types/usuarios';

// Configurar base URL para las API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Función helper para obtener token de Clerk
const getAuthHeaders = async () => {
  try {
    // Intentar obtener el token de diferentes maneras
    let token = null;
    
    // Método 1: Usando window.Clerk
    if (typeof window !== 'undefined' && window.Clerk?.session) {
      token = await window.Clerk.session.getToken();
    }
    
    if (!token) {
      console.warn('[usuariosApi] No se pudo obtener token de autenticación');
      throw new Error('No se pudo obtener token de autenticación');
    }

    console.log('[usuariosApi] Token obtenido exitosamente');
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error('Error al obtener token de autenticación:', error);
    throw error;
  }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<IUsuariosResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('[usuariosApi] Obteniendo usuarios desde:', `${BASE_URL}/users`);
    const response = await axios.get(`${BASE_URL}/users`, { headers });
    console.log('[usuariosApi] Usuarios obtenidos exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[usuariosApi] Error al obtener usuarios:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

// Obtener estadísticas de usuarios
export const obtenerEstadisticasUsuarios = async (): Promise<IEstadisticasUsuariosResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('[usuariosApi] Obteniendo estadísticas desde:', `${BASE_URL}/users/stats`);
    const response = await axios.get(`${BASE_URL}/users/stats`, { headers });
    console.log('[usuariosApi] Estadísticas obtenidas exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[usuariosApi] Error al obtener estadísticas:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};