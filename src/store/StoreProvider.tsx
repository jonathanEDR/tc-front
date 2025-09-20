import React, { ReactNode } from 'react';
import { AppStateProvider } from './AppStateContext';
import { CajaProvider } from './CajaContext';
import { CatalogoProvider } from './CatalogoContext';
import { GraphModalProvider } from '../components/dashboard/GraphModalContext';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Proveedor principal que combina todos los contextos de la aplicación
 * Proporciona acceso centralizado al estado global y específico de cada módulo
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <AppStateProvider>
      <GraphModalProvider>
        <CajaProvider>
          <CatalogoProvider>
            {children}
          </CatalogoProvider>
        </CajaProvider>
      </GraphModalProvider>
    </AppStateProvider>
  );
};

// Exportar todos los hooks para facilitar el uso
export { useAppState } from './AppStateContext';
export { useCaja } from './CajaContext';
export { useCatalogo } from './CatalogoContext';
export { useGraphModal } from '../components/dashboard/GraphModalContext';
export { useFilterableState } from './AppStateContext';

export default StoreProvider;