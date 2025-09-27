import React, { useState } from 'react';
import GraficoRankingGastos from '../components/graficos/GraficoRankingGastos';
import { FiltroFechas, generarPresetsPeriodos } from '../types/graficos';

const EjemploRankingGastos: React.FC = () => {
  const [fechasPersonalizadas, setFechasPersonalizadas] = useState<FiltroFechas | undefined>();

  // Ejemplos de fechas predefinidas
  const presets = generarPresetsPeriodos();
  const presetEsteMes = presets.find(p => p.id === 'estemes')?.getFechas();
  const presetMesAnterior = presets.find(p => p.id === 'mesanterior')?.getFechas();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🆕 Nuevo Sistema de Filtros de Fecha - Ranking de Gastos
        </h1>
        
        {/* Descripción del cambio */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            ✨ ¿Qué cambió?
          </h2>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>Antes:</strong> Filtros fijos (HOY, SEMANA, MES, ANUAL) basados en la fecha actual</p>
            <p>• <strong>Ahora:</strong> Selector de fecha inicio y fecha fin con control total</p>
            <p>• <strong>Ventaja:</strong> Puedes consultar cualquier período específico del pasado</p>
            <p>• <strong>Facilidad:</strong> Botones de preset para períodos comunes</p>
          </div>
        </div>

        {/* Ejemplos de uso */}
        <div className="space-y-8">
          {/* Ejemplo 1: Con selector de fechas habilitado (por defecto) */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              📅 1. Con Selector de Fechas (Modo Completo)
            </h2>
            <p className="text-gray-600 mb-4">
              El usuario puede seleccionar cualquier rango de fechas usando los presets o los inputs manuales.
            </p>
            <GraficoRankingGastos 
              className="bg-white rounded-lg shadow-lg"
              limitarItems={10}
            />
          </div>

          {/* Ejemplo 2: Con fechas predefinidas (este mes) */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🗓️ 2. Con Fechas Predefinidas (Este Mes)
            </h2>
            <p className="text-gray-600 mb-4">
              Componente configurado para mostrar datos de este mes específicamente.
            </p>
            <GraficoRankingGastos 
              className="bg-white rounded-lg shadow-lg"
              fechasIniciales={presetEsteMes}
              limitarItems={15}
            />
          </div>

          {/* Ejemplo 3: Sin selector de fechas */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🔒 3. Sin Selector de Fechas (Modo Fijo)
            </h2>
            <p className="text-gray-600 mb-4">
              Para dashboards donde las fechas están controladas por el componente padre.
            </p>
            <GraficoRankingGastos 
              className="bg-white rounded-lg shadow-lg"
              fechasIniciales={presetMesAnterior}
              showDateSelector={false}
              limitarItems={5}
            />
          </div>

          {/* Controles adicionales */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              ⚙️ 4. Controles Programáticos
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    const preset = presets.find(p => p.id === 'hoy')?.getFechas();
                    setFechasPersonalizadas(preset);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Ver Gastos de Hoy
                </button>
                <button
                  onClick={() => {
                    const preset = presets.find(p => p.id === 'estasemana')?.getFechas();
                    setFechasPersonalizadas(preset);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Ver Esta Semana
                </button>
                <button
                  onClick={() => {
                    // Ejemplo de rango personalizado: últimos 15 días
                    const hoy = new Date();
                    const hace15Dias = new Date();
                    hace15Dias.setDate(hoy.getDate() - 14);
                    hace15Dias.setHours(0, 0, 0, 0);
                    hoy.setHours(23, 59, 59, 999);
                    
                    setFechasPersonalizadas({
                      fechaInicio: hace15Dias,
                      fechaFin: hoy
                    });
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Ver Últimos 15 Días
                </button>
              </div>
              
              {fechasPersonalizadas && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Fechas configuradas programáticamente:
                  </p>
                  <p className="text-sm text-gray-600">
                    Desde: {fechasPersonalizadas.fechaInicio.toLocaleDateString('es-PE')} - 
                    Hasta: {fechasPersonalizadas.fechaFin.toLocaleDateString('es-PE')}
                  </p>
                </div>
              )}

              <GraficoRankingGastos 
                className="bg-gray-50 rounded-lg"
                fechasIniciales={fechasPersonalizadas}
                limitarItems={8}
              />
            </div>
          </div>
        </div>

        {/* Código de ejemplo */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">💻 Código de Ejemplo:</h3>
          <pre className="text-sm overflow-x-auto">
{`// 1. Uso básico (con selector de fechas)
<GraficoRankingGastos />

// 2. Con fechas predefinidas
const fechasPersonalizadas = {
  fechaInicio: new Date('2025-09-01'),
  fechaFin: new Date('2025-09-30')
};

<GraficoRankingGastos 
  fechasIniciales={fechasPersonalizadas}
  limitarItems={10}
/>

// 3. Sin selector de fechas (modo fijo)
<GraficoRankingGastos 
  fechasIniciales={fechasPersonalizadas}
  showDateSelector={false}
  limitarItems={5}
/>

// 4. Usando presets programáticamente
const presets = generarPresetsPeriodos();
const fechasEsteMes = presets.find(p => p.id === 'estemes')?.getFechas();

<GraficoRankingGastos 
  fechasIniciales={fechasEsteMes}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default EjemploRankingGastos;