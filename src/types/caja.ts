// Enumeraciones
export enum CategoriaCaja {
  FINANZAS = 'finanzas',
  OPERACIONES = 'operaciones',
  VENTAS = 'ventas',
  ADMINISTRATIVO = 'administrativo'
}

// Nuevas categorías específicas para ingresos
export enum CategoriaIngreso {
  VENTA_DIRECTA = 'venta_directa',
  VENTA_OPERACIONES = 'venta_operaciones',
  INGRESOS_FINANCIEROS = 'ingresos_financieros',
  OTROS_INGRESOS = 'otros_ingresos'
}

export enum TipoCosto {
  MANO_OBRA = 'mano_obra',
  MATERIA_PRIMA = 'materia_prima',
  OTROS_GASTOS = 'otros_gastos'
}

export enum TipoMovimiento {
  ENTRADA = 'entrada',
  SALIDA = 'salida'
}

// Nuevos métodos de pago
export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  YAPE = 'yape',
  PLIN = 'plin',
  DEPOSITO = 'deposito',
  CHEQUE = 'cheque',
  TARJETA = 'tarjeta'
}

// Interfaces principales
export interface IMovimientoCaja {
  _id?: string;
  fechaCaja: string; // Fecha principal del movimiento
  monto: number;
  tipoMovimiento: TipoMovimiento;
  descripcion: string;
  // Para salidas
  categoria?: CategoriaCaja;
  tipoCosto?: TipoCosto;
  // Para ingresos
  categoriaIngreso?: CategoriaIngreso;
  // Método de pago (para ambos)
  metodoPago: MetodoPago;
  usuario?: {
    _id: string;
    name: string;
    email: string;
  };
  comprobante?: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFormularioMovimiento {
  fechaCaja: string; // Fecha principal del movimiento
  monto: number | string;
  tipoMovimiento: TipoMovimiento;
  descripcion: string;
  // Para salidas
  categoria?: CategoriaCaja;
  tipoCosto?: TipoCosto;
  // Para ingresos
  categoriaIngreso?: CategoriaIngreso;
  // Método de pago (para ambos)
  metodoPago: MetodoPago;
  comprobante?: string;
  observaciones?: string;
}

export interface IFiltrosCaja {
  fechaInicio?: string;
  fechaFin?: string;
  // Filtros para salidas
  categoria?: CategoriaCaja;
  tipoCosto?: TipoCosto;
  // Filtros para ingresos
  categoriaIngreso?: CategoriaIngreso;
  // Filtros comunes
  metodoPago?: MetodoPago;
  tipoMovimiento?: TipoMovimiento;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IResumenCaja {
  totalEntradas: number;
  totalSalidas: number;
  balance: number;
}

export interface IResponseCaja {
  success: boolean;
  data: {
    movimientos: IMovimientoCaja[];
    total: number;
    page: number;
    totalPages: number;
  };
  resumen: IResumenCaja;
  message?: string;
}

export interface IResponseMovimiento {
  success: boolean;
  data: IMovimientoCaja;
  message?: string;
}

export interface IResumenReporte {
  porCategoria: Array<{
    _id: CategoriaCaja;
    entradas: number;
    salidas: number;
    cantidadMovimientos: number;
  }>;
  porTipoCosto: Array<{
    _id: TipoCosto;
    entradas: number;
    salidas: number;
    cantidadMovimientos: number;
  }>;
}

// Labels para mostrar en UI
export const LABELS_CATEGORIA: Record<CategoriaCaja, string> = {
  [CategoriaCaja.FINANZAS]: 'Finanzas',
  [CategoriaCaja.OPERACIONES]: 'Operaciones',
  [CategoriaCaja.VENTAS]: 'Ventas',
  [CategoriaCaja.ADMINISTRATIVO]: 'Administrativo'
};

export const LABELS_CATEGORIA_INGRESO: Record<CategoriaIngreso, string> = {
  [CategoriaIngreso.VENTA_DIRECTA]: 'Venta Directa',
  [CategoriaIngreso.VENTA_OPERACIONES]: 'Venta de Operaciones',
  [CategoriaIngreso.INGRESOS_FINANCIEROS]: 'Ingresos Financieros',
  [CategoriaIngreso.OTROS_INGRESOS]: 'Otros Ingresos'
};

export const LABELS_TIPO_COSTO: Record<TipoCosto, string> = {
  [TipoCosto.MANO_OBRA]: 'Mano de Obra',
  [TipoCosto.MATERIA_PRIMA]: 'Materia Prima',
  [TipoCosto.OTROS_GASTOS]: 'Otros Gastos'
};

export const LABELS_METODO_PAGO: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: 'Efectivo',
  [MetodoPago.TRANSFERENCIA]: 'Transferencia',
  [MetodoPago.YAPE]: 'Yape',
  [MetodoPago.PLIN]: 'Plin',
  [MetodoPago.DEPOSITO]: 'Depósito',
  [MetodoPago.CHEQUE]: 'Cheque',
  [MetodoPago.TARJETA]: 'Tarjeta'
};

export const LABELS_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  [TipoMovimiento.ENTRADA]: 'Entrada',
  [TipoMovimiento.SALIDA]: 'Salida'
};

// Opciones para selects
export const OPCIONES_CATEGORIA = Object.entries(LABELS_CATEGORIA).map(([value, label]) => ({
  value: value as CategoriaCaja,
  label
}));

export const OPCIONES_CATEGORIA_INGRESO = Object.entries(LABELS_CATEGORIA_INGRESO).map(([value, label]) => ({
  value: value as CategoriaIngreso,
  label
}));

export const OPCIONES_TIPO_COSTO = Object.entries(LABELS_TIPO_COSTO).map(([value, label]) => ({
  value: value as TipoCosto,
  label
}));

export const OPCIONES_METODO_PAGO = Object.entries(LABELS_METODO_PAGO).map(([value, label]) => ({
  value: value as MetodoPago,
  label
}));

export const OPCIONES_TIPO_MOVIMIENTO = Object.entries(LABELS_TIPO_MOVIMIENTO).map(([value, label]) => ({
  value: value as TipoMovimiento,
  label
}));