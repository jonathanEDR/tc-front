import React from 'react';
import { 
  IFiltrosCaja,
  LABELS_TIPO_MOVIMIENTO,
  LABELS_CATEGORIA,
  LABELS_TIPO_COSTO
} from '../../types/caja';
import { DateRangePicker } from '../common/DateTimeComponents';
import { dateUtils } from '../../utils/dateUtils';

interface Props {
  filtros: IFiltrosCaja;
  onFiltroChange: (key: keyof IFiltrosCaja, value: any) => void;
  onLimpiar: () => void;
  loading?: boolean;
}

const FiltrosCaja: React.FC<Props> = ({ filtros, onFiltroChange, onLimpiar, loading = false }) => {
  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => 
    key !== 'page' && key !== 'limit' && value !== undefined && value !== null && value !== ''
  ).length;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <div className="flex items-center space-x-3">
          {filtrosActivos > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onLimpiar}
            disabled={loading || filtrosActivos === 0}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Tipo de Movimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Movimiento
          </label>
          <select
            value={filtros.tipoMovimiento || ''}
            onChange={(e) => onFiltroChange('tipoMovimiento', e.target.value || undefined)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">Todos</option>
            {Object.entries(LABELS_TIPO_MOVIMIENTO).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={filtros.categoria || ''}
            onChange={(e) => onFiltroChange('categoria', e.target.value || undefined)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">Todas</option>
            {Object.entries(LABELS_CATEGORIA).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Costo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo Costo
          </label>
          <select
            value={filtros.tipoCosto || ''}
            onChange={(e) => onFiltroChange('tipoCosto', e.target.value || undefined)}
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <option value="">Todos</option>
            {Object.entries(LABELS_TIPO_COSTO).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Rango de Fechas */}
        <div className="md:col-span-2">
          <DateRangePicker
            value={{
              start: filtros.fechaInicio ? dateUtils.parse(filtros.fechaInicio) : null,
              end: filtros.fechaFin ? dateUtils.parse(filtros.fechaFin) : null
            }}
            onChange={(range) => {
              onFiltroChange('fechaInicio', range.start ? dateUtils.formatters.isoDate(range.start) : undefined);
              onFiltroChange('fechaFin', range.end ? dateUtils.formatters.isoDate(range.end) : undefined);
            }}
            startLabel="Fecha Inicio"
            endLabel="Fecha Fin"
            showPresets={true}
          />
        </div>

        {/* Búsqueda de texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Búsqueda
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={filtros.search || ''}
              onChange={(e) => onFiltroChange('search', e.target.value || undefined)}
              disabled={loading}
              className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            <svg 
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filtros aplicados */}
      {filtrosActivos > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Filtros aplicados:</span>
            <div className="flex flex-wrap gap-2">
              {filtros.tipoMovimiento && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tipo: {LABELS_TIPO_MOVIMIENTO[filtros.tipoMovimiento]}
                  <button
                    onClick={() => onFiltroChange('tipoMovimiento', undefined)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filtros.categoria && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Categoría: {LABELS_CATEGORIA[filtros.categoria]}
                  <button
                    onClick={() => onFiltroChange('categoria', undefined)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filtros.tipoCosto && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Tipo: {LABELS_TIPO_COSTO[filtros.tipoCosto]}
                  <button
                    onClick={() => onFiltroChange('tipoCosto', undefined)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filtros.fechaInicio || filtros.fechaFin) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Fechas: {filtros.fechaInicio || 'Inicio'} - {filtros.fechaFin || 'Fin'}
                  <button
                    onClick={() => {
                      onFiltroChange('fechaInicio', undefined);
                      onFiltroChange('fechaFin', undefined);
                    }}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filtros.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Búsqueda: "{filtros.search}"
                  <button
                    onClick={() => onFiltroChange('search', undefined)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosCaja;