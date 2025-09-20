import { z } from 'zod';

// Validaciones para campos de autenticación
const emailSchema = z
  .string({
    required_error: 'El email es obligatorio',
  })
  .email('Formato de email inválido')
  .min(5, 'El email debe tener al menos 5 caracteres')
  .max(100, 'El email no puede exceder 100 caracteres')
  .toLowerCase()
  .trim()
  // Validar dominios sospechosos
  .refine(
    (val) => !/(tempmail|10minutemail|guerrillamail|throwaway)/i.test(val),
    'Dominio de email no permitido'
  )
  // Validar formato más estricto
  .refine(
    (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val),
    'Formato de email inválido'
  );

const passwordSchema = z
  .string({
    required_error: 'La contraseña es obligatoria',
  })
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  // Al menos una letra minúscula
  .refine(
    (val) => /[a-z]/.test(val),
    'La contraseña debe contener al menos una letra minúscula'
  )
  // Al menos una letra mayúscula
  .refine(
    (val) => /[A-Z]/.test(val),
    'La contraseña debe contener al menos una letra mayúscula'
  )
  // Al menos un número
  .refine(
    (val) => /\d/.test(val),
    'La contraseña debe contener al menos un número'
  )
  // Al menos un carácter especial
  .refine(
    (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
    'La contraseña debe contener al menos un carácter especial'
  )
  // No contener espacios
  .refine(
    (val) => !/\s/.test(val),
    'La contraseña no puede contener espacios'
  )
  // No contener secuencias comunes
  .refine(
    (val) => !/123456|password|qwerty|admin|user/i.test(val),
    'La contraseña contiene una secuencia muy común'
  );

const nombreSchema = z
  .string({
    required_error: 'El nombre es obligatorio',
  })
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede exceder 50 caracteres')
  .trim()
  // Solo letras, espacios y algunos caracteres especiales
  .refine(
    (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/.test(val),
    'El nombre solo puede contener letras, espacios, guiones y apostrofes'
  )
  // No comenzar o terminar con espacios/guiones
  .refine(
    (val) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ].*[a-zA-ZáéíóúÁÉÍÓÚñÑ]$|^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(val),
    'El nombre debe comenzar y terminar con una letra'
  );

const apellidoSchema = nombreSchema; // Mismas reglas que el nombre

const telefonoSchema = z
  .string()
  .min(9, 'El teléfono debe tener al menos 9 dígitos')
  .max(15, 'El teléfono no puede exceder 15 dígitos')
  .trim()
  // Solo números, espacios, guiones y paréntesis
  .refine(
    (val) => /^[\d\s\-\+\(\)]+$/.test(val),
    'El teléfono solo puede contener números, espacios, guiones y paréntesis'
  )
  // Al menos 9 dígitos
  .refine(
    (val) => (val.match(/\d/g) || []).length >= 9,
    'El teléfono debe tener al menos 9 dígitos'
  )
  .optional();

// Schema para registro de usuario
export const registroSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nombre: nombreSchema,
  apellido: apellidoSchema,
  telefono: telefonoSchema,
  terminosYCondiciones: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
  politicaPrivacidad: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar la política de privacidad'),
});

// Schema para confirmación de contraseña
export const registroConConfirmacionSchema = registroSchema.extend({
  confirmarPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmarPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  }
);

// Schema para inicio de sesión
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Schema para recuperación de contraseña
export const recuperarPasswordSchema = z.object({
  email: emailSchema,
});

// Schema para restablecer contraseña
export const restablecerPasswordSchema = z.object({
  token: z.string().min(1, 'Token inválido'),
  password: passwordSchema,
  confirmarPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmarPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  }
);

// Schema para cambio de contraseña
export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  passwordNueva: passwordSchema,
  confirmarPasswordNueva: z.string(),
}).refine(
  (data) => data.passwordNueva === data.confirmarPasswordNueva,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPasswordNueva'],
  }
).refine(
  (data) => data.passwordActual !== data.passwordNueva,
  {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['passwordNueva'],
  }
);

// Schema para actualización de perfil
export const actualizarPerfilSchema = z.object({
  nombre: nombreSchema,
  apellido: apellidoSchema,
  telefono: telefonoSchema,
  // Email no se puede cambiar desde el perfil por seguridad
});

// Schema para verificación de email
export const verificarEmailSchema = z.object({
  token: z.string().min(1, 'Token inválido'),
  codigo: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'El código solo puede contener números'),
});

// Schema para autenticación de dos factores
export const twoFactorSchema = z.object({
  codigo: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'El código solo puede contener números'),
});

// Tipos TypeScript inferidos
export type RegistroData = z.infer<typeof registroSchema>;
export type RegistroConConfirmacionData = z.infer<typeof registroConConfirmacionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RecuperarPasswordData = z.infer<typeof recuperarPasswordSchema>;
export type RestablecerPasswordData = z.infer<typeof restablecerPasswordSchema>;
export type CambiarPasswordData = z.infer<typeof cambiarPasswordSchema>;
export type ActualizarPerfilData = z.infer<typeof actualizarPerfilSchema>;
export type VerificarEmailData = z.infer<typeof verificarEmailSchema>;
export type TwoFactorData = z.infer<typeof twoFactorSchema>;

// Funciones de validación helper
export const validarRegistro = (data: unknown) => {
  return registroConConfirmacionSchema.safeParse(data);
};

export const validarLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validarRecuperarPassword = (data: unknown) => {
  return recuperarPasswordSchema.safeParse(data);
};

export const validarRestablecerPassword = (data: unknown) => {
  return restablecerPasswordSchema.safeParse(data);
};

export const validarCambiarPassword = (data: unknown) => {
  return cambiarPasswordSchema.safeParse(data);
};

export const validarActualizarPerfil = (data: unknown) => {
  return actualizarPerfilSchema.safeParse(data);
};

// Función para extraer errores de validación
export const extraerErroresAuth = (error: z.ZodError) => {
  const errores: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const campo = issue.path.join('.');
    errores[campo] = issue.message;
  });

  return errores;
};

// Validaciones adicionales de seguridad
export const validarFortalezaPassword = (password: string): {
  puntuacion: number;
  nivel: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte';
  sugerencias: string[];
} => {
  let puntuacion = 0;
  const sugerencias: string[] = [];

  // Longitud
  if (password.length >= 12) puntuacion += 2;
  else if (password.length >= 8) puntuacion += 1;
  else sugerencias.push('Usa al menos 8 caracteres');

  // Minúsculas
  if (/[a-z]/.test(password)) puntuacion += 1;
  else sugerencias.push('Incluye letras minúsculas');

  // Mayúsculas
  if (/[A-Z]/.test(password)) puntuacion += 1;
  else sugerencias.push('Incluye letras mayúsculas');

  // Números
  if (/\d/.test(password)) puntuacion += 1;
  else sugerencias.push('Incluye números');

  // Caracteres especiales
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) puntuacion += 1;
  else sugerencias.push('Incluye caracteres especiales');

  // Diversidad
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) puntuacion += 1;

  let nivel: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte';
  if (puntuacion <= 2) nivel = 'Muy débil';
  else if (puntuacion <= 3) nivel = 'Débil';
  else if (puntuacion <= 4) nivel = 'Regular';
  else if (puntuacion <= 5) nivel = 'Fuerte';
  else nivel = 'Muy fuerte';

  return { puntuacion, nivel, sugerencias };
};