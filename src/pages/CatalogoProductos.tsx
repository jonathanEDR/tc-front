import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function CatalogoProductos() {
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
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Catálogo de Productos</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚧 Catálogo de Productos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Esta sección está en desarrollo. Pronto podrás gestionar tu inventario completo de productos, 
            precios, disponibilidad y características desde aquí.
          </p>
        </div>

        {/* Estado de desarrollo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              ⚙️ En Desarrollo Activo
            </h3>
            <p className="text-blue-700 mb-6">
              Estamos trabajando en implementar las siguientes funcionalidades:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">📦 Gestión de Inventario</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Registro de productos</li>
                  <li>• Control de stock</li>
                  <li>• Alertas de inventario bajo</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">💰 Gestión de Precios</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Precios de compra y venta</li>
                  <li>• Márgenes de ganancia</li>
                  <li>• Historial de precios</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">🏷️ Categorización</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Categorías y subcategorías</li>
                  <li>• Etiquetas personalizadas</li>
                  <li>• Filtros avanzados</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Reportes</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Productos más vendidos</li>
                  <li>• Análisis de rentabilidad</li>
                  <li>• Rotación de inventario</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de desarrollo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Cronograma de Desarrollo</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fase 1: Diseño de estructura</p>
                <p className="text-sm text-gray-500">Completado - Definición de modelos y API</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fase 2: Interfaz de usuario</p>
                <p className="text-sm text-gray-500">En progreso - Desarrollo de componentes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fase 3: Funcionalidades avanzadas</p>
                <p className="text-sm text-gray-500">Próximo - Reportes y análisis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/herramientas"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Herramientas
          </Link>
          
          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
            </svg>
            Notificarme cuando esté listo
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}