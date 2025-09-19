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
import { DistribucionGastosPreview, IngresosGastosPreview } from './GraphPreviews';
import GraficoCajaLineal from '../graficos/GraficoCajaLineal';

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

  // Mock data - esto se reemplazará con datos reales de la API
  const mockMetrics = {
    balance: 3354.70,
    ingresos: 5471.25,
    gastos: 2116.55,
    transacciones: 10
  };

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
            value={`S/ ${mockMetrics.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Saldo actual"
            color="blue"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            trend={{ value: 12.5, isPositive: true }}
          />

          <MetricCard
            title="Ingresos"
            value={`S/ ${mockMetrics.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Este período"
            color="green"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            }
            trend={{ value: 8.3, isPositive: true }}
          />

          <MetricCard
            title="Gastos"
            value={`S/ ${mockMetrics.gastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            subtitle="Este período"
            color="red"
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            }
            trend={{ value: 3.2, isPositive: false }}
          />

          <MetricCard
            title="Transacciones"
            value={mockMetrics.transacciones}
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
            <div className="w-full h-full bg-purple-100 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">⚖️</div>
                <h3 className="font-semibold text-purple-800">Gráfico 3</h3>
                <p className="text-sm text-purple-600">Ingresos vs Gastos</p>
                <IngresosGastosPreview onClick={() => abrirModal('ingresos-gastos')} />
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
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Bonificación por ventas registrada
                </p>
                <p className="text-xs text-gray-500">+S/ 420.80 • hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Material de oficina comprado
                </p>
                <p className="text-xs text-gray-500">-S/ 95.25 • hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Balance del día actualizado
                </p>
                <p className="text-xs text-gray-500">S/ 3,354.70 • hace 6 horas</p>
              </div>
            </div>
          </div>
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
        <div className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Gráfico en Desarrollo</h3>
            <p>Este gráfico de distribución estará disponible próximamente</p>
          </div>
        </div>
      </GraphModal>

      <GraphModal
        isOpen={estaAbierto('ingresos-gastos')}
        onClose={cerrarModal}
        title="⚖️ Comparativo Ingresos vs Gastos"
      >
        <div className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">Gráfico en Desarrollo</h3>
            <p>Este gráfico comparativo estará disponible próximamente</p>
          </div>
        </div>
      </GraphModal>
    </DashboardLayout>
  );
};

export default DashboardHome;