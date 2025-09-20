import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  IMovimientoCaja,
  IFiltrosCaja,
  IResumenCaja,
  CrearMovimientoData
} from '../types/caja';
import { useFilterableState } from './AppStateContext';
import { useApiWithAuth } from '../utils/useApiWithAuth';
import { notifications, notifyApiError } from '../utils/notifications';

// Filtros iniciales para Caja
const initialFilters: IFiltrosCaja = {
  page: 1,
  limit: 10
};

// Estado específico de Caja que extiende el estado base
interface CajaState {
  resumen: IResumenCaja;
  showIngresoForm: boolean;
  showSalidaForm: boolean;
}

interface CajaContextType {
  // Estado del filterable
  movimientos: IMovimientoCaja[];
  loading: boolean;
  error: string | null;
  processing: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filters: IFiltrosCaja;

  // Estado específico de Caja
  resumen: IResumenCaja;
  showIngresoForm: boolean;
  showSalidaForm: boolean;

  // Acciones generales
  setCurrentPage: (page: number) => void;
  setFilters: (filters: Partial<IFiltrosCaja>) => void;
  resetFilters: () => void;

  // Acciones específicas de Caja
  setShowIngresoForm: (show: boolean) => void;
  setShowSalidaForm: (show: boolean) => void;
  loadMovimientos: () => Promise<void>;
  createMovimiento: (data: CrearMovimientoData) => Promise<boolean>;
  deleteMovimiento: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

interface CajaProviderProps {
  children: ReactNode;
}

export const CajaProvider: React.FC<CajaProviderProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiWithAuth();

  // Estado filterable genérico
  const [filterableState, filterableActions] = useFilterableState<IMovimientoCaja, IFiltrosCaja>(initialFilters);

  // Estado específico de Caja
  const [cajaState, setCajaState] = React.useState<CajaState>({
    resumen: {
      totalEntradas: 0,
      totalSalidas: 0,
      balance: 0
    },
    showIngresoForm: false,
    showSalidaForm: false
  });

  // Cargar movimientos
  const loadMovimientos = async (): Promise<void> => {
    try {
      // Verificar que Clerk esté cargado y el usuario autenticado
      if (!isLoaded) {
        console.log('Clerk aún está cargando...');
        return;
      }

      if (!isSignedIn) {
        filterableActions.setError('Usuario no autenticado');
        return;
      }

      filterableActions.setLoading(true);
      filterableActions.setError(null);

      // Construir query params
      const params = new URLSearchParams();
      Object.entries(filterableState.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/caja?${params.toString()}`);

      if (response.success) {
        filterableActions.setData(response.data.movimientos);
        filterableActions.setPagination({
          currentPage: filterableState.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.total
        });

        // Actualizar resumen específico de Caja
        setCajaState(prev => ({
          ...prev,
          resumen: response.resumen
        }));

        console.log('Movimientos cargados exitosamente:', response.data.movimientos.length);
      } else {
        filterableActions.setError('Error al cargar movimientos');
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      filterableActions.setError(`Error al cargar movimientos: ${errorMessage}`);
      notifyApiError(error);
    }
  };

  // Crear movimiento
  const createMovimiento = async (data: CrearMovimientoData): Promise<boolean> => {
    try {
      filterableActions.setProcessing(true);

      const response = await api.post('/caja', data);

      if (response.success) {
        filterableActions.addItem(response.data);

        // Actualizar resumen
        setCajaState(prev => ({
          ...prev,
          resumen: response.resumen || prev.resumen
        }));

        notifications.success(`${data.tipoMovimiento === 'ENTRADA' ? 'Ingreso' : 'Salida'} registrado exitosamente`);
        return true;
      } else {
        notifications.error(response.message || 'Error al crear movimiento');
        return false;
      }
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      notifyApiError(error);
      return false;
    } finally {
      filterableActions.setProcessing(false);
    }
  };

  // Eliminar movimiento
  const deleteMovimiento = async (id: string): Promise<boolean> => {
    try {
      filterableActions.setProcessing(true);

      const response = await api.delete(`/caja/${id}`);

      if (response.success) {
        filterableActions.removeItem(id);

        // Actualizar resumen
        setCajaState(prev => ({
          ...prev,
          resumen: response.resumen || prev.resumen
        }));

        notifications.success('Movimiento eliminado exitosamente');
        return true;
      } else {
        notifications.error(response.message || 'Error al eliminar movimiento');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
      notifyApiError(error);
      return false;
    } finally {
      filterableActions.setProcessing(false);
    }
  };

  // Refrescar datos
  const refreshData = async (): Promise<void> => {
    await loadMovimientos();
  };

  // Cargar datos automáticamente cuando cambian los filtros
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadMovimientos();
    }
  }, [isLoaded, isSignedIn, filterableState.filters, filterableState.currentPage]);

  // Acciones específicas de Caja
  const setShowIngresoForm = (show: boolean) => {
    setCajaState(prev => ({ ...prev, showIngresoForm: show }));
  };

  const setShowSalidaForm = (show: boolean) => {
    setCajaState(prev => ({ ...prev, showSalidaForm: show }));
  };

  // Wrapper para setFilters que también actualiza la página
  const setFilters = (filters: Partial<IFiltrosCaja>) => {
    filterableActions.setFilters(filters);
  };

  const contextValue: CajaContextType = {
    // Estado del filterable
    movimientos: filterableState.data,
    loading: filterableState.loading,
    error: filterableState.error,
    processing: filterableState.processing,
    currentPage: filterableState.currentPage,
    totalPages: filterableState.totalPages,
    totalItems: filterableState.totalItems,
    filters: filterableState.filters,

    // Estado específico de Caja
    resumen: cajaState.resumen,
    showIngresoForm: cajaState.showIngresoForm,
    showSalidaForm: cajaState.showSalidaForm,

    // Acciones generales
    setCurrentPage: filterableActions.setCurrentPage,
    setFilters,
    resetFilters: filterableActions.resetFilters,

    // Acciones específicas de Caja
    setShowIngresoForm,
    setShowSalidaForm,
    loadMovimientos,
    createMovimiento,
    deleteMovimiento,
    refreshData
  };

  return (
    <CajaContext.Provider value={contextValue}>
      {children}
    </CajaContext.Provider>
  );
};

export const useCaja = (): CajaContextType => {
  const context = useContext(CajaContext);

  if (!context) {
    throw new Error('useCaja must be used within a CajaProvider');
  }

  return context;
};

export default CajaContext;