import React from 'react';
import { 
  IMovimientoCaja, 
  TipoMovimiento,
  LABELS_CATEGORIA,
  LABELS_TIPO_COSTO 
} from '../../types/caja';
import { formatearMonto } from '../../utils/cajaApi';
import { dateUtils } from '../../utils/dateUtils';

interface Props {
  movimientos: IMovimientoCaja[];
  loading: boolean;
  error: string | null;
  onEliminar: (id: string) => Promise<void>;
}

const TablaMovimientos: React.FC<Props> = ({ movimientos, loading, error, onEliminar }) => {
  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este movimiento?')) {
      return;
    }
    await onEliminar(id);
  };

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientos.map((movimiento) => (
                  <tr key={movimiento._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {dateUtils.formatters.shortDateTime(movimiento.fechaCaja)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dateUtils.formatters.shortDate(movimiento.fechaCaja)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="truncate font-medium">{movimiento.descripcion}</p>
                        {movimiento.observaciones && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {movimiento.observaciones}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {movimiento.categoria ? LABELS_CATEGORIA[movimiento.categoria] : 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {movimiento.tipoCosto ? LABELS_TIPO_COSTO[movimiento.tipoCosto] : 'Sin tipo'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className="flex items-center">
                        {movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? (
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? '+' : '-'}
                        {formatearMonto(movimiento.monto)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {movimiento.metodoPago}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEliminar(movimiento._id!)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-md hover:bg-red-50"
                          title="Eliminar movimiento"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-md hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
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
};

export default TablaMovimientos;