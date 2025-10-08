import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { FiltroFechas, generarPresetsPeriodos } from '../types/graficos';
import { IMovimientoCaja, IFiltrosCaja, TipoMovimiento } from '../types/caja';
import { obtenerMovimientos } from '../utils/cajaApi';
import SelectorFechas from '../components/common/SelectorFechas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Función helper para formatear soles peruanos
const formatearSoles = (monto: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto);
};

// Función helper para formatear fechas
const formatearFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para exportar a CSV
const exportarCSV = (movimientos: IMovimientoCaja[], fechaInicio: Date, fechaFin: Date) => {
  const headers = [
    'Fecha',
    'Tipo Movimiento',
    'Descripción',
    'Categoría',
    'Tipo Costo',
    'Monto',
    'Método Pago',
    'Comprobante',
    'Observaciones'
  ];

  const filas = movimientos.map(mov => [
    formatearFecha(mov.fechaCaja),
    mov.tipoMovimiento,
    mov.descripcion,
    mov.categoria,
    mov.tipoCosto,
    mov.monto.toString(),
    mov.metodoPago || '',
    mov.comprobante || '',
    mov.observaciones || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...filas.map(fila => fila.map(campo => `"${campo}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `reporte_${fechaInicio.toISOString().split('T')[0]}_a_${fechaFin.toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para exportar a PDF
const exportarPDF = (movimientos: IMovimientoCaja[], fechaInicio: Date, fechaFin: Date) => {
  const doc = new jsPDF();
  
  // Configuración del documento
  doc.setFontSize(18);
  doc.text('Reporte Detallado de Movimientos', 14, 22);
  
  // Información del período
  doc.setFontSize(12);
  doc.text(`Período: ${fechaInicio.toLocaleDateString('es-PE')} - ${fechaFin.toLocaleDateString('es-PE')}`, 14, 32);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`, 14, 40);
  
  // Calcular estadísticas
  const ingresos = movimientos.filter(m => m.tipoMovimiento === TipoMovimiento.ENTRADA);
  const gastos = movimientos.filter(m => m.tipoMovimiento === TipoMovimiento.SALIDA);
  const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
  const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);
  const balance = totalIngresos - totalGastos;
  
  // Resumen financiero
  doc.setFontSize(14);
  doc.text('Resumen Financiero:', 14, 52);
  doc.setFontSize(11);
  doc.text(`Total Movimientos: ${movimientos.length}`, 14, 60);
  doc.text(`Ingresos: ${formatearSoles(totalIngresos)} (${ingresos.length} movimientos)`, 14, 68);
  doc.text(`Gastos: ${formatearSoles(totalGastos)} (${gastos.length} movimientos)`, 14, 76);
  doc.text(`Balance: ${formatearSoles(balance)}`, 14, 84);
  
  // Preparar datos para la tabla
  const tableData = movimientos.map(mov => [
    formatearFecha(mov.fechaCaja),
    mov.tipoMovimiento === TipoMovimiento.ENTRADA ? 'Ingreso' : 'Gasto',
    mov.descripcion,
    mov.tipoMovimiento === TipoMovimiento.ENTRADA ? 
      (mov.categoriaIngreso || '-') : 
      (mov.categoria || '-'),
    mov.tipoCosto || '-',
    formatearSoles(mov.monto),
    mov.metodoPago || '-'
  ]);
  
  // Generar tabla
  autoTable(doc, {
    head: [['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Tipo Costo', 'Monto', 'Método Pago']],
    body: tableData,
    startY: 92,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Fecha
      1: { cellWidth: 18 }, // Tipo
      2: { cellWidth: 40 }, // Descripción
      3: { cellWidth: 25 }, // Categoría
      4: { cellWidth: 20 }, // Tipo Costo
      5: { cellWidth: 22, halign: 'right' }, // Monto
      6: { cellWidth: 20 } // Método Pago
    }
  });
  
  // Guardar el archivo
  const nombreArchivo = `reporte_detallado_${fechaInicio.toISOString().split('T')[0]}_a_${fechaFin.toISOString().split('T')[0]}.pdf`;
  doc.save(nombreArchivo);
};

function ReportesContent() {
  // Estados
  const [filtroFechas, setFiltroFechas] = useState<FiltroFechas>(() => {
    const presets = generarPresetsPeriodos();
    const presetMes = presets.find(p => p.id === 'estemes');
    return presetMes?.getFechas() || {
      fechaInicio: new Date(new Date().setDate(1)), // Primer día del mes
      fechaFin: new Date()
    };
  });

  const [movimientos, setMovimientos] = useState<IMovimientoCaja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cuando cambien las fechas
  React.useEffect(() => {
    cargarDatos();
  }, [filtroFechas]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros: IFiltrosCaja = {
        fechaInicio: filtroFechas.fechaInicio.toISOString().split('T')[0],
        fechaFin: filtroFechas.fechaFin.toISOString().split('T')[0],
        limit: 1000 // Límite alto para reportes
      };

      const response = await obtenerMovimientos(filtros);
      setMovimientos(response.data?.movimientos || []);
    } catch (err) {
      console.error('Error cargando datos del reporte:', err);
      setError('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas resumidas
  const estadisticas = useMemo(() => {
    const ingresos = movimientos
      .filter(m => m.tipoMovimiento === TipoMovimiento.ENTRADA)
      .reduce((sum, m) => sum + m.monto, 0);

    const gastos = movimientos
      .filter(m => m.tipoMovimiento === TipoMovimiento.SALIDA)
      .reduce((sum, m) => sum + m.monto, 0);

    return {
      totalMovimientos: movimientos.length,
      ingresos,
      gastos,
      balance: ingresos - gastos,
      movimientosIngresos: movimientos.filter(m => m.tipoMovimiento === TipoMovimiento.ENTRADA).length,
      movimientosGastos: movimientos.filter(m => m.tipoMovimiento === TipoMovimiento.SALIDA).length
    };
  }, [movimientos]);

  // Manejar cambio de fechas
  const handleCambioFechas = (nuevasFechas: FiltroFechas) => {
    setFiltroFechas(nuevasFechas);
  };

  // Manejar exportación CSV
  const handleExportarCSV = () => {
    if (movimientos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportarCSV(movimientos, filtroFechas.fechaInicio, filtroFechas.fechaFin);
  };

  // Manejar exportación PDF
  const handleExportarPDF = () => {
    if (movimientos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportarPDF(movimientos, filtroFechas.fechaInicio, filtroFechas.fechaFin);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Reportes Detallados
          </h1>
          <p className="text-gray-600">
            Reporte completo de movimientos de caja con filtros por fecha
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <SelectorFechas
                filtroFechas={filtroFechas}
                onCambioFechas={handleCambioFechas}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
              <button
                onClick={handleExportarCSV}
                disabled={loading || movimientos.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                � Exportar CSV
              </button>
              <button
                onClick={handleExportarPDF}
                disabled={loading || movimientos.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Estadísticas Resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Total Movimientos</div>
            <div className="text-2xl font-bold text-gray-900">{estadisticas.totalMovimientos}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Ingresos</div>
            <div className="text-2xl font-bold text-green-600">{formatearSoles(estadisticas.ingresos)}</div>
            <div className="text-xs text-gray-500">{estadisticas.movimientosIngresos} movimientos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Gastos</div>
            <div className="text-2xl font-bold text-red-600">{formatearSoles(estadisticas.gastos)}</div>
            <div className="text-xs text-gray-500">{estadisticas.movimientosGastos} movimientos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Balance</div>
            <div className={`text-2xl font-bold ${estadisticas.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatearSoles(estadisticas.balance)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm font-medium text-gray-500">Período</div>
            <div className="text-sm font-bold text-gray-900">
              {filtroFechas.fechaInicio.toLocaleDateString('es-PE')}
            </div>
            <div className="text-sm font-bold text-gray-900">
              al {filtroFechas.fechaFin.toLocaleDateString('es-PE')}
            </div>
          </div>
        </div>

        {/* Tabla de Movimientos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Detalle de Movimientos ({movimientos.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando movimientos...</span>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No hay movimientos en el período seleccionado</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Costo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprobante
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimientos.map((movimiento, index) => (
                    <tr key={movimiento._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearFecha(movimiento.fechaCaja)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          movimiento.tipoMovimiento === TipoMovimiento.ENTRADA
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {movimiento.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimiento.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimiento.tipoCosto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={movimiento.tipoMovimiento === TipoMovimiento.ENTRADA ? 'text-green-600' : 'text-red-600'}>
                          {formatearSoles(movimiento.monto)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimiento.metodoPago || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimiento.comprobante || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Reportes() {
  return (
    <DashboardLayout>
      <ReportesContent />
    </DashboardLayout>
  );
}