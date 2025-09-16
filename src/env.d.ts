// Type definitions for Vite import.meta.env and global Clerk helper
// Keep this file as a global types declaration only

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_NODE_ENV?: string;
  readonly VITE_DEBUG?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_REPORTING?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extender la interfaz Window para incluir Clerk (opcional, evita errores si lo usas)
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>;
      };
    };
  }
}

export {};
