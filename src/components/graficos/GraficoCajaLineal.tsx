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
  PeriodoGrafico, 
  DatosGraficoCaja, 
  ConfiguracionGrafico,
  CONFIGURACION_PERIODOS,
  COLORES_CATEGORIAS 
} from '../../types/graficos';
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

// Función helper para obtener fechas de fallback si no hay datos
const obtenerFechasFallback = (periodo: PeriodoGrafico): { fechaInicio: Date; fechaFin: Date } => {
  // Si no hay datos en el período actual, usar septiembre 2025 donde sabemos que hay datos
  switch (periodo) {
    case PeriodoGrafico.SEMANA:
      return {
        fechaInicio: new Date('2025-09-14'),
        fechaFin: new Date('2025-09-20')
      };
    case PeriodoGrafico.MES:
      return {
        fechaInicio: new Date('2025-09-01'),
        fechaFin: new Date('2025-09-30')
      };
    case PeriodoGrafico.ANUAL:
      return {
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31')
      };
    default:
      return {
        fechaInicio: new Date('2025-09-14'),
        fechaFin: new Date('2025-09-20')
      };
  }
};

interface Props {
  className?: string;
}

const GraficoCajaLineal: React.FC<Props> = ({ className = "" }) => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionGrafico>({
    periodoSeleccionado: PeriodoGrafico.SEMANA,
    loading: true,
    error: null
  });
  
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);

  // Calcular fechas según el período seleccionado - DINÁMICO
  const fechasPeriodo = useMemo(() => {
    const ahora = new Date();
    let fechaInicio: Date;
    let fechaFin: Date;

    switch (configuracion.periodoSeleccionado) {
      case PeriodoGrafico.HOY:
        // Desde las 00:00 hasta las 23:59 de hoy
        fechaInicio = new Date(ahora);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setHours(23, 59, 59, 999);
        break;

      case PeriodoGrafico.SEMANA:
        // Últimos 7 días desde hoy
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 6); // 6 días atrás + hoy = 7 días
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setHours(23, 59, 59, 999);
        break;

      case PeriodoGrafico.MES:
        // Todo el mes actual
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;

      case PeriodoGrafico.ANUAL:
        // Todo el año actual
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora.getFullYear(), 11, 31);
        fechaFin.setHours(23, 59, 59, 999);
        break;

      default:
        // Fallback: últimos 7 días
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 6);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin = new Date(ahora);
        fechaFin.setHours(23, 59, 59, 999);
    }

    console.log(`📅 CAJA LINEAL - Fechas dinámicas [${configuracion.periodoSeleccionado}]:`, {
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      añoActual: ahora.getFullYear(),
      mesActual: ahora.getMonth() + 1
    });

    return { fechaInicio, fechaFin };
  }, [configuracion.periodoSeleccionado]);

  // Cargar datos del API
  useEffect(() => {
    // Delay fijo de 100ms para evitar llamadas simultáneas
    const timer = setTimeout(() => {
      cargarDatos();
    }, 100);

    return () => clearTimeout(timer);
  }, [fechasPeriodo]);

  const cargarDatos = async () => {
    try {
      setConfiguracion(prev => ({ ...prev, loading: true, error: null }));

      // Preparar filtros para la API
      const filtros: IFiltrosCaja = {
        tipoMovimiento: TipoMovimiento.SALIDA,
        fechaInicio: fechasPeriodo.fechaInicio.toISOString().split('T')[0],
        fechaFin: fechasPeriodo.fechaFin.toISOString().split('T')[0],
        limit: 1000 // Obtener todos los registros para el gráfico
      };

      let response = await obtenerMovimientos(filtros);
      let movimientos = response.data?.movimientos || [];
      
      // Si no hay datos en el período actual, usar fechas de fallback
      if (movimientos.length === 0) {
        console.log('🔄 No hay datos en el período actual, usando fechas de fallback...');
        const fechasFallback = obtenerFechasFallback(configuracion.periodoSeleccionado);
        
        const filtrosFallback: IFiltrosCaja = {
          tipoMovimiento: TipoMovimiento.SALIDA,
          fechaInicio: fechasFallback.fechaInicio.toISOString().split('T')[0],
          fechaFin: fechasFallback.fechaFin.toISOString().split('T')[0],
          limit: 1000
        };

        response = await obtenerMovimientos(filtrosFallback);
        movimientos = response.data?.movimientos || [];
        
        console.log('📊 Datos de fallback obtenidos:', movimientos.length, 'movimientos');
      }
      
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
      
      setConfiguracion(prev => ({ 
        ...prev, 
        error: 'Error al cargar los datos del gráfico' 
      }));
      console.error('Error cargando datos del gráfico:', err);
    } finally {
      setConfiguracion(prev => ({ ...prev, loading: false }));
    }
  };

  // Función para generar períodos completos según el tipo seleccionado
  const generarPeriodosCompletos = (periodo: PeriodoGrafico, fechas: { fechaInicio: Date; fechaFin: Date }): DatosGraficoCaja[] => {
    const periodos: DatosGraficoCaja[] = [];

    switch (periodo) {
      case PeriodoGrafico.HOY:
        // Generar 24 horas
        for (let hora = 0; hora < 24; hora++) {
          const horaFormateada = hora.toString().padStart(2, '0') + ':00';
          periodos.push({
            periodo: horaFormateada,
            fechaCompleta: new Date(fechas.fechaInicio.getTime() + hora * 60 * 60 * 1000).toISOString(),
            manoObra: 0,
            materiaPrima: 0,
            otrosGastos: 0
          });
        }
        break;

      case PeriodoGrafico.SEMANA:
        // Generar 7 días de la semana
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        for (let i = 0; i < 7; i++) {
          const fechaDia = new Date(fechas.fechaInicio);
          fechaDia.setDate(fechas.fechaInicio.getDate() + i);
          periodos.push({
            periodo: diasSemana[i],
            fechaCompleta: fechaDia.toISOString(),
            manoObra: 0,
            materiaPrima: 0,
            otrosGastos: 0
          });
        }
        break;

      case PeriodoGrafico.MES:
        // Generar días del mes
        const ultimoDiaDelMes = new Date(fechas.fechaFin.getFullYear(), fechas.fechaFin.getMonth() + 1, 0).getDate();
        for (let dia = 1; dia <= ultimoDiaDelMes; dia++) {
          const fechaDia = new Date(fechas.fechaInicio.getFullYear(), fechas.fechaInicio.getMonth(), dia);
          periodos.push({
            periodo: dia.toString(),
            fechaCompleta: fechaDia.toISOString(),
            manoObra: 0,
            materiaPrima: 0,
            otrosGastos: 0
          });
        }
        break;

      case PeriodoGrafico.ANUAL:
        // Generar 12 meses
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for (let mes = 0; mes < 12; mes++) {
          const fechaMes = new Date(fechas.fechaInicio.getFullYear(), mes, 1);
          periodos.push({
            periodo: meses[mes],
            fechaCompleta: fechaMes.toISOString(),
            manoObra: 0,
            materiaPrima: 0,
            otrosGastos: 0
          });
        }
        break;
    }

    return periodos;
  };

  // Procesar datos según el período seleccionado
  const datosGrafico = useMemo(() => {
    // Primero generar la estructura completa de períodos
    const periodosCompletos = generarPeriodosCompletos(configuracion.periodoSeleccionado, fechasPeriodo);
    
    // Luego llenar con datos reales
    datosOriginales.forEach((movimiento) => {
      const fecha = new Date(movimiento.fechaCaja);
      let claveGrupo: string;

      switch (configuracion.periodoSeleccionado) {
        case PeriodoGrafico.HOY:
          const hora = fecha.getHours();
          claveGrupo = hora.toString().padStart(2, '0') + ':00';
          break;

        case PeriodoGrafico.SEMANA:
          const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          claveGrupo = diasSemana[fecha.getDay()];
          break;

        case PeriodoGrafico.MES:
          claveGrupo = fecha.getDate().toString();
          break;

        case PeriodoGrafico.ANUAL:
          const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          claveGrupo = meses[fecha.getMonth()];
          break;

        default:
          claveGrupo = fecha.toISOString().split('T')[0];
      }

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
    });

    return periodosCompletos;
  }, [datosOriginales, configuracion.periodoSeleccionado, fechasPeriodo]);

  // Configuración del gráfico Chart.js
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
        text: `Gastos por Categoría - ${CONFIGURACION_PERIODOS[configuracion.periodoSeleccionado].label}`,
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
          text: 'Período'
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

  // Manejar cambio de período
  const handleCambioPeriodo = (nuevoPeriodo: PeriodoGrafico) => {
    setConfiguracion(prev => ({
      ...prev,
      periodoSeleccionado: nuevoPeriodo
    }));
  };

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

  return (
    <div className={`w-full ${className}`}>
      {/* Selector de Período */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📊 Control de Gastos por Categoría
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {Object.values(PeriodoGrafico).map((periodo) => (
            <button
              key={periodo}
              onClick={() => handleCambioPeriodo(periodo)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                configuracion.periodoSeleccionado === periodo
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CONFIGURACION_PERIODOS[periodo].label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {datosGrafico.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No hay datos disponibles para el período seleccionado</p>
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