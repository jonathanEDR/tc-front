import React, { useState, useEffect } from 'react';
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
import { ICatalogoGasto, EstadoGasto, CategoriaGasto } from '../../types/herramientas';
import { useApiWithAuth } from '../../utils/useApiWithAuth';
import { obtenerCatalogoGastos } from '../../utils/herramientasApi';
import FormularioCatalogo from '../herramientas/FormularioCatalogo';
import { dateUtils } from '../../utils/dateUtils';

// Mapeo de categorías de catálogo a tipos de costo de caja
const MAPEO_CATEGORIA_TIPO_COSTO = {
  [CategoriaGasto.MANO_OBRA]: TipoCosto.MANO_OBRA,
  [CategoriaGasto.MATERIA_PRIMA]: TipoCosto.MATERIA_PRIMA,
  [CategoriaGasto.OTROS_GASTOS]: TipoCosto.OTROS_GASTOS
} as const;

// Mapeo de categorías de caja a tipos de costo (autocompletado por defecto)
const MAPEO_CATEGORIA_CAJA_TIPO_COSTO = {
  [CategoriaCaja.OPERACIONES]: TipoCosto.OTROS_GASTOS,
  [CategoriaCaja.ADMINISTRATIVO]: TipoCosto.OTROS_GASTOS,
  [CategoriaCaja.VENTAS]: TipoCosto.OTROS_GASTOS,
  [CategoriaCaja.FINANZAS]: TipoCosto.OTROS_GASTOS
} as const;

interface Props {
  tipoMovimiento?: TipoMovimiento; // Tipo predefinido opcional
  onSuccess: () => void;
  onCancel: () => void;
}

