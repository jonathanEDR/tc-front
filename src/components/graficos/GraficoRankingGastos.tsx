import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  DatosRankingGastos,
  ItemRankingGasto,
  ConfiguracionRanking,
  FiltroFechas,
  COLORES_RANKING,
  generarPresetsPeriodos
} from '../../types/graficos';
import SelectorFechas from '../common/SelectorFechas';
import { IMovimientoCaja, TipoMovimiento, IFiltrosCaja } from '../../types/caja';
import { obtenerMovimientos } from '../../utils/cajaApi';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Función helper para formatear soles peruanos
const formatearSoles = (monto: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto);
};

// Función helper para truncar texto
const truncarTexto = (texto: string, maxLength: number = 30): string => {
  return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
};

// Función helper para obtener descripción del período
const obtenerDescripcionPeriodo = (fechaInicio: Date, fechaFin: Date): string => {
  const opciones: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const fechaInicioStr = fechaInicio.toLocaleDateString('es-PE', opciones);
  const fechaFinStr = fechaFin.toLocaleDateString('es-PE', opciones);
  
  // Si son el mismo día
  if (fechaInicio.toDateString() === fechaFin.toDateString()) {
    return `${fechaInicioStr}`;
  }
  
  return `${fechaInicioStr} - ${fechaFinStr}`;
};

interface Props {
  className?: string;
  fechasIniciales?: FiltroFechas;
  showDateSelector?: boolean;
  limitarItems?: number;
}

