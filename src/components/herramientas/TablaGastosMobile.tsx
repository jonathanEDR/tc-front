import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  ICatalogoGasto,
  LABELS_CATEGORIA_GASTO,
  LABELS_TIPO_GASTO,
  COLORES_CATEGORIA_GASTO,
  COLORES_TIPO_GASTO
} from '../../types/herramientas';
import { formatearFechaHora } from '../../utils/herramientasApi';

interface Props {
  gastos: ICatalogoGasto[];
  loading: boolean;
  error: string | null;
  onEditar: (gasto: ICatalogoGasto) => void;
  onEliminar: (id: string) => Promise<void>;
  processingAction?: boolean;
}

const TablaGastosMobile: React.FC<Props> = ({ 
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
    if (eliminandoId || processingAction) return;
    
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
      <div className="flex flex-wrap gap-1 mt-2">
        {etiquetas.slice(0, 3).map((etiqueta, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            #{etiqueta}
          </span>
        ))}
        {etiquetas.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
            +{etiquetas.length - 3}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (gastos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay gastos registrados</h3>
        <p className="text-gray-500">Comienza creando tu primer gasto en el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {gastos.map((gasto) => {
        const categoria = LABELS_CATEGORIA_GASTO[gasto.categoriaGasto];
        const tipo = LABELS_TIPO_GASTO[gasto.tipoGasto];
        const colorCategoria = COLORES_CATEGORIA_GASTO[gasto.categoriaGasto];
        const colorTipo = COLORES_TIPO_GASTO[gasto.tipoGasto];
        const esAutor = user?.id === gasto.creadoPor?._id;
        
        return (
          <div 
            key={gasto._id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Header: Nombre y acciones */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {gasto.nombre}
                </h3>
                {gasto.descripcion && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {gasto.descripcion}
                  </p>
                )}
              </div>
              
              {/* Acciones */}
              <div className="flex items-center space-x-2 ml-3">
                <button
                  onClick={() => onEditar(gasto)}
                  disabled={processingAction}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                  title="Editar gasto"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                {esAutor && (
                  <button
                    onClick={() => handleEliminar(gasto._id!, gasto.nombre)}
                    disabled={processingAction || eliminandoId === gasto._id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                    title="Archivar gasto"
                  >
                    {eliminandoId === gasto._id ? (
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

            {/* Metadatos principales */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Categoría */}
              <div>
                <span className="text-gray-500">Categoría:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorCategoria}`}>
                    {categoria}
                  </span>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <span className="text-gray-500">Tipo:</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorTipo}`}>
                    {tipo}
                  </span>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {renderEtiquetas(gasto.etiquetas)}

            {/* Footer: Fecha de creación */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Creado: {formatearFechaHora(gasto.createdAt!)}
                </span>
                {gasto.updatedAt && gasto.updatedAt !== gasto.createdAt && (
                  <span>
                    Editado: {formatearFechaHora(gasto.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TablaGastosMobile;