// Tipos para el gráfico de caja lineal
export enum PeriodoGrafico {
  HOY = 'hoy',
  SEMANA = 'semana',
  MES = 'mes',
  ANUAL = 'anual'
}

export interface DatosGraficoCaja {
  periodo: string; // Etiqueta del período (ej: "Lunes", "15", "Enero")
  fechaCompleta: string; // Fecha completa para ordenamiento
  manoObra: number;
  materiaPrima: number;
  otrosGastos: number;
}

export interface ConfiguracionGrafico {
  periodoSeleccionado?: PeriodoGrafico | string; // Hacer opcional y permitir strings
  fechaInicio?: Date;
  fechaFin?: Date;
  loading: boolean;
  error: string | null;
}

export interface MovimientoCaja {
  _id: string;
  fechaCaja: string;
  monto: number;
  tipoMovimiento: string;
  tipoCosto: string;
  descripcion: string;
  categoria: string;
  metodoPago: string;
}

// Mapas de configuración para los períodos
export const CONFIGURACION_PERIODOS = {
  [PeriodoGrafico.HOY]: {
    label: 'Hoy',
    formatoEje: 'HH:mm',
    unidadAgrupacion: 'hour'
  },
  [PeriodoGrafico.SEMANA]: {
    label: 'Semana',
    formatoEje: 'ddd',
    unidadAgrupacion: 'day'
  },
  [PeriodoGrafico.MES]: {
    label: 'Mes',
    formatoEje: 'DD',
    unidadAgrupacion: 'day'
  },
  [PeriodoGrafico.ANUAL]: {
    label: 'Anual',
    formatoEje: 'MMM',
    unidadAgrupacion: 'month'
  }
} as const;

// Configuración de colores para las líneas
export const COLORES_CATEGORIAS = {
  manoObra: {
    border: 'rgb(239, 68, 68)', // red-500
    background: 'rgba(239, 68, 68, 0.1)',
    label: 'Mano de Obra'
  },
  materiaPrima: {
    border: 'rgb(59, 130, 246)', // blue-500
    background: 'rgba(59, 130, 246, 0.1)',
    label: 'Materia Prima'
  },
  otrosGastos: {
    border: 'rgb(34, 197, 94)', // green-500
    background: 'rgba(34, 197, 94, 0.1)',
    label: 'Otros Gastos'
  }
} as const;

// Tipos específicos para gráfico de distribución
export interface DetalleGasto {
  descripcion: string;
  monto: number;
  cantidad: number; // número de movimientos con esta descripción
  porcentaje: number; // dentro de su categoría
}

// Datos por TipoCosto dentro de una CategoriaCaja
export interface DatosTipoCosto {
  manoObra: number;
  materiaPrima: number;
  otrosGastos: number;
  detalles: {
    manoObra: DetalleGasto[];
    materiaPrima: DetalleGasto[];
    otrosGastos: DetalleGasto[];
  };
}

// Datos por CategoriaCaja (nivel superior)
export interface DatosCategoriaCaja {
  administrativo: number;
  finanzas: number;
  operaciones: number;
  ventas: number;
  desglosePorTipoCosto: {
    administrativo: DatosTipoCosto;
    finanzas: DatosTipoCosto;
    operaciones: DatosTipoCosto;
    ventas: DatosTipoCosto;
  };
}

export interface DatosDistribucionGastos {
  // Modo de vista actual
  modoVista: 'categoria' | 'tipoCosto';
  
  // Datos del nivel superior (CategoriaCaja)
  porCategoriaCaja: DatosCategoriaCaja;
  
  // Datos del nivel medio (TipoCosto) - vista tradicional
  categorias: {
    manoObra: number;
    materiaPrima: number;
    otrosGastos: number;
  };
  detallesPorCategoria: {
    manoObra: DetalleGasto[];
    materiaPrima: DetalleGasto[];
    otrosGastos: DetalleGasto[];
  };
  
