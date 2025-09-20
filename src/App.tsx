import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './store/StoreProvider';
import Home from './pages/Home';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import DashboardHome from './components/dashboard/DashboardHome';
import Profile from './pages/Profile';
import Caja from './pages/Caja';
import GestionPersonal from './pages/GestionPersonal';
import HerramientasHub from './pages/HerramientasHub';
import CatalogoGastos from './pages/CatalogoGastos';
import CatalogoProductos from './pages/CatalogoProductos';
import CatalogoServicios from './pages/CatalogoServicios';

export default function App() {
  return (
    <StoreProvider>
      {/* Configuración global de notificaciones */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Configuración por defecto para todos los toasts
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            maxWidth: '500px',
          },
          // Configuraciones específicas por tipo
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
        }}
      />

      <BrowserRouter>
      <Routes>
        {/* Página pública */}
        <Route path="/" element={<Home />} />

        {/* Páginas de autenticación */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Página protegida - solo para usuarios autenticados */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <DashboardHome />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <SignedIn>
                <Profile />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/caja"
          element={
            <>
              <SignedIn>
                <Caja />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/personal"
          element={
            <>
              <SignedIn>
                <GestionPersonal />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas"
          element={
            <>
              <SignedIn>
                <HerramientasHub />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas/gastos"
          element={
            <>
              <SignedIn>
                <CatalogoGastos />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas/productos"
          element={
            <>
              <SignedIn>
                <CatalogoProductos />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/herramientas/servicios"
          element={
            <>
              <SignedIn>
                <CatalogoServicios />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
    </StoreProvider>
  );
}
