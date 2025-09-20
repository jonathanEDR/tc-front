import React from 'react';
import toast from 'react-hot-toast';

// Configuración de estilos para las notificaciones
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    padding: '12px 16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
};

export const notifications = {
  // Notificaciones de éxito
  success: (message: string) => {
    toast.success(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: '#10B981',
        color: '#fff'
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981'
      }
    });
  },

  // Notificaciones de error
  error: (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      ...toastConfig,
      duration: options?.duration || 5000, // Errores duran más tiempo
      style: {
        ...toastConfig.style,
        background: '#EF4444',
        color: '#fff'
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444'
      }
    });
  },

  // Notificaciones de advertencia
  warning: (message: string) => {
    toast(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        ...toastConfig.style,
        background: '#F59E0B',
        color: '#fff'
      }
    });
  },

  // Notificaciones informativas
  info: (message: string) => {
    toast(message, {
      ...toastConfig,
      icon: 'ℹ️',
      style: {
        ...toastConfig.style,
        background: '#3B82F6',
        color: '#fff'
      }
    });
  },

  // Notificación de carga con promise
  loading: (
    promise: Promise<any>,
    messages: {
      loading: string;
      success: string | ((data: any) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        background: '#6B7280',
      }
    });
  },

  // Notificación personalizada con acción
  custom: (
    message: string,
    action?: {
      label: string;
      onClick: () => void;
    }
  ) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {message}
              </p>
            </div>
          </div>
        </div>
        {action && (
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t.id);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {action.label}
            </button>
          </div>
        )}
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            ✕
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  },

  // Función para cerrar todas las notificaciones
  dismissAll: () => {
    toast.dismiss();
  }
};

// Funciones de utilidad para casos específicos
export const notifyApiError = (error: any) => {
  let message = 'Error inesperado';

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  notifications.error(message);
};

export const notifyFormValidationError = (errors: Record<string, string>) => {
  const firstError = Object.values(errors)[0];
  if (firstError) {
    notifications.warning(`Error de validación: ${firstError}`);
  }
};

export const notifyNetworkError = () => {
  notifications.error('Error de conexión. Verifica tu internet e intenta nuevamente.', {
    duration: 6000
  });
};

export const notifyUnauthorized = () => {
  notifications.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
};

// Función para notificaciones de operaciones CRUD
export const notifyCrudOperation = {
  create: (entity: string) => notifications.success(`${entity} creado exitosamente`),
  update: (entity: string) => notifications.success(`${entity} actualizado exitosamente`),
  delete: (entity: string) => notifications.success(`${entity} eliminado exitosamente`),
  createError: (entity: string) => notifications.error(`Error al crear ${entity}`),
  updateError: (entity: string) => notifications.error(`Error al actualizar ${entity}`),
  deleteError: (entity: string) => notifications.error(`Error al eliminar ${entity}`)
};

export default notifications;