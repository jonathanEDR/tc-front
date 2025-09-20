import { useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  hasErrors: boolean;
}

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  initialErrors?: Record<string, string>;
}

interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  isValid: boolean;
  hasErrors: boolean;
  validate: (data: unknown) => { success: boolean; data?: T; errors?: Record<string, string> };
  validateField: (fieldName: string, value: unknown) => string | null;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
}

export function useFormValidation<T>({
  schema,
  initialErrors = {}
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {

  const [validationState, setValidationState] = useState<ValidationState>({
    errors: initialErrors,
    isValid: Object.keys(initialErrors).length === 0,
    hasErrors: Object.keys(initialErrors).length > 0,
  });

  // Función principal de validación
  const validate = useCallback((data: unknown) => {
    const result = schema.safeParse(data);

    if (result.success) {
      setValidationState({
        errors: {},
        isValid: true,
        hasErrors: false,
      });

      return {
        success: true,
        data: result.data,
      };
    } else {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const fieldPath = issue.path.join('.');
        errors[fieldPath] = issue.message;
      });

      setValidationState({
        errors,
        isValid: false,
        hasErrors: true,
      });

      return {
        success: false,
        errors,
      };
    }
  }, [schema]);

  // Validar un campo específico
  const validateField = useCallback((fieldName: string, value: unknown): string | null => {
    try {
      // Crear un schema parcial para el campo específico
      const fieldSchema = schema.shape?.[fieldName as keyof typeof schema.shape];

      if (!fieldSchema) {
        // Si no hay schema específico, validar el objeto completo
        // pero solo retornar el error de este campo
        const tempData = { [fieldName]: value };
        const result = schema.safeParse(tempData);

        if (!result.success) {
          const fieldError = result.error.issues.find(
            issue => issue.path.includes(fieldName)
          );
          return fieldError?.message || null;
        }
        return null;
      }

      const result = fieldSchema.safeParse(value);

      if (!result.success) {
        const error = result.error.issues[0]?.message || 'Error de validación';

        // Actualizar solo el error de este campo
        setValidationState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fieldName]: error,
          },
          hasErrors: true,
          isValid: false,
        }));

        return error;
      } else {
        // Limpiar el error de este campo si la validación es exitosa
        setValidationState(prev => {
          const newErrors = { ...prev.errors };
          delete newErrors[fieldName];

          return {
            ...prev,
            errors: newErrors,
            hasErrors: Object.keys(newErrors).length > 0,
            isValid: Object.keys(newErrors).length === 0,
          };
        });

        return null;
      }
    } catch (error) {
      // Si hay un error en la validación, asumir que el campo es inválido
      const errorMessage = 'Error de validación';

      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: errorMessage,
        },
        hasErrors: true,
        isValid: false,
      }));

      return errorMessage;
    }
  }, [schema]);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setValidationState({
      errors: {},
      isValid: true,
      hasErrors: false,
    });
  }, []);

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];

      return {
        ...prev,
        errors: newErrors,
        hasErrors: Object.keys(newErrors).length > 0,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  // Establecer error de un campo específico
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: error,
      },
      hasErrors: true,
      isValid: false,
    }));
  }, []);

  // Establecer múltiples errores
  const setErrors = useCallback((errors: Record<string, string>) => {
    setValidationState({
      errors,
      hasErrors: Object.keys(errors).length > 0,
      isValid: Object.keys(errors).length === 0,
    });
  }, []);

  return {
    errors: validationState.errors,
    isValid: validationState.isValid,
    hasErrors: validationState.hasErrors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    setErrors,
  };
}

// Hook especializado para validación en tiempo real
export function useRealTimeValidation<T>(
  schema: z.ZodSchema<T>,
  debounceMs: number = 300
) {
  const validation = useFormValidation({ schema });
  const [debouncedValidation, setDebouncedValidation] = useState<NodeJS.Timeout | null>(null);

  const validateFieldDebounced = useCallback((fieldName: string, value: unknown) => {
    // Limpiar timeout anterior
    if (debouncedValidation) {
      clearTimeout(debouncedValidation);
    }

    // Configurar nuevo timeout
    const timeout = setTimeout(() => {
      validation.validateField(fieldName, value);
    }, debounceMs);

    setDebouncedValidation(timeout);
  }, [validation, debouncedValidation, debounceMs]);

  return {
    ...validation,
    validateFieldDebounced,
  };
}

// Hook para validación con transformación de datos
export function useFormValidationWithTransform<TInput, TOutput>({
  schema,
  transform,
  initialErrors = {}
}: {
  schema: z.ZodSchema<TOutput>;
  transform: (input: TInput) => unknown;
  initialErrors?: Record<string, string>;
}) {
  const validation = useFormValidation({ schema, initialErrors });

  const validateWithTransform = useCallback((data: TInput) => {
    const transformedData = transform(data);
    return validation.validate(transformedData);
  }, [validation, transform]);

  return {
    ...validation,
    validateWithTransform,
  };
}

export default useFormValidation;