  // Totales y porcentajes
  totales: {
    totalGastos: number;
    cantidadMovimientos: number;
  };
  porcentajes: {
    manoObra: number;
    materiaPrima: number;
    otrosGastos: number;
  };
  porcentajesCategoriaCaja: {
    administrativo: number;
    finanzas: number;
    operaciones: number;
    ventas: number;
  };
}

export interface ConfiguracionDistribucion {
  mostrarPorcentajes: boolean;
  mostrarLeyenda: boolean;
  mostrarDetalles: boolean; // nueva opción para mostrar/ocultar detalles
  modoVista: 'categoria' | 'tipoCosto'; // toggle entre vista por CategoriaCaja o TipoCosto
  categoriaExpandida: 'manoObra' | 'materiaPrima' | 'otrosGastos' | null; // qué categoría está expandida (modo tipoCosto)
  categoriaCajaExpandida: 'administrativo' | 'finanzas' | 'operaciones' | 'ventas' | null; // qué categoría está expandida (modo categoria)
  tipoGrafico: 'pie' | 'doughnut';
  loading: boolean;
  error: string | null;
}

// Configuración de colores para distribución (coherente con gráfico lineal)
export const COLORES_DISTRIBUCION = {
  manoObra: {
    background: 'rgba(239, 68, 68, 0.8)', // red-500 con alpha
    border: 'rgb(239, 68, 68)',
    hover: 'rgba(239, 68, 68, 0.9)'
  },
  materiaPrima: {
    background: 'rgba(59, 130, 246, 0.8)', // blue-500 con alpha
    border: 'rgb(59, 130, 246)',
    hover: 'rgba(59, 130, 246, 0.9)'
  },
  otrosGastos: {
    background: 'rgba(34, 197, 94, 0.8)', // green-500 con alpha
    border: 'rgb(34, 197, 94)',
    hover: 'rgba(34, 197, 94, 0.9)'
  }
} as const;

// Configuración de colores para CategoriaCaja (nivel superior)
export const COLORES_CATEGORIA_CAJA = {
  administrativo: {
    background: 'rgba(168, 85, 247, 0.8)', // purple-500
    border: 'rgb(168, 85, 247)',
    hover: 'rgba(168, 85, 247, 0.9)',
    label: 'Administrativo',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-500'
  },
  finanzas: {
    background: 'rgba(34, 197, 94, 0.8)', // green-500
    border: 'rgb(34, 197, 94)',
    hover: 'rgba(34, 197, 94, 0.9)',
    label: 'Finanzas',
    bgClass: 'bg-green-50',
    textClass: 'text-green-800',
    borderClass: 'border-green-500'
  },
  operaciones: {
    background: 'rgba(59, 130, 246, 0.8)', // blue-500
    border: 'rgb(59, 130, 246)',
    hover: 'rgba(59, 130, 246, 0.9)',
    label: 'Operaciones',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-500'
  },
  ventas: {
    background: 'rgba(239, 68, 68, 0.8)', // red-500
    border: 'rgb(239, 68, 68)',
    hover: 'rgba(239, 68, 68, 0.9)',
    label: 'Ventas',
    bgClass: 'bg-red-50',
    textClass: 'text-red-800',
    borderClass: 'border-red-500'
  }
} as const;

// Tipos específicos para gráfico de ranking de gastos por descripción
export interface ItemRankingGasto {
  descripcion: string;
  montoTotal: number;
  cantidadMovimientos: number;
  promedioMonto: number;
  porcentaje: number; // del total de gastos
  categoria: string; // CategoriaCaja
  tipoCosto: string; // TipoCosto
  color: string; // color asignado dinámicamente
}

export interface DatosRankingGastos {
  ranking: ItemRankingGasto[];
  totales: {
    totalGastos: number;
    cantidadMovimientos: number;
    cantidadDescripciones: number;
  };
  filtros: {
    descripcion: string; // Descripción del período (ej: "15 sep - 22 sep 2025")
    fechaInicio: string;
    fechaFin: string;
  };
  estadisticas: {
    gastoMayor: ItemRankingGasto | null;
    gastoMenor: ItemRankingGasto | null;
    promedioGeneral: number;
  };
}

