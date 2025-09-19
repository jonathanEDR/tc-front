import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  ICatalogoGasto,
  LABELS_CATEGORIA_GASTO,
  LABELS_TIPO_GASTO,
  LABELS_ESTADO_GASTO,
  COLORES_CATEGORIA_GASTO,
  COLORES_TIPO_GASTO,
  COLORES_ESTADO_GASTO
} from '../../types/herramientas';
import { formatearMonto, formatearFechaHora } from '../../utils/herramientasApi';

interface Props {
  gastos: ICatalogoGasto[];
  loading: boolean;
  error: string | null;
  onEditar: (gasto: ICatalogoGasto) => void;
  onEliminar: (id: string) => Promise<void>;
  processingAction?: boolean;
}

const TablaCatalogo: React.FC<Props> = ({ 
  gastos, 
  loading, 
  error, 
  onEditar, 
  onEliminar, 
  processingAction = false 
}) => {
  const { user } = useUser();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  
  const handleEliminar = async (id: string, nombre: string) => {
    if (eliminandoId || processingAction) return; // Prevenir clicks múltiples
    
    if (!window.confirm(`¿Estás seguro de archivar el gasto "${nombre}"?\n\nEsta acción cambiará su estado a "Archivado".`)) {
      return;
    }
    
    setEliminandoId(id);
    try {
      await onEliminar(id);
    } finally {
      setEliminandoId(null);
    }
  };

  const renderEtiquetas = (etiquetas: string[] | undefined) => {
    if (!etiquetas || etiquetas.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {etiquetas.slice(0, 3).map((etiqueta, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
          >
            {etiqueta}
          </span>
        ))}
        {etiquetas.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{etiquetas.length - 3}
          </span>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Catálogo de Gastos</h3>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Catálogo de Gastos</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Catálogo de Gastos</h3>
        
        {gastos.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No hay gastos en el catálogo</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando el primer gasto al catálogo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gasto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría / Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Estimado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastos.map((gasto) => (
                  <tr key={gasto._id} className="hover:bg-gray-50">
                    {/* Información del Gasto */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {gasto.nombre}
                        </div>
                        {gasto.descripcion && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {gasto.descripcion}
                          </div>
                        )}
                        {renderEtiquetas(gasto.etiquetas)}
                      </div>
                    </td>
                    
                    {/* Categoría y Tipo */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${COLORES_CATEGORIA_GASTO[gasto.categoriaGasto]}`}>
                          {LABELS_CATEGORIA_GASTO[gasto.categoriaGasto]}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${COLORES_TIPO_GASTO[gasto.tipoGasto]}`}>
                          {LABELS_TIPO_GASTO[gasto.tipoGasto]}
                        </span>
                      </div>
                    </td>
                    
                    {/* Monto Estimado */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gasto.montoEstimado ? (
                        <span className="font-medium">
                          {formatearMonto(gasto.montoEstimado)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No especificado</span>
                      )}
                    </td>
                    
                    {/* Estado */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${COLORES_ESTADO_GASTO[gasto.estado]}`}>
                        {LABELS_ESTADO_GASTO[gasto.estado]}
                      </span>
                    </td>
                    
                    {/* Información de Creación */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-xs">
                          {gasto.creadoPor?.name || 'Usuario'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {gasto.createdAt ? formatearFechaHora(gasto.createdAt) : 'Fecha no disponible'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Acciones */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Botón Editar */}
                        <button
                          onClick={() => onEditar(gasto)}
                          disabled={processingAction}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                          title="Editar gasto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Botón Eliminar (Archivar) */}
                        <button
                          onClick={() => gasto._id && handleEliminar(gasto._id, gasto.nombre)}
                          disabled={processingAction || eliminandoId === gasto._id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                          title="Archivar gasto"
                        >
                          {eliminandoId === gasto._id ? (
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

export default TablaCatalogo;