const FormularioMovimiento: React.FC<Props> = ({ tipoMovimiento: tipoMovimientoProp, onSuccess, onCancel }) => {
  const api = useApiWithAuth();
  
  // Función para autocompletar tipoCosto basado en la categoría
  const autocompletarTipoCosto = (categoria: CategoriaCaja): TipoCosto => {
    return MAPEO_CATEGORIA_CAJA_TIPO_COSTO[categoria] || TipoCosto.OTROS_GASTOS;
  };
  
  // Generar fecha inicial solo una vez
  const fechaInicial = dateUtils.input.getCurrentInputDateTime();
  
  // Valores por defecto según el tipo de movimiento
  const getDefaultValues = (): IFormularioMovimiento => {
    const baseDefaults = {
      fechaCaja: fechaInicial, // Usar la fecha fija generada una sola vez
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
      const categoriaDefault = CategoriaCaja.OPERACIONES;
      return {
        ...baseDefaults,
        categoria: categoriaDefault, // Categoría por defecto para salidas
        tipoCosto: autocompletarTipoCosto(categoriaDefault) // Autocompletar tipo de costo
      };
    } else {
      const categoriaDefault = CategoriaCaja.OPERACIONES;
      return {
        ...baseDefaults,
        categoria: categoriaDefault,
        tipoCosto: autocompletarTipoCosto(categoriaDefault)
      };
    }
  };

  const [formData, setFormData] = useState<IFormularioMovimiento>(() => getDefaultValues());

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para el catálogo de gastos
  const [catalogoGastos, setCatalogoGastos] = useState<ICatalogoGasto[]>([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [mostrarCrearGasto, setMostrarCrearGasto] = useState(false);
  
  // Estado para controlar si el tipoCosto fue autocompletado desde el catálogo
  const [tipoCostoAutocompletado, setTipoCostoAutocompletado] = useState(false);

  // Cargar catálogo de gastos cuando el tipo de movimiento es SALIDA
  useEffect(() => {
    const cargarCatalogo = async () => {
      // Usar tipoMovimientoProp si existe, sino usar el del formData
      const tipoMovimiento = tipoMovimientoProp || formData.tipoMovimiento;
      
      if (tipoMovimiento === TipoMovimiento.SALIDA) {
        try {
          const response = await obtenerCatalogoGastos({
            page: 1,
            limit: 100, // Cargar los primeros 100 gastos activos
            estado: EstadoGasto.ACTIVO
          });
          setCatalogoGastos(response.data.gastos || []);
        } catch (error) {
          console.error('Error cargando catálogo:', error);
        }
      }
    };

    cargarCatalogo();
  }, [tipoMovimientoProp]); // Solo depender del prop, no del formData

  // Filtrar gastos del catálogo basado en la búsqueda
  const gastosFiltrados = catalogoGastos.filter(gasto =>
    gasto.nombre.toLowerCase().includes(busquedaCatalogo.toLowerCase()) ||
    gasto.descripcion?.toLowerCase().includes(busquedaCatalogo.toLowerCase())
  );

  // Seleccionar un gasto del catálogo
  const seleccionarGastoCatalogo = (gasto: ICatalogoGasto) => {
    // Mapear la categoría del catálogo al tipo de costo correspondiente
    const tipoCostoMapeado = MAPEO_CATEGORIA_TIPO_COSTO[gasto.categoriaGasto];
    
    setFormData(prev => ({
      ...prev,
      descripcion: gasto.nombre,
      tipoCosto: tipoCostoMapeado, // Autocompletar el tipoCosto
      catalogoGastoId: gasto._id // Guardar el ID para rastrear el origen
    }));
    
    // Marcar que el tipoCosto fue autocompletado
    setTipoCostoAutocompletado(true);
    
    setMostrarCatalogo(false);
    setBusquedaCatalogo('');
  };

  // Manejar gasto creado exitosamente
  const handleGastoCreado = () => {
    setMostrarCrearGasto(false);
    
    // Recargar el catálogo para incluir el nuevo gasto
    const recargarCatalogo = async () => {
      try {
        const response = await obtenerCatalogoGastos({
          page: 1,
          limit: 100,
          estado: EstadoGasto.ACTIVO
        });
        setCatalogoGastos(response.data.gastos || []);
      } catch (error) {
        console.error('Error recargando catálogo:', error);
      }
    };
    
    recargarCatalogo();
  };

  // Cerrar modal de crear gasto
  const handleCerrarCrearGasto = () => {
    setMostrarCrearGasto(false);
  };

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
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
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
          delete newData.catalogoGastoId;
        } else if (value === TipoMovimiento.SALIDA) {
          // Para SALIDA, eliminar campos de ENTRADA
          delete newData.categoriaIngreso;
          // Autocompletar tipoCosto basado en la categoría por defecto
          if (newData.categoria) {
            newData.tipoCosto = autocompletarTipoCosto(newData.categoria);
          }
        }
      }

      // Si se cambia la categoría para salidas, autocompletar tipoCosto
      if (field === 'categoria' && formData.tipoMovimiento === TipoMovimiento.SALIDA) {
        newData.tipoCosto = autocompletarTipoCosto(value as CategoriaCaja);
        // Limpiar autocompletado del catálogo
        setTipoCostoAutocompletado(false);
      }

      // Si se edita la descripción manualmente, limpiar la referencia al catálogo
      if (field === 'descripcion') {
        delete newData.catalogoGastoId;
        // También limpiar el autocompletado del tipoCosto y volver a autocompletar según categoría
        setTipoCostoAutocompletado(false);
        if (newData.categoria) {
          newData.tipoCosto = autocompletarTipoCosto(newData.categoria);
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
        // Agregar referencia al catálogo si existe
        if (formData.catalogoGastoId) {
          datosEnvio.catalogoGastoId = formData.catalogoGastoId;
        }
      }

      const response = await api.post('/caja', datosEnvio);
      
      if (response.success) {
        alert('Movimiento creado exitosamente');
        onSuccess();
      } else {
        alert('Error al crear movimiento');
      }
    } catch (error: any) {
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
    // Limpiar también estados del catálogo
    setMostrarCatalogo(false);
    setBusquedaCatalogo('');
    setMostrarCrearGasto(false);
    // Resetear el autocompletado
    setTipoCostoAutocompletado(false);
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
                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {tipoCostoAutocompletado ? 'Del catálogo' : 'Autocompletado'}
                  </span>
                </label>
                <select
                  value={formData.tipoCosto || ''}
                  disabled={true} // Siempre readonly
                  className="w-full p-3 border bg-gray-100 text-gray-700 cursor-not-allowed border-gray-200 rounded-lg"
                  title="Este campo se autocompleta automáticamente según la categoría o selección del catálogo"
                >
                  {OPCIONES_TIPO_COSTO.map(opcion => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  💡 Este campo se autocompleta según {tipoCostoAutocompletado ? 'el gasto seleccionado del catálogo' : 'la categoría elegida'}
                </p>
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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción <span className="text-red-500">*</span>
            </label>
            {formData.tipoMovimiento === TipoMovimiento.SALIDA && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  📋 Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarCrearGasto(true)}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  ➕ Crear Gasto
                </button>
              </div>
            )}
          </div>
          
          {/* Dropdown del catálogo */}
          {mostrarCatalogo && formData.tipoMovimiento === TipoMovimiento.SALIDA && (
            <div className="mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Buscar gasto en catálogo..."
                  value={busquedaCatalogo}
                  onChange={(e) => setBusquedaCatalogo(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="max-h-40 overflow-y-auto">
                {gastosFiltrados.length > 0 ? (
                  gastosFiltrados.slice(0, 10).map((gasto) => {
                    const tipoCostoQueSeAsignara = MAPEO_CATEGORIA_TIPO_COSTO[gasto.categoriaGasto];
                    return (
                      <button
                        key={gasto._id}
                        type="button"
                        onClick={() => seleccionarGastoCatalogo(gasto)}
                        className="w-full text-left p-3 text-sm hover:bg-blue-50 rounded transition-colors border-b border-gray-200 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{gasto.nombre}</div>
                        {gasto.descripcion && (
                          <div className="text-gray-500 text-xs truncate mb-1">{gasto.descripcion}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {tipoCostoQueSeAsignara === 'mano_obra' ? 'Mano de Obra' : 
                             tipoCostoQueSeAsignara === 'materia_prima' ? 'Materia Prima' : 
                             'Otros Gastos'}
                          </span>
                          {gasto.montoEstimado && (
                            <span className="text-xs text-gray-600">
                              ~S/ {gasto.montoEstimado.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-gray-500">
                      {busquedaCatalogo ? 'No se encontraron gastos' : 'No hay gastos en el catálogo'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
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
            <div className="flex flex-col">
              {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion}</p>}
              {formData.catalogoGastoId && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Descripción seleccionada del catálogo - Tipo de costo autocompletado
                </p>
              )}
            </div>
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

      {/* Modal para crear nuevo gasto */}
      {mostrarCrearGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  ➕ Crear Nuevo Gasto
                </h3>
                <button
                  onClick={handleCerrarCrearGasto}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <FormularioCatalogo
                onSuccess={handleGastoCreado}
                onCancel={handleCerrarCrearGasto}
                esModalAnidado={true}
                modoCompacto={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioMovimiento;