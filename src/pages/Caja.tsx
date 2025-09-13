import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  IMovimientoCaja, 
  IFiltrosCaja, 
  IResumenCaja, 
  TipoMovimiento
} from '../types/caja';
import { useApiWithAuth } from '../utils/useApiWithAuth';
import FormularioMovimiento from '../components/caja/FormularioMovimiento';
import TablaMovimientos from '../components/caja/TablaMovimientos';
import ResumenCards from '../components/caja/ResumenCards';
import FiltrosCaja from '../components/caja/FiltrosCaja';
import Paginacion from '../components/caja/Paginacion';
import { DateTimeDisplay } from '../components/common/DateTimeComponents';

const Caja: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useApiWithAuth();
  const [movimientos, setMovimientos] = useState<IMovimientoCaja[]>([]);
  const [resumen, setResumen] = useState<IResumenCaja>({
    totalEntradas: 0,
    totalSalidas: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<IFiltrosCaja>({
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showIngresoForm, setShowIngresoForm] = useState(false);
  const [showSalidaForm, setShowSalidaForm] = useState(false);

  // Cargar movimientos
  const cargarMovimientos = async () => {
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

      setLoading(true);
      setError(null);
      
      console.log('Intentando cargar movimientos...');
      
      // Construir query params
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/caja?${params.toString()}`);
      
      if (response.success) {
        setMovimientos(response.data.movimientos);
        setResumen(response.resumen);
        setTotalPages(response.data.totalPages);
        console.log('Movimientos cargados exitosamente:', response.data.movimientos.length);
      } else {
        setError('Error al cargar movimientos');
      }
    } catch (err: any) {
      console.error('Error cargando movimientos:', err);
      
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err.response?.data?.message || 'Error al cargar movimientos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar movimientos al cambiar filtros o cuando Clerk esté listo
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      cargarMovimientos();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
      setError('Usuario no autenticado');
    }
  }, [filtros, isLoaded, isSignedIn]);

  // Manejar eliminación
  const handleEliminar = async (id: string) => {
    try {
      const response = await api.delete(`/caja/${id}`);
      if (response.success) {
        await cargarMovimientos(); // Recargar lista
        alert('Movimiento eliminado exitosamente');
      }
    } catch (err: any) {
      console.error('Error eliminando movimiento:', err);
      alert(err.response?.data?.message || 'Error al eliminar movimiento');
    }
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (key: keyof IFiltrosCaja, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear a página 1 cuando cambian filtros
    }));
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ page: 1, limit: 10 });
  };

  if (loading && movimientos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando movimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Módulo Caja">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-gray-600">Gestiona tus ingresos y egresos de manera eficiente</p>
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <DateTimeDisplay 
                  format="longDateTime" 
                  realTime={true} 
                  showTimezone={true}
                  className="font-medium"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowIngresoForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo Ingreso</span>
              </button>
              <button
                onClick={() => setShowSalidaForm(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span>Nueva Salida</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen Cards - Ahora usando el componente modularizado */}
        <ResumenCards 
          resumen={resumen}
          totalMovimientos={movimientos.length}
          loading={loading}
        />

        {/* Modales para formularios */}
        {showIngresoForm && (
          <FormularioMovimiento
            tipoMovimiento={TipoMovimiento.ENTRADA}
            onSuccess={() => {
              setShowIngresoForm(false);
              cargarMovimientos();
            }}
            onCancel={() => setShowIngresoForm(false)}
          />
        )}

        {showSalidaForm && (
          <FormularioMovimiento
            tipoMovimiento={TipoMovimiento.SALIDA}
            onSuccess={() => {
              setShowSalidaForm(false);
              cargarMovimientos();
            }}
            onCancel={() => setShowSalidaForm(false)}
          />
        )}

        {/* Filtros - Ahora usando el componente modularizado */}
        <FiltrosCaja
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onLimpiar={limpiarFiltros}
          loading={loading}
        />

        {/* Tabla de movimientos - Ahora usando el componente modularizado */}
        <TablaMovimientos
          movimientos={movimientos}
          loading={loading}
          error={error}
          onEliminar={handleEliminar}
        />

        {/* Paginación - Ahora usando el componente modularizado */}
        <Paginacion
          currentPage={filtros.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
};

export default Caja;