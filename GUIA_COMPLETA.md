# GUÍA COMPLETA - Sistema de Inventario

## 📋 ÍNDICE
1. [Arquitectura del Proyecto](#arquitectura)
2. [Levantar la Aplicación](#levantar-la-aplicación)
3. [Cambiar a PostgreSQL](#postgresql)
4. [Troubleshooting](#troubleshooting)

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Tipo de Proyecto
- **Framework**: Next.js 16 con App Router
- **Arquitectura**: Fullstack integrado (Frontend + Backend en un solo servidor)
- **Base de datos**: SQLite (por defecto) o PostgreSQL (opcional)
- **Puerto**: 3000 (único puerto necesario)

### ¿Frontend y Backend por separado?
**NO**. En Next.js con App Router:
- El frontend (React) y el backend (API routes) están integrados
- Un solo comando inicia todo
- Un solo puerto (3000) maneja todo el tráfico
- Las rutas `/api/*` son manejadas automáticamente por el servidor

### Estructura de Carpetas Importantes

```
/home/z/my-project/
├── src/
│   ├── app/              # Rutas de Next.js (páginas y APIs)
│   │   ├── api/         # Backend - API Routes
│   │   ├── login/       # Página de login
│   │   └── page.tsx     # Dashboard
│   ├── components/       # Componentes UI (shadcn/ui)
│   └── lib/            # Utilidades (db, utils)
├── prisma/
│   └── schema.prisma   # Esquema de base de datos
├── db/                 # Base de datos SQLite (si la usas)
├── scripts/            # Scripts de utilidad
└── .env               # Variables de entorno
```

---

## 🚀 LEVANTAR LA APLICACIÓN

### PRIMERA VEZ - Configuración Inicial

#### 1. Instalar dependencias
```bash
cd /home/z/my-project
bun install
```

#### 2. Configurar base de datos (SQLite - Por Defecto)

El archivo `.env` ya está configurado:
```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

Ejecutar estos comandos:
```bash
# Generar cliente de Prisma
bun run db:generate

# Crear tablas en la base de datos
bun run db:push

# Crear usuario administrador
bun run scripts/create-admin.ts
```

#### 3. Iniciar el servidor
```bash
bun run dev
```

El servidor iniciará en: **http://localhost:3000**

### USO DIARIO - Levantar la aplicación

#### Opción 1: Modo desarrollo (con recarga automática)
```bash
cd /home/z/my-project
bun run dev
```

#### Opción 2: En segundo plano (background)
```bash
cd /home/z/my-project
nohup bun run dev > dev.log 2>&1 &

# Para ver los logs
tail -f dev.log
```

#### Opción 3: Verificar que está corriendo
```bash
# Ver procesos
ps aux | grep "next dev" | grep -v grep

# Probar la API
curl http://localhost:3000/api/dashboard
```

### ACCEDER A LA APLICACIÓN

1. **Abrir navegador**: http://localhost:3000

2. **Iniciar sesión**:
   - Ir a: http://localhost:3000/login
   - Usuario: `administrador`
   - Contraseña: `123456`

3. **Navegación**:
   - Después de login, serás redirigido al Dashboard
   - Usa el menú lateral para navegar entre secciones

### ENDPOINTS DE API DISPONIBLES

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/dashboard` | GET | Estadísticas del dashboard |
| `/api/categorias` | GET/POST | Listar/crear categorías |
| `/api/categorias/[id]` | PUT/DELETE | Actualizar/eliminar categoría |
| `/api/productos` | GET/POST | Listar/crear productos |
| `/api/productos/[id]` | GET/PUT/DELETE | Gestión de producto |
| `/api/clientes` | GET/POST | Listar/crear clientes |
| `/api/clientes/[id]` | GET/PUT/DELETE | Gestión de cliente |
| `/api/proveedores` | GET/POST | Listar/crear proveedores |
| `/api/proveedores/[id]` | GET/PUT/DELETE | Gestión de proveedor |
| `/api/usuarios` | GET/POST | Listar/crear usuarios |
| `/api/usuarios/[id]` | GET/PUT/DELETE | Gestión de usuario |

---

## 🐘 CAMBIAR DE SQLITE A POSTGRESQL

### Paso 1: Instalar PostgreSQL

#### En Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Iniciar el servicio
sudo service postgresql start
```

#### En macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### En Windows:
Descargar e instalar desde: https://www.postgresql.org/download/windows/

### Paso 2: Crear usuario y base de datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# En el prompt de PostgreSQL, ejecutar:
CREATE USER inventory_user WITH PASSWORD 'tu_contraseña_segura';
CREATE DATABASE inventory_db OWNER inventory_user;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;
\q
```

### Paso 3: Actualizar configuración de Prisma

Editar `/home/z/my-project/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  # ← CAMBIAR: de "sqlite" a "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 4: Actualizar archivo .env

Editar `/home/z/my-project/.env`:

```env
DATABASE_URL="postgresql://inventory_user:tu_contraseña_segura@localhost:5432/inventory_db"
```

### Paso 5: Generar cliente de Prisma

```bash
cd /home/z/my-project
bun run db:generate
```

### Paso 6: Crear base de datos en PostgreSQL

#### Opción A: Usar Prisma Push (rápido para desarrollo)
```bash
bun run db:push
```

#### Opción B: Usar Migraciones (recomendado para producción)
```bash
# Crear migración inicial
bun run db:migrate --name init

# Aplicar migraciones
bun run db:migrate deploy
```

### Paso 7: Crear usuario administrador

```bash
bun run scripts/create-admin.ts
```

### Paso 8: Reiniciar el servidor

```bash
# Detener servidor actual (si está corriendo)
kill $(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')

# Iniciar nuevamente
bun run dev
```

### Paso 9: Verificar que todo funciona

```bash
# Probar la conexión a la base de datos
curl http://localhost:3000/api/dashboard

# Probar el login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"administrador","password":"123456"}'
```

### Migrar datos de SQLite a PostgreSQL (Opcional)

Si ya tienes datos en SQLite y quieres moverlos a PostgreSQL:

```bash
# 1. Exportar datos desde SQLite
npx prisma db seed

# 2. Cambiar la configuración a PostgreSQL (pasos 3-4 de arriba)

# 3. Crear la estructura en PostgreSQL
bun run db:push

# 4. Importar los datos (necesitarás un script personalizado o usar Prisma Studio)
npx prisma studio
```

---

## 🔧 TROUBLESHOOTING

### Problema: El puerto 3000 ya está en uso

```bash
# Encontrar el proceso
lsof -i :3000
# o
ps aux | grep "next dev"

# Matar el proceso
kill <PID>
# o
kill -9 <PID>

# Reiniciar
bun run dev
```

### Problema: Error al conectar a la base de datos

**Para SQLite:**
```bash
# Verificar que el archivo existe
ls -la /home/z/my-project/db/

# Regenerar cliente
rm -rf node_modules/.prisma
bun run db:generate
bun run db:push
```

**Para PostgreSQL:**
```bash
# Verificar que PostgreSQL está corriendo
sudo service postgresql status

# Probar conexión
psql -U inventory_user -d inventory_db -h localhost

# Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL
```

### Problema: Login falla

```bash
# Verificar que el usuario administrador existe
bun run scripts/create-admin.ts

# Verificar en el log
tail -50 dev.log

# Probar directamente la API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"administrador","password":"123456"}'
```

### Problema: Errores de compilación

```bash
# Limpiar caché de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules
bun install

# Regenerar Prisma
bun run db:generate

# Iniciar nuevamente
bun run dev
```

### Verificar estado del sistema

```bash
# Ver procesos corriendo
ps aux | grep -E "(next|bun|postgres)" | grep -v grep

# Ver puertos en uso
netstat -tuln | grep 3000

# Ver logs del servidor
tail -f dev.log

# Probar endpoints básicos
curl http://localhost:3000/api/dashboard
curl http://localhost:3000/api/categorias
```

---

## 📝 COMANDOS ÚTILES

### Prisma
```bash
bun run db:generate     # Generar cliente
bun run db:push         # Crear/actualizar esquema
bun run db:migrate      # Crear migración
bun run db:migrate:dev  # Crear y aplicar migración
```

### Desarrollo
```bash
bun run dev            # Iniciar servidor desarrollo
bun run lint           # Verificar calidad de código
bun run build          # Compilar para producción
```

### Base de Datos
```bash
npx prisma studio      # UI visual para gestionar datos
sqlite3 db/custom.db   # Acceso directo a SQLite (si la usas)
psql -U inventory_user # Acceso directo a PostgreSQL (si la usas)
```

---

## ✅ RESUMEN RÁPIDO

### Para levantar la aplicación (SQLite):

```bash
cd /home/z/my-project
bun install                    # Solo primera vez
bun run db:generate            # Generar cliente
bun run db:push                # Crear tablas
bun run scripts/create-admin.ts # Crear admin
bun run dev                    # ¡Listo!
```

### Para cambiar a PostgreSQL:

1. Instalar PostgreSQL
2. Crear usuario y base de datos
3. Cambiar `provider` en schema.prisma a `postgresql`
4. Actualizar `DATABASE_URL` en .env
5. `bun run db:generate && bun run db:push`
6. `bun run scripts/create-admin.ts`
7. `bun run dev`

### Puntos Clave:
- ✅ **Solo un puerto**: 3000
- ✅ **Solo un comando**: `bun run dev`
- ✅ **Frontend y Backend integrados**
- ✅ **No necesitas configurar múltiples puertos**
- ✅ **No necesitas levantar procesos por separado**

---

## 📞 SOPORTE

Si encuentras problemas:
1. Revisa `dev.log` para ver errores detallados
2. Verifica que PostgreSQL (si lo usas) esté corriendo
3. Asegúrate de que las credenciales en .env son correctas
4. Limpia caché: `rm -rf .next node_modules/.prisma`
