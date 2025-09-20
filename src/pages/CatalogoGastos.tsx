import DashboardLayout from '../components/layout/DashboardLayout';
import { useCatalogo } from '../store/StoreProvider';
import FormularioCatalogo from '../components/herramientas/FormularioCatalogo';
import TablaCatalogo from '../components/herramientas/TablaCatalogo';
import TablaGastosMobile from '../components/herramientas/TablaGastosMobile';
import FiltrosCatalogo from '../components/herramientas/FiltrosCatalogo';
import Paginacion from '../components/caja/Paginacion';
import { useIsMobile } from '../hooks/useResponsive';

export default function CatalogoGastos() {
  const isMobile = useIsMobile();

  // Usar el estado centralizado de Catálogo
  const {
    gastos,
    loading,
    error,
    processing,
    currentPage,
    totalPages,
    filters,
    resumen,
    showFormulario,
    gastoEdicion,
    setCurrentPage,
    setFilters,
    resetFilters,
    setShowFormulario,
    setGastoEdicion,
    deleteGasto,
    refreshData
  } = useCatalogo();

  // Manejadores de filtros
  const handleFiltroChange = (key: keyof typeof filters, value: any) => {
    setFilters({ [key]: value });
  };

  const handleLimpiarFiltros = () => {
    resetFilters();
  };

  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejadores de formulario
  const handleNuevoGasto = () => {
    setGastoEdicion(undefined);
    setShowFormulario(true);
  };

  const handleEditarGasto = (gasto: any) => {
    setGastoEdicion(gasto);
    setShowFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setShowFormulario(false);
    setGastoEdicion(undefined);
  };

  // Función wrapper para onSuccess del FormularioCatalogo
  const handleFormularioSuccess = () => {
    handleCerrarFormulario();
    // Refrescar datos después de crear/actualizar
    refreshData();
  };

  const handleEliminarGasto = async (id: string) => {
    await deleteGasto(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Catálogo de Gastos
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona tu catálogo de gastos frecuentes y proveedores
            </p>
          </div>

          <button
            onClick={handleNuevoGasto}
            disabled={loading || processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Gasto
          </button>
        </div>

        {/* Estadísticas del Catálogo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                <p className="text-2xl font-bold text-gray-900">{resumen.totalGastos}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m6-6a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0h6m-6 0v4m0-4H9m6 0v4m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2V9a2 2 0 012-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">{resumen.gastosPorCategoria.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{resumen.gastosPorTipo.length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosCatalogo
          filtros={filters}
          onFiltroChange={handleFiltroChange}
          onLimpiar={handleLimpiarFiltros}
          loading={loading}
        />

        {/* Tabla */}
        {isMobile ? (
          <TablaGastosMobile
            gastos={gastos}
            loading={loading}
            error={error}
            onEditar={handleEditarGasto}
            onEliminar={handleEliminarGasto}
            processingAction={processing}
          />
        ) : (
          <TablaCatalogo
            gastos={gastos}
            loading={loading}
            error={error}
            onEditar={handleEditarGasto}
            onEliminar={handleEliminarGasto}
            processingAction={processing}
          />
        )}

        {/* Paginación */}
        <Paginacion
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />

        {/* Formulario Modal */}
        {showFormulario && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={(e) => {
              // Cerrar modal si se hace click en el overlay
              if (e.target === e.currentTarget) {
                handleCerrarFormulario();
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <FormularioCatalogo
                gasto={gastoEdicion}
                onSuccess={handleFormularioSuccess}
                onCancel={handleCerrarFormulario}
                esModalAnidado={false}
                modoCompacto={true}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}