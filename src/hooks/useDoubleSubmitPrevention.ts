import { useRef, useCallback } from 'react';

/**
 * Hook para prevenir double submit en formularios
 * Funciona incluso con React.StrictMode
 */
export const useDoubleSubmitPrevention = (delay: number = 1000) => {
  const lastSubmitTime = useRef<number>(0);
  const isSubmitting = useRef<boolean>(false);

  const preventDoubleSubmit = useCallback((submitFunction: () => Promise<void> | void) => {
    return async () => {
      const now = Date.now();
      
      // Verificar si ya está enviando
      if (isSubmitting.current) {
        console.warn('[DoubleSubmitPrevention] Envío bloqueado: ya está en proceso');
        return;
      }
      
      // Verificar si ha pasado suficiente tiempo desde el último envío
      if (now - lastSubmitTime.current < delay) {
        console.warn('[DoubleSubmitPrevention] Envío bloqueado: muy pronto desde el último envío');
        return;
      }
      
      try {
        isSubmitting.current = true;
        lastSubmitTime.current = now;
        await submitFunction();
      } finally {
        isSubmitting.current = false;
      }
    };
  }, [delay]);

  const reset = useCallback(() => {
    isSubmitting.current = false;
    lastSubmitTime.current = 0;
  }, []);

  return {
    preventDoubleSubmit,
    reset,
    isSubmitting: isSubmitting.current
  };
};