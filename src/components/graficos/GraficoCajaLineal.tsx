import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  DatosGraficoCaja, 
  ConfiguracionGrafico,
  FiltroFechas,
  COLORES_CATEGORIAS,
  generarPresetsPeriodos
} from '../../types/graficos';
import SelectorFechas from '../common/SelectorFechas';
import { TipoCosto, IMovimientoCaja, IFiltrosCaja, TipoMovimiento } from '../../types/caja';
import { obtenerMovimientos } from '../../utils/cajaApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

// Función para determinar el tipo de agrupación basado en el rango de fechas
const determinarTipoAgrupacion = (fechaInicio: Date, fechaFin: Date): {
  tipo: 'horas' | 'dias' | 'semanas' | 'meses';
  etiqueta: string;
} => {
  const diffTime = fechaFin.getTime() - fechaInicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    return { tipo: 'horas', etiqueta: 'Por Horas' };
  } else if (diffDays <= 31) {
    return { tipo: 'dias', etiqueta: 'Por Días' };
  } else if (diffDays <= 90) {
    return { tipo: 'semanas', etiqueta: 'Por Semanas' };
  } else {
    return { tipo: 'meses', etiqueta: 'Por Meses' };
  }
};

// Función para generar períodos completos según el rango de fechas
const generarPeriodosCompletos = (fechaInicio: Date, fechaFin: Date): DatosGraficoCaja[] => {
  const periodos: DatosGraficoCaja[] = [];
  const { tipo } = determinarTipoAgrupacion(fechaInicio, fechaFin);

  switch (tipo) {
    case 'horas':
      // Generar 24 horas del día
      const fechaBase = new Date(fechaInicio);
      fechaBase.setHours(0, 0, 0, 0);
      
      for (let hora = 0; hora < 24; hora++) {
        const horaFormateada = hora.toString().padStart(2, '0') + ':00';
        const fechaHora = new Date(fechaBase.getTime() + hora * 60 * 60 * 1000);
        
        periodos.push({
          periodo: horaFormateada,
          fechaCompleta: fechaHora.toISOString(),
          manoObra: 0,
          materiaPrima: 0,
          otrosGastos: 0
        });
      }
      break;

    case 'dias':
      // Generar días en el rango
      const fechaActual = new Date(fechaInicio);
      fechaActual.setHours(0, 0, 0, 0);
      
      while (fechaActual <= fechaFin) {
        const dia = fechaActual.getDate();
        const mes = fechaActual.getMonth() + 1;
        const etiquetaDia = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}`;
        
        periodos.push({
          periodo: etiquetaDia,
          fechaCompleta: new Date(fechaActual).toISOString(),
          manoObra: 0,
          materiaPrima: 0,
          otrosGastos: 0
        });
        
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      break;

    case 'semanas':
      // Generar semanas en el rango
      const inicioSemana = new Date(fechaInicio);
      inicioSemana.setHours(0, 0, 0, 0);
      
      // Ajustar al lunes de la semana
      const diaSemana = inicioSemana.getDay();
      const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
      inicioSemana.setDate(inicioSemana.getDate() - diasHastaLunes);
      
      let numeroSemana = 1;
      const fechaSemanaActual = new Date(inicioSemana);
      
      while (fechaSemanaActual <= fechaFin) {
        const inicioSem = new Date(fechaSemanaActual);
        const finSem = new Date(fechaSemanaActual);
        finSem.setDate(finSem.getDate() + 6);
        
        const etiquetaSemana = `Sem ${numeroSemana} (${inicioSem.getDate()}/${inicioSem.getMonth() + 1})`;
        
        periodos.push({
          periodo: etiquetaSemana,
          fechaCompleta: inicioSem.toISOString(),
          manoObra: 0,
          materiaPrima: 0,
          otrosGastos: 0
        });
        
        fechaSemanaActual.setDate(fechaSemanaActual.getDate() + 7);
        numeroSemana++;
      }
      break;

    case 'meses':
      // Generar meses en el rango
      const añoInicio = fechaInicio.getFullYear();
      const mesInicio = fechaInicio.getMonth();
      const añoFin = fechaFin.getFullYear();
      const mesFin = fechaFin.getMonth();
      
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      let añoActual = añoInicio;
      let mesActual = mesInicio;
      
      while (añoActual < añoFin || (añoActual === añoFin && mesActual <= mesFin)) {
        const fechaMes = new Date(añoActual, mesActual, 1);
        const etiquetaMes = `${meses[mesActual]} ${añoActual}`;
        
        periodos.push({
          periodo: etiquetaMes,
          fechaCompleta: fechaMes.toISOString(),
          manoObra: 0,
          materiaPrima: 0,
          otrosGastos: 0
        });
        
        mesActual++;
        if (mesActual > 11) {
          mesActual = 0;
          añoActual++;
        }
      }
      break;
  }

  return periodos;
};

// Función para obtener la clave de agrupación según el tipo
const obtenerClaveAgrupacion = (fecha: Date, tipo: 'horas' | 'dias' | 'semanas' | 'meses'): string => {
  switch (tipo) {
    case 'horas':
      return fecha.getHours().toString().padStart(2, '0') + ':00';
      
    case 'dias':
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}`;
      
    case 'semanas':
      // Encontrar el lunes de la semana
      const fechaSemana = new Date(fecha);
      const diaSemana = fechaSemana.getDay();
      const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
      fechaSemana.setDate(fechaSemana.getDate() - diasHastaLunes);
      
      // Calcular número de semana desde inicio del año
      const inicioAño = new Date(fechaSemana.getFullYear(), 0, 1);
      const diffTime = fechaSemana.getTime() - inicioAño.getTime();
      const numeroSemana = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      return `Sem ${numeroSemana} (${fechaSemana.getDate()}/${fechaSemana.getMonth() + 1})`;
      
    case 'meses':
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      
    default:
      return fecha.toISOString().split('T')[0];
  }
};

