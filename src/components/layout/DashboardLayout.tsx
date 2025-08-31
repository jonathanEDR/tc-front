import React, { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import Sidebar from './Sidebar';

type Props = {
  title?: string;
  children?: React.ReactNode;
};

export default function DashboardLayout({ title = 'Dashboard', children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // abierto por defecto en desktop

  // Detectar si es móvil para cerrar el sidebar al navegar
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-white shadow flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            onClick={() => setSidebarOpen((open) => !open)}
            className="px-3 py-1 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {/* Icono hamburguesa o cruz */}
            {sidebarOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div>
          <UserButton />
        </div>
      </header>

      <div className="p-2 md:p-6">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          {/* Sidebar colapsable en todas las vistas */}
          <div
            className={`relative transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-x-hidden`}
            style={{ minWidth: sidebarOpen ? '16rem' : '0', maxWidth: sidebarOpen ? '16rem' : '0' }}
          >
            <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
              style={{ height: '100%' }}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} showClose={false} />
            </div>
          </div>
          <div className="flex-1 w-full max-w-full">{children}</div>
        </div>
      </div>

      {/* Sidebar overlay para móvil (cuando está abierto) */}
      {!sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}
    </div>
  );
}
