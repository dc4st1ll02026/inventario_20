# Sistema de Inventario - Guía de Instalación y Uso

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
4. [Ejecutar la Aplicación](#ejecutar-la-aplicación)
5. [Credenciales de Acceso](#credenciales-de-acceso)
6. [Uso de la Aplicación](#uso-de-la-aplicación)
7. [Funcionalidades](#funcionalidades)

## 📦 Requisitos Previos

- **Node.js** (v18 o superior) o **Bun**
- **Git** (para clonar el repositorio)

## 🔧 Instalación

### 1. Clonar el repositorio (si aplica)
```bash
git clone <url-del-repositorio>
cd my-project
```

### 2. Instalar dependencias
```bash
bun install
# o
npm install
```

## 🗄️ Configuración de la Base de Datos

Este proyecto utiliza **SQLite** como base de datos (puede migrarse fácilmente a PostgreSQL si se requiere).

### Pasos de configuración:

1. **Verificar el archivo `.env`**
   ```bash
   cat .env
   ```
   Debería contener:
   ```
   DATABASE_URL=file:/home/z/my-project/db/custom.db
   ```

2. **Generar el cliente de Prisma**
   ```bash
   bun run db:generate
   ```

3. **Crear las tablas en la base de datos**
   ```bash
   bun run db:push
   ```

4. **Crear el usuario administrador por defecto**
   ```bash
   bun run scripts/create-admin.ts
   ```
   O alternativamente, puede hacer una solicitud POST a la API:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

## 🚀 Ejecutar la Aplicación

### Modo Desarrollo
```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:3000**

### Verificar que el servidor esté corriendo
```bash
curl http://localhost:3000
```

## 🔐 Credenciales de Acceso

Por defecto, el sistema viene con un usuario administrador:

- **Usuario:** `administrador`
- **Contraseña:** `123456`

> ⚠️ **IMPORTANTE:** Se recomienda cambiar esta contraseña después del primer inicio de sesión.

## 📖 Uso de la Aplicación

### 1. Iniciar Sesión

1. Abra el navegador en `http://localhost:3000`
2. Será redirigido automáticamente a la página de login
3. Ingrese las credenciales:
   - Usuario: `administrador`
   - Contraseña: `123456`
4. Haga clic en "Iniciar Sesión"
5. Si las credenciales son correctas, será redirigido al Dashboard

### 2. Navegación

El sistema cuenta con un menú lateral que permite navegar entre las diferentes secciones:

- **Dashboard** - Vista general con estadísticas y últimas operaciones
- **Productos** - Gestión del inventario de productos
- **Categorías** - Gestión de categorías de productos
- **Clientes** - Gestión de clientes
- **Proveedores** - Gestión de proveedores
- **Ingresos** - Registro de ingresos de productos al almacén
- **Ventas** - Registro de ventas de productos
- **Reportes** - Consultas de stock e historial de productos
- **Usuarios** - Gestión de usuarios del sistema

## ⚙️ Funcionalidades

### Dashboard
- Muestra estadísticas generales del sistema
- Últimas 10 operaciones realizadas
- Alertas de stock bajo
- Resumen de productos, stock, ventas y clientes

### Gestión de Productos
- Crear nuevos productos con:
  - Nombre
  - SKU (código único)
  - Categoría
  - Precio
  - Stock inicial
  - Descripción (opcional)
- Editar productos existentes
- Eliminar productos (soft delete)
- Búsqueda por nombre o SKU
- Indicadores visuales de stock (bajo, sin stock, normal)

### Gestión de Categorías
- Crear nuevas categorías
- Editar categorías existentes
- Eliminar categorías (si no tienen productos asociados)

### Gestión de Clientes
- Registrar nuevos clientes con:
  - Nombre
  - Email (opcional)
  - Teléfono (opcional)
  - Dirección (opcional)
- Editar clientes
- Eliminar clientes (si no tienen ventas asociadas)

### Gestión de Proveedores
- Registrar nuevos proveedores con:
  - Nombre
  - Email (opcional)
  - Teléfono (opcional)
  - Dirección (opcional)
- Editar proveedores
- Eliminar proveedores (si no tienen ingresos asociados)

### Ingresos de Productos
- Registrar ingresos de productos al almacén
- Seleccionar proveedor
- Agregar múltiples productos en un ingreso
- Especificar cantidad y precio unitario
- El stock se actualiza automáticamente

### Ventas de Productos
- Registrar ventas de productos
- Seleccionar cliente
- Agregar múltiples productos en una venta
- El sistema valida que haya stock disponible
- El stock se reduce automáticamente
- No se puede vender si no hay stock suficiente

### Reportes
- Consultar stock de productos
- Filtrar por categoría
- Ver productos con stock bajo
- Ver historial completo de un producto:
  - Todos sus ingresos
  - Todas sus ventas
  - Estadísticas de cantidades y valores

### Gestión de Usuarios
- Crear nuevos usuarios
- Asignar roles (ADMIN, USER)
- Editar usuarios existentes
- Cambiar contraseñas
- Activar/desactivar usuarios

## 🔧 Solución de Problemas

### Error: "La tabla no existe en la base de datos"
**Solución:**
```bash
bun run db:push
```

### Error: "Error al iniciar sesión"
**Verifique:**
1. Que el servidor esté corriendo: `curl http://localhost:3000`
2. Que el usuario administrador exista: `curl -X GET http://localhost:3000/api/seed`
3. Si no existe, créelo: `curl -X POST http://localhost:3000/api/seed`

### Error: "No hay suficiente stock para el producto"
**Solución:**
Este es un control de seguridad. El sistema impide vender productos cuando el stock es insuficiente. Primero debe realizar un ingreso para aumentar el stock.

### El servidor no responde
**Solución:**
1. Verifique que no hay otros procesos usando el puerto 3000
2. Reinicie el servidor:
   ```bash
   # Detener el proceso actual
   pkill -f "next dev"
   # Iniciar nuevamente
   bun run dev
   ```

## 📞 Soporte

Si encuentra algún problema no documentado, por favor:
1. Revise los logs del servidor: `cat dev.log`
2. Verifique que todas las dependencias estén instaladas
3. Asegúrese de que la base de datos esté configurada correctamente

## 📝 Notas Técnicas

- **Framework:** Next.js 16 con App Router
- **Lenguaje:** TypeScript 5
- **Base de Datos:** SQLite (con Prisma ORM)
- **UI Components:** shadcn/ui con Tailwind CSS 4
- **Autenticación:** Personalizada con bcrypt para hashing de contraseñas

## 🔄 Migración a PostgreSQL

Si en el futuro desea migrar a PostgreSQL:

1. Instalar PostgreSQL
2. Cambiar el provider en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Actualizar el `.env`:
   ```
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_db"
   ```
4. Ejecutar migraciones:
   ```bash
   bun run db:push
   ```

## 📄 Licencia

Este proyecto es propiedad de la organización y es para uso exclusivo de la misma.
