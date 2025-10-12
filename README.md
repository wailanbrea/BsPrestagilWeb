# 🚀 BsPrestagil Web - Sistema de Gestión de Préstamos

Sistema web desarrollado con Next.js 14, TypeScript y Firebase para gestionar préstamos, clientes, pagos, garantías y cobradores. Comparte la misma base de datos Firebase con la aplicación móvil Android.

## 📋 Características Principales

- ✅ **Autenticación completa** con Firebase Auth
- ✅ **Dashboard con estadísticas** en tiempo real
- ✅ **Gestión de Clientes** (CRUD completo)
- ✅ **Gestión de Préstamos** con sistemas de amortización (Francés y Alemán)
- ✅ **Sistema de Pagos** con distribución automática
- ✅ **Gestión de Garantías** con fotos
- ✅ **Sistema de Cobradores** con comisiones
- ✅ **Reportes y Estadísticas**
- ✅ **Generación de PDFs** de cronogramas

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: jsPDF
- **Date Handling**: date-fns

## 📦 Instalación

### 1. Clonar el repositorio

```bash
cd bsprestagil-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activa **Authentication** con Email/Password
3. Crea una base de datos **Firestore**
4. Configura **Storage** para las fotos

### 4. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

Puedes encontrar estos valores en:
**Firebase Console > Project Settings > General > Your apps > Web app**

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
bsprestagil-web/
├── src/
│   ├── app/                    # Páginas de Next.js (App Router)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── cambiar-password/
│   │   ├── (dashboard)/       # Rutas protegidas del dashboard
│   │   │   ├── dashboard/
│   │   │   ├── clientes/
│   │   │   ├── prestamos/
│   │   │   ├── pagos/
│   │   │   ├── garantias/
│   │   │   ├── cobradores/
│   │   │   └── reportes/
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes de UI (shadcn)
│   │   ├── layout/           # Sidebar, Navbar
│   │   └── ...
│   ├── lib/                   # Utilidades y configuración
│   │   ├── firebase/         # Configuración de Firebase
│   │   ├── hooks/            # Custom React Hooks
│   │   └── utils/            # Funciones de utilidad
│   ├── types/                # Definiciones de TypeScript
│   └── constants/            # Constantes del proyecto
├── public/                    # Archivos estáticos
└── package.json
```

## 🔥 Configuración de Firebase

### Colecciones de Firestore

El sistema utiliza las siguientes colecciones:

- `clientes` - Información de clientes
- `prestamos` - Préstamos activos y completados
- `pagos` - Registro de pagos
- `cuotas` - Cronogramas de amortización
- `garantias` - Garantías registradas
- `usuarios` - Datos extendidos de usuarios (cobradores)
- `notificaciones` - Notificaciones del sistema

### Reglas de Seguridad (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚦 Uso del Sistema

### 1. Registro e Inicio de Sesión

1. Accede a `/register` para crear una cuenta
2. El primer usuario se crea automáticamente como ADMIN
3. Inicia sesión en `/login`

### 2. Dashboard

El dashboard muestra:
- Total de clientes activos
- Préstamos activos
- Capital pendiente de cobro
- Intereses generados
- Lista de préstamos recientes

### 3. Gestión de Clientes

- **Crear**: Click en "Nuevo Cliente" para agregar un cliente
- **Buscar**: Usa la barra de búsqueda para filtrar clientes
- **Ver Detalles**: Click en cualquier tarjeta de cliente
- **Editar/Eliminar**: Desde la vista de detalles

### 4. Gestión de Préstamos

- **Crear Préstamo**: Selecciona un cliente y completa el formulario
- **Sistema de Amortización**:
  - **Francés**: Cuota fija (común en México)
  - **Alemán**: Capital fijo, interés decreciente
- **Frecuencia**: Diario, Quincenal o Mensual
- **Cronograma**: Se genera automáticamente

### 5. Registro de Pagos

- Registra pagos completos o parciales
- El sistema distribuye automáticamente entre capital e interés
- Actualiza el estado de las cuotas
- Recalcula cuotas futuras si es necesario

## 🔐 Seguridad

- ✅ Autenticación requerida para todas las rutas protegidas
- ✅ Validación de datos con TypeScript
- ✅ Soft delete para clientes y préstamos
- ✅ Verificación de email opcional
- ✅ Cambio de contraseña forzado en primer login

## 📱 Compatibilidad con App Android

Este sistema web comparte la misma base de datos Firebase con la aplicación Android existente, lo que permite:

- ✅ Sincronización en tiempo real
- ✅ Mismos datos de clientes y préstamos
- ✅ Misma estructura de datos
- ✅ Compatibilidad total

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Variables de Entorno en Vercel

Agrega las mismas variables de `.env.local` en:
**Vercel Dashboard > Project Settings > Environment Variables**

## 📝 Scripts Disponibles

```bash
npm run dev        # Ejecutar en modo desarrollo
npm run build      # Compilar para producción
npm run start      # Ejecutar versión de producción
npm run lint       # Ejecutar linter
```

## 🎨 Personalización

### Colores

Modifica `src/app/globals.css` para cambiar los colores del tema:

```css
:root {
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... más colores */
}
```

### Logo

Reemplaza `public/logo.png` con tu propio logo.

## 📄 Próximas Funcionalidades

- [ ] Generación de PDFs de cronogramas
- [ ] Gráficas y reportes avanzados
- [ ] Exportación a Excel
- [ ] Sistema de notificaciones
- [ ] Modo oscuro
- [ ] Dashboard de cobradores

## 🐛 Solución de Problemas

### Error de Firebase

Si ves errores de Firebase, verifica que:
1. Las variables de entorno estén configuradas correctamente
2. Firebase esté inicializado en tu proyecto
3. Las reglas de Firestore y Storage permitan acceso autenticado

### Errores de Build

```bash
# Limpia el cache y reinstala
rm -rf node_modules .next
npm install
npm run build
```

## 📞 Soporte

Para problemas o preguntas, consulta la documentación de:
- [Next.js](https://nextjs.org/docs)
- [Firebase](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📜 Licencia

Proyecto privado - Todos los derechos reservados

---

Desarrollado con ❤️ para BsPrestagil
