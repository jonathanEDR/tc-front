import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';

// Definición de categorías y módulos de navegación
const navigationSections = [
  {
    title: 'GESTIÓN DE USUARIOS',
    items: [
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
        label: 'Gestión de Personal',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      }
    ]
  },
  {
    title: 'OPERACIONES',
    items: [
      {
        to: '/caja',
        label: 'Gestión de Caja',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    ]
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
    <div className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${className}`}>
      {/* Header del Sidebar */}
      <div className="bg-white border-b border-gray-200 p-4 relative">
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 lg:hidden"
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
            className="absolute top-4 right-4 hidden lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        )}
        
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">TC</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Panel Super</h1>
              <h2 className="text-lg font-bold text-gray-900">Admin</h2>
            </div>
          )}
        </div>
      </div>

      {/* Navegación por secciones */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center ${collapsed ? 'justify-center px-2' : 'space-x-3 px-3'} py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer con información del usuario */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-xs font-bold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress || ''}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "hidden",
                    userButtonPopoverCard: "bg-white"
                  }
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-bold">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
