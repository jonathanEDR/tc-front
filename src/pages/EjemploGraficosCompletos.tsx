import React, { useState } from 'react';
import GraficoRankingGastos from '../components/graficos/GraficoRankingGastos';
import GraficoDistribucionGastos from '../components/graficos/GraficoDistribucionGastos';
import GraficoCajaLineal from '../components/graficos/GraficoCajaLineal';
import { FiltroFechas, generarPresetsPeriodos } from '../types/graficos';

const EjemploGraficosCompletos: React.FC = () => {
  const [fechasGlobales, setFechasGlobales] = useState<FiltroFechas | undefined>();
  
  // Presets disponibles
  const presets = generarPresetsPeriodos();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          🎉 Sistema de Filtros por Fechas - Los 3 Gráficos Migrados
        </h1>
        
        {/* Descripción del cambio */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            🚀 Migración Completa Finalizada - 3/3 Gráficos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">✅ Problemas Resueltos:</h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Sistema de períodos rígido (HOY, SEMANA, MES, ANUAL)</li>
                <li>• Imposibilidad de consultar períodos específicos del pasado</li>
                <li>• Fallback confuso a septiembre 2025</li>
                <li>• Lógica compleja de fechas dinámicas</li>
                <li>• Falta de flexibilidad para análisis personalizado</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 mb-2">🎯 Beneficios Obtenidos:</h3>
              <ul className="space-y-1 text-purple-700 text-sm">
                <li>• Control total sobre rangos de fechas</li>
                <li>• Presets intuitivos para períodos comunes</li>
                <li>• Interfaz consistente entre gráficos</li>
                <li>• Validación automática de fechas</li>
                <li>• Código más limpio y mantenible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Controles globales */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🎛️ Control Global de Fechas
          </h2>
          <p className="text-gray-600 mb-4">
            Estos botones afectan ambos gráficos simultáneamente para mostrar cómo se puede centralizar el control de fechas.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  const fechas = preset.getFechas();
                  setFechasGlobales(fechas);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 text-sm font-medium shadow-md"
                title={preset.descripcion}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {fechasGlobales && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    📅 Período configurado globalmente:
                  </p>
                  <p className="text-sm text-gray-600">
                    Desde: <span className="font-medium">{fechasGlobales.fechaInicio.toLocaleDateString('es-PE')}</span> - 
                    Hasta: <span className="font-medium">{fechasGlobales.fechaFin.toLocaleDateString('es-PE')}</span>
                  </p>
                </div>
                <button
                  onClick={() => setFechasGlobales(undefined)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Ranking */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
              📊 Gráfico de Ranking de Gastos
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ Actualizado
              </span>
            </h2>
            <p className="text-gray-600 mb-4">
              Muestra el ranking de gastos por descripción con control total de fechas. 
              {fechasGlobales ? " Usando fechas configuradas globalmente." : " Usando su propio selector de fechas."}
            </p>
          </div>
          
          <GraficoRankingGastos 
            className="shadow-lg"
            fechasIniciales={fechasGlobales}
            showDateSelector={!fechasGlobales} // Solo mostrar selector si no hay fechas globales
            limitarItems={12}
          />
        </div>

        {/* Gráfico de Distribución */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
              🍰 Gráfico de Distribución de Gastos
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ Actualizado
              </span>
            </h2>
            <p className="text-gray-600 mb-4">
              Distribución de gastos por categoría con vista por área de negocio y tipo de costo.
              {fechasGlobales ? " Usando fechas configuradas globalmente." : " Usando su propio selector de fechas."}
            </p>
          </div>
          
          <GraficoDistribucionGastos 
            className="shadow-lg"
            fechasIniciales={fechasGlobales}
            showDateSelector={!fechasGlobales} // Solo mostrar selector si no hay fechas globales
          />
        </div>

        {/* Gráfico Lineal */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
              📈 Gráfico Lineal de Gastos por Categoría
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ Actualizado
              </span>
            </h2>
            <p className="text-gray-600 mb-4">
              Evolución temporal de gastos con agrupación inteligente según el rango de fechas.
              {fechasGlobales ? " Usando fechas configuradas globalmente." : " Usando su propio selector de fechas."}
            </p>
            <div className="text-sm text-gray-500">
              <span className="font-medium">💡 Agrupación automática:</span> 
              1 día → Por horas | 2-31 días → Por días | 32-90 días → Por semanas | 90+ días → Por meses
            </div>
          </div>
          
          <GraficoCajaLineal 
            className="shadow-lg"
            fechasIniciales={fechasGlobales}
            showDateSelector={!fechasGlobales} // Solo mostrar selector si no hay fechas globales
          />
        </div>

        {/* Ejemplos de uso en código */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-white">💻 Ejemplos de Implementación:</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-medium text-green-400 mb-2">📊 Ranking de Gastos:</h4>
              <pre className="text-sm bg-gray-800 p-4 rounded overflow-x-auto">
{`// Uso básico
<GraficoRankingGastos />

// Con fechas personalizadas
<GraficoRankingGastos 
  fechasIniciales={{
    fechaInicio: new Date('2025-09-01'),
    fechaFin: new Date('2025-09-30')
  }}
  limitarItems={15}
/>

// Sin selector (modo dashboard)
<GraficoRankingGastos 
  fechasIniciales={fechas}
  showDateSelector={false}
/>`}
              </pre>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-purple-400 mb-2">🍰 Distribución de Gastos:</h4>
              <pre className="text-sm bg-gray-800 p-4 rounded overflow-x-auto">
{`// Uso básico
<GraficoDistribucionGastos />

// Con fechas personalizadas
<GraficoDistribucionGastos 
  fechasIniciales={{
    fechaInicio: new Date('2025-08-01'),
    fechaFin: new Date('2025-08-31')
  }}
/>

// Sin selector (modo dashboard)
<GraficoDistribucionGastos 
  fechasIniciales={fechas}
  showDateSelector={false}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="text-lg font-medium text-blue-400 mb-2">📈 Gráfico Lineal:</h4>
              <pre className="text-sm bg-gray-800 p-4 rounded overflow-x-auto">
{`// Uso básico
<GraficoCajaLineal />

// Con fechas personalizadas
<GraficoCajaLineal 
  fechasIniciales={{
    fechaInicio: new Date('2025-07-01'),
    fechaFin: new Date('2025-07-15')
  }}
/>

// Sin selector (modo dashboard)
<GraficoCajaLineal 
  fechasIniciales={fechas}
  showDateSelector={false}
/>

// Agrupación automática:
// 1 día → horas
// 7 días → días  
// 3 meses → semanas
// 1 año → meses`}
              </pre>
            </div>
          </div>
        </div>

        {/* Casos de uso comunes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 Casos de Uso Comunes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📈 Dashboard Ejecutivo</h4>
              <p className="text-blue-700 text-sm mb-3">
                Gráficos sincronizados con fechas centralizadas, sin selectores individuales.
              </p>
              <button 
                onClick={() => {
                  const mesActual = presets.find(p => p.id === 'estemes')?.getFechas();
                  setFechasGlobales(mesActual);
                }}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Ver ejemplo
              </button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🔍 Análisis Detallado</h4>
              <p className="text-green-700 text-sm mb-3">
                Cada gráfico con su propio selector para análisis independiente.
              </p>
              <button 
                onClick={() => setFechasGlobales(undefined)}
                className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Ver ejemplo
              </button>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">📊 Comparación Histórica</h4>
              <p className="text-purple-700 text-sm mb-3">
                Análisis de diferentes períodos históricos específicos.
              </p>
              <button 
                onClick={() => {
                  const mesAnterior = presets.find(p => p.id === 'mesanterior')?.getFechas();
                  setFechasGlobales(mesAnterior);
                }}
                className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
              >
                Ver ejemplo
              </button>
            </div>
          </div>
        </div>

        {/* Footer con beneficios */}
        <div className="mt-8 text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            � ¡Migración de los 3 Gráficos Completada al 100%!
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm text-gray-700 mb-4">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              GraficoRankingGastos
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              GraficoDistribucionGastos
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              GraficoCajaLineal
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              SelectorFechas reutilizable
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Agrupación inteligente
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Interfaz unificada
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Todos los gráficos ahora usan el mismo sistema flexible de filtros por fechas con presets intuitivos y validación automática.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EjemploGraficosCompletos;