# 🌐 Configuración de Variables de Entorno para Vercel

Este documento explica cómo configurar las variables de entorno necesarias para desplegar correctamente la aplicación en Vercel.

## 📋 Variables de Entorno Requeridas

### 1. VITE_API_BASE_URL
- **Descripción**: URL base de tu API backend en producción
- **Ejemplo**: `https://tu-backend.herokuapp.com` o `https://api.tudominio.com`
- **Importante**: NO incluir `/api` al final, solo la URL base

### 2. VITE_CLERK_PUBLISHABLE_KEY
- **Descripción**: Clave pública de Clerk para producción
- **Formato**: `pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Obtener de**: Dashboard de Clerk → Settings → API Keys → Publishable keys

### 3. VITE_NODE_ENV (Opcional)
- **Descripción**: Ambiente de ejecución
- **Valor**: `production`
- **Se configura automáticamente en Vercel**

### 4. VITE_DEBUG (Opcional)
- **Descripción**: Habilitar logs de debug
- **Valor**: `false` para producción
- **Recomendado**: No configurar en producción

## 🔧 Cómo Configurar en Vercel

### Método 1: Dashboard de Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega cada variable:
   - **Name**: Nombre de la variable (ej: `VITE_API_BASE_URL`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona **Production**
4. Haz clic en **Save**

### Método 2: Vercel CLI
```bash
# Configurar variables de entorno desde la terminal
vercel env add VITE_API_BASE_URL production
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
```

### Método 3: Archivo vercel.json (NO recomendado para variables sensibles)
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://tu-backend.com"
  }
}
```

## ⚠️ Consideraciones de Seguridad

### ✅ Variables PÚBLICAS (Prefix VITE_)
- Estas variables son **visibles en el frontend**
- Solo incluir información que puede ser pública
- Ejemplos: URLs de API, claves públicas de servicios

### 🔒 Variables PRIVADAS
- **NO** usar variables con datos sensibles en el frontend
- Las claves privadas deben ir en el backend
- Ejemplo de lo que NO hacer: `VITE_DATABASE_PASSWORD`

## 🔄 Redepliegue después de Cambios

Después de cambiar variables de entorno en Vercel:
1. Ve a **Deployments**
2. Haz clic en **Redeploy** en el último deployment
3. Selecciona **Use existing Build Cache** (opcional)
4. Confirma el redepliegue

## 🧪 Verificar Variables en Producción

Para verificar que las variables están cargándose correctamente:

```javascript
// En el navegador (Console del desarrollador)
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
```

## 📚 Variables por Ambiente

| Variable | Desarrollo | Producción |
|----------|------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:5000` | `https://tu-backend.com` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `VITE_DEBUG` | `true` | `false` |

## 🚨 Troubleshooting

### Problema: Variables no se cargan
- **Verificar**: Que tengan el prefijo `VITE_`
- **Verificar**: Que estén configuradas en Vercel
- **Solución**: Redesplegar después de configurar

### Problema: API no conecta
- **Verificar**: URL de `VITE_API_BASE_URL` es correcta
- **Verificar**: CORS configurado en el backend
- **Verificar**: Backend está desplegado y funcionando