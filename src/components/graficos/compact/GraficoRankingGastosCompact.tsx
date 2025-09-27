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
} from '../../../types/graficos';
import { IMovimientoCaja, TipoMovimiento, IFiltrosCaja } from '../../../types/caja';
import { obtenerMovimientos } from '../../../utils/cajaApi';

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
const truncarTexto = (texto: string, maxLength: number): string => {
  return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
};

interface Props {
  className?: string;
  onVerMas?: () => void; // Callback para abrir vista completa
  limitarItems?: number; // Reducido para vista compacta
  periodoInicial?: string; // 'hoy', 'semana', 'mes'
}

const GraficoRankingGastosCompact: React.FC<Props> = ({ 
  className = "",
  onVerMas,
  limitarItems = 5, // Solo 5 items en vista compacta
  periodoInicial = 'ultimos7dias'
}) => {
  // Estado del componente
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);
  const [filtroFechas, setFiltroFechas] = useState<FiltroFechas>(() => {
    const presets = generarPresetsPeriodos();
    const preset = presets.find(p => p.id === periodoInicial) || presets[1]; // Default a semana
    return preset.getFechas();
  });
  const [configuracion, setConfiguracion] = useState<ConfiguracionRanking>({
    ordenarPor: 'monto',
    direccion: 'desc',
    limitarItems: limitarItems,
    mostrarCantidad: false,
    mostrarPromedio: false,
    loading: false,
    error: null
  });



  // Cargar datos del API cuando cambien las fechas
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 300);

    return () => clearTimeout(timer);
  }, [filtroFechas]);

  const cargarDatos = async () => {
    try {
      setConfiguracion(prev => ({ ...prev, loading: true, error: null }));

      const filtros: IFiltrosCaja = {
        tipoMovimiento: TipoMovimiento.SALIDA,
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0],
        limit: 100 // Menos datos para vista compacta
      };

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      setDatosOriginales(movimientos);
    } catch (err) {
      console.error('❌ Error cargando datos del ranking compacto:', err);
      setConfiguracion(prev => ({ 
        ...prev, 
        error: 'Error al cargar los datos' 
      }));
    } finally {
      setConfiguracion(prev => ({ ...prev, loading: false }));
    }
  };

  // Procesar datos para crear ranking
  const datosRanking = useMemo((): DatosRankingGastos => {
    if (datosOriginales.length === 0) {
      return {
        ranking: [],
        totales: { totalGastos: 0, cantidadMovimientos: 0, cantidadDescripciones: 0 },
        filtros: { descripcion: '', fechaInicio: '', fechaFin: '' },
        estadisticas: { gastoMayor: null, gastoMenor: null, promedioGeneral: 0 }
      };
    }

    // Agrupar por descripción
    const gastosAgrupados = new Map<string, {
      descripcion: string;
      montoTotal: number;
      cantidadMovimientos: number;
      categoria: string;
      tipoCosto: string;
    }>();

    datosOriginales.forEach(movimiento => {
      const key = movimiento.descripcion;
      const existing = gastosAgrupados.get(key);
      
      if (existing) {
        existing.montoTotal += movimiento.monto;
        existing.cantidadMovimientos += 1;
      } else {
        gastosAgrupados.set(key, {
          descripcion: movimiento.descripcion,
          montoTotal: movimiento.monto,
          cantidadMovimientos: 1,
          categoria: movimiento.categoria || 'Sin categoría',
          tipoCosto: movimiento.tipoCosto || 'Sin tipo'
        });
      }
    });

    // Convertir a array y calcular totales
    const totalGastos = Array.from(gastosAgrupados.values())
      .reduce((sum, item) => sum + item.montoTotal, 0);

    // Crear ranking con colores
    const coloresDisponibles = Object.values(COLORES_RANKING);
    let ranking: ItemRankingGasto[] = Array.from(gastosAgrupados.values())
      .map((item, index) => ({
        descripcion: item.descripcion,
        montoTotal: item.montoTotal,
        cantidadMovimientos: item.cantidadMovimientos,
        promedioMonto: item.montoTotal / item.cantidadMovimientos,
        porcentaje: totalGastos > 0 ? (item.montoTotal / totalGastos) * 100 : 0,
        categoria: item.categoria,
        tipoCosto: item.tipoCosto,
        color: coloresDisponibles[index % coloresDisponibles.length]
      }));

    // Ordenar según configuración
    ranking.sort((a, b) => {
      let aValue: number, bValue: number;
      switch (configuracion.ordenarPor) {
        case 'monto':
          aValue = a.montoTotal;
          bValue = b.montoTotal;
          break;
        case 'cantidad':
          aValue = a.cantidadMovimientos;
          bValue = b.cantidadMovimientos;
          break;
        case 'promedio':
          aValue = a.promedioMonto;
          bValue = b.promedioMonto;
          break;
        default:
          aValue = a.montoTotal;
          bValue = b.montoTotal;
      }
      return configuracion.direccion === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Limitar items para vista compacta
    ranking = ranking.slice(0, configuracion.limitarItems);

    return {
      ranking,
      totales: {
        totalGastos,
        cantidadMovimientos: datosOriginales.length,
        cantidadDescripciones: gastosAgrupados.size
      },
      filtros: {
        descripcion: '',
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0]
      },
      estadisticas: {
        gastoMayor: ranking.length > 0 ? ranking[0] : null,
        gastoMenor: ranking.length > 0 ? ranking[ranking.length - 1] : null,
        promedioGeneral: datosOriginales.length > 0 ? totalGastos / datosOriginales.length : 0
      }
    };
  }, [datosOriginales, configuracion.ordenarPor, configuracion.direccion, configuracion.limitarItems, filtroFechas]);

  // Cambiar período rápidamente
  const cambiarPeriodo = (presetId: string) => {
    const presets = generarPresetsPeriodos();
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFiltroFechas(preset.getFechas());
    }
  };

  // Configuración del gráfico Chart.js (más compacta)
  const chartData = {
    labels: datosRanking.ranking.map(item => truncarTexto(item.descripcion, 15)), // Más corto
    datasets: [
      {
        label: 'Monto',
        data: datosRanking.ranking.map(item => item.montoTotal),
        backgroundColor: datosRanking.ranking.map(item => item.color),
        borderColor: datosRanking.ranking.map(item => item.color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: false }, // Sin título para vista compacta
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = datosRanking.ranking[context.dataIndex];
            return `${formatearSoles(item.montoTotal)} (${item.porcentaje.toFixed(1)}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false, // Ocultar eje x para vista más limpia
      },
      y: {
        ticks: { font: { size: 10 } } // Texto más pequeño
      }
    },
  };

  if (configuracion.loading) {
    return (
      <div className={`${className} bg-white rounded-lg p-4 border border-gray-200`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (configuracion.error) {
    return (
      <div className={`${className} bg-white rounded-lg p-4 border border-gray-200`}>
        <div className="flex items-center justify-center h-48">
          <div className="text-center text-red-500">
            <div className="text-2xl mb-2">⚠️</div>
            <p className="text-sm">Error al cargar</p>
          </div>
        </div>
      </div>
    );
  }

  const tieneData = datosRanking.ranking.length > 0;

  return (
    <div className={`${className} bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg`}>
      {/* Header compacto */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📊 <span className="ml-2">Ranking de Gastos</span>
            </h3>
            <p className="text-xs text-gray-500">Top {limitarItems} descripciones</p>
          </div>
          {onVerMas && (
            <button
              onClick={onVerMas}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Ver más →
            </button>
          )}
        </div>

        {/* Selector de período rápido */}
        <div className="flex space-x-1">
          {[
            { id: 'hoy', label: 'Hoy' },
            { id: 'ultimos7dias', label: 'Semana' },
            { id: 'estemes', label: 'Mes' }
          ].map((opcion) => {
            const presets = generarPresetsPeriodos();
            const preset = presets.find(p => p.id === opcion.id);
            
            if (!preset) return null;
            
            const fechasPreset = preset.getFechas();
            const isActive = 
              fechasPreset.fechaInicio.toDateString() === filtroFechas.fechaInicio.toDateString() &&
              fechasPreset.fechaFin.toDateString() === filtroFechas.fechaFin.toDateString();
            
            return (
              <button
                key={opcion.id}
                onClick={() => cambiarPeriodo(opcion.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opcion.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {!tieneData ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-1">📊</div>
              <p className="text-sm">Sin datos</p>
            </div>
          </div>
        ) : (
          <>
            {/* Métrica destacada */}
            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatearSoles(datosRanking.totales.totalGastos)}
              </p>
              <p className="text-xs text-gray-500">
                Total en {datosRanking.totales.cantidadDescripciones} descripciones
              </p>
            </div>

            {/* Gráfico compacto */}
            <div className="h-32 mb-3">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Top 3 items en texto */}
            <div className="space-y-1">
              {datosRanking.ranking.slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate flex-1">
                    {index + 1}. {truncarTexto(item.descripcion, 20)}
                  </span>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatearSoles(item.montoTotal)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GraficoRankingGastosCompact;