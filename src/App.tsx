import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
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
  );
}
