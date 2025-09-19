// Enumeraciones para el catálogo de gastos
export enum CategoriaGasto {
  MANO_OBRA = 'mano_obra',
  MATERIA_PRIMA = 'materia_prima',
  OTROS_GASTOS = 'otros_gastos'
}

export enum TipoGasto {
  FIJO = 'fijo',           // Gastos que se repiten mensualmente
  VARIABLE = 'variable',    // Gastos que varían según la operación
  OCASIONAL = 'ocasional'   // Gastos esporádicos
}

export enum EstadoGasto {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  ARCHIVADO = 'archivado'
}

// Importar TipoCosto de caja para evitar duplicación
import { TipoCosto } from './caja';

// Re-exportar para uso en herramientas
export { TipoCosto };

// Interfaces principales
export interface ICatalogoGasto {
  _id?: string;
  nombre: string;
  descripcion?: string;
  categoriaGasto: CategoriaGasto;
  tipoGasto: TipoGasto;
  montoEstimado?: number;
  estado: EstadoGasto;
  observaciones?: string;
  etiquetas?: string[];
  creadoPor?: {
    _id: string;
    clerkId: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
  montoEstimadoFormateado?: string;
}

export interface IFormularioCatalogoGasto {
  nombre: string;
  descripcion?: string;
  categoriaGasto: CategoriaGasto;
  tipoGasto: TipoGasto;
  montoEstimado?: number | string;
  estado: EstadoGasto;
  observaciones?: string;
  etiquetas?: string[];
}

export interface IFiltrosCatalogo {
  categoriaGasto?: CategoriaGasto;
  tipoGasto?: TipoGasto;
  tipoCosto?: TipoCosto;
  estado?: EstadoGasto;
  search?: string;
  etiqueta?: string;
  montoMin?: number;
  montoMax?: number;
  page?: number;
  limit?: number;
}

export interface IResponseCatalogo {
  success: boolean;
  data: {
    gastos: ICatalogoGasto[];
    total: number;
    page: number;
    totalPages: number;
  };
  message?: string;
}

export interface IResponseGasto {
  success: boolean;
  data: ICatalogoGasto;
  message?: string;
}

export interface IResumenCatalogo {
  totalGastos: number;
  gastosPorCategoria: Array<{
    categoriaGasto: CategoriaGasto;
    cantidad: number;
    montoEstimadoTotal: number;
  }>;
  gastosPorTipo: Array<{
    tipo: TipoGasto;
    cantidad: number;
    montoEstimadoTotal: number;
  }>;
}

// Labels para mostrar en UI
export const LABELS_CATEGORIA_GASTO: Record<CategoriaGasto, string> = {
  [CategoriaGasto.MANO_OBRA]: 'Mano de Obra',
  [CategoriaGasto.MATERIA_PRIMA]: 'Materia Prima',
  [CategoriaGasto.OTROS_GASTOS]: 'Otros Gastos'
};

export const LABELS_TIPO_GASTO: Record<TipoGasto, string> = {
  [TipoGasto.FIJO]: 'Fijo',
  [TipoGasto.VARIABLE]: 'Variable',
  [TipoGasto.OCASIONAL]: 'Ocasional'
};

export const LABELS_ESTADO_GASTO: Record<EstadoGasto, string> = {
  [EstadoGasto.ACTIVO]: 'Activo',
  [EstadoGasto.INACTIVO]: 'Inactivo',
  [EstadoGasto.ARCHIVADO]: 'Archivado'
};

// Opciones para selects
export const OPCIONES_CATEGORIA_GASTO = Object.entries(LABELS_CATEGORIA_GASTO).map(([value, label]) => ({
  value: value as CategoriaGasto,
  label
}));

export const OPCIONES_TIPO_GASTO = Object.entries(LABELS_TIPO_GASTO).map(([value, label]) => ({
  value: value as TipoGasto,
  label
}));

export const OPCIONES_ESTADO_GASTO = Object.entries(LABELS_ESTADO_GASTO).map(([value, label]) => ({
  value: value as EstadoGasto,
  label
}));

// Colores para estados (para usar en badges/chips)
export const COLORES_ESTADO_GASTO: Record<EstadoGasto, string> = {
  [EstadoGasto.ACTIVO]: 'bg-green-100 text-green-800',
  [EstadoGasto.INACTIVO]: 'bg-yellow-100 text-yellow-800',
  [EstadoGasto.ARCHIVADO]: 'bg-gray-100 text-gray-800'
};

// Colores para categorías
export const COLORES_CATEGORIA_GASTO: Record<CategoriaGasto, string> = {
  [CategoriaGasto.MANO_OBRA]: 'bg-blue-100 text-blue-800',
  [CategoriaGasto.MATERIA_PRIMA]: 'bg-green-100 text-green-800',
  [CategoriaGasto.OTROS_GASTOS]: 'bg-purple-100 text-purple-800'
};

// Colores para tipos de gasto
export const COLORES_TIPO_GASTO: Record<TipoGasto, string> = {
  [TipoGasto.FIJO]: 'bg-red-100 text-red-800',
  [TipoGasto.VARIABLE]: 'bg-yellow-100 text-yellow-800',
  [TipoGasto.OCASIONAL]: 'bg-green-100 text-green-800'
};

// Validaciones de formulario
export interface IErroresCatalogo {
  nombre?: string;
  descripcion?: string;
  categoriaGasto?: string;
  tipoGasto?: string;
  montoEstimado?: string;
  estado?: string;
  observaciones?: string;
  etiquetas?: string;
}

// Constantes útiles
export const MONTO_MAXIMO_ESTIMADO = 999999999;
export const LONGITUD_MAXIMA_NOMBRE = 100;
export const LONGITUD_MAXIMA_DESCRIPCION = 500;
export const LONGITUD_MAXIMA_OBSERVACIONES = 1000;
export const LONGITUD_MAXIMA_ETIQUETA = 50;
export const MAXIMO_ETIQUETAS = 10;