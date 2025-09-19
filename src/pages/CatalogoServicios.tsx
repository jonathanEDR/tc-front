import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CatalogoServicios() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                to="/herramientas" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                🛠️ Herramientas
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Catálogo de Servicios</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⏳ Catálogo de Servicios
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Esta funcionalidad está planificada para futuras versiones. Aquí podrás gestionar todos 
            los servicios que ofreces, tarifas, configuraciones y seguimiento de clientes.
          </p>
        </div>

        {/* Estado planificado */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              📋 Funcionalidad Planificada
            </h3>
            <p className="text-green-700 mb-6">
              Estamos diseñando un sistema completo para la gestión de servicios:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">📋 Catálogo de Servicios</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Registro de servicios</li>
                  <li>• Descripciones detalladas</li>
                  <li>• Categorización por tipo</li>
                  <li>• Requisitos y condiciones</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">💰 Gestión de Tarifas</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Precios por servicio</li>
                  <li>• Tarifas por tiempo/proyecto</li>
                  <li>• Descuentos y promociones</li>
                  <li>• Paquetes combinados</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">👥 Gestión de Clientes</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Historial de servicios</li>
                  <li>• Seguimiento de proyectos</li>
                  <li>• Facturación automática</li>
                  <li>• Feedback y evaluaciones</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">⏰ Programación</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Calendario de servicios</li>
                  <li>• Reservas y citas</li>
                  <li>• Gestión de horarios</li>
                  <li>• Recordatorios automáticos</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">📊 Análisis y Reportes</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Servicios más solicitados</li>
                  <li>• Ingresos por servicio</li>
                  <li>• Satisfacción del cliente</li>
                  <li>• Tendencias y proyecciones</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">🔧 Configuración</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Términos y condiciones</li>
                  <li>• Políticas de servicio</li>
                  <li>• Métodos de pago</li>
                  <li>• Notificaciones personalizadas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap de desarrollo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Hoja de Ruta de Desarrollo</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">✅ Investigación y análisis de requisitos</p>
                <p className="text-sm text-gray-500">Completado - Definición de funcionalidades clave</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">📋 Diseño de arquitectura del sistema</p>
                <p className="text-sm text-gray-500">Próximo - Después del catálogo de productos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">⚙️ Desarrollo e implementación</p>
                <p className="text-sm text-gray-500">Futuro - Estimado para Q2 2024</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">🚀 Lanzamiento y optimización</p>
                <p className="text-sm text-gray-500">Futuro - Pruebas beta y mejoras</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💡 ¿Tienes ideas para el catálogo de servicios?
            </h3>
            <p className="text-gray-600 mb-4">
              Tu feedback es valioso para diseñar la mejor experiencia de gestión de servicios.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                💬 Enviar sugerencia
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                📧 Notificarme del progreso
              </button>
            </div>
          </div>
        </div>

        {/* Acciones de navegación */}
        <div className="flex justify-center">
          <Link
            to="/herramientas"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Centro de Herramientas
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}