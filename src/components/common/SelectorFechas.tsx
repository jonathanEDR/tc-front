import React from 'react';
import { FiltroFechas, PresetPeriodo, generarPresetsPeriodos } from '../../types/graficos';

interface Props {
  filtroFechas: FiltroFechas;
  onCambioFechas: (nuevasFechas: FiltroFechas) => void;
  className?: string;
  mostrarPresets?: boolean;
  presets?: PresetPeriodo[];
}

const SelectorFechas: React.FC<Props> = ({
  filtroFechas,
  onCambioFechas,
  className = "",
  mostrarPresets = true,
  presets = generarPresetsPeriodos()
}) => {
  
  // Formatear fecha para input type="date"
  const formatearFechaInput = (fecha: Date): string => {
    return fecha.toISOString().split('T')[0];
  };

  // Convertir string de input a Date
  const parsearFechaInput = (fechaStr: string): Date => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha;
  };

  // Manejar cambio en fecha inicio
  const handleCambioFechaInicio = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFechaInicio = parsearFechaInput(event.target.value);
    nuevaFechaInicio.setHours(0, 0, 0, 0);
    
    // Validar que no sea posterior a fecha fin
    if (nuevaFechaInicio <= filtroFechas.fechaFin) {
      onCambioFechas({
        fechaInicio: nuevaFechaInicio,
        fechaFin: filtroFechas.fechaFin
      });
    }
  };

  // Manejar cambio en fecha fin
  const handleCambioFechaFin = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFechaFin = parsearFechaInput(event.target.value);
    nuevaFechaFin.setHours(23, 59, 59, 999);
    
    // Validar que no sea anterior a fecha inicio
    if (nuevaFechaFin >= filtroFechas.fechaInicio) {
      onCambioFechas({
        fechaInicio: filtroFechas.fechaInicio,
        fechaFin: nuevaFechaFin
      });
    }
  };

  // Aplicar preset
  const aplicarPreset = (preset: PresetPeriodo) => {
    const nuevasFechas = preset.getFechas();
    onCambioFechas(nuevasFechas);
  };

  // Calcular diferencia en días
  const calcularDiferenciaDias = (): number => {
    const diffTime = filtroFechas.fechaFin.getTime() - filtroFechas.fechaInicio.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${className}`}>
      {/* Título */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          📅 Filtro por Fechas
        </h4>
        <div className="text-sm text-gray-600">
          {calcularDiferenciaDias()} día(s) seleccionado(s)
        </div>
      </div>

      {/* Presets rápidos */}
      {mostrarPresets && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Períodos comunes:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => aplicarPreset(preset)}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                title={preset.descripcion}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selectores de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicio:
          </label>
          <input
            type="date"
            value={formatearFechaInput(filtroFechas.fechaInicio)}
            onChange={handleCambioFechaInicio}
            max={formatearFechaInput(filtroFechas.fechaFin)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha fin:
          </label>
          <input
            type="date"
            value={formatearFechaInput(filtroFechas.fechaFin)}
            onChange={handleCambioFechaFin}
            min={formatearFechaInput(filtroFechas.fechaInicio)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Info del rango seleccionado */}
      <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>
            <strong>Desde:</strong> {filtroFechas.fechaInicio.toLocaleDateString('es-PE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span>
            <strong>Hasta:</strong> {filtroFechas.fechaFin.toLocaleDateString('es-PE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SelectorFechas;