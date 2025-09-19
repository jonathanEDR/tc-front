import React from 'react';

interface GraphPreviewProps {
  onClick?: () => void;
  className?: string;
}

export const DistribucionGastosPreview: React.FC<GraphPreviewProps> = ({ onClick, className = "" }) => {
  return (
    <div 
      className={`w-full h-full bg-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-300 ${className}`}
      onClick={onClick}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header del preview */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Distribución Gastos</h3>
            <p className="text-xs text-gray-500">Por categoría</p>
          </div>
          <div className="text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>

        {/* Gráfico circular simple */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-24 h-24">
            {/* Círculo base */}
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Mano de Obra - 45% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="12"
                strokeDasharray="113 251"
                strokeDashoffset="0"
              />
              {/* Materia Prima - 35% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#22C55E"
                strokeWidth="12"
                strokeDasharray="88 251"
                strokeDashoffset="-113"
              />
              {/* Otros Gastos - 20% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="12"
                strokeDasharray="50 251"
                strokeDashoffset="-201"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">100%</span>
            </div>
          </div>
        </div>

        {/* Leyenda compacta */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Mano de Obra 45%</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Materia Prima 35%</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Otros Gastos 20%</span>
          </div>
        </div>

        {/* Indicador de click */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">Clic para ver detalles →</span>
        </div>
      </div>
    </div>
  );
};

export const IngresosGastosPreview: React.FC<GraphPreviewProps> = ({ onClick, className = "" }) => {
  return (
    <div 
      className={`w-full h-full bg-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300 ${className}`}
      onClick={onClick}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header del preview */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Ingresos vs Gastos</h3>
            <p className="text-xs text-gray-500">Comparativo</p>
          </div>
          <div className="text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Gráfico de barras simple */}
        <div className="flex-1 flex items-end justify-center space-x-4">
          {/* Ingresos */}
          <div className="flex flex-col items-center">
            <div className="w-6 bg-green-500 rounded-t" style={{ height: '60px' }}></div>
            <span className="text-xs text-gray-600 mt-1">Ingresos</span>
            <span className="text-xs font-semibold text-green-600">S/ 5.4K</span>
          </div>
          
          {/* Gastos */}
          <div className="flex flex-col items-center">
            <div className="w-6 bg-red-500 rounded-t" style={{ height: '35px' }}></div>
            <span className="text-xs text-gray-600 mt-1">Gastos</span>
            <span className="text-xs font-semibold text-red-600">S/ 2.1K</span>
          </div>

          {/* Balance */}
          <div className="flex flex-col items-center">
            <div className="w-6 bg-blue-500 rounded-t" style={{ height: '48px' }}></div>
            <span className="text-xs text-gray-600 mt-1">Balance</span>
            <span className="text-xs font-semibold text-blue-600">S/ 3.3K</span>
          </div>
        </div>

        {/* Indicador de tendencia */}
        <div className="mt-3 text-center">
          <div className="flex items-center justify-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-semibold">+157% Balance positivo</span>
          </div>
        </div>

        {/* Indicador de click */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">Clic para ver detalles →</span>
        </div>
      </div>
    </div>
  );
};