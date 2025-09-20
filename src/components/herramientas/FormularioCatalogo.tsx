import React, { useState, useEffect, useCallback } from 'react';
import { 
  IFormularioCatalogoGasto,
  ICatalogoGasto,
  CategoriaGasto,
  TipoGasto,
  EstadoGasto,
  OPCIONES_CATEGORIA_GASTO,
  OPCIONES_TIPO_GASTO,
  OPCIONES_ESTADO_GASTO,
  LONGITUD_MAXIMA_NOMBRE,
  LONGITUD_MAXIMA_DESCRIPCION,
  LONGITUD_MAXIMA_OBSERVACIONES,
  MONTO_MAXIMO_ESTIMADO,
  IErroresCatalogo
} from '../../types/herramientas';
import { procesarEtiquetas, validarEtiquetas } from '../../utils/herramientasApi';
import { useCatalogo } from '../../store/CatalogoContext';

interface Props {
  gasto?: ICatalogoGasto; // Para edición (opcional)
  onSuccess: () => void;
  onCancel: () => void;
  esModalAnidado?: boolean; // Para cuando se usa dentro de otro modal
  modoCompacto?: boolean; // Para mostrar solo campos esenciales
}

const DATOS_INICIALES: IFormularioCatalogoGasto = {
  nombre: '',
  categoriaGasto: '' as CategoriaGasto,
  tipoGasto: OPCIONES_TIPO_GASTO[0].value,
  estado: OPCIONES_ESTADO_GASTO[0].value,
  descripcion: '',
  montoEstimado: undefined,
  etiquetas: [],
  observaciones: ''
};

