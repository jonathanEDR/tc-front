# ============================================
# CONFIGURACIÓN PARA VERCEL
# ============================================

# Configuración de las Variables de Entorno en Vercel:
# 1. Ve a tu proyecto en vercel.com
# 2. Settings → Environment Variables
# 3. Agrega estas variables:

# REQUERIDAS (Para producción):
VITE_API_BASE_URL=https://tu-backend-de-produccion.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_tu_clave_de_produccion_de_clerk

# OPCIONALES (Para optimización):
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true

# ============================================
# NOTAS IMPORTANTES
# ============================================

# 1. Framework: Vite (se detecta automáticamente)
# 2. Build Command: npm run build (configurado en vercel.json)
# 3. Output Directory: dist (configurado en vercel.json)
# 4. Install Command: npm install (por defecto)

# ============================================
# TROUBLESHOOTING
# ============================================

# Si el despliegue falla:
# 1. Verificar que las variables de entorno estén configuradas
# 2. Verificar que VITE_CLERK_PUBLISHABLE_KEY sea la clave de producción (pk_live_...)
# 3. Verificar que VITE_API_BASE_URL apunte al backend correcto
# 4. Comprobar los logs de build en Vercel para errores específicos

# Si hay errores de rutas:
# 1. Vercel debería manejar automáticamente las rutas SPA
# 2. El vercel.json está configurado para redirigir todo a index.html

# Si hay problemas de CORS:
# 1. Configurar CORS en el backend para permitir el dominio de Vercel
# 2. Ejemplo: https://tu-proyecto.vercel.app