export interface ConfiguracionRanking {
  mostrarCantidad: boolean; // mostrar cantidad de movimientos
  mostrarPromedio: boolean; // mostrar promedio por movimiento
  limitarItems: number; // cuántos items mostrar (0 = todos)
  ordenarPor: 'monto' | 'cantidad' | 'promedio'; // criterio de ordenamiento
  direccion: 'desc' | 'asc'; // dirección del ordenamiento
  loading: boolean;
  error: string | null;
}

// Nueva interfaz para filtros de fecha
export interface FiltroFechas {
  fechaInicio: Date;
  fechaFin: Date;
}

// Presets de períodos comunes para facilidad de uso
export interface PresetPeriodo {
  id: string;
  label: string;
  descripcion: string;
  getFechas: () => FiltroFechas;
}

// Función helper para generar presets comunes
export const generarPresetsPeriodos = (): PresetPeriodo[] => {
  const hoy = new Date();
  
  return [
    {
      id: 'hoy',
      label: 'Hoy',
      descripcion: 'Solo los gastos de hoy',
      getFechas: () => {
        const inicio = new Date(hoy);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'ayer',
      label: 'Ayer',
      descripcion: 'Gastos del día anterior',
      getFechas: () => {
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        const inicio = new Date(ayer);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(ayer);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'ultimos7dias',
      label: 'Últimos 7 días',
      descripcion: 'Una semana completa hasta hoy',
      getFechas: () => {
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 6);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'estasemana',
      label: 'Esta semana',
      descripcion: 'Desde el lunes hasta hoy',
      getFechas: () => {
        const inicio = new Date(hoy);
        const diaSemana = inicio.getDay();
        const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
        inicio.setDate(inicio.getDate() - diasHastaLunes);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(hoy);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'estemes',
      label: 'Este mes',
      descripcion: 'Todo el mes actual',
      getFechas: () => {
        const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'mesanterior',
      label: 'Mes anterior',
      descripcion: 'Todo el mes pasado',
      getFechas: () => {
        const mesAnterior = hoy.getMonth() - 1;
        const año = mesAnterior < 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
        const mes = mesAnterior < 0 ? 11 : mesAnterior;
        
        const inicio = new Date(año, mes, 1);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(año, mes + 1, 0);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    },
    {
      id: 'esteano',
      label: 'Este año',
      descripcion: 'Todo el año actual',
      getFechas: () => {
        const inicio = new Date(hoy.getFullYear(), 0, 1);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(hoy.getFullYear(), 11, 31);
        fin.setHours(23, 59, 59, 999);
        return { fechaInicio: inicio, fechaFin: fin };
      }
    }
  ];
};

// Paleta de colores para el ranking (gradiente de intensidad)
export const COLORES_RANKING = [
  'rgba(239, 68, 68, 0.8)',   // rojo fuerte
  'rgba(245, 101, 101, 0.8)', // rojo medio
  'rgba(252, 165, 165, 0.8)', // rojo claro
  'rgba(59, 130, 246, 0.8)',  // azul fuerte
  'rgba(96, 165, 250, 0.8)',  // azul medio
  'rgba(147, 197, 253, 0.8)', // azul claro
  'rgba(34, 197, 94, 0.8)',   // verde fuerte
  'rgba(74, 222, 128, 0.8)',  // verde medio
  'rgba(134, 239, 172, 0.8)', // verde claro
  'rgba(168, 85, 247, 0.8)',  // púrpura fuerte
  'rgba(196, 181, 253, 0.8)', // púrpura medio
  'rgba(221, 214, 254, 0.8)', // púrpura claro
  'rgba(245, 158, 11, 0.8)',  // ámbar fuerte
  'rgba(251, 191, 36, 0.8)',  // ámbar medio
  'rgba(252, 211, 77, 0.8)',  // ámbar claro
] as const;