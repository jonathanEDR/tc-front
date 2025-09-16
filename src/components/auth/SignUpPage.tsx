import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { apiClient } from '../../utils/api';
import axios from 'axios';

export default function SignUpPage() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const registerUserInBackend = async () => {
      if (isSignedIn && user) {
        try {
          // Extraer datos del usuario de Clerk
          const userData = {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
            email: user.primaryEmailAddress?.emailAddress,
            clerkId: user.id
          };

          console.log('Registrando usuario en backend:', userData);

          // Enviar datos al backend para guardar en BD
          const response = await axios.post(apiClient.register, userData, {
            headers: {
              'Content-Type': 'application/json',
            }
          });

          console.log('Usuario guardado en BD:', response.data);
        } catch (error) {
          console.error('Error al guardar usuario en BD:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      }
    };

    registerUserInBackend();
  }, [isSignedIn, user]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h1>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          redirectUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  );
}
