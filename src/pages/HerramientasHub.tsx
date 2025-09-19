import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

// Definición de catálogos disponibles con diseño premium y colores suaves
const catalogos = [
  {
    id: 'gastos',
    titulo: 'Catálogo de Gastos',
    descripcion: 'Gestiona categorías de gastos y movimientos financieros',
    ruta: '/herramientas/gastos',
    icono: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    gradient: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    items: '12 categorías',
    estado: 'Activo',
    badge: 'Activo',
    badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  },
  {
    id: 'productos',
    titulo: 'Catálogo de Productos',
    descripcion: 'Inventario de productos, precios y disponibilidad',
    ruta: '/herramientas/productos',
    icono: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    items: 'Próximamente',
    estado: 'En desarrollo',
    badge: 'Beta',
    badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200'
  },
  {
    id: 'servicios',
    titulo: 'Catálogo de Servicios',
    descripcion: 'Servicios ofrecidos, tarifas y configuraciones',
    ruta: '/herramientas/servicios',
    icono: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
      </svg>
    ),
    gradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    items: 'Próximamente',
    estado: 'Planificado',
    badge: 'Próximo',
    badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200'
  },
  {
    id: 'proveedores',
    titulo: 'Catálogo de Proveedores',
    descripcion: 'Directorio de proveedores y contactos',
    ruta: '/herramientas/proveedores',
    icono: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    items: 'Próximamente',
    estado: 'Planificado',
    badge: 'Futuro',
    badgeColor: 'bg-gray-50 text-gray-600 border border-gray-200'
  }
];

export default function HerramientasHub() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header elegante */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-sm">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Centro de Herramientas
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
              Gestiona todos los catálogos de tu sistema desde un lugar centralizado. 
              Organiza productos, servicios, gastos y proveedores de manera eficiente.
            </p>
          </div>
        </div>

        {/* Estadísticas compactas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Activos</p>
                <p className="text-xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">En desarrollo</p>
                <p className="text-xl font-semibold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Planificados</p>
                <p className="text-xl font-semibold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de catálogos compacto y elegante */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {catalogos.map((catalogo) => (
            <div key={catalogo.id} className="group relative">
              <div className={`bg-gradient-to-br ${catalogo.gradient} rounded-xl border ${catalogo.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                {/* Badge de estado */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${catalogo.badgeColor}`}>
                    {catalogo.badge}
                  </span>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${catalogo.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                      <div className={catalogo.iconColor}>
                        {catalogo.icono}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {catalogo.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {catalogo.descripcion}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Estado: {catalogo.estado}</span>
                        <span>{catalogo.items}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    {catalogo.badge === 'Activo' ? (
                      <Link
                        to={catalogo.ruta}
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors duration-200 shadow-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Abrir Catálogo
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Próximamente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action elegante */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Necesitas un catálogo específico?
              </h3>
              <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                Estamos trabajando constantemente en nuevas herramientas para optimizar tu gestión empresarial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Solicitar catálogo
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors duration-200 shadow-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Sugerir mejora
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}