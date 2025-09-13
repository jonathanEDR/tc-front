import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';

const links = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/caja', label: 'Caja' },
  { to: '/profile', label: 'Perfil' },
];

type SidebarProps = {
  className?: string;
  onClose?: () => void;
  showClose?: boolean;
};

export default function Sidebar({ className = '', onClose, showClose = false }: SidebarProps) {
  const { user } = useUser();
  return (
    <aside className={`w-64 min-h-[80vh] flex flex-col bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-100 ${className}`} aria-label="Menú lateral">
      {/* Botón de cerrar SOLO en móvil (md:hidden) */}
      {showClose && (
        <button
          aria-label="Cerrar menú lateral"
          className="absolute top-2 right-2 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 md:hidden"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
      )}
      {/* Avatar y título */}
      <div className="flex flex-col items-center gap-2 py-6 border-b border-blue-100 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow">
          {user ? <img src={user.imageUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="bg-gray-200 w-full h-full" />}
        </div>
        <div className="text-lg font-semibold text-blue-900">{user?.firstName || 'Usuario'}</div>
        <div className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress || ''}</div>
      </div>
      {/* Menú */}
      <nav className="flex-1 space-y-1 px-2" tabIndex={0}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition-colors duration-150 outline-none focus:ring-2 focus:ring-blue-400 font-medium text-base ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-blue-100 hover:text-blue-700 text-blue-900'
              }`
            }
            onClick={onClose}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      {/* Footer */}
      <div className="mt-6 mb-2 px-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </aside>
  );
}
