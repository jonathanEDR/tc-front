import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  FiltroFechas,
  generarPresetsPeriodos
} from '../../../types/graficos';
import { IMovimientoCaja, TipoMovimiento, IFiltrosCaja } from '../../../types/caja';
import { obtenerMovimientos } from '../../../utils/cajaApi';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Función helper para formatear soles peruanos
const formatearSoles = (monto: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto);
};

// Función helper para formatear porcentajes
const formatearPorcentaje = (porcentaje: number): string => {
  return `${porcentaje.toFixed(1)}%`;
};

// Colores para las categorías
const COLORES_CATEGORIA = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

interface Props {
  className?: string;
  onVerMas?: () => void;
  periodoInicial?: string; // 'hoy', 'semana', 'mes'
}

const GraficoDistribucionGastosCompact: React.FC<Props> = ({ 
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
    }, 300);

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
        limit: 100 // Menos datos para vista compacta
      };

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      setDatosOriginales(movimientos);
    } catch (err) {
      console.error('❌ Error cargando datos de distribución compacta:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para crear distribución simplificada
  const datosDistribucion = useMemo(() => {
    if (datosOriginales.length === 0) {
      return {
        categorias: {},
        labels: [],
        valores: [],
        colores: [],
        total: 0,
        cantidadMovimientos: 0
      };
    }

    // Agrupar por categoria
    const categoriasMap: { [key: string]: number } = {};
    
    datosOriginales.forEach(movimiento => {
      const categoria = movimiento.categoria || 'Sin categoría';
      categoriasMap[categoria] = (categoriasMap[categoria] || 0) + movimiento.monto;
    });

    const labels = Object.keys(categoriasMap);
    const valores = Object.values(categoriasMap);
    const colores = labels.map((_, index) => COLORES_CATEGORIA[index % COLORES_CATEGORIA.length]);
    const total = valores.reduce((sum, val) => sum + val, 0);

    return {
      categorias: categoriasMap,
      labels,
      valores,
      colores,
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
  const chartData = {
    labels: datosDistribucion.labels,
    datasets: [
      {
        data: datosDistribucion.valores,
        backgroundColor: datosDistribucion.colores,
        borderWidth: 0
      }
    ]
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Sin leyenda para vista compacta
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${formatearSoles(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%' // Más espacio en el centro
  };

  if (loading) {
    return (
      <div className={`${className} bg-white rounded-lg p-4 border border-gray-200`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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

  const tieneDatos = datosDistribucion.total > 0;

  return (
    <div className={`${className} bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg`}>
      {/* Header compacto */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              🍰 <span className="ml-2">Distribución</span>
            </h3>
            <p className="text-xs text-gray-500">Por categoría</p>
          </div>
          {onVerMas && (
            <button
              onClick={onVerMas}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
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
                    ? 'bg-green-100 text-green-700 border border-green-300' 
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
              <div className="text-2xl mb-1">🍰</div>
              <p className="text-sm">Sin datos</p>
            </div>
          </div>
        ) : (
          <>
            {/* Métrica destacada */}
            <div className="mb-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatearSoles(datosDistribucion.total)}
              </p>
              <p className="text-xs text-gray-500">
                Total en {datosDistribucion.cantidadMovimientos} movimientos
              </p>
            </div>

            {/* Gráfico compacto */}
            <div className="h-32 mb-3 relative">
              <Doughnut data={chartData} options={chartOptions} />
              
              {/* Total en el centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-bold text-gray-700">
                    S/ {(datosDistribucion.total / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen por categorías */}
            <div className="space-y-1">
              {datosDistribucion.labels.slice(0, 4).map((categoria, index) => {
                const valor = datosDistribucion.valores[index];
                const color = datosDistribucion.colores[index];
                const porcentaje = datosDistribucion.total > 0 ? (valor / datosDistribucion.total) * 100 : 0;
                
                return (
                  <div key={categoria} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      ></div>
                      {categoria}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatearPorcentaje(porcentaje)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GraficoDistribucionGastosCompact;