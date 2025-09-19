import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos de gráficos disponibles
export type TipoGrafico = 'caja-lineal' | 'distribucion-gastos' | 'ingresos-gastos';

interface GraphModalContextType {
  modalAbierto: TipoGrafico | null;
  abrirModal: (tipo: TipoGrafico) => void;
  cerrarModal: () => void;
  estaAbierto: (tipo: TipoGrafico) => boolean;
}

const GraphModalContext = createContext<GraphModalContextType | undefined>(undefined);

interface GraphModalProviderProps {
  children: ReactNode;
}

export const GraphModalProvider: React.FC<GraphModalProviderProps> = ({ children }) => {
  const [modalAbierto, setModalAbierto] = useState<TipoGrafico | null>(null);

  const abrirModal = (tipo: TipoGrafico) => {
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
  };

  const estaAbierto = (tipo: TipoGrafico) => {
    return modalAbierto === tipo;
  };

  const contextValue: GraphModalContextType = {
    modalAbierto,
    abrirModal,
    cerrarModal,
    estaAbierto
  };

  return (
    <GraphModalContext.Provider value={contextValue}>
      {children}
    </GraphModalContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useGraphModal = (): GraphModalContextType => {
  const context = useContext(GraphModalContext);
  if (!context) {
    throw new Error('useGraphModal debe ser usado dentro de un GraphModalProvider');
  }
  return context;
};

export default GraphModalContext;