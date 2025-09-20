import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import {
  DashboardGrid,
  MetricsGrid,
  CentralArea,
  ModulesGrid,
  ActivitySection
} from './DashboardGrid';
import MetricCard from './MetricCard';
import GraphCarousel from './GraphCarousel';
import GraphModal from './GraphModal';
import { GraphModalProvider, useGraphModal } from './GraphModalContext';
import CajaLinealPreview from './CajaLinealPreview';
import { DistribucionGastosPreview, RankingGastosPreview } from './GraphPreviews';
import GraficoCajaLineal from '../graficos/GraficoCajaLineal';
import GraficoDistribucionGastos from '../graficos/GraficoDistribucionGastos';
import GraficoRankingGastos from '../graficos/GraficoRankingGastos';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useActividadReciente } from '../../hooks/useActividadReciente';

const DashboardHome: React.FC = () => {
  return (
    <GraphModalProvider>
      <DashboardContent />
    </GraphModalProvider>
  );
};

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { abrirModal, cerrarModal, estaAbierto } = useGraphModal();
  
  // Hooks para datos reales
  const { metricas, loading: loadingMetricas } = useDashboardMetrics();
  const { actividades, loading: loadingActividades, error: errorActividades } = useActividadReciente(5);

  if (loadingMetricas) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Cargando métricas del dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardGrid>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard VCaja
          </h1>
          <p className="text-gray-600">
            Resumen general de tu negocio y acceso rápido a módulos
          </p>
        </div>

        {/* Métricas en círculo alrededor del área central */}
        <MetricsGrid>
          <MetricCard
            title="Balance Total"
            value={`S/ ${metricas.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Saldo actual"
            color="blue"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
          />

          <MetricCard
            title="Ingresos"
            value={`S/ ${metricas.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Este período"
            color="green"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            }
          />

          <MetricCard
            title="Gastos"
            value={`S/ ${metricas.gastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Este período"
            color="red"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            }
          />

          <MetricCard
            title="Transacciones"
            value={metricas.transacciones}
            subtitle="Total registros"
            color="amber"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </MetricsGrid>

        {/* Carrusel Central de Gráficos */}
        <CentralArea>
          <GraphCarousel>
            <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold text-blue-800">Gráfico 1</h3>
                <p className="text-sm text-blue-600">Tendencia Semanal</p>
                <CajaLinealPreview onClick={() => abrirModal('caja-lineal')} />
              </div>
            </div>
            <div className="w-full h-full bg-green-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🍰</div>
                <h3 className="font-semibold text-green-800">Gráfico 2</h3>
                <p className="text-sm text-green-600">Distribución</p>
                <DistribucionGastosPreview onClick={() => abrirModal('distribucion-gastos')} />
              </div>
            </div>
            <div className="w-full h-full bg-orange-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold text-orange-800">Gráfico 3</h3>
                <p className="text-sm text-orange-600">Ranking de Gastos</p>
                <RankingGastosPreview onClick={() => abrirModal('ranking-gastos')} />
              </div>
            </div>
          </GraphCarousel>
        </CentralArea>

        {/* Accesos Rápidos a Módulos */}
        <ModulesGrid>
          <MetricCard
            title="Caja"
            value="💰"
            subtitle="Gestionar movimientos"
            color="blue"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            onClick={() => navigate('/caja')}
          />

          <MetricCard
            title="Herramientas"
            value="🛠️"
            subtitle="Catálogos y config"
            color="green"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            onClick={() => navigate('/herramientas')}
          />

          <MetricCard
            title="Personal"
            value="👥"
            subtitle="Gestión de equipo"
            color="amber"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            onClick={() => navigate('/personal')}
          />

          <MetricCard
            title="Reportes"
            value="📋"
            subtitle="Análisis y datos"
            color="red"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={() => navigate('/reportes')}
          />
        </ModulesGrid>

        {/* Actividad Reciente */}
        <ActivitySection>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📱 Actividad Reciente
          </h2>
          {loadingActividades ? (
            <div className="text-sm text-gray-500">Cargando actividades...</div>
          ) : errorActividades ? (
            <div className="text-sm text-red-500">Error al cargar actividades</div>
          ) : actividades.length === 0 ? (
            <div className="text-sm text-gray-500">No hay actividad reciente</div>
          ) : (
            <div className="space-y-3">
              {actividades.map((actividad) => (
                <div key={actividad._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    actividad.color === 'green' ? 'bg-green-500' : 
                    actividad.color === 'red' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {actividad.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      {actividad.tipo === 'ingreso' ? '+' : '-'}S/ {actividad.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })} • {actividad.fechaRelativa}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ActivitySection>
      </DashboardGrid>

      {/* Modales de Gráficos */}
      <GraphModal
        isOpen={estaAbierto('caja-lineal')}
        onClose={cerrarModal}
        title="📈 Tendencia de Gastos por Categoría"
      >
        <GraficoCajaLineal />
      </GraphModal>

      <GraphModal
        isOpen={estaAbierto('distribucion-gastos')}
        onClose={cerrarModal}
        title="🍰 Distribución de Gastos por Categoría"
      >
        <GraficoDistribucionGastos />
      </GraphModal>

      <GraphModal
        isOpen={estaAbierto('ranking-gastos')}
        onClose={cerrarModal}
        title="📊 Ranking de Gastos por Descripción"
      >
        <GraficoRankingGastos />
      </GraphModal>
    </DashboardLayout>
  );
};

export default DashboardHome;