interface Props {
  className?: string;
  fechasIniciales?: FiltroFechas;
  showDateSelector?: boolean;
}

const GraficoCajaLineal: React.FC<Props> = ({ 
  className = "",
  fechasIniciales,
  showDateSelector = true
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

  const [configuracion, setConfiguracion] = useState<ConfiguracionGrafico>({
    periodoSeleccionado: 'personalizado', // Ya no usamos el enum
    loading: true,
    error: null
  });

  const [filtroFechas, setFiltroFechas] = useState<FiltroFechas>(fechasDefecto);
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);

  // Log de las fechas seleccionadas para debugging
  React.useEffect(() => {
    console.log(`📅 CAJA LINEAL - Fechas seleccionadas:`, {
      fechaInicio: filtroFechas.fechaInicio.toISOString(),
      fechaFin: filtroFechas.fechaFin.toISOString(),
      diasDiferencia: Math.ceil((filtroFechas.fechaFin.getTime() - filtroFechas.fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      tipoAgrupacion: determinarTipoAgrupacion(filtroFechas.fechaInicio, filtroFechas.fechaFin)
    });
  }, [filtroFechas]);

  // Cargar datos del API cuando cambien las fechas
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 200); // Debounce para evitar múltiples llamadas

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

      console.log('🔍 Cargando datos lineales con filtros:', filtros);

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      
      console.log('📊 Datos lineales obtenidos:', movimientos.length, 'movimientos');
      setDatosOriginales(movimientos);
    } catch (err: any) {
      // Manejo específico del error 429
      if (err.response?.status === 429) {
        setConfiguracion(prev => ({ 
          ...prev, 
          error: 'Demasiadas peticiones. Reintentando en unos segundos...' 
        }));
        
        // Reintentar después de 2 segundos
        setTimeout(() => {
          cargarDatos();
        }, 2000);
        return;
      }
      
      console.error('❌ Error cargando datos del gráfico lineal:', err);
      setConfiguracion(prev => ({ 
        ...prev, 
        error: 'Error al cargar los datos del gráfico' 
      }));
    } finally {
      setConfiguracion(prev => ({ ...prev, loading: false }));
    }
  };

  // Procesar datos según el rango de fechas seleccionado
  const datosGrafico = useMemo(() => {
    // Generar la estructura completa de períodos basada en el rango de fechas
    const periodosCompletos = generarPeriodosCompletos(filtroFechas.fechaInicio, filtroFechas.fechaFin);
    const { tipo } = determinarTipoAgrupacion(filtroFechas.fechaInicio, filtroFechas.fechaFin);
    
    // Llenar con datos reales
    datosOriginales.forEach((movimiento) => {
      const fecha = new Date(movimiento.fechaCaja);
      
      // Verificar que la fecha esté dentro del rango seleccionado
      if (fecha >= filtroFechas.fechaInicio && fecha <= filtroFechas.fechaFin) {
        const claveGrupo = obtenerClaveAgrupacion(fecha, tipo);
        
        // Buscar el período correspondiente y agregar datos
        const periodoEncontrado = periodosCompletos.find(p => p.periodo === claveGrupo);
        
        if (periodoEncontrado) {
          const monto = movimiento.monto || 0;
          const tipoCostoLimpio = String(movimiento.tipoCosto).toLowerCase().trim();
          
          switch (tipoCostoLimpio) {
            case TipoCosto.MANO_OBRA:
            case 'mano_obra':
              periodoEncontrado.manoObra += monto;
              break;
            case TipoCosto.MATERIA_PRIMA:
            case 'materia_prima':
              periodoEncontrado.materiaPrima += monto;
              break;
            case TipoCosto.OTROS_GASTOS:
            case 'otros_gastos':
              periodoEncontrado.otrosGastos += monto;
              break;
            default:
              // tipoCosto no reconocido, se asigna a otros gastos por defecto
              periodoEncontrado.otrosGastos += monto;
          }
        }
      }
    });

    console.log('📊 Datos procesados para gráfico lineal:', {
      totalPeriodos: periodosCompletos.length,
      tipoAgrupacion: tipo,
      totalManoObra: periodosCompletos.reduce((sum, p) => sum + p.manoObra, 0),
      totalMateriaPrima: periodosCompletos.reduce((sum, p) => sum + p.materiaPrima, 0),
      totalOtrosGastos: periodosCompletos.reduce((sum, p) => sum + p.otrosGastos, 0)
    });

    return periodosCompletos;
  }, [datosOriginales, filtroFechas]);

  // Configuración del gráfico Chart.js
  const tipoAgrupacion = determinarTipoAgrupacion(filtroFechas.fechaInicio, filtroFechas.fechaFin);
  
  const chartData = {
    labels: datosGrafico.map(d => d.periodo),
    datasets: [
      {
        label: COLORES_CATEGORIAS.manoObra.label,
        data: datosGrafico.map(d => d.manoObra),
        borderColor: COLORES_CATEGORIAS.manoObra.border,
        backgroundColor: COLORES_CATEGORIAS.manoObra.background,
        tension: 0.1,
        fill: false,
      },
      {
        label: COLORES_CATEGORIAS.materiaPrima.label,
        data: datosGrafico.map(d => d.materiaPrima),
        borderColor: COLORES_CATEGORIAS.materiaPrima.border,
        backgroundColor: COLORES_CATEGORIAS.materiaPrima.background,
        tension: 0.1,
        fill: false,
      },
      {
        label: COLORES_CATEGORIAS.otrosGastos.label,
        data: datosGrafico.map(d => d.otrosGastos),
        borderColor: COLORES_CATEGORIAS.otrosGastos.border,
        backgroundColor: COLORES_CATEGORIAS.otrosGastos.background,
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Gastos por Categoría - ${tipoAgrupacion.etiqueta} (${obtenerDescripcionPeriodo(filtroFechas.fechaInicio, filtroFechas.fechaFin)})`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatearSoles(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: tipoAgrupacion.etiqueta
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Soles (S/)'
        },
        ticks: {
          callback: function(value) {
            return formatearSoles(Number(value));
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Manejar cambio de fechas
  const handleCambioFechas = (nuevasFechas: FiltroFechas) => {
    setFiltroFechas(nuevasFechas);
  };

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    const totalManoObra = datosGrafico.reduce((sum, p) => sum + p.manoObra, 0);
    const totalMateriaPrima = datosGrafico.reduce((sum, p) => sum + p.materiaPrima, 0);
    const totalOtrosGastos = datosGrafico.reduce((sum, p) => sum + p.otrosGastos, 0);
    const totalGeneral = totalManoObra + totalMateriaPrima + totalOtrosGastos;
    
    return {
      totalManoObra,
      totalMateriaPrima,
      totalOtrosGastos,
      totalGeneral,
      promedioManoObra: datosGrafico.length > 0 ? totalManoObra / datosGrafico.length : 0,
      promedioMateriaPrima: datosGrafico.length > 0 ? totalMateriaPrima / datosGrafico.length : 0,
      promedioOtrosGastos: datosGrafico.length > 0 ? totalOtrosGastos / datosGrafico.length : 0
    };
  }, [datosGrafico]);

  // Render del componente
  if (configuracion.loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <span className="mt-2 text-gray-600">Cargando gráfico...</span>
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

  const tieneDatos = datosGrafico.some(d => d.manoObra > 0 || d.materiaPrima > 0 || d.otrosGastos > 0);

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

      {/* Información de agrupación */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            📊 Gastos por Categoría - {tipoAgrupacion.etiqueta}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">{datosGrafico.length}</span> períodos
            </div>
            <div>
              <span className="font-medium">{obtenerDescripcionPeriodo(filtroFechas.fechaInicio, filtroFechas.fechaFin)}</span>
            </div>
          </div>
        </div>
        
        {/* Estadísticas resumen */}
        {tieneDatos && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-800">Mano de Obra</div>
              <div className="text-lg font-bold text-red-700">
                {formatearSoles(estadisticas.totalManoObra)}
              </div>
              <div className="text-xs text-red-600">
                Promedio: {formatearSoles(estadisticas.promedioManoObra)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Materia Prima</div>
              <div className="text-lg font-bold text-blue-700">
                {formatearSoles(estadisticas.totalMateriaPrima)}
              </div>
              <div className="text-xs text-blue-600">
                Promedio: {formatearSoles(estadisticas.promedioMateriaPrima)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800">Otros Gastos</div>
              <div className="text-lg font-bold text-green-700">
                {formatearSoles(estadisticas.totalOtrosGastos)}
              </div>
              <div className="text-xs text-green-600">
                Promedio: {formatearSoles(estadisticas.promedioOtrosGastos)}
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-800">Total General</div>
              <div className="text-lg font-bold text-gray-700">
                {formatearSoles(estadisticas.totalGeneral)}
              </div>
              <div className="text-xs text-gray-600">
                {datosOriginales.length} movimientos
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {!tieneDatos ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-lg font-medium">No hay datos para mostrar</p>
              <p className="text-sm">Intenta seleccionar un rango de fechas diferente</p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default GraficoCajaLineal;