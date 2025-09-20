import React, { useState, useCallback, memo, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  IMovimientoCaja,
  TipoMovimiento,
  LABELS_CATEGORIA,
  LABELS_TIPO_COSTO,
  LABELS_CATEGORIA_INGRESO
} from '../../types/caja';
import { formatearMonto } from '../../utils/cajaApi';
import { dateUtils } from '../../utils/dateUtils';

interface Props {
  movimientos: IMovimientoCaja[];
  loading: boolean;
  error: string | null;
  onEliminar: (id: string) => Promise<void>;
  processingAction?: boolean;
}

const TablaMovimientos: React.FC<Props> = memo(({ movimientos, loading, error, onEliminar, processingAction = false }) => {
  const { user } = useUser();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  // ✅ Memoizar handleEliminar
  const handleEliminar = useCallback(async (id: string) => {
    if (eliminandoId || processingAction) return; // Prevenir clicks múltiples
    
    if (!window.confirm('¿Estás seguro de eliminar este movimiento?')) {
      return;
    }
    
    setEliminandoId(id);
    try {
      await onEliminar(id);
    } finally {
      setEliminandoId(null);
    }
  }, [eliminandoId, processingAction, onEliminar]);

  // ✅ Memoizar si el usuario puede eliminar movimientos
  const puedeEliminar = useMemo(() => {
    return !!user;
  }, [user]);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Movimientos</h3>
        
        {movimientos.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m6-6a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0h6m-6 0v4m0-4H9m6 0v4m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2V9a2 2 0 012-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin movimientos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo ingreso o salida.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salidas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientos.map((movimiento) => (
                  <tr key={movimiento._id} className="hover:bg-gray-50 transition-colors">
                    {/* Fecha */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">
                          {dateUtils.formatters.shortDateTime(movimiento.fechaCaja)}
                        </span>
                      </div>
                    </td>
                    
                    {/* Descripción */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="font-medium text-sm truncate">{movimiento.descripcion}</p>
                        {movimiento.observaciones && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {movimiento.observaciones}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    {/* Categoría con Tipo debajo */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        {movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? (
                          // Para ENTRADAS: solo mostrar categoría de ingreso
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {movimiento.categoriaIngreso ? LABELS_CATEGORIA_INGRESO[movimiento.categoriaIngreso] : 'Sin categoría'}
                          </span>
                        ) : (
                          // Para SALIDAS: mostrar categoría y tipo como antes
                          <>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {movimiento.categoria ? LABELS_CATEGORIA[movimiento.categoria] : 'Sin categoría'}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {movimiento.tipoCosto ? LABELS_TIPO_COSTO[movimiento.tipoCosto] : 'Sin tipo'}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    
                    {/* Método de Pago */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {movimiento.metodoPago}
                    </td>
                    
                    {/* Usuario */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-xs">
                          {movimiento.usuario?.name || 'Usuario desconocido'}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-32">
                          {movimiento.usuario?.email}
                        </span>
                      </div>
                    </td>
                    
                    {/* Ingresos */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? (
                        <div className="text-green-600 font-semibold">
                          +${formatearMonto(movimiento.monto)}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    
                    {/* Salidas */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {movimiento.tipoMovimiento === TipoMovimiento.SALIDA ? (
                        <div className="text-red-600 font-semibold">
                          -${formatearMonto(movimiento.monto)}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    
                    {/* Acciones */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-1">
                        {puedeEliminar && (
                          <button
                            onClick={() => handleEliminar(movimiento._id!)}
                            disabled={eliminandoId === movimiento._id || processingAction}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar"
                          >
                            {eliminandoId === movimiento._id ? (
                              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                        {puedeEliminar && (
                          <button
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
});

TablaMovimientos.displayName = 'TablaMovimientos';

export default TablaMovimientos;