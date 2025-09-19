import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

interface MetricsGridProps {
  children: React.ReactNode;
  className?: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${className}`}>
      {children}
    </div>
  );
};

interface CentralAreaProps {
  children: React.ReactNode;
  className?: string;
}

const CentralArea: React.FC<CentralAreaProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex justify-center mb-8 ${className}`}>
      {children}
    </div>
  );
};

interface ModulesGridProps {
  children: React.ReactNode;
  className?: string;
}

const ModulesGrid: React.FC<ModulesGridProps> = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${className}`}>
      {children}
    </div>
  );
};

interface ActivitySectionProps {
  children: React.ReactNode;
  className?: string;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
};

export {
  DashboardGrid,
  MetricsGrid,
  CentralArea,
  ModulesGrid,
  ActivitySection
};