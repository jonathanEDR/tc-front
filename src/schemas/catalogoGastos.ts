import { z } from 'zod';
import { CategoriaGasto, EstadoGasto } from '../types/herramientas';

// Validaciones específicas para catálogo de gastos
const nombreSchema = z
  .string({
    required_error: 'El nombre es obligatorio',
  })
  .min(3, 'El nombre debe tener al menos 3 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .trim()
  // Validación contra caracteres especiales y XSS
  .refine(
    (val) => !/[<>{}'"]/g.test(val),
    'El nombre no puede contener caracteres especiales: < > { } \' "'
  )
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
    'El nombre contiene contenido no permitido'
  );

const descripcionCatalogoSchema = z
  .string()
  .min(5, 'La descripción debe tener al menos 5 caracteres')
  .max(300, 'La descripción no puede exceder 300 caracteres')
  .trim()
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
    'La descripción contiene contenido no permitido'
  )
  .optional()
  .or(z.literal(''));

const montoEstimadoSchema = z
  .number({
    invalid_type_error: 'El monto debe ser un número',
  })
  .positive('El monto estimado debe ser mayor a 0')
  .max(999999999, 'El monto no puede exceder 999,999,999')
  .finite('El monto debe ser un número válido')
  .optional();

const etiquetasSchema = z
  .array(
    z.string()
      .min(2, 'Cada etiqueta debe tener al menos 2 caracteres')
      .max(30, 'Cada etiqueta no puede exceder 30 caracteres')
      .trim()
      .refine(
        (val) => !/[<>{}'"]/g.test(val),
        'Las etiquetas no pueden contener caracteres especiales'
      )
  )
  .max(10, 'No puedes agregar más de 10 etiquetas')
  .optional()
  .default([]);

const proveedorSchema = z
  .string()
  .min(2, 'El proveedor debe tener al menos 2 caracteres')
  .max(100, 'El proveedor no puede exceder 100 caracteres')
  .trim()
  .refine(
    (val) => !/[<>{}'"]/g.test(val),
    'El proveedor no puede contener caracteres especiales'
  )
  .optional()
  .or(z.literal(''));

const observacionesSchema = z
  .string()
  .max(500, 'Las observaciones no pueden exceder 500 caracteres')
  .trim()
  .optional()
  .or(z.literal(''));

const relevanciaSchema = z
  .number()
  .int('La relevancia debe ser un número entero')
  .min(1, 'La relevancia mínima es 1')
  .max(10, 'La relevancia máxima es 10')
  .optional()
  .default(5);

// Schema principal para crear/actualizar gastos del catálogo
export const catalogoGastoSchema = z.object({
  nombre: nombreSchema,
  descripcion: descripcionCatalogoSchema,
  categoria: z.nativeEnum(CategoriaGasto, {
    errorMap: () => ({ message: 'Selecciona una categoría válida' }),
  }),
  montoEstimado: montoEstimadoSchema,
  etiquetas: etiquetasSchema,
  proveedor: proveedorSchema,
  observaciones: observacionesSchema,
  relevancia: relevanciaSchema,
  estado: z.nativeEnum(EstadoGasto).optional().default(EstadoGasto.ACTIVO),
});

// Schema para actualización (todos los campos opcionales excepto ID)
export const actualizarCatalogoGastoSchema = catalogoGastoSchema.partial();

// Schema para filtros de búsqueda
export const filtrosCatalogoSchema = z.object({
  search: z.string().min(1, 'La búsqueda debe tener al menos 1 caracter').optional(),
  categoria: z.nativeEnum(CategoriaGasto).optional(),
  estado: z.nativeEnum(EstadoGasto).optional(),
  montoMin: z.number().positive().optional(),
  montoMax: z.number().positive().optional(),
  proveedor: z.string().min(1).optional(),
  etiqueta: z.string().min(1).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  sortBy: z.enum(['nombre', 'categoria', 'montoEstimado', 'relevancia', 'fechaCreacion']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Schema para importación masiva
export const importarCatalogoSchema = z.array(
  catalogoGastoSchema.extend({
    // Campos adicionales para importación
    codigo: z.string().optional(), // Código de referencia externa
    fechaVigencia: z.string().optional(), // Fecha hasta cuando es válido el precio
  })
).max(1000, 'No se pueden importar más de 1000 elementos a la vez');

// Schema para exportación
export const exportarCatalogoSchema = z.object({
  formato: z.enum(['csv', 'excel', 'json']),
  filtros: filtrosCatalogoSchema.optional(),
  incluirArchivados: z.boolean().optional().default(false),
  incluirInactivos: z.boolean().optional().default(false),
});

// Tipos TypeScript inferidos
export type CatalogoGastoData = z.infer<typeof catalogoGastoSchema>;
export type ActualizarCatalogoGastoData = z.infer<typeof actualizarCatalogoGastoSchema>;
export type FiltrosCatalogoData = z.infer<typeof filtrosCatalogoSchema>;
export type ImportarCatalogoData = z.infer<typeof importarCatalogoSchema>;
export type ExportarCatalogoData = z.infer<typeof exportarCatalogoSchema>;

// Funciones de validación helper
export const validarCatalogoGasto = (data: unknown) => {
  return catalogoGastoSchema.safeParse(data);
};

export const validarActualizacionCatalogo = (data: unknown) => {
  return actualizarCatalogoGastoSchema.safeParse(data);
};

export const validarFiltrosCatalogo = (data: unknown) => {
  return filtrosCatalogoSchema.safeParse(data);
};

export const validarImportacion = (data: unknown) => {
  return importarCatalogoSchema.safeParse(data);
};

// Función para limpiar datos antes de la validación
export const limpiarDatosCatalogo = (data: any): any => {
  const cleaned = { ...data };

  // Limpiar strings vacíos
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'string' && cleaned[key].trim() === '') {
      cleaned[key] = undefined;
    }
  });

  // Convertir montoEstimado a number si es string
  if (cleaned.montoEstimado && typeof cleaned.montoEstimado === 'string') {
    const numero = parseFloat(cleaned.montoEstimado);
    cleaned.montoEstimado = isNaN(numero) ? undefined : numero;
  }

  // Convertir relevancia a number si es string
  if (cleaned.relevancia && typeof cleaned.relevancia === 'string') {
    const numero = parseInt(cleaned.relevancia, 10);
    cleaned.relevancia = isNaN(numero) ? 5 : numero;
  }

  // Asegurar que etiquetas sea un array
  if (cleaned.etiquetas && !Array.isArray(cleaned.etiquetas)) {
    if (typeof cleaned.etiquetas === 'string') {
      // Si es string, dividir por comas
      cleaned.etiquetas = cleaned.etiquetas.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else {
      cleaned.etiquetas = [];
    }
  }

  return cleaned;
};

// Función para extraer errores de validación
export const extraerErroresCatalogo = (error: z.ZodError) => {
  const errores: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const campo = issue.path.join('.');
    errores[campo] = issue.message;
  });

  return errores;
};

// Validaciones de negocio adicionales
export const validarNombreUnico = async (
  nombre: string,
  categoria: CategoriaGasto,
  idExcluir?: string
): Promise<boolean> => {
  // Esta función debería hacer una llamada a la API para verificar unicidad
  // Por ahora retorna true, pero se debe implementar la lógica real
  return true;
};

export const validarProveedor = (proveedor: string): boolean => {
  // Validaciones adicionales para proveedores
  const patronesInvalidos = [
    /admin/i,
    /test/i,
    /temp/i,
    /\d{10,}/, // Solo números largos
  ];

  return !patronesInvalidos.some(patron => patron.test(proveedor));
};