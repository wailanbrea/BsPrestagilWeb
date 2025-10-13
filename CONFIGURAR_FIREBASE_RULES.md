# 🔒 Configurar Firebase Security Rules

## 📋 Pasos para Configurar las Reglas de Seguridad

### 1. Acceder a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **bsprestagil**
3. En el menú lateral, click en **Firestore Database**
4. Click en la pestaña **Reglas** (Rules)

### 2. Copiar las Reglas

1. Abre el archivo `firestore.rules` en este proyecto
2. Copia TODO el contenido del archivo
3. Pega el contenido en el editor de Firebase Console
4. Click en **Publicar** (Publish)

### 3. Verificar las Reglas

Después de publicar, verifica que las reglas estén activas:

- Los **PRESTAMISTAS** y **ADMIN** deben tener acceso completo
- Los **COBRADORES** solo deben ver:
  - Sus propios datos en `usuarios`
  - Todos los clientes (solo lectura)
  - Solo préstamos donde `cobradorId` = su UID
  - Pueden crear pagos, pero no editar/eliminar

---

## 🔑 Roles Implementados

### PRESTAMISTA / ADMIN
- ✅ Acceso completo a todas las colecciones
- ✅ Puede crear, leer, actualizar y eliminar
- ✅ Puede gestionar usuarios y cobradores

### COBRADOR
- ✅ Solo lectura de clientes
- ✅ Solo préstamos asignados (donde `cobradorId` = su UID)
- ✅ Puede crear pagos
- ❌ NO puede editar/eliminar pagos
- ❌ NO puede acceder a configuración
- ❌ NO puede gestionar usuarios
- ❌ NO puede ver garantías

---

## 🧪 Testing de Reglas

### Crear Usuario Cobrador de Prueba

1. **Firebase Authentication:**
   - Email: `cobrador@test.com`
   - Password: `123456`
   - Copiar el UID del usuario

2. **Firestore - Colección `usuarios`:**
   ```json
   {
     "id": "uid-del-cobrador",
     "nombre": "Juan Cobrador",
     "email": "cobrador@test.com",
     "rol": "COBRADOR",
     "activo": true,
     "primerLogin": false,
     "fechaCreacion": 1728765432000
   }
   ```

3. **Probar Acceso:**
   - Login con `cobrador@test.com`
   - Verificar que:
     - Solo ve 4 items en menú
     - Va a `/cobrador/dashboard`
     - No puede acceder a `/garantias`, `/cobradores`, `/reportes`

---

## 📊 Estructura de Datos Requerida

### Colección `usuarios`

Cada usuario debe tener el campo `rol`:

```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'PRESTAMISTA' | 'ADMIN' | 'COBRADOR'; // ⭐ CAMPO CLAVE
  activo: boolean;
  primerLogin: boolean;
  fechaCreacion: number;
  // ... otros campos
}
```

### Colección `prestamos`

Los préstamos deben tener `cobradorId` para asignación:

```typescript
interface Prestamo {
  id: string;
  clienteId: string;
  cobradorId?: string; // ⭐ Para filtrar por cobrador
  cobradorNombre?: string;
  // ... otros campos
}
```

### Colección `pagos`

Los pagos deben registrar quién cobró:

```typescript
interface Pago {
  id: string;
  prestamoId: string;
  recibidoPor: string; // ⭐ UID del cobrador que recibió el pago
  // ... otros campos
}
```

---

## 🚨 Importante

1. **Publicar las reglas:** Las reglas NO se aplican automáticamente, debes publicarlas en Firebase Console

2. **Testing:** Siempre prueba con usuarios de diferentes roles después de publicar

3. **Backup:** Firebase Console guarda un historial de versiones de reglas, puedes revertir si algo sale mal

4. **Seguridad:** Estas reglas son tu última línea de defensa, NO confíes solo en la UI

---

## ✅ Checklist

- [ ] Copiar reglas de `firestore.rules` a Firebase Console
- [ ] Publicar las reglas
- [ ] Crear usuario de prueba COBRADOR
- [ ] Agregar campo `rol` a usuarios existentes
- [ ] Probar login como COBRADOR
- [ ] Probar login como PRESTAMISTA
- [ ] Verificar que cobradores solo ven sus préstamos
- [ ] Verificar que cobradores no pueden eliminar clientes/préstamos

---

**Última actualización:** Octubre 2024  
**Estado:** Listo para configuración ✅

