import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  ICatalogoGasto, 
  IFiltrosCatalogo, 
  IResumenCatalogo 
} from '../types/herramientas';
import { 
  obtenerCatalogoGastos, 
  eliminarGastoCatalogo, 
  obtenerResumenCatalogo 
} from '../utils/herramientasApi';
import FormularioCatalogo from '../components/herramientas/FormularioCatalogo';
import TablaCatalogo from '../components/herramientas/TablaCatalogo';
import TablaGastosMobile from '../components/herramientas/TablaGastosMobile';
import FiltrosCatalogo from '../components/herramientas/FiltrosCatalogo';
import Paginacion from '../components/caja/Paginacion'; // Reutilizamos el componente de paginación
import { useIsMobile } from '../hooks/useResponsive';

export default function CatalogoGastos() {
  const { isLoaded, isSignedIn } = useAuth();
  const isMobile = useIsMobile();
  
  // Estados principales
  const [gastos, setGastos] = useState<ICatalogoGasto[]>([]);
  const [resumen, setResumen] = useState<IResumenCatalogo>({
    totalGastos: 0,
    gastosPorCategoria: [],
    gastosPorTipo: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Estados de filtros y paginación
  const [filtros, setFiltros] = useState<IFiltrosCatalogo>({
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados de formulario
  const [showFormulario, setShowFormulario] = useState(false);
  const [gastoEdicion, setGastoEdicion] = useState<ICatalogoGasto | undefined>(undefined);

  // Cargar catálogo de gastos
  const cargarCatalogo = async () => {
    try {
      // Verificar que Clerk esté cargado y el usuario autenticado
      if (!isLoaded) {
        console.log('Clerk aún está cargando...');
        return;
      }

      if (!isSignedIn) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      setError(null);
      console.log('[HERRAMIENTAS] Cargando catálogo con filtros:', filtros);
      
      const response = await obtenerCatalogoGastos(filtros);
      
      if (response.success) {
        setGastos(response.data.gastos);
        setTotalPages(response.data.totalPages);
        console.log('[HERRAMIENTAS] Catálogo cargado:', response.data.gastos.length, 'gastos');
      } else {
        throw new Error(response.message || 'Error al cargar catálogo');
      }

    } catch (error: any) {
      console.error('[HERRAMIENTAS] Error cargando catálogo:', error);
      setError(error.message || 'Error al cargar catálogo de gastos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar resumen estadístico
  const cargarResumen = async () => {
    try {
      if (!isSignedIn) return;
      
      const response = await obtenerResumenCatalogo();
      if (response.success) {
        setResumen(response.data);
      }
    } catch (error: any) {
      console.error('[HERRAMIENTAS] Error cargando resumen:', error);
      // No mostramos error del resumen para no interferir con la UX principal
    }
  };

  // Efectos
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      cargarCatalogo();
      cargarResumen();
    }
  }, [isLoaded, isSignedIn, filtros]);

  // Manejar cambios en filtros
  const handleFiltroChange = (key: keyof IFiltrosCatalogo, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : prev.page // Reset page si no es cambio de página
    }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      page: 1,
      limit: 10
    });
  };

  // Manejar paginación
  const handlePageChange = (page: number) => {
    handleFiltroChange('page', page);
  };

  // Abrir formulario para nuevo gasto
  const abrirFormularioNuevo = () => {
    setGastoEdicion(undefined);
    setShowFormulario(true);
  };

  // Abrir formulario para editar gasto
  const abrirFormularioEdicion = (gasto: ICatalogoGasto) => {
    setGastoEdicion(gasto);
    setShowFormulario(true);
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setShowFormulario(false);
    setGastoEdicion(undefined);
  };

  // Manejar éxito del formulario
  const handleFormularioExito = () => {
    cerrarFormulario();
    cargarCatalogo();
    cargarResumen();
  };

  // Eliminar gasto (archivar)
  const handleEliminar = async (id: string) => {
    if (processingAction) return;
    
    setProcessingAction(true);
    try {
      const response = await eliminarGastoCatalogo(id);
      if (response.success) {
        alert(response.message || 'Gasto archivado exitosamente');
        cargarCatalogo();
        cargarResumen();
      } else {
        alert('Error al archivar gasto');
      }
    } catch (error: any) {
      console.error('Error eliminando gasto:', error);
      alert(error.message || 'Error al archivar gasto');
    } finally {
      setProcessingAction(false);
    }
  };

  // Renderizar estadísticas rápidas
  const renderEstadisticas = () => {
    if (!resumen || resumen.totalGastos === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total de gastos */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-blue-100">Total de Gastos</dt>
                <dd className="text-3xl font-bold">{resumen.totalGastos}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Categoría más común */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-green-100">Categoría Principal</dt>
                <dd className="text-lg font-bold">
                  {resumen.gastosPorCategoria.length > 0 
                    ? resumen.gastosPorCategoria[0].categoria 
                    : 'N/A'}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Tipo más común */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-purple-100">Tipo Principal</dt>
                <dd className="text-lg font-bold">
                  {resumen.gastosPorTipo.length > 0 
                    ? resumen.gastosPorTipo[0].tipo 
                    : 'N/A'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isSignedIn) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Acceso Denegado</h2>
          <p className="mt-2 text-gray-600">Debes iniciar sesión para acceder a este módulo.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 Catálogo de Gastos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona categorías de gastos, subcategorías y tipos de movimientos financieros
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button
              onClick={abrirFormularioNuevo}
              disabled={processingAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Gasto
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {renderEstadisticas()}

        {/* Formulario Modal */}
        {showFormulario && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <FormularioCatalogo
                gasto={gastoEdicion}
                onSuccess={handleFormularioExito}
                onCancel={cerrarFormulario}
                modoCompacto={true}
              />
            </div>
          </div>
        )}

        {/* Filtros */}
        <FiltrosCatalogo
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onLimpiar={limpiarFiltros}
          loading={loading}
        />

        {/* Tabla de gastos */}
        {isMobile ? (
          <TablaGastosMobile
            gastos={gastos}
            loading={loading}
            error={error}
            onEditar={abrirFormularioEdicion}
            onEliminar={handleEliminar}
            processingAction={processingAction}
          />
        ) : (
          <TablaCatalogo
            gastos={gastos}
            loading={loading}
            error={error}
            onEditar={abrirFormularioEdicion}
            onEliminar={handleEliminar}
            processingAction={processingAction}
          />
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <Paginacion
            currentPage={filtros.page || 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}