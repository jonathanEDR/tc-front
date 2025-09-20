import { z } from 'zod';
import { TipoMovimiento, CategoriaCaja, CategoriaIngreso, TipoCosto, MetodoPago } from '../types/caja';

// Validaciones comunes
const montoSchema = z
  .number({
    required_error: 'El monto es obligatorio',
    invalid_type_error: 'El monto debe ser un número',
  })
  .positive('El monto debe ser mayor a 0')
  .max(999999999, 'El monto no puede exceder 999,999,999')
  .finite('El monto debe ser un número válido');

const descripcionSchema = z
  .string({
    required_error: 'La descripción es obligatoria',
  })
  .min(5, 'La descripción debe tener al menos 5 caracteres')
  .max(200, 'La descripción no puede exceder 200 caracteres')
  .trim()
  // Validación contra XSS básico
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:|onload|onerror/i.test(val),
    'La descripción contiene contenido no permitido'
  )
  // Validación contra caracteres especiales maliciosos
  .refine(
    (val) => !/[<>{}'"]/g.test(val),
    'La descripción no puede contener caracteres especiales: < > { } \' "'
  );

const fechaCajaSchema = z
  .string({
    required_error: 'La fecha es obligatoria',
  })
  .refine((val) => !isNaN(Date.parse(val)), 'Fecha inválida')
  .refine((val) => {
    const fecha = new Date(val);
    const hoy = new Date();
    const dosAñosAtras = new Date();
    const unAñoAdelante = new Date();

    dosAñosAtras.setFullYear(hoy.getFullYear() - 2);
    unAñoAdelante.setFullYear(hoy.getFullYear() + 1);

    return fecha >= dosAñosAtras && fecha <= unAñoAdelante;
  }, 'La fecha debe estar entre 2 años atrás y 1 año adelante');

const comprobanteSchema = z
  .string()
  .max(50, 'El comprobante no puede exceder 50 caracteres')
  .trim()
  .optional()
  .or(z.literal(''));

const observacionesSchema = z
  .string()
  .max(500, 'Las observaciones no pueden exceder 500 caracteres')
  .trim()
  .optional()
  .or(z.literal(''));

// Schema base común para movimientos
const baseMovimientoSchema = z.object({
  fechaCaja: fechaCajaSchema,
  monto: montoSchema,
  descripcion: descripcionSchema,
  metodoPago: z.nativeEnum(MetodoPago, {
    errorMap: () => ({ message: 'Selecciona un método de pago válido' }),
  }),
  comprobante: comprobanteSchema,
  observaciones: observacionesSchema,
});

// Schema para movimientos de SALIDA (gastos)
export const salidaMovimientoSchema = baseMovimientoSchema.extend({
  tipoMovimiento: z.literal(TipoMovimiento.SALIDA),
  categoria: z.nativeEnum(CategoriaCaja, {
    errorMap: () => ({ message: 'Selecciona una categoría válida' }),
  }),
  tipoCosto: z.nativeEnum(TipoCosto, {
    errorMap: () => ({ message: 'Selecciona un tipo de costo válido' }),
  }),
  catalogoGastoId: z.string().optional(),
  // Campos de ingreso deben ser undefined para salidas
  categoriaIngreso: z.undefined(),
});

// Schema para movimientos de ENTRADA (ingresos)
export const ingresoMovimientoSchema = baseMovimientoSchema.extend({
  tipoMovimiento: z.literal(TipoMovimiento.ENTRADA),
  categoriaIngreso: z.nativeEnum(CategoriaIngreso, {
    errorMap: () => ({ message: 'Selecciona una categoría de ingreso válida' }),
  }),
  // Campos de salida deben ser undefined para ingresos
  categoria: z.undefined(),
  tipoCosto: z.undefined(),
  catalogoGastoId: z.undefined(),
});

// Schema discriminado que valida según el tipo de movimiento
export const crearMovimientoSchema = z.discriminatedUnion('tipoMovimiento', [
  ingresoMovimientoSchema,
  salidaMovimientoSchema,
]);

// Schema para actualización de movimiento (todos los campos opcionales)
export const actualizarMovimientoSchema = z.object({
  fechaCaja: fechaCajaSchema.optional(),
  monto: montoSchema.optional(),
  descripcion: descripcionSchema.optional(),
  metodoPago: z.nativeEnum(MetodoPago).optional(),
  tipoMovimiento: z.nativeEnum(TipoMovimiento).optional(),
  categoria: z.nativeEnum(CategoriaCaja).optional(),
  tipoCosto: z.nativeEnum(TipoCosto).optional(),
  categoriaIngreso: z.nativeEnum(CategoriaIngreso).optional(),
  comprobante: comprobanteSchema,
  observaciones: observacionesSchema,
});

// Schema para filtros de búsqueda
export const filtrosMovimientoSchema = z.object({
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  categoria: z.nativeEnum(CategoriaCaja).optional(),
  tipoCosto: z.nativeEnum(TipoCosto).optional(),
  categoriaIngreso: z.nativeEnum(CategoriaIngreso).optional(),
  metodoPago: z.nativeEnum(MetodoPago).optional(),
  tipoMovimiento: z.nativeEnum(TipoMovimiento).optional(),
  search: z.string().min(1, 'La búsqueda debe tener al menos 1 caracter').optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Schema para datos desde catálogo
export const crearDesdeCatalogoSchema = z.object({
  catalogoGastoId: z.string().min(1, 'Selecciona un gasto del catálogo'),
  fechaCaja: fechaCajaSchema,
  monto: montoSchema,
  metodoPago: z.nativeEnum(MetodoPago),
  descripcionPersonalizada: descripcionSchema.optional(),
  categoria: z.nativeEnum(CategoriaCaja),
  tipoCosto: z.nativeEnum(TipoCosto),
  comprobante: comprobanteSchema,
  observaciones: observacionesSchema,
});

// Tipos TypeScript inferidos de los schemas
export type CrearMovimientoData = z.infer<typeof crearMovimientoSchema>;
export type ActualizarMovimientoData = z.infer<typeof actualizarMovimientoSchema>;
export type FiltrosMovimientoData = z.infer<typeof filtrosMovimientoSchema>;
export type CrearDesdeCatalogoData = z.infer<typeof crearDesdeCatalogoSchema>;
export type SalidaMovimientoData = z.infer<typeof salidaMovimientoSchema>;
export type IngresoMovimientoData = z.infer<typeof ingresoMovimientoSchema>;

// Funciones de validación helper
export const validarMovimiento = (data: unknown) => {
  return crearMovimientoSchema.safeParse(data);
};

export const validarActualizacion = (data: unknown) => {
  return actualizarMovimientoSchema.safeParse(data);
};

export const validarFiltros = (data: unknown) => {
  return filtrosMovimientoSchema.safeParse(data);
};

// Función para extraer errores de forma legible
export const extraerErroresValidacion = (error: z.ZodError) => {
  const errores: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const campo = issue.path.join('.');
    errores[campo] = issue.message;
  });

  return errores;
};