/// <reference types="vite/client" />
/// <reference path="../types/clerk.d.ts" />
import axios, { AxiosInstance } from 'axios';
import { IUsuariosResponse, IEstadisticasUsuariosResponse } from '../types/usuarios';

// Configurar base URL para las API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

// Crear instancia de axios configurada
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 segundos de timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para agregar token de autenticación
  client.interceptors.request.use(
    async (config) => {
      try {
        if (typeof window !== 'undefined' && window.Clerk?.session) {
          const token = await window.Clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[usuariosApi] Token agregado a la petición');
          }
        }
      } catch (error) {
        console.warn('[usuariosApi] No se pudo obtener token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para manejo de errores
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('[usuariosApi] Error de autenticación');
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// Obtener todos los usuarios
export const obtenerUsuarios = async (): Promise<IUsuariosResponse> => {
  try {
    console.log('[usuariosApi] Obteniendo usuarios desde:', '/users');
    const response = await apiClient.get('/users');
    console.log('[usuariosApi] Usuarios obtenidos exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[usuariosApi] Error al obtener usuarios:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // Error de red o servidor no disponible
        console.error('Network error - no response received:', error.message);
        console.error('Request details:', error.request);
      } else {
        // Error en la configuración de la request
        console.error('Request configuration error:', error.message);
      }
    }
    throw error;
  }
};

// Obtener estadísticas de usuarios
export const obtenerEstadisticasUsuarios = async (): Promise<IEstadisticasUsuariosResponse> => {
  try {
    console.log('[usuariosApi] Obteniendo estadísticas desde:', '/users/stats');
    const response = await apiClient.get('/users/stats');
    console.log('[usuariosApi] Estadísticas obtenidas exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[usuariosApi] Error al obtener estadísticas:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        // Error de red o servidor no disponible
        console.error('Network error - no response received:', error.message);
        console.error('Request details:', error.request);
      } else {
        // Error en la configuración de la request
        console.error('Request configuration error:', error.message);
      }
    }
    throw error;
  }
};