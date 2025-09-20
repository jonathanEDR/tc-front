import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos genéricos para el estado
interface BaseState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  processing: boolean;
}

interface PaginatedState<T> extends BaseState<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface FilterableState<T, F> extends PaginatedState<T> {
  filters: F;
}

// Acciones genéricas
type BaseAction<T> =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_DATA'; payload: T[] }
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'UPDATE_ITEM'; payload: { id: string; item: Partial<T> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'RESET_STATE' };

type PaginatedAction<T> = BaseAction<T>
  | { type: 'SET_PAGINATION'; payload: { currentPage: number; totalPages: number; totalItems: number } }
  | { type: 'SET_CURRENT_PAGE'; payload: number };

type FilterableAction<T, F> = PaginatedAction<T>
  | { type: 'SET_FILTERS'; payload: Partial<F> }
  | { type: 'RESET_FILTERS'; payload: F };

// Reducer genérico
function createFilterableReducer<T extends { _id?: string }, F>() {
  return function reducer(state: FilterableState<T, F>, action: FilterableAction<T, F>): FilterableState<T, F> {
    switch (action.type) {
      case 'SET_LOADING':
        return { ...state, loading: action.payload };

      case 'SET_ERROR':
        return { ...state, error: action.payload, loading: false };

      case 'SET_PROCESSING':
        return { ...state, processing: action.payload };

      case 'SET_DATA':
        return { ...state, data: action.payload, loading: false, error: null };

      case 'ADD_ITEM':
        return {
          ...state,
          data: [action.payload, ...state.data],
          totalItems: state.totalItems + 1
        };

      case 'UPDATE_ITEM':
        return {
          ...state,
          data: state.data.map(item =>
            item._id === action.payload.id
              ? { ...item, ...action.payload.item }
              : item
          )
        };

      case 'REMOVE_ITEM':
        return {
          ...state,
          data: state.data.filter(item => item._id !== action.payload),
          totalItems: state.totalItems - 1
        };

      case 'SET_PAGINATION':
        return {
          ...state,
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems
        };

      case 'SET_CURRENT_PAGE':
        return { ...state, currentPage: action.payload };

      case 'SET_FILTERS':
        return {
          ...state,
          filters: { ...state.filters, ...action.payload },
          currentPage: 1 // Reset a primera página cuando cambian filtros
        };

      case 'RESET_FILTERS':
        return {
          ...state,
          filters: action.payload,
          currentPage: 1
        };

      case 'RESET_STATE':
        return {
          ...state,
          data: [],
          loading: false,
          error: null,
          processing: false,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        };

      default:
        return state;
    }
  };
}

// Hook genérico para crear manejadores de estado
export function useFilterableState<T extends { _id?: string }, F>(
  initialFilters: F
): [
  FilterableState<T, F>,
  {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setProcessing: (processing: boolean) => void;
    setData: (data: T[]) => void;
    addItem: (item: T) => void;
    updateItem: (id: string, item: Partial<T>) => void;
    removeItem: (id: string) => void;
    setPagination: (pagination: { currentPage: number; totalPages: number; totalItems: number }) => void;
    setCurrentPage: (page: number) => void;
    setFilters: (filters: Partial<F>) => void;
    resetFilters: () => void;
    resetState: () => void;
  }
] {
  const initialState: FilterableState<T, F> = {
    data: [],
    loading: true,
    error: null,
    processing: false,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    filters: initialFilters
  };

  const reducer = createFilterableReducer<T, F>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    setProcessing: (processing: boolean) => dispatch({ type: 'SET_PROCESSING', payload: processing }),
    setData: (data: T[]) => dispatch({ type: 'SET_DATA', payload: data }),
    addItem: (item: T) => dispatch({ type: 'ADD_ITEM', payload: item }),
    updateItem: (id: string, item: Partial<T>) => dispatch({ type: 'UPDATE_ITEM', payload: { id, item } }),
    removeItem: (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
    setPagination: (pagination: { currentPage: number; totalPages: number; totalItems: number }) =>
      dispatch({ type: 'SET_PAGINATION', payload: pagination }),
    setCurrentPage: (page: number) => dispatch({ type: 'SET_CURRENT_PAGE', payload: page }),
    setFilters: (filters: Partial<F>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS', payload: initialFilters }),
    resetState: () => dispatch({ type: 'RESET_STATE' })
  };

  return [state, actions];
}

// Contexto específico para la aplicación
interface AppState {
  globalLoading: boolean;
  globalError: string | null;
  theme: 'light' | 'dark';
}

interface AppStateContextType {
  appState: AppState;
  setGlobalLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearGlobalError: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [appState, setAppState] = React.useState<AppState>({
    globalLoading: false,
    globalError: null,
    theme: 'light'
  });

  const contextValue: AppStateContextType = {
    appState,
    setGlobalLoading: (loading: boolean) =>
      setAppState(prev => ({ ...prev, globalLoading: loading })),
    setGlobalError: (error: string | null) =>
      setAppState(prev => ({ ...prev, globalError: error })),
    setTheme: (theme: 'light' | 'dark') =>
      setAppState(prev => ({ ...prev, theme })),
    clearGlobalError: () =>
      setAppState(prev => ({ ...prev, globalError: null }))
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  return context;
};

export default AppStateContext;