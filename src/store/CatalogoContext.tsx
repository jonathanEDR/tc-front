import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  ICatalogoGasto,
  IFiltrosCatalogo,
  IResumenCatalogo,
  IFormularioCatalogoGasto
} from '../types/herramientas';
import { useFilterableState } from './AppStateContext';
import {
  obtenerCatalogoGastos,
  crearGastoCatalogo,
  actualizarGastoCatalogo,
  eliminarGastoCatalogo,
  obtenerResumenCatalogo
} from '../utils/herramientasApi';
import { notifications, notifyApiError } from '../utils/notifications';

// Filtros iniciales para Catálogo
const initialFilters: IFiltrosCatalogo = {
  page: 1,
  limit: 10
};

// Estado específico de Catálogo que extiende el estado base
interface CatalogoState {
  resumen: IResumenCatalogo;
  showFormulario: boolean;
  gastoEdicion: ICatalogoGasto | undefined;
}

interface CatalogoContextType {
  // Estado del filterable
  gastos: ICatalogoGasto[];
  loading: boolean;
  error: string | null;
  processing: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filters: IFiltrosCatalogo;

  // Estado específico de Catálogo
  resumen: IResumenCatalogo;
  showFormulario: boolean;
  gastoEdicion: ICatalogoGasto | undefined;

  // Acciones generales
  setCurrentPage: (page: number) => void;
  setFilters: (filters: Partial<IFiltrosCatalogo>) => void;
  resetFilters: () => void;

  // Acciones específicas de Catálogo
  setShowFormulario: (show: boolean) => void;
  setGastoEdicion: (gasto: ICatalogoGasto | undefined) => void;
  loadCatalogo: () => Promise<void>;
  createGasto: (data: IFormularioCatalogoGasto) => Promise<boolean>;
  updateGasto: (id: string, data: Partial<IFormularioCatalogoGasto>) => Promise<boolean>;
  deleteGasto: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const CatalogoContext = createContext<CatalogoContextType | undefined>(undefined);

interface CatalogoProviderProps {
  children: ReactNode;
}

export const CatalogoProvider: React.FC<CatalogoProviderProps> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Estado filterable genérico
  const [filterableState, filterableActions] = useFilterableState<ICatalogoGasto, IFiltrosCatalogo>(initialFilters);

  // Estado específico de Catálogo
  const [catalogoState, setCatalogoState] = React.useState<CatalogoState>({
    resumen: {
      totalGastos: 0,
      gastosPorCategoria: [],
      gastosPorTipo: []
    },
    showFormulario: false,
    gastoEdicion: undefined
  });

  // Cargar catálogo
  const loadCatalogo = async (): Promise<void> => {
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

      const response = await obtenerCatalogoGastos(filterableState.filters);

      if (response.success) {
        filterableActions.setData(response.data.gastos);
        filterableActions.setPagination({
          currentPage: filterableState.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.total
        });

        console.log('Catálogo cargado exitosamente:', response.data.gastos.length);
      } else {
        filterableActions.setError('Error al cargar catálogo');
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      filterableActions.setError(`Error al cargar catálogo: ${errorMessage}`);
      notifyApiError(error);
    }
  };

  // Cargar resumen por separado
  const loadResumen = async (): Promise<void> => {
    try {
      const response = await obtenerResumenCatalogo();
      if (response.success) {
        setCatalogoState(prev => ({
          ...prev,
          resumen: response.data
        }));
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error);
    }
  };

  // Crear gasto
  const createGasto = async (data: IFormularioCatalogoGasto): Promise<boolean> => {
    try {
      filterableActions.setProcessing(true);

      const response = await crearGastoCatalogo(data);

      if (response.success) {
        // Recargar toda la lista para evitar inconsistencias
        await Promise.all([loadCatalogo(), loadResumen()]);
        notifications.success('Gasto agregado al catálogo exitosamente');
        return true;
      } else {
        notifications.error(response.message || 'Error al crear gasto');
        return false;
      }
    } catch (error) {
      console.error('Error al crear gasto:', error);
      notifyApiError(error);
      return false;
    } finally {
      filterableActions.setProcessing(false);
    }
  };

  // Actualizar gasto
  const updateGasto = async (id: string, data: Partial<IFormularioCatalogoGasto>): Promise<boolean> => {
    try {
      filterableActions.setProcessing(true);

      const response = await actualizarGastoCatalogo(id, data);

      if (response.success) {
        filterableActions.updateItem(id, response.data);
        await loadResumen(); // Actualizar resumen
        notifications.success('Gasto actualizado exitosamente');
        return true;
      } else {
        notifications.error(response.message || 'Error al actualizar gasto');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      notifyApiError(error);
      return false;
    } finally {
      filterableActions.setProcessing(false);
    }
  };

  // Eliminar gasto
  const deleteGasto = async (id: string): Promise<boolean> => {
    try {
      filterableActions.setProcessing(true);

      const response = await eliminarGastoCatalogo(id);

      if (response.success) {
        filterableActions.removeItem(id);
        await loadResumen(); // Actualizar resumen
        notifications.success('Gasto eliminado del catálogo exitosamente');
        return true;
      } else {
        notifications.error(response.message || 'Error al eliminar gasto');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      notifyApiError(error);
      return false;
    } finally {
      filterableActions.setProcessing(false);
    }
  };

  // Refrescar datos
  const refreshData = async (): Promise<void> => {
    await Promise.all([loadCatalogo(), loadResumen()]);
  };

  // Cargar datos automáticamente cuando cambian los filtros
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadCatalogo();
    }
  }, [isLoaded, isSignedIn, filterableState.filters, filterableState.currentPage]);

  // Cargar resumen al inicio
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadResumen();
    }
  }, [isLoaded, isSignedIn]);

  // Acciones específicas de Catálogo
  const setShowFormulario = (show: boolean) => {
    setCatalogoState(prev => ({ ...prev, showFormulario: show }));
  };

  const setGastoEdicion = (gasto: ICatalogoGasto | undefined) => {
    setCatalogoState(prev => ({ ...prev, gastoEdicion: gasto }));
  };

  // Wrapper para setFilters que también actualiza la página
  const setFilters = (filters: Partial<IFiltrosCatalogo>) => {
    filterableActions.setFilters(filters);
  };

  const contextValue: CatalogoContextType = {
    // Estado del filterable
    gastos: filterableState.data,
    loading: filterableState.loading,
    error: filterableState.error,
    processing: filterableState.processing,
    currentPage: filterableState.currentPage,
    totalPages: filterableState.totalPages,
    totalItems: filterableState.totalItems,
    filters: filterableState.filters,

    // Estado específico de Catálogo
    resumen: catalogoState.resumen,
    showFormulario: catalogoState.showFormulario,
    gastoEdicion: catalogoState.gastoEdicion,

    // Acciones generales
    setCurrentPage: filterableActions.setCurrentPage,
    setFilters,
    resetFilters: filterableActions.resetFilters,

    // Acciones específicas de Catálogo
    setShowFormulario,
    setGastoEdicion,
    loadCatalogo,
    createGasto,
    updateGasto,
    deleteGasto,
    refreshData
  };

  return (
    <CatalogoContext.Provider value={contextValue}>
      {children}
    </CatalogoContext.Provider>
  );
};

export const useCatalogo = (): CatalogoContextType => {
  const context = useContext(CatalogoContext);

  if (!context) {
    throw new Error('useCatalogo must be used within a CatalogoProvider');
  }

  return context;
};

export default CatalogoContext;