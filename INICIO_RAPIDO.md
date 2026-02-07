# 🚀 INICIO RÁPIDO - Sistema de Inventario

## Levantar la aplicación (Actual - SQLite)

```bash
cd /home/z/my-project
bun run dev
```

✅ **Acceder**: http://localhost:3000/login
- Usuario: `administrador`
- Contraseña: `123456`

---

## Cambiar a PostgreSQL

### 1. Instalar PostgreSQL
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Crear base de datos
```bash
sudo -u postgres psql
```
```sql
CREATE USER inventory_user WITH PASSWORD 'tu_password';
CREATE DATABASE inventory_db OWNER inventory_user;
\q
```

### 3. Actualizar configuración

**Editar `prisma/schema.prisma`:**
```prisma
provider = "postgresql"  # Cambiar de "sqlite"
```

**Editar `.env`:**
```env
DATABASE_URL="postgresql://inventory_user:tu_password@localhost:5432/inventory_db"
```

### 4. Aplicar cambios
```bash
bun run db:generate
bun run db:push
bun run scripts/create-admin.ts
bun run dev
```

---

## Comandos Útiles

```bash
# Ver logs
tail -f dev.log

# Reiniciar servidor
kill $(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
bun run dev

# Ver estado del sistema
ps aux | grep "next dev"
curl http://localhost:3000/api/dashboard

# Base de datos visual
npx prisma studio
```

---

## ⚠️ IMPORTANTE

- **Solo un puerto**: 3000
- **Solo un comando**: `bun run dev`
- **Frontend y Backend integrados**
- **No necesitas configurar múltiples puertos**

---

## Documentación completa

Ver `GUIA_COMPLETA.md` para documentación detallada.