const GraficoRankingGastos: React.FC<Props> = ({ 
  className = "", 
  fechasIniciales,
  showDateSelector = true,
  limitarItems = 10
}) => {
  // Generar fechas por defecto (últimos 7 días)
  const fechasDefecto = React.useMemo(() => {
    if (fechasIniciales) return fechasIniciales;
    
    const presets = generarPresetsPeriodos();
    const presetUltimos7Dias = presets.find((p) => p.id === 'ultimos7dias');
    return presetUltimos7Dias?.getFechas() || {
      fechaInicio: new Date(new Date().setDate(new Date().getDate() - 6)),
      fechaFin: new Date()
    };
  }, [fechasIniciales]);

  const [configuracion, setConfiguracion] = useState<ConfiguracionRanking>({
    mostrarCantidad: true,
    mostrarPromedio: false,
    limitarItems: limitarItems,
    ordenarPor: 'monto',
    direccion: 'desc',
    loading: true,
    error: null
  });

  const [filtroFechas, setFiltroFechas] = useState<FiltroFechas>(fechasDefecto);
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);

  // Log de las fechas seleccionadas para debugging
  React.useEffect(() => {
    console.log(`📅 FECHAS SELECCIONADAS:`, {
      fechaInicio: filtroFechas.fechaInicio.toISOString(),
      fechaFin: filtroFechas.fechaFin.toISOString(),
      diasDiferencia: Math.ceil((filtroFechas.fechaFin.getTime() - filtroFechas.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
    });
  }, [filtroFechas]);

  // Cargar datos del API cuando cambien las fechas
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 300); // Debounce para evitar múltiples llamadas

    return () => clearTimeout(timer);
  }, [filtroFechas]);

  const cargarDatos = async () => {
    try {
      setConfiguracion(prev => ({ ...prev, loading: true, error: null }));

      // Preparar filtros para la API
      const filtros: IFiltrosCaja = {
        tipoMovimiento: TipoMovimiento.SALIDA,
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0],
        limit: 1000 // Obtener todos los registros para el gráfico
      };

      console.log('🔍 Cargando datos con filtros:', filtros);

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      
      console.log('📊 Datos obtenidos:', movimientos.length, 'movimientos');
      setDatosOriginales(movimientos);
    } catch (err) {
      console.error('❌ Error cargando datos del ranking:', err);
      setConfiguracion(prev => ({ 
        ...prev, 
        error: 'Error al cargar los datos del ranking de gastos' 
      }));
    } finally {
      setConfiguracion(prev => ({ ...prev, loading: false }));
    }
  };

  // Procesar datos para crear ranking
  const datosRanking = useMemo((): DatosRankingGastos => {
    // Mapa para agrupar por descripción
    const gastosAgrupados = new Map<string, {
      montoTotal: number;
      cantidadMovimientos: number;
      categoria: string;
      tipoCosto: string;
      movimientos: IMovimientoCaja[];
    }>();

    console.log('📊 Procesando datos originales para ranking:', datosOriginales.length);

    datosOriginales.forEach((movimiento) => {
      const descripcion = movimiento.descripcion || 'Sin descripción';
      const monto = movimiento.monto || 0;
      const categoria = movimiento.categoria || 'sin_categoria';
      const tipoCosto = movimiento.tipoCosto || 'sin_tipo';

      const existing = gastosAgrupados.get(descripcion) || {
        montoTotal: 0,
        cantidadMovimientos: 0,
        categoria,
        tipoCosto,
        movimientos: []
      };

      gastosAgrupados.set(descripcion, {
        montoTotal: existing.montoTotal + monto,
        cantidadMovimientos: existing.cantidadMovimientos + 1,
        categoria: existing.categoria,
        tipoCosto: existing.tipoCosto,
        movimientos: [...existing.movimientos, movimiento]
      });
    });

    const totalGastos = Array.from(gastosAgrupados.values())
      .reduce((sum, item) => sum + item.montoTotal, 0);

    // Convertir a array de ItemRankingGasto y ordenar
    let ranking: ItemRankingGasto[] = Array.from(gastosAgrupados.entries())
      .map(([descripcion, datos], index) => ({
        descripcion,
        montoTotal: datos.montoTotal,
        cantidadMovimientos: datos.cantidadMovimientos,
        promedioMonto: datos.montoTotal / datos.cantidadMovimientos,
        porcentaje: totalGastos > 0 ? (datos.montoTotal / totalGastos) * 100 : 0,
        categoria: datos.categoria,
        tipoCosto: datos.tipoCosto,
        color: COLORES_RANKING[index % COLORES_RANKING.length]
      }));

    // Ordenar según configuración
    ranking.sort((a, b) => {
      let comparison = 0;
      switch (configuracion.ordenarPor) {
        case 'monto':
          comparison = a.montoTotal - b.montoTotal;
          break;
        case 'cantidad':
          comparison = a.cantidadMovimientos - b.cantidadMovimientos;
          break;
        case 'promedio':
          comparison = a.promedioMonto - b.promedioMonto;
          break;
      }
      return configuracion.direccion === 'desc' ? -comparison : comparison;
    });

    // Limitar items si se especifica
    if (configuracion.limitarItems > 0) {
      ranking = ranking.slice(0, configuracion.limitarItems);
    }

    // Estadísticas
    const estadisticas = {
      gastoMayor: ranking.length > 0 ? ranking[0] : null,
      gastoMenor: ranking.length > 0 ? ranking[ranking.length - 1] : null,
      promedioGeneral: datosOriginales.length > 0 ? totalGastos / datosOriginales.length : 0
    };

    const resultado: DatosRankingGastos = {
      ranking,
      totales: {
        totalGastos,
        cantidadMovimientos: datosOriginales.length,
        cantidadDescripciones: gastosAgrupados.size
      },
      filtros: {
        descripcion: obtenerDescripcionPeriodo(filtroFechas.fechaInicio, filtroFechas.fechaFin),
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0]
      },
      estadisticas
    };

    return resultado;
  }, [datosOriginales, configuracion.ordenarPor, configuracion.direccion, configuracion.limitarItems, filtroFechas]);

  // Configuración del gráfico Chart.js
  const chartData = {
    labels: datosRanking.ranking.map(item => truncarTexto(item.descripcion, 25)),
    datasets: [
      {
        label: 'Monto Total',
        data: datosRanking.ranking.map(item => item.montoTotal),
        backgroundColor: datosRanking.ranking.map(item => item.color),
        borderColor: datosRanking.ranking.map(item => item.color.replace('0.8', '1')),
        borderWidth: 1,
        hoverBackgroundColor: datosRanking.ranking.map(item => item.color.replace('0.8', '0.9')),
        hoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // Barras horizontales
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Ranking de Gastos - ${obtenerDescripcionPeriodo(filtroFechas.fechaInicio, filtroFechas.fechaFin)}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        callbacks: {
          title: function(context) {
            const index = context[0].dataIndex;
            return datosRanking.ranking[index]?.descripcion || '';
          },
          label: function(context) {
            const index = context.dataIndex;
            const item = datosRanking.ranking[index];
            if (!item) return '';
            
            const lines = [
              `Monto: ${formatearSoles(item.montoTotal)}`,
              `Movimientos: ${item.cantidadMovimientos}`,
              `Promedio: ${formatearSoles(item.promedioMonto)}`,
              `Porcentaje: ${item.porcentaje.toFixed(1)}%`,
              `Categoría: ${item.categoria}`,
              `Tipo: ${item.tipoCosto}`
            ];
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto en Soles (S/)'
        },
        ticks: {
          callback: function(value) {
            return formatearSoles(Number(value));
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Descripciones de Gastos'
        }
      }
    },
  };

  // Manejar cambio de configuración
  const handleConfigChange = (key: keyof ConfiguracionRanking, value: any) => {
    setConfiguracion(prev => ({ ...prev, [key]: value }));
  };

  // Manejar cambio de fechas
  const handleCambioFechas = (nuevasFechas: FiltroFechas) => {
    setFiltroFechas(nuevasFechas);
  };

  // Render del componente
  if (configuracion.loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <span className="mt-2 text-gray-600">Cargando ranking...</span>
        </div>
      </div>
    );
  }

  if (configuracion.error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 mb-4">{configuracion.error}</p>
          <button
            onClick={cargarDatos}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tieneData = datosRanking.ranking.length > 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Selector de fechas */}
      {showDateSelector && (
        <div className="mb-6">
          <SelectorFechas
            filtroFechas={filtroFechas}
            onCambioFechas={handleCambioFechas}
            className="mb-4"
          />
        </div>
      )}

      {/* Controles de configuración */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            📊 Configuración del Ranking
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Mostrar:
              </label>
              <select
                value={configuracion.limitarItems}
                onChange={(e) => handleConfigChange('limitarItems', parseInt(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={0}>Todos</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Ordenar por:
              </label>
              <select
                value={configuracion.ordenarPor}
                onChange={(e) => handleConfigChange('ordenarPor', e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="monto">Monto Total</option>
                <option value="cantidad">Cantidad</option>
                <option value="promedio">Promedio</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas resumen */}
      {tieneData && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatearSoles(datosRanking.totales.totalGastos)}
              </div>
              <div className="text-sm text-gray-600">Total Gastado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {datosRanking.totales.cantidadDescripciones}
              </div>
              <div className="text-sm text-gray-600">Descripciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {datosRanking.estadisticas.gastoMayor ? formatearSoles(datosRanking.estadisticas.gastoMayor.montoTotal) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Gasto Mayor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatearSoles(datosRanking.estadisticas.promedioGeneral || 0)}
              </div>
              <div className="text-sm text-gray-600">Promedio General</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {!tieneData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-medium">No hay datos para mostrar</p>
              <p className="text-sm">Intenta seleccionar un rango de fechas diferente</p>
            </div>
          </div>
        ) : (
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Tabla de detalles */}
        {tieneData && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosRanking.ranking.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearSoles(item.montoTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.cantidadMovimientos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearSoles(item.promedioMonto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.porcentaje.toFixed(1)}%
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

export default GraficoRankingGastos;