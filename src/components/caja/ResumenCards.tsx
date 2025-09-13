import React from 'react';
import { IResumenCaja } from '../../types/caja';
import { formatearMonto } from '../../utils/cajaApi';

interface Props {
  resumen: IResumenCaja;
  totalMovimientos: number;
  loading?: boolean;
}

const ResumenCards: React.FC<Props> = ({ resumen, totalMovimientos, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gray-200 w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Entradas',
      value: formatearMonto(resumen.totalEntradas),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      bgGradient: 'from-green-50 to-emerald-100',
      borderColor: 'border-green-200/50',
      iconBg: 'bg-green-500',
      textColor: 'text-green-700',
      valueColor: 'text-green-800'
    },
    {
      title: 'Total Salidas',
      value: formatearMonto(resumen.totalSalidas),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      bgGradient: 'from-red-50 to-rose-100',
      borderColor: 'border-red-200/50',
      iconBg: 'bg-red-500',
      textColor: 'text-red-700',
      valueColor: 'text-red-800'
    },
    {
      title: 'Balance',
      value: formatearMonto(resumen.balance),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgGradient: 'from-blue-50 to-indigo-100',
      borderColor: 'border-blue-200/50',
      iconBg: resumen.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500',
      textColor: 'text-blue-700',
      valueColor: resumen.balance >= 0 ? 'text-blue-800' : 'text-orange-800'
    },
    {
      title: 'Total Movimientos',
      value: totalMovimientos.toString(),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m6-6a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0h6m-6 0v4m0-4H9m6 0v4m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2V9a2 2 0 012-2z" />
        </svg>
      ),
      bgGradient: 'from-gray-50 to-slate-100',
      borderColor: 'border-gray-200/50',
      iconBg: 'bg-gray-600',
      textColor: 'text-gray-700',
      valueColor: 'text-gray-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br ${card.bgGradient} rounded-xl shadow-sm border ${card.borderColor} p-6 hover:shadow-md transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-xl ${card.iconBg} text-white shadow-lg`}>
              {card.icon}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${card.textColor}`}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.valueColor}`}>
                {card.value}
              </p>
            </div>
          </div>
          
          {/* Indicador de progreso para balance */}
          {card.title === 'Balance' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Rendimiento</span>
                <span className={resumen.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {resumen.balance >= 0 ? 'Positivo' : 'Negativo'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    resumen.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(resumen.balance) / Math.max(resumen.totalEntradas, 1) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResumenCards;