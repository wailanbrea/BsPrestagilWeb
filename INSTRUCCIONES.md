# ⚡ Instrucciones Rápidas - BsPrestagil Web

## 🎉 ¡Tu proyecto está listo!

He creado la estructura base de tu aplicación web de gestión de préstamos. El servidor de desarrollo ya está corriendo en el puerto 3000.

## ✅ Lo que ya está implementado:

1. ✅ **Setup completo** del proyecto Next.js + TypeScript + Tailwind CSS
2. ✅ **Modelos de datos** (Cliente, Préstamo, Cuota, Pago, Garantía, Usuario)
3. ✅ **Configuración de Firebase** (Auth, Firestore, Storage)
4. ✅ **Sistema de autenticación**:
   - Página de Login (`/login`)
   - Página de Registro (`/register`)
   - Hooks de autenticación
5. ✅ **Layout del Dashboard**:
   - Sidebar con navegación
   - Navbar con información del usuario
   - Rutas protegidas
6. ✅ **Dashboard principal** con estadísticas en tiempo real
7. ✅ **Gestión de Clientes** (CRUD completo):
   - Lista de clientes con búsqueda
   - Crear nuevo cliente
   - Ver detalles (pendiente)
8. ✅ **Lógica de amortización**:
   - Sistema Francés (cuota fija)
   - Sistema Alemán (capital fijo)

## 🚀 Pasos Siguientes (IMPORTANTE):

### 1. Configurar Firebase

**DEBES hacer esto antes de usar la aplicación:**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto nuevo (o usa el existente de tu app Android)
3. En **Project Settings**, copia las credenciales de tu Web App
4. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Crea este archivo manualmente
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

5. En Firebase Console, activa:
   - **Authentication** > Sign-in method > Email/Password
   - **Firestore Database** > Create database (Production mode)
   - **Storage** > Get started

### 2. Acceder a la aplicación

```bash
# Si el servidor no está corriendo, ejecuta:
npm run dev
```

Luego abre tu navegador en: `http://localhost:3000`

**Primera vez:**
1. Te redirigirá a `/login`
2. Haz click en "Registrarse"
3. Crea tu primera cuenta (será ADMIN automáticamente)
4. Ya puedes usar el sistema

### 3. Funcionalidades disponibles

**✅ Ahora puedes:**
- Ver el dashboard con estadísticas
- Crear, ver y buscar clientes
- Ver la lista de préstamos (vacía inicialmente)

**⏳ Por implementar:**
- Crear nuevos préstamos (formulario)
- Ver detalles y cronograma de préstamos
- Registrar pagos
- Gestión de garantías
- Gestión de cobradores
- Reportes y PDFs

## 📝 Estructura de Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/` | Página principal (redirecciona) | ✅ |
| `/login` | Inicio de sesión | ✅ |
| `/register` | Registro de usuario | ✅ |
| `/dashboard` | Dashboard principal | ✅ |
| `/clientes` | Lista de clientes | ✅ |
| `/clientes/nuevo` | Crear cliente | ✅ |
| `/clientes/[id]` | Detalles del cliente | ⏳ |
| `/prestamos` | Lista de préstamos | ⏳ |
| `/prestamos/nuevo` | Crear préstamo | ⏳ |
| `/prestamos/[id]` | Detalles del préstamo | ⏳ |
| `/pagos` | Registro de pagos | ⏳ |
| `/garantias` | Gestión de garantías | ⏳ |
| `/cobradores` | Gestión de cobradores | ⏳ |
| `/reportes` | Reportes y estadísticas | ⏳ |

## 🎨 Componentes de UI Disponibles

Todos en `src/components/ui/`:
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Alert
- ✅ Dialog
- ✅ Table
- ✅ Select

## 🔥 Tips de Desarrollo

### Agregar más componentes de shadcn/ui

```bash
npx shadcn@latest add [componente]
# Ejemplo:
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
```

### Ver logs de Firebase

Abre la consola del navegador (F12) para ver los logs de Firestore y Auth.

### Hot Reload

Los cambios se reflejan automáticamente. Si algo no funciona:
```bash
# Detén el servidor (Ctrl+C) y vuelve a ejecutar:
npm run dev
```

## ⚠️ Solución de Problemas Comunes

### Error: "Firebase is not defined"
→ Verifica que el archivo `.env.local` existe y tiene las variables correctas

### Error: "Permission denied" en Firestore
→ Configura las reglas de Firestore para permitir lectura/escritura a usuarios autenticados

### La página está en blanco
→ Abre la consola del navegador (F12) para ver los errores

### No puedo registrarme
→ Verifica que Email/Password esté activado en Firebase Authentication

## 📚 Próximos Pasos Sugeridos

1. **Completar gestión de clientes**: Agregar página de detalles y edición
2. **Implementar gestión de préstamos**: Formulario de creación con cronograma
3. **Sistema de pagos**: Registrar pagos y actualizar cuotas
4. **Garantías**: Upload de fotos y gestión
5. **Cobradores**: Asignación y comisiones
6. **Reportes**: Gráficas con Recharts
7. **PDFs**: Generar cronogramas con jsPDF

## 💡 Recursos Útiles

- **Documentación Next.js**: https://nextjs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs/web/setup
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🆘 ¿Necesitas Ayuda?

Si tienes dudas o problemas:
1. Revisa el archivo `GUIA_NEXTJS_BSPRESTAGIL.md` (contiene toda la documentación)
2. Revisa el README.md para más detalles
3. Consulta los comentarios en el código

---

**¡Listo para comenzar! 🎉**

El sistema está corriendo en: http://localhost:3000

