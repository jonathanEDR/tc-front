import React, { useState } from 'react';
import { 
  IFormularioMovimiento, 
  TipoMovimiento,
  CategoriaCaja,
  CategoriaIngreso,
  TipoCosto,
  MetodoPago,
  OPCIONES_CATEGORIA,
  OPCIONES_CATEGORIA_INGRESO,
  OPCIONES_TIPO_COSTO,
  OPCIONES_METODO_PAGO,
  OPCIONES_TIPO_MOVIMIENTO 
} from '../../types/caja';
import { useApiWithAuth } from '../../utils/useApiWithAuth';
import { dateUtils } from '../../utils/dateUtils';

interface Props {
  tipoMovimiento?: TipoMovimiento; // Tipo predefinido opcional
  onSuccess: () => void;
  onCancel: () => void;
}

const FormularioMovimiento: React.FC<Props> = ({ tipoMovimiento: tipoMovimientoProp, onSuccess, onCancel }) => {
  const api = useApiWithAuth();
  
  // Valores por defecto según el tipo de movimiento
  const getDefaultValues = (): IFormularioMovimiento => {
    const baseDefaults = {
      fechaCaja: dateUtils.input.getCurrentInputDateTime(), // Usar fecha y hora actual
      monto: '',
      tipoMovimiento: tipoMovimientoProp || TipoMovimiento.ENTRADA,
      descripcion: '',
      metodoPago: MetodoPago.EFECTIVO, // Método por defecto
      comprobante: '',
      observaciones: ''
    };

    if (tipoMovimientoProp === TipoMovimiento.ENTRADA) {
      return {
        ...baseDefaults,
        categoriaIngreso: CategoriaIngreso.VENTA_DIRECTA // Categoría por defecto para ingresos
      };
    } else if (tipoMovimientoProp === TipoMovimiento.SALIDA) {
      return {
        ...baseDefaults,
        categoria: CategoriaCaja.OPERACIONES, // Categoría por defecto para salidas
        tipoCosto: TipoCosto.MANO_OBRA // Tipo de costo por defecto
      };
    } else {
      return {
        ...baseDefaults,
        categoria: CategoriaCaja.OPERACIONES,
        tipoCosto: TipoCosto.OTROS_GASTOS
      };
    }
  };

  const [formData, setFormData] = useState<IFormularioMovimiento>(getDefaultValues());

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fechaCaja) {
      newErrors.fechaCaja = 'La fecha es obligatoria';
    }

    const monto = typeof formData.monto === 'string' ? parseFloat(formData.monto) : formData.monto;
    if (!monto || isNaN(monto) || monto <= 0) {
      newErrors.monto = 'El monto debe ser un número mayor a 0';
    }

    if (!formData.descripcion || formData.descripcion.trim().length < 5) {
      newErrors.descripcion = 'La descripción debe tener al menos 5 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 200) {
      newErrors.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = 'El método de pago es obligatorio';
    }

    // Validaciones específicas por tipo de movimiento
    if (formData.tipoMovimiento === TipoMovimiento.ENTRADA) {
      if (!formData.categoriaIngreso) {
        newErrors.categoriaIngreso = 'La categoría de ingreso es obligatoria';
      }
    } else if (formData.tipoMovimiento === TipoMovimiento.SALIDA) {
      if (!formData.categoria) {
        newErrors.categoria = 'La categoría es obligatoria para salidas';
      }
      if (!formData.tipoCosto) {
        newErrors.tipoCosto = 'El tipo de costo es obligatorio para salidas';
      }
    }

    if (formData.comprobante && formData.comprobante.length > 50) {
      newErrors.comprobante = 'El comprobante no puede exceder 50 caracteres';
    }

    if (formData.observaciones && formData.observaciones.length > 500) {
      newErrors.observaciones = 'Las observaciones no pueden exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof IFormularioMovimiento, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Si se cambia el tipo de movimiento, limpiar campos incompatibles
      if (field === 'tipoMovimiento') {
        if (value === TipoMovimiento.ENTRADA) {
          // Para ENTRADA, eliminar campos de SALIDA
          delete newData.categoria;
          delete newData.tipoCosto;
        } else if (value === TipoMovimiento.SALIDA) {
          // Para SALIDA, eliminar campos de ENTRADA
          delete newData.categoriaIngreso;
        }
      }

      return newData;
    });

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar los datos limpios según el tipo de movimiento
      const datosBase = {
        fechaCaja: formData.fechaCaja,
        monto: typeof formData.monto === 'string' ? parseFloat(formData.monto) : formData.monto,
        tipoMovimiento: formData.tipoMovimiento,
        descripcion: formData.descripcion,
        metodoPago: formData.metodoPago
      };

      // Agregar campos opcionales solo si tienen valor
      const datosEnvio: any = { ...datosBase };
      
      if (formData.comprobante?.trim()) {
        datosEnvio.comprobante = formData.comprobante.trim();
      }
      
      if (formData.observaciones?.trim()) {
        datosEnvio.observaciones = formData.observaciones.trim();
      }

      // Agregar campos específicos según el tipo de movimiento
      if (formData.tipoMovimiento === TipoMovimiento.ENTRADA) {
        if (formData.categoriaIngreso) {
          datosEnvio.categoriaIngreso = formData.categoriaIngreso;
        }
      } else if (formData.tipoMovimiento === TipoMovimiento.SALIDA) {
        if (formData.categoria) {
          datosEnvio.categoria = formData.categoria;
        }
        if (formData.tipoCosto) {
          datosEnvio.tipoCosto = formData.tipoCosto;
        }
      }

      console.log('Datos a enviar:', datosEnvio);

      const response = await api.post('/caja', datosEnvio);
      
      if (response.success) {
        alert('Movimiento creado exitosamente');
        onSuccess();
      } else {
        alert('Error al crear movimiento');
      }
    } catch (error: any) {
      console.error('Error creando movimiento:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear movimiento';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormData(getDefaultValues());
    setErrors({});
  };

  const getPlaceholderTexto = (campo: string) => {
    if (!tipoMovimientoProp) return '';
    
    const isIngreso = formData.tipoMovimiento === TipoMovimiento.ENTRADA;
    
    switch (campo) {
      case 'descripcion':
        return isIngreso 
          ? 'Ej: Venta de producto, pago de cliente, ingreso por servicios...'
          : 'Ej: Compra de materiales, pago de empleados, gastos operativos...';
      case 'observaciones':
        return isIngreso
          ? 'Detalles adicionales del ingreso...'
          : 'Detalles adicionales del gasto...';
      case 'comprobante':
        return isIngreso
          ? 'Ej: FACT-001, REC-001'
          : 'Ej: FACT-001, COMP-001';
      default:
        return '';
    }
  };

  const isIngreso = formData.tipoMovimiento === TipoMovimiento.ENTRADA;
  const tituloModal = tipoMovimientoProp 
    ? (isIngreso ? 'Nuevo Ingreso' : 'Nueva Salida')
    : 'Nuevo Movimiento';
  const colorHeader = tipoMovimientoProp 
    ? (isIngreso ? 'text-green-600' : 'text-red-600')
    : 'text-gray-900';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {tipoMovimientoProp && (
                <div className={`p-2 rounded-full ${isIngreso ? 'bg-green-100' : 'bg-red-100'}`}>
                  <svg className={`w-5 h-5 ${isIngreso ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isIngreso ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M20 12H4"} />
                  </svg>
                </div>
              )}
              <h2 className={`text-2xl font-bold ${colorHeader}`}>{tituloModal}</h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primera fila: Fecha, Tipo, Monto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.fechaCaja || ''}
              onChange={(e) => handleChange('fechaCaja', e.target.value || undefined)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fechaCaja ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fechaCaja && <p className="mt-1 text-sm text-red-500">{errors.fechaCaja}</p>}
          </div>

          {!tipoMovimientoProp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipoMovimiento}
                onChange={(e) => handleChange('tipoMovimiento', e.target.value as TipoMovimiento)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {OPCIONES_TIPO_MOVIMIENTO.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              placeholder="0.00"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.monto ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.monto && <p className="mt-1 text-sm text-red-500">{errors.monto}</p>}
          </div>
        </div>

        {/* Segunda fila: Campos específicos según tipo de movimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos para INGRESOS */}
          {formData.tipoMovimiento === TipoMovimiento.ENTRADA && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría de Ingreso <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoriaIngreso || ''}
                onChange={(e) => handleChange('categoriaIngreso', e.target.value as CategoriaIngreso)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {OPCIONES_CATEGORIA_INGRESO.map(opcion => (
                  <option key={opcion.value} value={opcion.value}>
                    {opcion.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campos para SALIDAS */}
          {formData.tipoMovimiento === TipoMovimiento.SALIDA && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoria || ''}
                  onChange={(e) => handleChange('categoria', e.target.value as CategoriaCaja)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_CATEGORIA.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Costo <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipoCosto || ''}
                  onChange={(e) => handleChange('tipoCosto', e.target.value as TipoCosto)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_TIPO_COSTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Método de Pago - Para ambos tipos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.metodoPago}
              onChange={(e) => handleChange('metodoPago', e.target.value as MetodoPago)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {OPCIONES_METODO_PAGO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder={getPlaceholderTexto('descripcion')}
            rows={3}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
            <p className="text-sm text-gray-500">{formData.descripcion.length}/200</p>
          </div>
        </div>

        {/* Tercera fila: Comprobante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprobante (Opcional)
          </label>
          <input
            type="text"
            value={formData.comprobante}
            onChange={(e) => handleChange('comprobante', e.target.value)}
            placeholder={getPlaceholderTexto('comprobante')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.comprobante ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.comprobante && <p className="text-sm text-red-500">{errors.comprobante}</p>}
            <p className="text-sm text-gray-500">{formData.comprobante?.length || 0}/50</p>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones (Opcional)
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            placeholder={getPlaceholderTexto('observaciones')}
            rows={3}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.observaciones ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.observaciones && <p className="text-sm text-red-500">{errors.observaciones}</p>}
            <p className="text-sm text-gray-500">{formData.observaciones?.length || 0}/500</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              tipoMovimientoProp 
                ? (isIngreso ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Guardando...' : 
             tipoMovimientoProp 
               ? (isIngreso ? 'Registrar Ingreso' : 'Registrar Salida')
               : 'Guardar Movimiento'
            }
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioMovimiento;