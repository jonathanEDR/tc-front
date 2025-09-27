import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  PointElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  FiltroFechas,
  generarPresetsPeriodos
} from '../../../types/graficos';
import { IMovimientoCaja, TipoMovimiento, IFiltrosCaja } from '../../../types/caja';
import { obtenerMovimientos } from '../../../utils/cajaApi';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
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

interface Props {
  className?: string;
  onVerMas?: () => void;
  periodoInicial?: string; // 'hoy', 'semana', 'mes'
}

const GraficoCajaLinealCompact: React.FC<Props> = ({ 
  className = "",
  onVerMas,
  periodoInicial = 'ultimos7dias'
}) => {
  // Estado del componente
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);
  const [filtroFechas, setFiltroFechas] = useState<FiltroFechas>(() => {
    const presets = generarPresetsPeriodos();
    const preset = presets.find(p => p.id === periodoInicial) || presets[1];
    return preset.getFechas();
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del API cuando cambien las fechas
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 100); // Reducir debounce para mejor respuesta

    return () => clearTimeout(timer);
  }, [filtroFechas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros: IFiltrosCaja = {
        tipoMovimiento: TipoMovimiento.SALIDA,
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0],
        limit: 50 // Menos datos para vista compacta
      };

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      setDatosOriginales(movimientos);
    } catch (err) {
      console.error('❌ Error cargando datos de caja lineal compacta:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para crear línea temporal
  const datosLineales = useMemo(() => {
    if (datosOriginales.length === 0) {
      return {
        chartData: {
          labels: [],
          datasets: []
        },
        labels: [],
        total: 0,
        cantidadMovimientos: 0
      };
    }

    // Agrupar por fecha con ordenamiento correcto
    const gastosPorFecha: { [fecha: string]: { monto: number; fechaOrden: Date } } = {};
    
    datosOriginales.forEach(movimiento => {
      const fechaObj = new Date(movimiento.fechaCaja);
      const fechaLabel = fechaObj.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      if (!gastosPorFecha[fechaLabel]) {
        gastosPorFecha[fechaLabel] = { monto: 0, fechaOrden: fechaObj };
      }
      gastosPorFecha[fechaLabel].monto += movimiento.monto;
    });

    // Ordenar por fecha cronológicamente
    const entradasOrdenadas = Object.entries(gastosPorFecha)
      .sort(([, a], [, b]) => a.fechaOrden.getTime() - b.fechaOrden.getTime());

    const labels = entradasOrdenadas.map(([fecha]) => fecha);
    const valores = entradasOrdenadas.map(([, data]) => data.monto);
    const total = valores.reduce((sum, val) => sum + val, 0);

    return {
      chartData: {
        labels,
        datasets: [
          {
            label: 'Gastos Diarios',
            data: valores,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1
          }
        ]
      },
      labels,
      total,
      cantidadMovimientos: datosOriginales.length
    };
  }, [datosOriginales]);

  // Cambiar período rápidamente
  const cambiarPeriodo = (presetId: string) => {
    const presets = generarPresetsPeriodos();
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFiltroFechas(preset.getFechas());
    }
  };

  // Configuración del gráfico Chart.js (compacta)
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Sin leyenda para vista compacta
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Gastos: ${formatearSoles(context.raw as number)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: false, // Ocultar eje x para vista más limpia
      },
      y: {
        display: false, // Ocultar eje y para vista más limpia
        beginAtZero: false, // No forzar desde cero para mejor visualización
        ticks: {
          display: false
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 2,
        hoverRadius: 4
      }
    }
  };

  if (loading) {
    return (
      <div className={`${className} bg-white rounded-lg p-4 border border-gray-200`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
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

  const tieneDatos = datosLineales.labels.length > 0 && datosLineales.total > 0;

  return (
    <div className={`${className} bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg`}>
      {/* Header compacto */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📈 <span className="ml-2">Tendencia</span>
            </h3>
            <p className="text-xs text-gray-500">Gastos por período</p>
          </div>
          {onVerMas && (
            <button
              onClick={onVerMas}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver más →
            </button>
          )}
        </div>

        {/* Selector de período */}
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
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
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
        {!tieneDatos ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-1">📈</div>
              <p className="text-sm">Sin datos</p>
              <p className="text-xs mt-1">
                {datosOriginales.length} movimientos encontrados
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Métrica destacada */}
            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatearSoles(datosLineales.total)}
              </p>
              <p className="text-xs text-gray-500">
                Total en {datosLineales.cantidadMovimientos} movimientos
              </p>
            </div>

            {/* Gráfico compacto */}
            <div className="h-24">
              {datosLineales.chartData && (
                <Line data={datosLineales.chartData} options={chartOptions} />
              )}
            </div>

            {/* Estadísticas mini */}
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-500">Promedio</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatearSoles(datosLineales.total / Math.max(datosLineales.labels.length, 1))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Días</p>
                <p className="text-sm font-medium text-gray-900">
                  {datosLineales.labels.length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GraficoCajaLinealCompact;