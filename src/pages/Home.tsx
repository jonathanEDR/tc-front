import React from 'react';
import { Link } from 'react-router-dom';
import AuthButtons from '../components/auth/AuthButtons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Header Corporativo */}
      <header className="relative bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Marca Corporativa */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl shadow-lg">
                <span className="text-white font-bold text-xl tracking-wide">PA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PlastApp</h1>
                <p className="text-sm text-slate-500 font-medium">Sistema de Gestión Integral</p>
              </div>
            </div>

            {/* Acceso al Sistema */}
            <div className="flex items-center">
              <AuthButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Área Principal Corporativa */}
      <main>
        <section className="relative overflow-hidden py-24 sm:py-32">
          {/* Patrón de fondo corporativo */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
              <div className="w-full h-full opacity-[0.02]" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Indicador de Estado Operativo */}
              <div className="inline-flex items-center px-6 py-3 bg-emerald-50 backdrop-blur-sm rounded-full text-sm text-emerald-700 border border-emerald-200 mb-12 shadow-sm">
                <div className="flex w-2 h-2 bg-emerald-500 rounded-full mr-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <span className="font-medium">Sistema operativo - Acceso 24/7</span>
              </div>

              {/* Mensaje Principal */}
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 leading-none tracking-tight">
                Controla tu{' '}
                <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Empresa
                </span>
                <br />
                <span className="text-4xl md:text-6xl text-slate-700">con Precisión</span>
              </h1>

              {/* Propuesta de Valor */}
              <p className="text-xl md:text-2xl text-slate-600 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
                Sistema integral de gestión empresarial diseñado para optimizar 
                el control financiero, inventarios y análisis de rendimiento de su organización.
              </p>

              {/* Acciones Principales */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                <Link 
                  to="/sign-up"
                  className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Crear Cuenta</span>
                  <svg className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                
                <Link 
                  to="/sign-in"
                  className="inline-flex items-center px-10 py-5 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold rounded-2xl border-2 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                >
                  <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Acceder al Sistema
                </Link>
              </div>

              {/* Métricas Corporativas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-slate-900 mb-2">100%</div>
                  <div className="text-sm text-slate-600 font-medium uppercase tracking-wide">Seguridad</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-slate-900 mb-2">24/7</div>
                  <div className="text-sm text-slate-600 font-medium uppercase tracking-wide">Disponibilidad</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-slate-900 mb-2">∞</div>
                  <div className="text-sm text-slate-600 font-medium uppercase tracking-wide">Transacciones</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-bold text-slate-900 mb-2">📊</div>
                  <div className="text-sm text-slate-600 font-medium uppercase tracking-wide">Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Capacidades */}
        <section className="py-20 bg-white/40 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Plataforma Integral de Gestión
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Solución empresarial completa para el control y optimización de procesos de negocio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Control Financiero */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Control de Caja</h3>
                <p className="text-slate-600 leading-relaxed">
                  Gestión completa de flujo de efectivo, registro de transacciones y generación de reportes financieros en tiempo real.
                </p>
              </div>

              {/* Gestión de Inventarios */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Gestión de Inventarios</h3>
                <p className="text-slate-600 leading-relaxed">
                  Control integral de productos, servicios y recursos con categorización inteligente y estimaciones automáticas.
                </p>
              </div>

              {/* Analytics Empresarial */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Analytics Avanzado</h3>
                <p className="text-slate-600 leading-relaxed">
                  Visualización de datos empresariales con gráficos interactivos, métricas KPI y análisis predictivo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
