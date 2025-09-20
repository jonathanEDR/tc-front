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
  DatosDistribucionGastos,
  DetalleGasto,
  DatosTipoCosto,
  ConfiguracionDistribucion,
  COLORES_DISTRIBUCION,
  COLORES_CATEGORIA_CAJA,
  COLORES_CATEGORIAS,
  PeriodoGrafico,
  CONFIGURACION_PERIODOS
} from '../../types/graficos';
import { TipoCosto, CategoriaCaja, IMovimientoCaja, IFiltrosCaja, TipoMovimiento } from '../../types/caja';
import { obtenerMovimientos } from '../../utils/cajaApi';

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

interface Props {
  className?: string;
  periodo?: PeriodoGrafico;
  showPeriodSelector?: boolean;
}

const GraficoDistribucionGastos: React.FC<Props> = ({ 
  className = "", 
  periodo = PeriodoGrafico.SEMANA,
  showPeriodSelector = true 
}) => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionDistribucion>({
    mostrarPorcentajes: true,
    mostrarLeyenda: true,
    mostrarDetalles: true,
    modoVista: 'categoria', // Empezar con vista por CategoriaCaja
    categoriaExpandida: null,
    categoriaCajaExpandida: null,
    tipoGrafico: 'doughnut',
    loading: true,
    error: null
  });

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<PeriodoGrafico>(periodo);
  const [datosOriginales, setDatosOriginales] = useState<IMovimientoCaja[]>([]);

  // Calcular fechas según el período seleccionado
  const fechasPeriodo = useMemo(() => {
    const ahora = new Date();
    let fechaInicio: Date;
    let fechaFin: Date = new Date(ahora);

    switch (periodoSeleccionado) {
      case PeriodoGrafico.HOY:
        fechaInicio = new Date(ahora);
        fechaInicio.setHours(0, 0, 0, 0);
        fechaFin.setHours(23, 59, 59, 999);
        break;

      case PeriodoGrafico.SEMANA:
        // MODIFICADO: Buscar datos de prueba de 2024 
        fechaInicio = new Date('2024-09-15');
        fechaFin = new Date('2024-09-21');
        break;

      case PeriodoGrafico.MES:
        // MODIFICADO: Buscar todo el mes de septiembre 2024
        fechaInicio = new Date('2024-09-01');
        fechaFin = new Date('2024-09-30');
        break;

      case PeriodoGrafico.ANUAL:
        // MODIFICADO: Buscar todo el año 2024
        fechaInicio = new Date('2024-01-01');
        fechaFin = new Date('2024-12-31');
        break;

      default:
        fechaInicio = new Date(ahora);
        fechaInicio.setDate(ahora.getDate() - 7);
    }

    return { fechaInicio, fechaFin };
  }, [periodoSeleccionado]);

  // Cargar datos del API
  useEffect(() => {
    cargarDatos();
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

      const response = await obtenerMovimientos(filtros);
      const movimientos = response.data?.movimientos || [];
      
      setDatosOriginales(movimientos);
    } catch (err) {
      setConfiguracion(prev => ({ 
        ...prev, 
        error: 'Error al cargar los datos del gráfico de distribución' 
      }));
      console.error('Error cargando datos del gráfico de distribución:', err);
    } finally {
      setConfiguracion(prev => ({ ...prev, loading: false }));
    }
  };

  // Procesar datos para calcular distribución jerárquica
  const datosDistribucion = useMemo((): DatosDistribucionGastos => {
    // Estructuras para nivel TipoCosto (vista tradicional)
    const categorias = {
      manoObra: 0,
      materiaPrima: 0,
      otrosGastos: 0
    };

    // Estructuras para nivel CategoriaCaja (vista superior)
    const categoriasSuperiores = {
      administrativo: 0,
      finanzas: 0,
      operaciones: 0,
      ventas: 0
    };

    // Mapas para agrupar por descripción dentro de TipoCosto
    const detallesManoObra = new Map<string, { monto: number; cantidad: number }>();
    const detallesMateriaPrima = new Map<string, { monto: number; cantidad: number }>();
    const detallesOtrosGastos = new Map<string, { monto: number; cantidad: number }>();

    // Mapas para agrupar por CategoriaCaja y luego por TipoCosto
    const desglosePorCategoriaCaja = {
      administrativo: { manoObra: 0, materiaPrima: 0, otrosGastos: 0, detalles: { manoObra: new Map(), materiaPrima: new Map(), otrosGastos: new Map() } },
      finanzas: { manoObra: 0, materiaPrima: 0, otrosGastos: 0, detalles: { manoObra: new Map(), materiaPrima: new Map(), otrosGastos: new Map() } },
      operaciones: { manoObra: 0, materiaPrima: 0, otrosGastos: 0, detalles: { manoObra: new Map(), materiaPrima: new Map(), otrosGastos: new Map() } },
      ventas: { manoObra: 0, materiaPrima: 0, otrosGastos: 0, detalles: { manoObra: new Map(), materiaPrima: new Map(), otrosGastos: new Map() } }
    };

    datosOriginales.forEach((movimiento) => {
      const monto = movimiento.monto || 0;
      const descripcion = movimiento.descripcion || 'Sin descripción';
      const tipoCostoLimpio = String(movimiento.tipoCosto).toLowerCase().trim();
      const categoriaLimpia = String(movimiento.categoria).toLowerCase().trim();

      // Función helper para agregar a un mapa de detalles
      const agregarDetalle = (mapa: Map<string, { monto: number; cantidad: number }>) => {
        const existing = mapa.get(descripcion) || { monto: 0, cantidad: 0 };
        mapa.set(descripcion, {
          monto: existing.monto + monto,
          cantidad: existing.cantidad + 1
        });
      };

      // Procesar por TipoCosto (nivel tradicional)
      switch (tipoCostoLimpio) {
        case TipoCosto.MANO_OBRA:
        case 'mano_obra':
          categorias.manoObra += monto;
          agregarDetalle(detallesManoObra);
          break;
        case TipoCosto.MATERIA_PRIMA:
        case 'materia_prima':
          categorias.materiaPrima += monto;
          agregarDetalle(detallesMateriaPrima);
          break;
        case TipoCosto.OTROS_GASTOS:
        case 'otros_gastos':
          categorias.otrosGastos += monto;
          agregarDetalle(detallesOtrosGastos);
          break;
      }

      // Procesar por CategoriaCaja (nivel superior)
      let categoriaKey: keyof typeof categoriasSuperiores | null = null;
      switch (categoriaLimpia) {
        case CategoriaCaja.ADMINISTRATIVO:
        case 'administrativo':
          categoriaKey = 'administrativo';
          categoriasSuperiores.administrativo += monto;
          break;
        case CategoriaCaja.FINANZAS:
        case 'finanzas':
          categoriaKey = 'finanzas';
          categoriasSuperiores.finanzas += monto;
          break;
        case CategoriaCaja.OPERACIONES:
        case 'operaciones':
          categoriaKey = 'operaciones';
          categoriasSuperiores.operaciones += monto;
          break;
        case CategoriaCaja.VENTAS:
        case 'ventas':
          categoriaKey = 'ventas';
          categoriasSuperiores.ventas += monto;
          break;
      }

      // Si tenemos categoría válida, también procesar el desglose por TipoCosto dentro de esa categoría
      if (categoriaKey) {
        const categoria = desglosePorCategoriaCaja[categoriaKey];
        switch (tipoCostoLimpio) {
          case TipoCosto.MANO_OBRA:
          case 'mano_obra':
            categoria.manoObra += monto;
            agregarDetalle(categoria.detalles.manoObra);
            break;
          case TipoCosto.MATERIA_PRIMA:
          case 'materia_prima':
            categoria.materiaPrima += monto;
            agregarDetalle(categoria.detalles.materiaPrima);
            break;
          case TipoCosto.OTROS_GASTOS:
          case 'otros_gastos':
            categoria.otrosGastos += monto;
            agregarDetalle(categoria.detalles.otrosGastos);
            break;
        }
      }
    });

    const totalGastos = categorias.manoObra + categorias.materiaPrima + categorias.otrosGastos;
    
    // Calcular porcentajes por TipoCosto
    const porcentajes = {
      manoObra: totalGastos > 0 ? (categorias.manoObra / totalGastos) * 100 : 0,
      materiaPrima: totalGastos > 0 ? (categorias.materiaPrima / totalGastos) * 100 : 0,
      otrosGastos: totalGastos > 0 ? (categorias.otrosGastos / totalGastos) * 100 : 0
    };

    // Calcular porcentajes por CategoriaCaja
    const porcentajesCategoriaCaja = {
      administrativo: totalGastos > 0 ? (categoriasSuperiores.administrativo / totalGastos) * 100 : 0,
      finanzas: totalGastos > 0 ? (categoriasSuperiores.finanzas / totalGastos) * 100 : 0,
      operaciones: totalGastos > 0 ? (categoriasSuperiores.operaciones / totalGastos) * 100 : 0,
      ventas: totalGastos > 0 ? (categoriasSuperiores.ventas / totalGastos) * 100 : 0
    };

    // Convertir mapas a arrays de DetalleGasto
    const convertirDetalles = (
      mapa: Map<string, { monto: number; cantidad: number }>, 
      totalCategoria: number
    ): DetalleGasto[] => {
      return Array.from(mapa.entries())
        .map(([descripcion, datos]) => ({
          descripcion,
          monto: datos.monto,
          cantidad: datos.cantidad,
          porcentaje: totalCategoria > 0 ? (datos.monto / totalCategoria) * 100 : 0
        }))
        .sort((a, b) => b.monto - a.monto);
    };

    // Convertir desglose por CategoriaCaja
    const convertirDatosTipoCosto = (datos: typeof desglosePorCategoriaCaja.administrativo): DatosTipoCosto => ({
      manoObra: datos.manoObra,
      materiaPrima: datos.materiaPrima,
      otrosGastos: datos.otrosGastos,
      detalles: {
        manoObra: convertirDetalles(datos.detalles.manoObra, datos.manoObra),
        materiaPrima: convertirDetalles(datos.detalles.materiaPrima, datos.materiaPrima),
        otrosGastos: convertirDetalles(datos.detalles.otrosGastos, datos.otrosGastos)
      }
    });

    const detallesPorCategoria = {
      manoObra: convertirDetalles(detallesManoObra, categorias.manoObra),
      materiaPrima: convertirDetalles(detallesMateriaPrima, categorias.materiaPrima),
      otrosGastos: convertirDetalles(detallesOtrosGastos, categorias.otrosGastos)
    };

    const resultado: DatosDistribucionGastos = {
      modoVista: configuracion.modoVista,
      porCategoriaCaja: {
        administrativo: categoriasSuperiores.administrativo,
        finanzas: categoriasSuperiores.finanzas,
        operaciones: categoriasSuperiores.operaciones,
        ventas: categoriasSuperiores.ventas,
        desglosePorTipoCosto: {
          administrativo: convertirDatosTipoCosto(desglosePorCategoriaCaja.administrativo),
          finanzas: convertirDatosTipoCosto(desglosePorCategoriaCaja.finanzas),
          operaciones: convertirDatosTipoCosto(desglosePorCategoriaCaja.operaciones),
          ventas: convertirDatosTipoCosto(desglosePorCategoriaCaja.ventas)
        }
      },
      categorias,
      detallesPorCategoria,
      totales: {
        totalGastos,
        cantidadMovimientos: datosOriginales.length
      },
      porcentajes,
      porcentajesCategoriaCaja
    };

    return resultado;
  }, [datosOriginales, configuracion.modoVista]);

  // Configuración del gráfico Chart.js basada en el modo de vista
  const chartData = configuracion.modoVista === 'categoria' ? {
    labels: [
      COLORES_CATEGORIA_CAJA.administrativo.label,
      COLORES_CATEGORIA_CAJA.finanzas.label,
      COLORES_CATEGORIA_CAJA.operaciones.label,
      COLORES_CATEGORIA_CAJA.ventas.label
    ],
    datasets: [
      {
        data: [
          datosDistribucion.porCategoriaCaja.administrativo,
          datosDistribucion.porCategoriaCaja.finanzas,
          datosDistribucion.porCategoriaCaja.operaciones,
          datosDistribucion.porCategoriaCaja.ventas
        ],
        backgroundColor: [
          COLORES_CATEGORIA_CAJA.administrativo.background,
          COLORES_CATEGORIA_CAJA.finanzas.background,
          COLORES_CATEGORIA_CAJA.operaciones.background,
          COLORES_CATEGORIA_CAJA.ventas.background
        ],
        borderColor: [
          COLORES_CATEGORIA_CAJA.administrativo.border,
          COLORES_CATEGORIA_CAJA.finanzas.border,
          COLORES_CATEGORIA_CAJA.operaciones.border,
          COLORES_CATEGORIA_CAJA.ventas.border
        ],
        hoverBackgroundColor: [
          COLORES_CATEGORIA_CAJA.administrativo.hover,
          COLORES_CATEGORIA_CAJA.finanzas.hover,
          COLORES_CATEGORIA_CAJA.operaciones.hover,
          COLORES_CATEGORIA_CAJA.ventas.hover
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  } : {
    labels: [
      COLORES_CATEGORIAS.manoObra.label,
      COLORES_CATEGORIAS.materiaPrima.label,
      COLORES_CATEGORIAS.otrosGastos.label
    ],
    datasets: [
      {
        data: [
          datosDistribucion.categorias.manoObra,
          datosDistribucion.categorias.materiaPrima,
          datosDistribucion.categorias.otrosGastos
        ],
        backgroundColor: [
          COLORES_DISTRIBUCION.manoObra.background,
          COLORES_DISTRIBUCION.materiaPrima.background,
          COLORES_DISTRIBUCION.otrosGastos.background
        ],
        borderColor: [
          COLORES_DISTRIBUCION.manoObra.border,
          COLORES_DISTRIBUCION.materiaPrima.border,
          COLORES_DISTRIBUCION.otrosGastos.border
        ],
        hoverBackgroundColor: [
          COLORES_DISTRIBUCION.manoObra.hover,
          COLORES_DISTRIBUCION.materiaPrima.hover,
          COLORES_DISTRIBUCION.otrosGastos.hover
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: configuracion.mostrarLeyenda,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            let percentage: string;
            
            if (configuracion.modoVista === 'categoria') {
              percentage = datosDistribucion.totales.totalGastos > 0 
                ? ((value / datosDistribucion.totales.totalGastos) * 100).toFixed(1)
                : '0.0';
            } else {
              percentage = datosDistribucion.totales.totalGastos > 0 
                ? ((value / datosDistribucion.totales.totalGastos) * 100).toFixed(1)
                : '0.0';
            }
            
            return `${context.label}: ${formatearSoles(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: configuracion.tipoGrafico === 'doughnut' ? '60%' : '0%',
  };

  // Manejar cambio de período
  const handleCambioPeriodo = (nuevoPeriodo: PeriodoGrafico) => {
    setPeriodoSeleccionado(nuevoPeriodo);
  };

  // Manejar cambio de modo de vista
  const toggleModoVista = () => {
    setConfiguracion(prev => ({
      ...prev,
      modoVista: prev.modoVista === 'categoria' ? 'tipoCosto' : 'categoria',
      categoriaExpandida: null,
      categoriaCajaExpandida: null
    }));
  };

  // Render del componente
  if (configuracion.loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <span className="mt-2 text-gray-600">Cargando distribución...</span>
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
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tienedatos = datosDistribucion.totales.totalGastos > 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Selector de Período */}
      {showPeriodSelector && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              🍰 Distribución de Gastos por Categoría
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleModoVista}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  configuracion.modoVista === 'categoria'
                    ? 'bg-purple-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {configuracion.modoVista === 'categoria' ? '🏢 Por Área Negocio' : '⚙️ Por Tipo Costo'}
              </button>
              <button
                onClick={() => setConfiguracion(prev => ({ ...prev, mostrarDetalles: !prev.mostrarDetalles }))}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  configuracion.mostrarDetalles
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {configuracion.mostrarDetalles ? '📋 Ocultar detalles' : '📋 Mostrar detalles'}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.values(PeriodoGrafico).map((periodoItem) => (
              <button
                key={periodoItem}
                onClick={() => handleCambioPeriodo(periodoItem)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  periodoSeleccionado === periodoItem
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {CONFIGURACION_PERIODOS[periodoItem].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de datos */}
      {tienedatos && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Gastos</p>
              <p className="text-xl font-bold text-gray-800">
                {formatearSoles(datosDistribucion.totales.totalGastos)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Movimientos</p>
              <p className="text-xl font-bold text-gray-800">
                {datosDistribucion.totales.cantidadMovimientos}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Período</p>
              <p className="text-xl font-bold text-gray-800">
                {CONFIGURACION_PERIODOS[periodoSeleccionado].label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {!tienedatos ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🍰</div>
              <p>No hay datos disponibles para el período seleccionado</p>
              <p className="text-xs mt-2">Intenta seleccionar un período diferente</p>
            </div>
          </div>
        ) : (
          <div className="relative h-96">
            <Doughnut data={chartData} options={chartOptions} />
            
            {/* Información central en doughnut */}
            {configuracion.tipoGrafico === 'doughnut' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatearSoles(datosDistribucion.totales.totalGastos)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {datosDistribucion.totales.cantidadMovimientos} movimientos
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estadísticas detalladas con expansión - Vista por CategoriaCaja */}
        {tienedatos && configuracion.modoVista === 'categoria' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Administrativo */}
              <div className={`${COLORES_CATEGORIA_CAJA.administrativo.bgClass} rounded-lg overflow-hidden`}>
                <div 
                  className="p-3 cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => setConfiguracion(prev => ({ 
                    ...prev, 
                    categoriaCajaExpandida: prev.categoriaCajaExpandida === 'administrativo' ? null : 'administrativo' 
                  }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${COLORES_CATEGORIA_CAJA.administrativo.textClass}`}>
                          {COLORES_CATEGORIA_CAJA.administrativo.label}
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          {formatearSoles(datosDistribucion.porCategoriaCaja.administrativo)}
                        </p>
                        <p className="text-xs text-purple-600">
                          {formatearPorcentaje(datosDistribucion.porcentajesCategoriaCaja.administrativo)}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-purple-600 transition-transform ${
                        configuracion.categoriaCajaExpandida === 'administrativo' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {configuracion.categoriaCajaExpandida === 'administrativo' && (
                  <div className="p-3 bg-purple-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>👥 Mano de Obra:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.administrativo.manoObra)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Materia Prima:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.administrativo.materiaPrima)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔧 Otros Gastos:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.administrativo.otrosGastos)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Finanzas */}
              <div className={`${COLORES_CATEGORIA_CAJA.finanzas.bgClass} rounded-lg overflow-hidden`}>
                <div 
                  className="p-3 cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => setConfiguracion(prev => ({ 
                    ...prev, 
                    categoriaCajaExpandida: prev.categoriaCajaExpandida === 'finanzas' ? null : 'finanzas' 
                  }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${COLORES_CATEGORIA_CAJA.finanzas.textClass}`}>
                          {COLORES_CATEGORIA_CAJA.finanzas.label}
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          {formatearSoles(datosDistribucion.porCategoriaCaja.finanzas)}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatearPorcentaje(datosDistribucion.porcentajesCategoriaCaja.finanzas)}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-green-600 transition-transform ${
                        configuracion.categoriaCajaExpandida === 'finanzas' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {configuracion.categoriaCajaExpandida === 'finanzas' && (
                  <div className="p-3 bg-green-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>👥 Mano de Obra:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.finanzas.manoObra)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Materia Prima:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.finanzas.materiaPrima)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔧 Otros Gastos:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.finanzas.otrosGastos)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Operaciones */}
              <div className={`${COLORES_CATEGORIA_CAJA.operaciones.bgClass} rounded-lg overflow-hidden`}>
                <div 
                  className="p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setConfiguracion(prev => ({ 
                    ...prev, 
                    categoriaCajaExpandida: prev.categoriaCajaExpandida === 'operaciones' ? null : 'operaciones' 
                  }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${COLORES_CATEGORIA_CAJA.operaciones.textClass}`}>
                          {COLORES_CATEGORIA_CAJA.operaciones.label}
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          {formatearSoles(datosDistribucion.porCategoriaCaja.operaciones)}
                        </p>
                        <p className="text-xs text-blue-600">
                          {formatearPorcentaje(datosDistribucion.porcentajesCategoriaCaja.operaciones)}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-blue-600 transition-transform ${
                        configuracion.categoriaCajaExpandida === 'operaciones' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {configuracion.categoriaCajaExpandida === 'operaciones' && (
                  <div className="p-3 bg-blue-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>👥 Mano de Obra:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.operaciones.manoObra)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Materia Prima:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.operaciones.materiaPrima)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔧 Otros Gastos:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.operaciones.otrosGastos)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ventas */}
              <div className={`${COLORES_CATEGORIA_CAJA.ventas.bgClass} rounded-lg overflow-hidden`}>
                <div 
                  className="p-3 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => setConfiguracion(prev => ({ 
                    ...prev, 
                    categoriaCajaExpandida: prev.categoriaCajaExpandida === 'ventas' ? null : 'ventas' 
                  }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${COLORES_CATEGORIA_CAJA.ventas.textClass}`}>
                          {COLORES_CATEGORIA_CAJA.ventas.label}
                        </p>
                        <p className="text-lg font-bold text-red-900">
                          {formatearSoles(datosDistribucion.porCategoriaCaja.ventas)}
                        </p>
                        <p className="text-xs text-red-600">
                          {formatearPorcentaje(datosDistribucion.porcentajesCategoriaCaja.ventas)}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-red-600 transition-transform ${
                        configuracion.categoriaCajaExpandida === 'ventas' ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {configuracion.categoriaCajaExpandida === 'ventas' && (
                  <div className="p-3 bg-red-50">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>👥 Mano de Obra:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.ventas.manoObra)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📦 Materia Prima:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.ventas.materiaPrima)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔧 Otros Gastos:</span>
                        <span className="font-semibold">{formatearSoles(datosDistribucion.porCategoriaCaja.desglosePorTipoCosto.ventas.otrosGastos)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas detalladas con expansión - Vista por TipoCosto (vista original) */}
        {tienedatos && configuracion.modoVista === 'tipoCosto' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{/* Contenido de la vista original por TipoCosto */}</div>
          </div>
        )}

        {/* Tabla resumen completo (opcional - toggle) */}
        {tienedatos && configuracion.mostrarDetalles && (
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  📋 Resumen Completo por Descripción
                </h4>
                <button
                  onClick={() => setConfiguracion(prev => ({ ...prev, mostrarDetalles: !prev.mostrarDetalles }))}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Ocultar detalles
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Mano de Obra */}
                {datosDistribucion.detallesPorCategoria.manoObra.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Mano de Obra ({datosDistribucion.detallesPorCategoria.manoObra.length})
                    </h5>
                    <div className="space-y-2">
                      {datosDistribucion.detallesPorCategoria.manoObra.map((detalle, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-red-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <p className="text-sm font-medium text-gray-800">{detalle.descripcion}</p>
                              <p className="text-xs text-gray-500">{detalle.cantidad} mov.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{formatearSoles(detalle.monto)}</p>
                              <p className="text-xs text-red-600">{formatearPorcentaje(detalle.porcentaje)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Columna Materia Prima */}
                {datosDistribucion.detallesPorCategoria.materiaPrima.length > 0 && (
                  <div>
                    <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Materia Prima ({datosDistribucion.detallesPorCategoria.materiaPrima.length})
                    </h5>
                    <div className="space-y-2">
                      {datosDistribucion.detallesPorCategoria.materiaPrima.map((detalle, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <p className="text-sm font-medium text-gray-800">{detalle.descripcion}</p>
                              <p className="text-xs text-gray-500">{detalle.cantidad} mov.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{formatearSoles(detalle.monto)}</p>
                              <p className="text-xs text-blue-600">{formatearPorcentaje(detalle.porcentaje)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Columna Otros Gastos */}
                {datosDistribucion.detallesPorCategoria.otrosGastos.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-800 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Otros Gastos ({datosDistribucion.detallesPorCategoria.otrosGastos.length})
                    </h5>
                    <div className="space-y-2">
                      {datosDistribucion.detallesPorCategoria.otrosGastos.map((detalle, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-green-500">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <p className="text-sm font-medium text-gray-800">{detalle.descripcion}</p>
                              <p className="text-xs text-gray-500">{detalle.cantidad} mov.</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{formatearSoles(detalle.monto)}</p>
                              <p className="text-xs text-green-600">{formatearPorcentaje(detalle.porcentaje)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraficoDistribucionGastos;