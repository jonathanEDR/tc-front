import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';

// Definición de navegación simplificada y moderna
const navigationItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    to: '/personal',
    label: 'Personal',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  },
  {
    to: '/caja',
    label: 'Caja',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    to: '/herramientas',
    label: 'Herramientas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
];

type SidebarProps = {
  className?: string;
  onClose?: () => void;
  showClose?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function Sidebar({ className = '', onClose, showClose = false, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { user } = useUser();
  
  return (
    <div className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-white/95 backdrop-blur-xl border-r border-gray-200/60 flex flex-col transition-all duration-300 ease-in-out ${className}`}>
      {/* Header del Sidebar - Diseño moderno */}
      <div className="relative overflow-hidden">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Contenido del header */}
        <div className="relative p-6">
          {showClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white lg:hidden transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Botón toggle para desktop */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="absolute top-4 right-4 hidden lg:block p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          )}
          
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            {/* Logo moderno */}
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-white font-bold text-lg">TC</span>
              </div>
              {!collapsed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-sm">PlastAPP</h1>
                <p className="text-white/80 text-sm font-medium">Panel de Control</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación moderna */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center ${collapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex-shrink-0 transition-all duration-200 ${
                    isActive 
                      ? 'text-blue-600 scale-110' 
                      : 'text-gray-500 group-hover:text-gray-700 group-hover:scale-105'
                  }`}>
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer moderno con información del usuario */}
      <div className="border-t border-gray-200/60 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            {/* Información del usuario */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'Sin email'}
                </p>
              </div>
            </div>
            
            {/* UserButton */}
            <div className="flex justify-center">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "hidden",
                    userButtonPopoverCard: "bg-white shadow-xl rounded-xl border-0",
                    userButtonPopoverActions: "bg-gray-50"
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-sm">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}