import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red';
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'text-green-500'
    },
    amber: {
      bg: 'bg-amber-50 hover:bg-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-600',
      icon: 'text-amber-500'
    },
    red: {
      bg: 'bg-red-50 hover:bg-red-100',
      border: 'border-red-200',
      text: 'text-red-600',
      icon: 'text-red-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`
        relative p-6 rounded-2xl border-2 ${classes.border} ${classes.bg}
        transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
        min-h-[140px] flex flex-col justify-between
      `}
      onClick={onClick}
    >
      {/* Icono */}
      <div className={`${classes.icon} mb-3`}>
        <div className="w-8 h-8">
          {icon}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-600 mb-1">
          {title}
        </h3>
        
        <div className={`text-2xl font-bold ${classes.text} mb-1`}>
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-gray-500">
            {subtitle}
          </p>
        )}
      </div>

      {/* Tendencia */}
      {trend && (
        <div className="flex items-center mt-2">
          <div className={`flex items-center text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </div>
        </div>
      )}

      {/* Efectos decorativos */}
      <div className="absolute top-2 right-2 opacity-10">
        <div className={`w-12 h-12 rounded-full ${classes.text.replace('text-', 'bg-')}`} />
      </div>
    </div>
  );
};

export default MetricCard;