const FormularioCatalogo: React.FC<Props> = ({ 
  gasto, 
  onSuccess, 
  onCancel, 
  esModalAnidado = false,
  modoCompacto = false
}) => {
  const { createGasto, updateGasto, processing } = useCatalogo();
  const [formData, setFormData] = useState<IFormularioCatalogoGasto>(DATOS_INICIALES);
  const [errors, setErrors] = useState<IErroresCatalogo>({});
  const [etiquetasTexto, setEtiquetasTexto] = useState('');

  const esEdicion = !!gasto;

  // Cargar datos del gasto si es edición
  useEffect(() => {
    if (gasto) {
      setFormData({
        nombre: gasto.nombre,
        categoriaGasto: gasto.categoriaGasto,
        tipoGasto: gasto.tipoGasto,
        estado: gasto.estado,
        descripcion: gasto.descripcion || '',
        montoEstimado: gasto.montoEstimado,
        etiquetas: gasto.etiquetas || [],
        observaciones: gasto.observaciones || ''
      });
      
      if (gasto.etiquetas) {
        setEtiquetasTexto(gasto.etiquetas.join(', '));
      }
    }
  }, [gasto]);

  const handleChange = useCallback((campo: keyof IFormularioCatalogoGasto, valor: any) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo si existe
    if (errors[campo]) {
      setErrors(prev => ({
        ...prev,
        [campo]: undefined
      }));
    }
  }, [errors]);

  const handleEtiquetasChange = useCallback((texto: string) => {
    setEtiquetasTexto(texto);
    const etiquetasProcesadas = procesarEtiquetas(texto);
    handleChange('etiquetas', etiquetasProcesadas);
  }, [handleChange]);

  const validarFormulario = (): boolean => {
    const nuevosErrores: IErroresCatalogo = {};

    // Validaciones obligatorias
    if (!formData.nombre?.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > LONGITUD_MAXIMA_NOMBRE) {
      nuevosErrores.nombre = `El nombre no puede exceder ${LONGITUD_MAXIMA_NOMBRE} caracteres`;
    }

    if (!formData.categoriaGasto) {
      nuevosErrores.categoriaGasto = 'La categoría es obligatoria';
    }

    // Validaciones opcionales
    if (formData.descripcion && formData.descripcion.length > LONGITUD_MAXIMA_DESCRIPCION) {
      nuevosErrores.descripcion = `La descripción no puede exceder ${LONGITUD_MAXIMA_DESCRIPCION} caracteres`;
    }

    if (formData.observaciones && formData.observaciones.length > LONGITUD_MAXIMA_OBSERVACIONES) {
      nuevosErrores.observaciones = `Las observaciones no pueden exceder ${LONGITUD_MAXIMA_OBSERVACIONES} caracteres`;
    }

    if (formData.montoEstimado && typeof formData.montoEstimado === 'number' && formData.montoEstimado > MONTO_MAXIMO_ESTIMADO) {
      nuevosErrores.montoEstimado = `El monto no puede exceder ${MONTO_MAXIMO_ESTIMADO}`;
    }

    if (formData.etiquetas && formData.etiquetas.length > 0) {
      const resultadoEtiquetas = validarEtiquetas(formData.etiquetas);
      if (!resultadoEtiquetas.validas && resultadoEtiquetas.error) {
        nuevosErrores.etiquetas = resultadoEtiquetas.error;
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarFormulario = useCallback(() => {
    setFormData(DATOS_INICIALES);
    setEtiquetasTexto('');
    setErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (processing) {
      console.warn('[FormularioCatalogo] Envío bloqueado: ya está en proceso');
      return;
    }
    
    if (!validarFormulario()) {
      return;
    }

    console.log('[FormularioCatalogo] Iniciando envío de formulario');

    try {
      // Preparar datos para envío
      const datosEnvio: IFormularioCatalogoGasto = {
        ...formData
      };

      // Limpiar campos vacíos
      if (!datosEnvio.descripcion?.trim()) {
        datosEnvio.descripcion = undefined;
      }
      if (!datosEnvio.observaciones?.trim()) {
        datosEnvio.observaciones = undefined;
      }
      if (!datosEnvio.montoEstimado) {
        datosEnvio.montoEstimado = undefined;
      }
      if (datosEnvio.etiquetas?.length === 0) {
        datosEnvio.etiquetas = undefined;
      }

      console.log('[FormularioCatalogo] Datos a enviar:', datosEnvio);

      if (esEdicion && gasto?._id) {
        console.log('[FormularioCatalogo] Actualizando gasto existente:', gasto._id);
        const exito = await updateGasto(gasto._id, datosEnvio);
        if (exito) {
          console.log('[FormularioCatalogo] Actualización exitosa');
          onSuccess();
        }
      } else {
        console.log('[FormularioCatalogo] Creando nuevo gasto');
        const exito = await createGasto(datosEnvio);
        if (exito) {
          console.log('[FormularioCatalogo] Creación exitosa');
          if (!esModalAnidado) {
            limpiarFormulario();
          }
          onSuccess();
        }
      }
    } catch (error) {
      console.error('[FormularioCatalogo] Error en el formulario:', error);
    } finally {
      console.log('[FormularioCatalogo] Finalizando envío');
    }
  };

  return (
    <div className={`bg-white ${modoCompacto ? 'p-4' : 'p-6'} rounded-lg ${!esModalAnidado ? 'shadow-lg' : ''}`}>
      {!esModalAnidado && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {esEdicion ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {modoCompacto && !esEdicion ? (
          // MODO COMPACTO: Layout de 2 columnas optimizado para modal
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* COLUMNA IZQUIERDA - Campos principales */}
            <div className="space-y-4">
              {/* Nombre del Gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Gasto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Alquiler de oficina"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoriaGasto}
                  onChange={(e) => handleChange('categoriaGasto', e.target.value as CategoriaGasto)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.categoriaGasto ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {OPCIONES_CATEGORIA_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                {errors.categoriaGasto && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoriaGasto}</p>
                )}
              </div>

              {/* Tipo de Gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Gasto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipoGasto}
                  onChange={(e) => handleChange('tipoGasto', e.target.value as TipoGasto)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_TIPO_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COLUMNA DERECHA - Campos secundarios */}
            <div className="space-y-4">
              {/* Monto Estimado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Estimado
                </label>
                <input
                  type="number"
                  value={formData.montoEstimado || ''}
                  onChange={(e) => handleChange('montoEstimado', parseFloat(e.target.value) || undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value as EstadoGasto)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_ESTADO_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Descripción del gasto..."
                  maxLength={LONGITUD_MAXIMA_DESCRIPCION}
                />
                <div className="flex justify-end mt-1">
                  <p className="text-sm text-gray-500">
                    {formData.descripcion?.length || 0}/{LONGITUD_MAXIMA_DESCRIPCION}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MODO COMPLETO: Layout de 2 columnas mejorado
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMNA IZQUIERDA - Campos principales */}
            <div className="space-y-6">
              {/* Nombre del Gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Gasto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Alquiler de oficina"
                  maxLength={LONGITUD_MAXIMA_NOMBRE}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoriaGasto}
                  onChange={(e) => handleChange('categoriaGasto', e.target.value as CategoriaGasto)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.categoriaGasto ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {OPCIONES_CATEGORIA_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                {errors.categoriaGasto && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoriaGasto}</p>
                )}
              </div>

              {/* Tipo de Gasto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Gasto <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tipoGasto}
                  onChange={(e) => handleChange('tipoGasto', e.target.value as TipoGasto)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_TIPO_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={etiquetasTexto}
                  onChange={(e) => handleEtiquetasChange(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.etiquetas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="oficina, mensual, importante, urgente..."
                />
                {errors.etiquetas && (
                  <p className="text-sm text-red-600 mt-1">{errors.etiquetas}</p>
                )}
                {formData.etiquetas && formData.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.etiquetas.map((etiqueta, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {etiqueta}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA - Campos secundarios */}
            <div className="space-y-6">
              {/* Monto Estimado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Estimado
                </label>
                <input
                  type="number"
                  value={formData.montoEstimado || ''}
                  onChange={(e) => handleChange('montoEstimado', parseFloat(e.target.value) || undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.montoEstimado && (
                  <p className="mt-1 text-sm text-red-600">{errors.montoEstimado}</p>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value as EstadoGasto)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {OPCIONES_ESTADO_GASTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descripción detallada del gasto..."
                  rows={4}
                  maxLength={LONGITUD_MAXIMA_DESCRIPCION}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.descripcion && (
                    <p className="text-sm text-red-600">{errors.descripcion}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.descripcion?.length || 0}/{LONGITUD_MAXIMA_DESCRIPCION}
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones internas
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => handleChange('observaciones', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.observaciones ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Notas internas sobre el gasto..."
                  rows={3}
                  maxLength={LONGITUD_MAXIMA_OBSERVACIONES}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.observaciones && (
                    <p className="text-sm text-red-600">{errors.observaciones}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.observaciones?.length || 0}/{LONGITUD_MAXIMA_OBSERVACIONES}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {esEdicion ? 'Actualizando...' : 'Creando...'}
              </span>
            ) : (
              esEdicion ? 'Actualizar Gasto' : 'Crear Gasto'
            )}
          </button>

          {!esModalAnidado && (
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          )}

          {!esEdicion && !esModalAnidado && (
            <button
              type="button"
              onClick={limpiarFormulario}
              disabled={processing}
              className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FormularioCatalogo;