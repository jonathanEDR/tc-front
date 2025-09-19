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
  periodoSeleccionado: PeriodoGrafico;
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