import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { TipoMovimiento } from '../types/caja';
import { useCaja } from '../store/StoreProvider';
import FormularioMovimiento from '../components/caja/FormularioMovimiento';
import TablaMovimientos from '../components/caja/TablaMovimientos';
import TablaMovimientosMobile from '../components/caja/TablaMovimientosMobile';
import ResumenCards from '../components/caja/ResumenCards';
import FiltrosCaja from '../components/caja/FiltrosCaja';
import Paginacion from '../components/caja/Paginacion';
import GraficoCajaLineal from '../components/graficos/GraficoCajaLineal';
import { DateTimeDisplay } from '../components/common/DateTimeComponents';
import { useIsMobile } from '../hooks/useResponsive';

const Caja: React.FC = () => {
  const isMobile = useIsMobile();

  // Usar el estado centralizado de Caja
  const {
    movimientos,
    loading,
    error,
    processing,
    currentPage,
    totalPages,
    totalItems,
    filters,
    resumen,
    showIngresoForm,
    showSalidaForm,
    setCurrentPage,
    setFilters,
    resetFilters,
    setShowIngresoForm,
    setShowSalidaForm,
    deleteMovimiento
  } = useCaja();

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

  // Manejadores de formularios
  const handleCrearIngreso = () => {
    setShowIngresoForm(true);
    setShowSalidaForm(false);
  };

  const handleCrearSalida = () => {
    setShowSalidaForm(true);
    setShowIngresoForm(false);
  };

  const handleCerrarFormularios = () => {
    setShowIngresoForm(false);
    setShowSalidaForm(false);
  };

  const handleMovimientoCreado = () => {
    // El movimiento ya fue creado por FormularioMovimiento
    // Solo necesitamos cerrar los formularios
    handleCerrarFormularios();
  };

  const handleEliminarMovimiento = async (id: string) => {
    await deleteMovimiento(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Caja
            </h1>
            <p className="text-gray-600 mt-1">
              Controla tus ingresos y salidas de efectivo
            </p>
            <div className="mt-2">
              <DateTimeDisplay />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleCrearIngreso}
              disabled={loading || processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Ingreso
            </button>

            <button
              onClick={handleCrearSalida}
              disabled={loading || processing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Nueva Salida
            </button>
          </div>
        </div>

        {/* Resumen Cards */}
        <ResumenCards
          resumen={resumen}
          totalMovimientos={totalItems}
          loading={loading}
        />

        {/* Gráfico */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Evolución de Caja</h3>
          <GraficoCajaLineal />
        </div>

        {/* Filtros */}
        <FiltrosCaja
          filtros={filters}
          onFiltroChange={handleFiltroChange}
          onLimpiar={handleLimpiarFiltros}
          loading={loading}
        />

        {/* Tabla de Movimientos */}
        {isMobile ? (
          <TablaMovimientosMobile
            movimientos={movimientos}
            loading={loading}
            error={error}
            onEliminar={handleEliminarMovimiento}
            processingAction={processing}
          />
        ) : (
          <TablaMovimientos
            movimientos={movimientos}
            loading={loading}
            error={error}
            onEliminar={handleEliminarMovimiento}
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

        {/* Formularios */}
        {showIngresoForm && (
          <FormularioMovimiento
            tipoMovimiento={TipoMovimiento.ENTRADA}
            onSuccess={handleMovimientoCreado}
            onCancel={handleCerrarFormularios}
          />
        )}

        {showSalidaForm && (
          <FormularioMovimiento
            tipoMovimiento={TipoMovimiento.SALIDA}
            onSuccess={handleMovimientoCreado}
            onCancel={handleCerrarFormularios}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Caja;