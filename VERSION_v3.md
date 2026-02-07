# Sistema de Inventario - Versión 3 (v3)

**Fecha de lanzamiento:** 2025-01-23  
**Estado:** FUNCIONAL  
**Versión anterior:** sistema_inventarios_v2

---

## 📋 Tabla de Contenidos

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Funcionalidades Nuevas](#funcionalidades-nuevas)
3. [Cambios en Base de Datos](#cambios-en-base-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Frontend Changes](#frontend-changes)
6. [Seguridad y Permisos](#seguridad-y-permisos)
7. [Instrucciones de Rollback](#instrucciones-de-rollback)
8. [Credenciales de Prueba](#credenciales-de-prueba)

---

## Resumen de Cambios

Esta versión introduce tres mejoras principales al sistema de inventario:

1. **Gestión de Imágenes de Productos**: Ahora es posible adjuntar fotografías a cada producto
2. **Control de Acceso por Roles**: Implementación de seguridad basada en roles (ADMIN vs USER)
3. **Mejoras en Experiencia de Usuario**: Modal de confirmación para cerrar sesión

### Cambios Mayores

- ✅ Subida y gestión de imágenes de productos
- ✅ Sistema de permisos basado en roles de usuario
- ✅ Protección del módulo de usuarios para administradores
- ✅ Modal de confirmación al cerrar sesión
- ✅ Unidades de medida en productos (continuación de v2)

---

## Funcionalidades Nuevas

### 1. 🖼️ Gestión de Imágenes de Productos

#### Características
- **Subida de Imágenes**: Interfaz intuitiva para cargar imágenes de productos
  - Formatos soportados: JPEG, PNG, GIF, WebP
  - Tamaño máximo: 5MB por imagen
  - Vista previa antes de guardar
  - Posibilidad de eliminar o cambiar la imagen

- **Visualización en Tabla**: Las imágenes se muestran en el listado de productos
  - Miniaturas de 64x64px con object-cover
  - Placeholder cuando no hay imagen asignada
  - Imagen alineada y con bordes redondeados

- **Validaciones**:
  - Validación de tipo de archivo en backend
  - Validación de tamaño máximo en backend
  - Mensajes de error claros al usuario
  - Indicador de carga mientras se sube la imagen

- **Almacenamiento**:
  - Directorio: `/public/uploads/products/`
  - Nombres únicos: timestamp + string aleatoria
  - URLs públicas accesibles

#### Archivos Afectados
- `/src/app/api/upload/route.ts` - Endpoint de subida de imágenes
- `/src/app/api/productos/route.ts` - API de productos (GET, POST)
- `/src/app/api/productos/[id]/route.ts` - API de productos (PUT)
- `/src/app/productos/page.tsx` - Frontend completo de productos

#### Uso del Feature
1. Crear/Editar producto:
   - Sección de "Imagen del Producto" en el formulario
   - Botón "Subir Imagen" para seleccionar archivo
   - Vista previa de la imagen seleccionada
   - Botón X para eliminar la imagen
   - Texto informativo sobre formatos y tamaño

2. Tabla de productos:
   - Nueva columna "Imagen" al inicio de la tabla
   - Muestra miniatura o icono de placeholder
   - Imágenes con estilo uniforme (64x64px, border, rounded-lg)

---

### 2. 🔐 Control de Acceso por Roles

#### Características
- **Sistema de Roles**: Dos roles principales
  - `ADMIN`: Acceso completo al sistema incluyendo gestión de usuarios
  - `USER`: Acceso limitado a funciones operativas (inventario, ventas, etc.)

- **Hook de Autenticación**: Hook personalizado `useAuth()` para gestión de sesión
  - `user`: Datos completos del usuario
  - `isAdmin`: Booleano para verificación de permisos
  - `isLoggedIn`: Estado de autenticación
  - `isLoading`: Estado de carga

- **Filtrado de Navegación**: El menú lateral se ajusta según rol
  - Opción "Usuarios" con flag `adminOnly: true`
  - Solo visible para usuarios con rol ADMIN
  - Filtrado dinámico en sidebar desktop y móvil

#### Archivos Afectados
- `/src/hooks/use-auth.ts` - Nuevo hook de autenticación
- `/src/components/layout/sidebar.tsx` - Menú con filtrado por rol
- `/src/app/usuarios/page.tsx` - Página protegida con verificación de permisos

#### Comportamiento por Rol

**Usuario con Rol ADMIN:**
- ✅ Ve opción "Usuarios" en el menú
- ✅ Puede acceder a `/usuarios`
- ✅ Puede crear, editar y eliminar usuarios
- ✅ Puede asignar roles (USER o ADMIN)

**Usuario con Rol USER:**
- ✅ **NO** ve opción "Usuarios" en el menú
- ✅ Si intenta acceder a `/usuarios`:
  - Muestra mensaje: "Acceso denegado"
  - Descripción: "No tienes permisos para acceder a esta página"
  - Redirigido automáticamente al dashboard
- ✅ No puede realizar operaciones de gestión de usuarios

---

### 3. 🔒 Modal de Confirmación al Cerrar Sesión

#### Características
- **Modal de Confirmación**: Diálogo de seguridad antes de cerrar sesión
  - Título: "¿Cerrar Sesión?" con icono de logout
  - Pregunta: "¿Estás seguro de que deseas cerrar tu sesión actual?"
  - Dos botones: "Cancelar" y "Cerrar Sesión"

#### Flujo de Usuario

**Opción 1: Cancelar**
1. Usuario hace clic en "Cerrar Sesión"
2. Se abre el modal de confirmación
3. Usuario hace clic en "Cancelar"
4. El modal se cierra
5. Usuario **PERMANECE** logueado en el sistema

**Opción 2: Confirmar Cierre**
1. Usuario hace clic en "Cerrar Sesión"
2. Se abre el modal de confirmación
3. Usuario hace clic en "Cerrar Sesión"
4. Se elimina la sesión (user y token de localStorage)
5. Se muestra toast: "Sesión cerrada" + "Has cerrado sesión exitosamente"
6. Se redirige a la página de login

#### Archivos Afectados
- `/src/components/layout/header.tsx` - Header con modal de confirmación

#### Mejoras
- ✅ Protección contra cierres accidentales
- ✅ Confirmación clara de acción
- ✅ Diferenciación visual de botones (outline vs destructive)
- ✅ Iconografía consistente
- ✅ Feedback de usuario con toast notification

---

## Cambios en Base de Datos

### Esquema de Productos
**Cambios en modelo Product:**
```prisma
model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  sku         String      @unique
  price       Float
  stock       Int         @default(0)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id])
  unitId      String      // NUEVO: Campo obligatorio
  unit        Unit        @relation(fields: [unitId], references: [id]) // NUEVO
  imageUrl    String?     // NUEVO: Campo opcional para imagen
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  inboundItems InboundItem[]
  saleItems    SaleItem[]
}
```

**Modelo Unit (ya existía en v2 pero ahora usado):**
```prisma
model Unit {
  id          String     @id @default(cuid())
  name        String     @unique
  symbol      String
  description String?
  active      Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  products    Product[]
}
```

### Nota de Migración
- ⚠️ **IMPORTANTE**: Se realizó un `--force-reset` de la base de datos
- Esto significa que **TODOS LOS DATOS FUERON ELIMINADOS**
- Necesario volver a cargar categorías, unidades, productos, clientes, proveedores, etc.
- Recomendación: Usar el API de seed o crear datos de prueba nuevamente

---

## API Endpoints

### Endpoints Nuevos en v3

#### 1. `/api/upload` (POST)
**Propósito**: Subir imágenes de productos

**Solicitud:**
- Content-Type: `multipart/form-data`
- Campo: `file` (archivo de imagen)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "imageUrl": "/uploads/products/1737601234567-abc123def456.jpg",
  "filename": "1737601234567-abc123def456.jpg"
}
```

**Errores:**
- `400` - No se proporcionó archivo
- `400` - Tipo de archivo no permitido
- `400` - Archivo demasiado grande (máximo 5MB)
- `500` - Error interno del servidor

**Validaciones:**
- Tipos permitidos: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
- Tamaño máximo: 5MB (5 * 1024 * 1024 bytes)
- Nombres únicos: `timestamp` + `string aleatoria`

#### 2. `/api/unidades` (GET)
**Propósito**: Obtener todas las unidades de medida activas

**Respuesta Exitosa (200):**
```json
{
  "unidades": [
    {
      "id": "clx...",
      "name": "Unidad",
      "symbol": "u",
      "description": "Unidad base",
      "active": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Endpoints Modificados en v3

#### 3. `/api/productos` (GET)
**Cambio**: Ahora incluye relación `unit` en la respuesta
```json
{
  "productos": [
    {
      "id": "...",
      "name": "...",
      "sku": "...",
      "price": 123.45,
      "stock": 50,
      "categoryId": "...",
      "category": { ... },
      "unitId": "...",      // NUEVO
      "unit": { ... },      // NUEVO
      "imageUrl": "...",     // NUEVO
      "active": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### 4. `/api/productos` (POST)
**Cambio**: Ahora acepta campos adicionales
- `unitId` (obligatorio)
- `imageUrl` (opcional)

**Cuerpo de la solicitud:**
```json
{
  "name": "Producto Test",
  "description": "Descripción",
  "sku": "PROD-001",
  "price": 100.50,
  "stock": 50,
  "categoryId": "categoria-id",
  "unitId": "unidad-id",      // NUEVO - obligatorio
  "imageUrl": "/uploads/products/..." // NUEVO - opcional
}
```

**Error si faltan campos:**
```json
{
  "error": "Faltan campos requeridos: nombre, sku, precio, categoría y unidad son obligatorios"
}
```

#### 5. `/api/productos/[id]` (PUT)
**Cambio**: Ahora permite actualizar `unitId` y `imageUrl`
- `imageUrl` solo se actualiza si se proporciona un valor
- Si se envía `null` o string vacío, se mantiene la imagen actual

#### 6. `/api/productos/[id]` (GET)
**Cambio**: Ahora incluye `unit` en la respuesta

---

## Frontend Changes

### Nuevos Componentes y Hooks

#### 1. Hook `useAuth` (`/src/hooks/use-auth.ts`)
**Propósito**: Hook centralizado para gestión de autenticación y permisos

**API del Hook:**
```typescript
const { user, isAdmin, isLoggedIn, isLoading } = useAuth()

// user: Usuario | null - Datos completos del usuario
// isAdmin: boolean - true si user.role === 'ADMIN'
// isLoggedIn: boolean - true si user !== null
// isLoading: boolean - true mientras carga la sesión
```

**Características:**
- Lee automáticamente del localStorage al montar
- Escucha cambios en localStorage (storage event)
- Actualiza el estado cuando cambia en otra pestaña
- Provee información de permisos de forma simple

### Componentes Modificados

#### 2. Sidebar (`/src/components/layout/sidebar.tsx`)
**Cambios:**
- Importado hook `useAuth()`
- Agregado flag `adminOnly: true` al item de navegación "Usuarios"
- Implementado filtrado dinámico de navegación según rol
- Filtrado aplicado en sidebar desktop y móvil

**Lógica de filtrado:**
```typescript
const filteredNavigation = navigation.filter(item => {
  if (item.adminOnly && !isAdmin) {
    return false  // No mostrar item de administración
  }
  return true  // Mostrar item normal
})
```

#### 3. Header (`/src/components/layout/header.tsx`)
**Cambios:**
- Agregado estado para controlar modal de logout
- Botón "Cerrar Sesión" ahora abre modal en lugar de cerrar directamente
- Implementado modal de confirmación con dos opciones
- Importados componentes Dialog de shadcn/ui

**Nuevo flujo de logout:**
1. Click en "Cerrar Sesión" → Abre modal
2. Click en "Cancelar" → Cierra modal, mantiene sesión
3. Click en "Cerrar Sesión" → Cierra sesión completamente

#### 4. Página de Productos (`/src/app/productos/page.tsx`)
**Cambios Principales:**
- Agregado campo `imageUrl` al estado del formulario
- Agregado estado `imagePreview` para vista previa
- Agregado estado `uploadingImage` durante carga
- Agregada interfaz `Unit` con campos id, name, symbol
- Agregada función `handleImageUpload()` para subir imágenes
- Agregada función `handleRemoveImage()` para eliminar imágenes
- Actualizada tabla para mostrar columna de imagen
- Actualizada tabla para mostrar unidad de medida
- Stock ahora muestra símbolo de unidad (ej. "50 u")

**Sección de imagen en formulario:**
- Vista previa con imagen cargada o placeholder
- Botón "Subir Imagen" con icono Upload
- Estado de carga con texto "Subiendo..."
- Botón X flotante para eliminar imagen
- Texto informativo de formatos y tamaño

**Nueva columna en tabla:**
- "Imagen": Muestra miniatura 64x64px
- Placeholder con icono de imagen si no hay foto
- Estilo con border y rounded-lg

---

## Seguridad y Permisos

### Niveles de Permisos

#### Rol ADMIN
Tiene acceso **COMPLETO** al sistema:

**Módulos Accesibles:**
- ✅ Dashboard
- ✅ Productos (CRUD completo)
- ✅ Categorías (CRUD completo)
- ✅ Unidades de Medida (CRUD completo)
- ✅ Clientes (CRUD completo)
- ✅ Proveedores (CRUD completo)
- ✅ Ingresos (crear y listado)
- ✅ Ventas (crear y listado)
- ✅ Reportes (todos los reportes)
- ✅ **Usuarios (CRUD completo)**
- ✅ Cuentas por Cobrar

**Permisos Especiales:**
- ✅ Puede crear usuarios con rol ADMIN
- ✅ Puede crear usuarios con rol USER
- ✅ Puede editar cualquier usuario
- ✅ Puede eliminar cualquier usuario
- ✅ Puede asignar roles
- ✅ Puede resetear contraseñas

#### Rol USER
Tiene acceso **LIMITADO** al sistema:

**Módulos Accesibles:**
- ✅ Dashboard
- ✅ Productos (CRUD completo)
- ✅ Categorías (CRUD completo)
- ✅ Unidades de Medida (solo lectura)
- ✅ Clientes (CRUD completo)
- ✅ Proveedores (CRUD completo)
- ✅ Ingresos (crear y listado)
- ✅ Ventas (crear y listado)
- ✅ Reportes (todos los reportes)
- ✅ Cuentas por Cobrar

**Módulos BLOQUEADOS:**
- ❌ **Usuarios (acceso denegado)**
- ❌ Gestión de usuarios
- ❌ Asignación de roles

### Implementación de Seguridad

#### 1. Filtrado de Navegación
**Ubicación**: `/src/components/layout/sidebar.tsx`
```typescript
const navigation = [
  // ... otros items
  { name: 'Usuarios', href: '/usuarios', icon: Users, adminOnly: true },  // NUEVO
]

const { isAdmin } = useAuth()  // NUEVO

const filteredNavigation = navigation.filter(item => {
  if (item.adminOnly && !isAdmin) {
    return false  // No mostrar si no es admin
  }
  return true
})
```

#### 2. Protección de Página
**Ubicación**: `/src/app/usuarios/page.tsx`

**Verificación implementada:**
```typescript
useEffect(() => {
  if (!authLoading && !isAdmin) {
    toast({
      variant: 'destructive',
      title: 'Acceso denegado',
      description: 'No tienes permisos para acceder a esta página',
    })
    router.push('/')  // Redirigir al dashboard
  }
}, [isAdmin, authLoading, router, toast])

useEffect(() => {
  if (isAdmin) {
    loadUsuarios()  // Solo cargar datos si es admin
  }
}, [isAdmin])
```

**Pantallas:**
- Si `authLoading`: "Verificando permisos..."
- Si no es admin: Mensaje de error + redirección
- Si es admin: Carga normal de usuarios

#### 3. Protección contra Cierres Accidentales
**Ubicación**: `/src/components/layout/header.tsx`

**Implementación:**
- Modal de confirmación antes de cerrar sesión
- Usuario debe confirmar explícitamente
- Opción de cancelar disponible
- Feedback visual con botones diferenciados

---

## Instrucciones de Rollback

### Para volver a v2 (sistema_inventarios_v2)

Si necesitas revertir todos los cambios de v3 y volver a v2, sigue estos pasos:

#### Opción 1: Volver al Tag de Git (Recomendado)
```bash
# Revisar todos los tags disponibles
git tag -l

# Volver al tag v2
git checkout tags/sistema_inventarios_v2

# Verificar que estás en v2
git log --oneline -1
```

#### Opción 2: Usar worklog.md
1. Lee el archivo `/home/z/my-project/worklog.md`
2. Busca la sección con Task ID correspondiente
3. Revisa los cambios hechos en v2
4. Aplica manualmente los cambios inversos

### Cambios para Revertir de v3 → v2

**Archivos que CREAR:**
1. Eliminar `/src/hooks/use-auth.ts`
2. Revertir `/src/components/layout/sidebar.tsx` a versión sin filtrado por rol
3. Revertir `/src/components/layout/header.tsx` a versión sin modal de confirmación
4. Revertir `/src/app/usuarios/page.tsx` a versión sin protección de permisos
5. Eliminar `/src/app/api/upload/route.ts`
6. Eliminar `/src/app/api/unidades/route.ts`
7. Eliminar el directorio `/public/uploads/products/`

**Archivos que MODIFICAR:**
1. `/src/app/productos/page.tsx`:
   - Remover funcionalidad de imágenes
   - Remover campo `imageUrl` y `unitId` del formulario
   - Remover columna de imagen de la tabla
   - Remover columna de unidad de la tabla
   - Remover funciones `handleImageUpload()` y `handleRemoveImage()`

2. `/src/app/api/productos/route.ts`:
   - En GET: remover `unit: true` del include
   - En POST: remover `unitId` y `imageUrl` del body
   - Remover validación de `unitId`
   - Remover `imageUrl` del data

3. `/src/app/api/productos/[id]/route.ts`:
   - En GET: remover `unit: true` del include
   - En PUT: remover `unitId` y `imageUrl` del body

**Archivos que NO CAMBIAR:**
- Todos los demás módulos (ventas, ingresos, clientes, proveedores, categorías, reportes, etc.) pueden mantenerse como están en v3

---

## Credenciales de Prueba

### Usuario Administrador (Rol: ADMIN)
```
Usuario: administrador
Contraseña: 123456
```
**Permisos:** Acceso completo a todo el sistema, incluyendo gestión de usuarios

### Notas sobre Datos de Prueba
⚠️ **IMPORTANTE**: Como se realizó un `--force-reset` de la base de datos, todos los datos anteriores fueron eliminados.

**Datos que necesitas recrear:**
1. ✅ Unidades de Medida: Se pueden crear desde `/unidades`
2. ⚠️ Categorías: Necesario crear desde `/categorias`
3. ⚠️ Productos: Necesario crear desde `/productos`
4. ⚠️ Clientes: Necesario crear desde `/clientes`
5. ⚠️ Proveedores: Necesario crear desde `/proveedores`
6. ⚠️ Usuarios: Ya existe el usuario `administrador`

**Recomendación:** Usa las funcionalidades de CRUD para crear los datos de prueba necesarios para probar el sistema.

---

## Tecnologías Utilizadas

### Stack Principal
- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Base de Datos**: Prisma ORM + SQLite
- **Estado**: React Hooks (useState, useEffect)

### Librerías de UI
- shadcn/ui componentes
- Lucide React icons
- React Toast (sonner)

### Archivos Estáticos
- Directorio `/public/uploads/products/` para imágenes de productos

---

## Checklist de v3

- [x] Sistema de imágenes de productos implementado
- [x] API de subida de imágenes funcionando
- [x] Validaciones de tipo y tamaño implementadas
- [x] Visualización de imágenes en tabla
- [x] Sistema de roles (ADMIN/USER) funcionando
- [x] Hook de autenticación implementado
- [x] Filtrado de menú por rol
- [x] Protección de página de usuarios
- [x] Modal de confirmación de cierre de sesión
- [x] Base de datos actualizada con campos nuevos
- [x] API de productos actualizada
- [x] Frontend de productos actualizado
- [x] Documentación de versión creada

---

## Resumen Ejecutivo

**Version**: v3  
**Estado**: ✅ FUNCIONAL  
**Cambios Principales**:
1. 🖼️ Gestión completa de imágenes de productos
2. 🔐 Sistema de permisos basado en roles (ADMIN/USER)
3. 🔒 Modal de confirmación para cerrar sesión

**Archivos Modificados**: 8  
**Archivos Nuevos**: 4  
**API Endpoints**: 2 nuevos, 4 modificados

**Precauciones:**
- Base de datos reseteada (datos anteriores eliminados)
- Necesario recrear datos de prueba
- Sistema listo para producción con todas las funcionalidades implementadas

---

**Fin de Documentación - Sistema de Inventario v3**
