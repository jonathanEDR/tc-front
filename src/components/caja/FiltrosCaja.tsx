import React, { useState, useCallback, memo, useMemo } from 'react';
import { 
  IFiltrosCaja,
  LABELS_TIPO_MOVIMIENTO,
  LABELS_CATEGORIA,
  LABELS_TIPO_COSTO,
  LABELS_CATEGORIA_INGRESO,
  TipoMovimiento
} from '../../types/caja';
import { DateRangePicker } from '../common/DateTimeComponents';
import { dateUtils } from '../../utils/dateUtils';

interface Props {
  filtros: IFiltrosCaja;
  onFiltroChange: (key: keyof IFiltrosCaja, value: any) => void;
  onLimpiar: () => void;
  loading?: boolean;
}

const FiltrosCaja: React.FC<Props> = memo(({ filtros, onFiltroChange, onLimpiar, loading = false }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [aplicandoRango, setAplicandoRango] = useState(false);
  
  const filtrosActivos = useMemo(() => {
    return Object.entries(filtros).filter(([key, value]) =>
      key !== 'page' && key !== 'limit' && value !== undefined && value !== null && value !== ''
    ).length;
  }, [filtros]);

  // Limpiar filtros incompatibles cuando cambia el tipo de movimiento
  const handleTipoMovimientoChange = useCallback((tipoMovimiento: string | undefined) => {
    onFiltroChange('tipoMovimiento', tipoMovimiento || undefined);
    
    if (tipoMovimiento === TipoMovimiento.ENTRADA) {
      // Si selecciona ENTRADA, limpiar filtros de salida
      onFiltroChange('categoria', undefined);
      onFiltroChange('tipoCosto', undefined);
    } else if (tipoMovimiento === TipoMovimiento.SALIDA) {
      // Si selecciona SALIDA, limpiar filtros de ingreso
      onFiltroChange('categoriaIngreso', undefined);
    }
  }, [onFiltroChange]);

  // Rangos rápidos para fechas
  const rangosRapidos = useMemo(() => [
    {
      label: 'Hoy',
      value: () => {
        const today = new Date();
        // Formato simple YYYY-MM-DD
        const todayStr = today.toISOString().split('T')[0];
        return {
          fechaInicio: todayStr,
          fechaFin: todayStr
        };
      }
    },
    {
      label: 'Esta semana',
      value: () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
        
        return {
          fechaInicio: startOfWeek.toISOString().split('T')[0],
          fechaFin: endOfWeek.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Este mes',
      value: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          fechaInicio: startOfMonth.toISOString().split('T')[0],
          fechaFin: endOfMonth.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Últimos 7 días',
      value: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        return {
          fechaInicio: sevenDaysAgo.toISOString().split('T')[0],
          fechaFin: today.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Últimos 30 días',
      value: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        return {
          fechaInicio: thirtyDaysAgo.toISOString().split('T')[0],
          fechaFin: today.toISOString().split('T')[0]
        };
      }
    }
  ], []);

  const aplicarRangoRapido = useCallback(async (rangoFn: () => { fechaInicio: string; fechaFin: string }) => {
    if (aplicandoRango) return; // Prevenir clicks múltiples
    
    setAplicandoRango(true);
    try {
      const { fechaInicio, fechaFin } = rangoFn();
      onFiltroChange('fechaInicio', fechaInicio);
      onFiltroChange('fechaFin', fechaFin);
    } finally {
      // Pequeño delay para prevenir clicks accidentales
      setTimeout(() => setAplicandoRango(false), 500);
    }
  }, [aplicandoRango, onFiltroChange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title={mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
              >
                <svg 
                  className={`w-5 h-5 transform transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {filtrosActivos > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Rangos rápidos - Siempre visibles */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Rangos rápidos:</span>
            {rangosRapidos.map((rango, index) => (
              <button
                key={index}
                onClick={() => aplicarRangoRapido(rango.value)}
                disabled={loading || aplicandoRango}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 hover:border-blue-300 hover:shadow-sm flex items-center space-x-2"
              >
                {aplicandoRango && (
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{rango.label}</span>
              </button>
            ))}
            <button
              onClick={onLimpiar}
              disabled={loading || filtrosActivos === 0 || aplicandoRango}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 flex items-center space-x-2 hover:shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros detallados - Solo visibles cuando se expanden */}
      {mostrarFiltros && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Resto de los filtros aquí */}
          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Movimiento
            </label>
            <select
              value={filtros.tipoMovimiento || ''}
              onChange={(e) => handleTipoMovimientoChange(e.target.value || undefined)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="">Todos</option>
              {Object.entries(LABELS_TIPO_MOVIMIENTO).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Categoría - Dinámico según tipo de movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={
                filtros.tipoMovimiento === TipoMovimiento.ENTRADA 
                  ? (filtros.categoriaIngreso || '') 
                  : (filtros.categoria || '')
              }
              onChange={(e) => {
                const value = e.target.value || undefined;
                if (filtros.tipoMovimiento === TipoMovimiento.ENTRADA) {
                  onFiltroChange('categoriaIngreso', value);
                  onFiltroChange('categoria', undefined); // Limpiar categoria de salida
                } else if (filtros.tipoMovimiento === TipoMovimiento.SALIDA) {
                  onFiltroChange('categoria', value);
                  onFiltroChange('categoriaIngreso', undefined); // Limpiar categoria de ingreso
                } else {
                  // Si no hay tipo específico, permitir ambos
                  onFiltroChange('categoria', value);
                  onFiltroChange('categoriaIngreso', value);
                }
              }}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="">Todas</option>
              {filtros.tipoMovimiento === TipoMovimiento.ENTRADA ? (
                // Mostrar categorías de ingreso
                Object.entries(LABELS_CATEGORIA_INGRESO).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))
              ) : filtros.tipoMovimiento === TipoMovimiento.SALIDA ? (
                // Mostrar categorías de salida
                Object.entries(LABELS_CATEGORIA).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))
              ) : (
                // Si no hay tipo seleccionado, mostrar ambas con separadores
                <>
                  <optgroup label="Categorías de Ingreso">
                    {Object.entries(LABELS_CATEGORIA_INGRESO).map(([value, label]) => (
                      <option key={`ingreso-${value}`} value={value}>{label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Categorías de Salida">
                    {Object.entries(LABELS_CATEGORIA).map(([value, label]) => (
                      <option key={`salida-${value}`} value={value}>{label}</option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Tipo de Costo - Solo para salidas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Costo
            </label>
            <select
              value={filtros.tipoCosto || ''}
              onChange={(e) => onFiltroChange('tipoCosto', e.target.value || undefined)}
              disabled={loading || filtros.tipoMovimiento === TipoMovimiento.ENTRADA}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <option value="">Todos</option>
              {Object.entries(LABELS_TIPO_COSTO).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {filtros.tipoMovimiento === TipoMovimiento.ENTRADA && (
              <p className="text-xs text-gray-500 mt-1">No aplica para ingresos</p>
            )}
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio || ''}
              onChange={(e) => onFiltroChange('fechaInicio', e.target.value || undefined)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin || ''}
              onChange={(e) => onFiltroChange('fechaFin', e.target.value || undefined)}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={filtros.search || ''}
                onChange={(e) => onFiltroChange('search', e.target.value || undefined)}
                disabled={loading}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
              <svg 
                className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" 
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
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Filtros aplicados:</span>
              <div className="flex flex-wrap gap-2">
                {filtros.tipoMovimiento && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
                    Tipo: {LABELS_TIPO_MOVIMIENTO[filtros.tipoMovimiento]}
                    <button
                      onClick={() => onFiltroChange('tipoMovimiento', undefined)}
                      className="ml-1.5 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filtros.categoria && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                    Categoría: {LABELS_CATEGORIA[filtros.categoria]}
                    <button
                      onClick={() => onFiltroChange('categoria', undefined)}
                      className="ml-1.5 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filtros.categoriaIngreso && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Categoría Ingreso: {LABELS_CATEGORIA_INGRESO[filtros.categoriaIngreso]}
                    <button
                      onClick={() => onFiltroChange('categoriaIngreso', undefined)}
                      className="ml-1.5 text-emerald-600 hover:text-emerald-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filtros.tipoCosto && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
                    Tipo: {LABELS_TIPO_COSTO[filtros.tipoCosto]}
                    <button
                      onClick={() => onFiltroChange('tipoCosto', undefined)}
                      className="ml-1.5 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(filtros.fechaInicio || filtros.fechaFin) && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                    Fechas: {filtros.fechaInicio || 'Inicio'} - {filtros.fechaFin || 'Fin'}
                    <button
                      onClick={() => {
                        onFiltroChange('fechaInicio', undefined);
                        onFiltroChange('fechaFin', undefined);
                      }}
                      className="ml-1.5 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filtros.search && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                    Búsqueda: "{filtros.search}"
                    <button
                      onClick={() => onFiltroChange('search', undefined)}
                      className="ml-1.5 text-gray-600 hover:text-gray-800"
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
      )}
    </div>
  );
});

FiltrosCaja.displayName = 'FiltrosCaja';

export default FiltrosCaja;