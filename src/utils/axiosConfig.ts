import axios from 'axios';

// Configurar axios con interceptores para incluir token de Clerk
export const setupAxiosInterceptors = () => {
  // Interceptor para requests
  axios.interceptors.request.use(
    async (config) => {
      // Agregar token para todas las rutas API protegidas
      if (config.url?.includes('/api/')) {
        try {
          // Obtener token de Clerk desde el navegador
          const token = await window.Clerk?.session?.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('[axios] No se pudo obtener token de Clerk para:', config.url);
          }
        } catch (error) {
          console.warn('No se pudo obtener token de Clerk:', error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Error de autenticación:', error.response.data);
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
