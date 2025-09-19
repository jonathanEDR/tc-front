import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  IMovimientoCaja, 
  TipoMovimiento,
  LABELS_CATEGORIA,
  LABELS_TIPO_COSTO,
  LABELS_CATEGORIA_INGRESO 
} from '../../types/caja';
import { formatearMonto } from '../../utils/cajaApi';

interface Props {
  movimientos: IMovimientoCaja[];
  loading: boolean;
  error: string | null;
  onEliminar: (id: string) => Promise<void>;
  processingAction?: boolean;
}

const TablaMovimientosMobile: React.FC<Props> = ({ 
  movimientos, 
  loading, 
  error, 
  onEliminar, 
  processingAction = false 
}) => {
  const { user } = useUser();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  
  const handleEliminar = async (id: string) => {
    if (eliminandoId || processingAction) return;
    
    if (!window.confirm('¿Estás seguro de eliminar este movimiento?')) {
      return;
    }
    
    setEliminandoId(id);
    try {
      await onEliminar(id);
    } finally {
      setEliminandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m6-6a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0h6m-6 0v4m0-4H9m6 0v4m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2V9a2 2 0 012-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin movimientos</h3>
          <p className="text-gray-500">Comienza creando un nuevo ingreso o salida.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
      
      <div className="space-y-3">
        {movimientos.map((movimiento) => {
          const esIngreso = movimiento.tipoMovimiento === TipoMovimiento.ENTRADA;
          const esAutor = user?.id === movimiento.usuario?.clerkId;
          
          return (
            <div 
              key={movimiento._id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header: Descripción y Monto */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {movimiento.descripcion}
                  </h4>
                  {movimiento.observaciones && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {movimiento.observaciones}
                    </p>
                  )}
                </div>
                
                {/* Monto con color según tipo */}
                <div className={`text-sm font-bold ml-3 ${
                  esIngreso 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {esIngreso 
                    ? `+$${formatearMonto(movimiento.monto)}` 
                    : `-$${formatearMonto(movimiento.monto)}`
                  }
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {esIngreso ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {movimiento.categoriaIngreso ? LABELS_CATEGORIA_INGRESO[movimiento.categoriaIngreso] : 'Sin categoría'}
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {movimiento.categoria ? LABELS_CATEGORIA[movimiento.categoria] : 'Sin categoría'}
                      </span>
                      {movimiento.tipoCosto && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {LABELS_TIPO_COSTO[movimiento.tipoCosto]}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Footer: Acciones */}
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {movimiento.metodoPago}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Botón Ver */}
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Ver detalles"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  
                  {/* Botón Eliminar - Solo si es el autor */}
                  {esAutor && (
                    <button
                      onClick={() => handleEliminar(movimiento._id!)}
                      disabled={eliminandoId === movimiento._id || processingAction}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      {eliminandoId === movimiento._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TablaMovimientosMobile;