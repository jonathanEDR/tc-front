import React, { memo, useMemo } from 'react';
import { IResumenCaja } from '../../types/caja';
import { formatearMonto } from '../../utils/cajaApi';

interface Props {
  resumen: IResumenCaja;
  totalMovimientos: number;
  loading?: boolean;
}

const ResumenCards: React.FC<Props> = memo(({ resumen, totalMovimientos, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 w-12 h-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = useMemo(() => [
    {
      title: 'Total Entradas',
      value: formatearMonto(resumen.totalEntradas),
      prefix: '+$',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      bgColor: 'bg-white',
      borderColor: 'border-green-100',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
      textColor: 'text-gray-600',
      valueColor: 'text-green-600',
      shadowColor: 'shadow-green-100/50'
    },
    {
      title: 'Total Salidas',
      value: formatearMonto(resumen.totalSalidas),
      prefix: '-$',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      bgColor: 'bg-white',
      borderColor: 'border-red-100',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-600',
      textColor: 'text-gray-600',
      valueColor: 'text-red-600',
      shadowColor: 'shadow-red-100/50'
    },
    {
      title: 'Balance',
      value: formatearMonto(Math.abs(resumen.balance)),
      prefix: resumen.balance >= 0 ? '+$' : '-$',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-white',
      borderColor: resumen.balance >= 0 ? 'border-blue-100' : 'border-orange-100',
      iconBg: resumen.balance >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10',
      iconColor: resumen.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      textColor: 'text-gray-600',
      valueColor: resumen.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      shadowColor: resumen.balance >= 0 ? 'shadow-blue-100/50' : 'shadow-orange-100/50'
    },
    {
      title: 'Total Movimientos',
      value: totalMovimientos.toString(),
      prefix: '',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m6-6a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0h6m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0h6m-6 0v4m0-4H9m6 0v4m0-4h2a2 2 0 012 2v6a2 2 0 01-2 2h-2V9a2 2 0 012-2z" />
        </svg>
      ),
      bgColor: 'bg-white',
      borderColor: 'border-gray-100',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-600',
      valueColor: 'text-gray-700',
      shadowColor: 'shadow-gray-100/50'
    }
  ], [resumen, totalMovimientos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} rounded-2xl border ${card.borderColor} p-6 hover:shadow-lg ${card.shadowColor} transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${card.textColor} mb-2`}>
                {card.title}
              </p>
              <div className="flex items-baseline space-x-1">
                <span className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.prefix}
                </span>
                <span className={`text-2xl font-bold ${card.valueColor}`}>
                  {card.value}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              <div className={card.iconColor}>
                {card.icon}
              </div>
            </div>
          </div>
          
          {/* Indicador sutil para balance */}
          {card.title === 'Balance' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500 font-medium">Rendimiento</span>
                <span className={`font-semibold ${resumen.balance >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {resumen.balance >= 0 ? 'Positivo' : 'Negativo'}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    resumen.balance >= 0 ? 'bg-green-500' : 'bg-orange-500'
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
});

ResumenCards.displayName = 'ResumenCards';

export default ResumenCards;