import React, { useState } from 'react';
import { 
  IFiltrosCatalogo,
  TipoGasto,
  EstadoGasto,
  LABELS_TIPO_GASTO,
  LABELS_ESTADO_GASTO,
  TipoCosto
} from '../../types/herramientas';
import { LABELS_TIPO_COSTO } from '../../types/caja';

interface Props {
  filtros: IFiltrosCatalogo;
  onFiltroChange: (key: keyof IFiltrosCatalogo, value: any) => void;
  onLimpiar: () => void;
  loading?: boolean;
}

const FiltrosCatalogo: React.FC<Props> = ({ filtros, onFiltroChange, onLimpiar, loading = false }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => 
    key !== 'page' && key !== 'limit' && value !== undefined && value !== null && value !== ''
  ).length;

  // Manejar búsqueda con debounce
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Establecer nuevo timeout para debounce
    const timeout = setTimeout(() => {
      onFiltroChange('search', value || undefined);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  // Limpiar timeout al desmontar el componente
  React.useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Manejar cambio de montos con validación
  const handleMontoChange = (tipo: 'montoMin' | 'montoMax', value: string) => {
    const numero = value ? parseFloat(value) : undefined;
    
    if (value === '' || (numero !== undefined && !isNaN(numero) && numero >= 0)) {
      onFiltroChange(tipo, numero);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        {/* Header con botón de toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            {filtrosActivos > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filtrosActivos} activo{filtrosActivos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {filtrosActivos > 0 && (
              <button
                onClick={onLimpiar}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <span>{mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de búsqueda rápida - siempre visible */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              defaultValue={filtros.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar por nombre, descripción o etiquetas..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {mostrarFiltros && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Tipo de Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Costo
                </label>
                <select
                  value={filtros.tipoCosto || ''}
                  onChange={(e) => onFiltroChange('tipoCosto', e.target.value || undefined)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos de costo</option>
                  {Object.entries(LABELS_TIPO_COSTO).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Gasto
                </label>
                <select
                  value={filtros.tipoGasto || ''}
                  onChange={(e) => onFiltroChange('tipoGasto', e.target.value || undefined)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(LABELS_TIPO_GASTO).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtros.estado || ''}
                  onChange={(e) => onFiltroChange('estado', e.target.value || undefined)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(LABELS_ESTADO_GASTO).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Etiqueta específica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiqueta específica
                </label>
                <input
                  type="text"
                  value={filtros.etiqueta || ''}
                  onChange={(e) => onFiltroChange('etiqueta', e.target.value || undefined)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: mensual, urgente..."
                />
              </div>

            </div>

            {/* Rango de montos */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de Monto Estimado (S/.)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Monto mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filtros.montoMin !== undefined ? filtros.montoMin : ''}
                    onChange={(e) => handleMontoChange('montoMin', e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Monto máximo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filtros.montoMax !== undefined ? filtros.montoMax : ''}
                    onChange={(e) => handleMontoChange('montoMax', e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="999999.99"
                  />
                </div>
              </div>
              {((filtros.montoMin !== undefined && filtros.montoMax !== undefined) && 
                filtros.montoMin > filtros.montoMax) && (
                <p className="mt-1 text-sm text-red-600">
                  El monto mínimo no puede ser mayor al monto máximo
                </p>
              )}
            </div>

            {/* Filtros rápidos por tipo */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filtros rápidos
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onFiltroChange('tipoGasto', TipoGasto.FIJO);
                    onFiltroChange('estado', EstadoGasto.ACTIVO);
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  Gastos Fijos Activos
                </button>
                
                <button
                  onClick={() => {
                    onFiltroChange('tipoGasto', TipoGasto.VARIABLE);
                    onFiltroChange('estado', EstadoGasto.ACTIVO);
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                >
                  Gastos Variables Activos
                </button>

                <button
                  onClick={() => {
                    onFiltroChange('tipoCosto', TipoCosto.MATERIA_PRIMA);
                    onFiltroChange('estado', EstadoGasto.ACTIVO);
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 transition-colors"
                >
                  Materia Prima Activa
                </button>

                <button
                  onClick={() => {
                    onFiltroChange('tipoCosto', TipoCosto.MANO_OBRA);
                    onFiltroChange('estado', EstadoGasto.ACTIVO);
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50 transition-colors"
                >
                  Mano de Obra Activa
                </button>

                <button
                  onClick={() => {
                    onFiltroChange('estado', EstadoGasto.INACTIVO);
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Ver Inactivos
                </button>
              </div>
            </div>

            {/* Resumen de filtros activos */}
            {filtrosActivos > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    <strong>{filtrosActivos}</strong> filtro{filtrosActivos !== 1 ? 's' : ''} aplicado{filtrosActivos !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={onLimpiar}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 underline"
                  >
                    Limpiar todos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltrosCatalogo;