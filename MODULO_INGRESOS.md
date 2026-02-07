# 📦 MÓDULO DE INGRESOS - Guía Completa

## 🎯 Características del Módulo

El módulo de ingresos incluye funcionalidades completas para:

1. **Registro de Ingresos** - Formulario completo para crear ingresos
2. **Listado de Ingresos** - Historial completo de todos los ingresos
3. **Detalle de Ingreso** - Vista detallada de cada ingreso
4. **Control de Stock** - Incremento automático del inventario
5. **Código de Ingreso** - Generación automática de códigos únicos
6. **Filtros Avanzados** - Búsqueda por proveedor, código y fechas
7. **Precio Unitario Personalizable** - Opción de cambiar precio al ingresar

---

## 📁 Estructura del Módulo

### Backend (API Routes)

```
src/app/api/ingresos/
├── route.ts              # API para crear nuevos ingresos
├── listado/route.ts      # API para listar ingresos
└── [id]/route.ts        # API para obtener detalle de ingreso
```

### Frontend

```
src/app/ingresos/
├── page.tsx              # Formulario de registro de ingresos
└── listado/page.tsx      # Listado con filtros y detalle
```

### Componentes de Navegación

```
src/components/layout/
└── sidebar.tsx            # Menú actualizado con "Listado de Ingresos"
```

---

## 🔌 API Endpoints

### 1. Crear Nuevo Ingreso

```http
POST /api/ingresos
```

#### Body de la Petición

```json
{
  "supplierId": "cmkm5k06r0006ok4v1wqebksj",
  "items": [
    {
      "productId": "cmkm5k06s0008ok4vu2riscgg",
      "quantity": 10,
      "unitPrice": 750.00
    }
  ],
  "notes": "Notas sobre el ingreso (opcional)"
}
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|------------|-------------|
| supplierId | string | Sí | ID del proveedor |
| items | Array | Sí | Lista de productos a ingresar |
| items[].productId | string | Sí | ID del producto |
| items[].quantity | number | Sí | Cantidad a ingresar |
| items[].unitPrice | number | No | Precio unitario (opcional) |
| notes | string | No | Notas adicionales |

#### Respuesta Exitosa (201)

```json
{
  "ingreso": {
    "id": "cmkm6xvc6000gok1883adl5pw",
    "operationId": "cmkm6xvc5000eok18z0ml3m29",
    "supplierId": "cmkm5k06r0006ok4v1wqebksj",
    "operation": {
      "id": "cmkm6xvc5000eok18z0ml3m29",
      "type": "INBOUND",
      "reference": "ING-170642-U22",
      "date": "2025-01-20T12:30:00.000Z",
      "total": 10599.90,
      "notes": "Ingreso regular de Q1"
    },
    "supplier": {
      "id": "cmkm5k06r0006ok4v1wqebksj",
      "name": "Tech Suppliers S.A.",
      "email": "ventas@techsuppliers.com"
    },
    "items": [...]
  },
  "codigoIngreso": "ING-170642-U22"
}
```

#### Errores Posibles

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | Proveedor y productos son requeridos | Faltan datos obligatorios |
| 400 | Proveedor no encontrado | El ID de proveedor no existe |
| 400 | Producto no encontrado | Un producto no existe |
| 400 | Producto duplicado | El mismo producto se agregó 2 veces |

---

### 2. Listado de Ingresos

```http
GET /api/ingresos/listado?proveedorId={id}&fechaInicio={YYYY-MM-DD}&fechaFin={YYYY-MM-DD}
```

#### Parámetros Query (opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| proveedorId | string | Filtrar por proveedor específico |
| fechaInicio | string (ISO date) | Fecha de inicio del rango |
| fechaFin | string (ISO date) | Fecha de fin del rango |

#### Respuesta

```json
{
  "ingresos": [
    {
      "id": "cmkm5k0pc000tok4vu8aa8ucc",
      "operationId": "cmkm5k0pc000tok4v3ijx7et3",
      "supplierId": "cmkm5k06r0006ok4v1wqebksj",
      "operation": {
        "id": "cmkm5k0pc000tok4v3ijx7et3",
        "type": "INBOUND",
        "reference": "ING-003",
        "date": "2025-01-17T00:00:00.000Z",
        "total": 4498.5,
        "notes": "Ingreso mixto de ropa"
      },
      "supplier": {
        "id": "cmkm5k06r0006ok4v1wqebksj",
        "name": "Fashion Imports Ltd.",
        "email": "orders@fashionimports.com"
      },
      "items": [...]
    }
  ],
  "resumen": {
    "totalIngresos": 6,
    "valorTotalIngresos": 65372.00
  }
}
```

---

### 3. Detalle de Ingreso

```http
GET /api/ingresos/{id}
```

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID del ingreso |

#### Respuesta

```json
{
  "ingreso": {
    "id": "cmkm5k0pc000tok4vu8aa8ucc",
    "operationId": "cmkm5k0pc000tok4v3ijx7et3",
    "supplierId": "cmkm5k06r0006ok4v1wqebksj",
    "operation": {
      "id": "cmkm5k0pc000tok4v3ijx7et3",
      "type": "INBOUND",
      "reference": "ING-003",
      "date": "2025-01-17T00:00:00.000Z",
      "total": 4498.5,
      "notes": "Ingreso mixto de ropa"
    },
    "supplier": {
      "id": "cmkm5k06r0006ok4v1wqebksj",
      "name": "Fashion Imports Ltd.",
      "email": "orders@fashionimports.com",
      "phone": "555-0202",
      "address": "Zona Industrial 2"
    },
    "items": [
      {
        "id": "cmkm5k0pd000xok4vlgkfbqdb",
        "inboundReceiptId": "cmkm5k0pc000tok4vu8aa8ucc",
        "productId": "cmkm5k06v000cok4v50jknwfv",
        "quantity": 100,
        "unitPrice": 29.99,
        "subtotal": 2999,
        "product": {
          "id": "cmkm5k06v000cok4v50jknwfv",
          "name": "Camiseta Polo Azul",
          "sku": "ROP-001",
          "category": {
            "name": "Ropa"
          }
        }
      }
    ]
  }
}
```

---

## 🎨 Interfaz de Usuario

### Registro de Ingresos (`/ingresos`)

#### Funcionalidades

1. **Selección de Proveedor**
   - Dropdown con todos los proveedores registrados
   - Muestra nombre y email del proveedor

2. **Agregar Productos**
   - Lista de todos los productos
   - Muestra SKU, nombre, stock actual y precio base
   - **Campo de precio unitario personalizable**
   - Validación de productos duplicados

3. **Vista Previa**
   - Tabla con productos agregados
   - Cantidad, precio unitario y subtotal por producto
   - Botón para eliminar productos

4. **Cálculos Automáticos**
   - Subtotal por producto (usando precio personalizado o precio base)
   - Total general del ingreso
   - Cantidad total de productos
   - Total de unidades ingresadas

5. **Formulario Completo**
   - Selección de proveedor
   - Lista de productos con cantidades y precios
   - Notas opcionales
   - Validaciones antes de guardar

#### Flujo de Uso

1. Acceder a **http://localhost:3000/ingresos**
2. Seleccionar el proveedor
3. Seleccionar producto del dropdown
4. Ingresar cantidad
5. (Opcional) Cambiar precio unitario
6. Clic en **"+"** para agregar
7. Repetir pasos 3-6 para más productos
8. Agregar notas (opcional)
9. Clic en **"Registrar Ingreso"**
10. Confirmar creación en modal

#### Validaciones

- ✅ Proveedor seleccionado
- ✅ Al menos un producto
- ✅ Cantidades válidas (mínimo 1)
- ✅ Sin productos duplicados

---

### Listado de Ingresos (`/ingresos/listado`)

#### Funcionalidades

1. **Filtros Avanzados**
   - Búsqueda por código de ingreso
   - Filtrado por proveedor
   - Rango de fechas (inicio y fin)

2. **Resumen Estadístico**
   - Total de ingresos
   - Valor acumulado

3. **Tabla de Ingresos**
   - Código de ingreso
   - Fecha y hora
   - Proveedor con email
   - Cantidad de items
   - Total de ingreso
   - Botón para ver detalle

4. **Detalle Completo**
   - Modal con toda la información
   - Datos del ingreso
   - Información del proveedor
   - Lista de productos con detalles
   - Totales y resúmenes

#### Flujo de Uso

1. Acceder a **http://localhost:3000/ingresos/listado**
2. Aplicar filtros si es necesario:
   - Buscar por código
   - Filtrar por proveedor
   - Seleccionar rango de fechas
3. Revisar tabla de ingresos
4. Clic en **"Ver Detalle"** en cualquier ingreso
5. Ver información completa en modal

#### Información en el Listado

| Columna | Descripción |
|---------|-------------|
| Código Ingreso | Código único generado automáticamente |
| Fecha | Fecha y hora del ingreso |
| Proveedor | Nombre y email del proveedor |
| Items | Cantidad de productos (badge) |
| Total | Monto total del ingreso (verde) |
| Acciones | Botón para ver detalle |

---

## 🔄 Generación de Códigos de Ingreso

### Formato

```
ING-{timestamp}-{random}
```

### Ejemplos

- `ING-003`
- `ING-170642-U22`
- `ING-170656-5W5`
- `ING-170661-TD7`

### Componentes

| Componente | Descripción |
|-----------|-------------|
| ING | Prefijo de ingreso |
| 170642 | Timestamp (últimos 6 dígitos) |
| U22 | Código aleatorio (3 caracteres) |

---

## ✅ Control de Stock

### Incremento Automático de Stock

El sistema incrementa automáticamente el stock:

1. **Antes de Registrar el Ingreso**
   - No se valida stock (porque es un ingreso)
   - Se verifica que el producto existe

2. **Durante la Creación del Ingreso**
   - Se crea la operación INBOUND
   - Se crean los items de ingreso
   - Se **INCREMENTA** el stock de cada producto
   - La operación es atómica (todo o nada)

3. **Resultado Final**
   - Stock de cada producto aumentado
   - Historial de movimientos registrado
   - Código único de ingreso generado

### Diferencia con Ventas

| Operación | Stock | Validación |
|-----------|-------|------------|
| **Ingreso** | Incrementa (+) | No valida límite superior |
| **Venta** | Decrementa (-) | Valida stock disponible |

---

## 📊 Datos de Prueba

### Ingresos Creados

| Código | Proveedor | Total | Fecha | Estado |
|--------|-----------|-------|-------|--------|
| ING-001 | Fashion Imports Ltd. | $4,498.50 | 2025-01-17 | ✅ |
| ING-002 | Tech Suppliers S.A. | $34,999.50 | 2025-01-16 | ✅ |
| ING-003 | Fashion Imports Ltd. | $11,250.00 | 2025-01-15 | ✅ |
| ING-170642-U22 | Tech Suppliers S.A. | $10,599.90 | 2025-01-20 | ✅ |
| ING-170656-5W5 | Fashion Imports Ltd. | $2,674.45 | 2025-01-20 | ✅ |
| ING-170661-TD7 | Tech Suppliers S.A. | $1,349.65 | 2025-01-20 | ✅ |

### Resumen

- ✅ 6 ingresos totales
- ✅ $65,372.00 valor acumulado
- ✅ 2 proveedores diferentes
- ✅ Múltiples productos ingresados
- ✅ Todos los stocks incrementados

---

## 🎯 Casos de Uso

### Caso 1: Ingreso con Precio Base

1. Acceder a `/ingresos`
2. Seleccionar proveedor: "Tech Suppliers S.A."
3. Agregar producto: "Laptop HP Pavilion"
4. Ingresar cantidad: 10
5. **NO** cambiar precio unitario (usará el precio base)
6. Clic en "+" para agregar
7. Clic en "Registrar Ingreso"
8. **Resultado**: Ingreso creado, stock incrementado con precio base

### Caso 2: Ingreso con Precio Personalizado

1. Acceder a `/ingresos`
2. Seleccionar proveedor
3. Agregar producto: "Samsung Galaxy S23"
4. Ingresar cantidad: 5
5. Cambiar precio unitario: $680.00 (precio especial)
6. Clic en "+" para agregar
7. Clic en "Registrar Ingreso"
8. **Resultado**: Ingreso creado con precio personalizado

### Caso 3: Consultar Historial

1. Acceder a `/ingresos/listado`
2. Ver todos los ingresos
3. Filtrar por proveedor: "Tech Suppliers S.A."
4. Clic en "Ver Detalle" de cualquier ingreso
5. **Resultado**: Modal con información completa

### Caso 4: Buscar Ingreso por Código

1. Acceder a `/ingresos/listado`
2. Ingresar código: "ING-170642"
3. **Resultado**: Ingresos filtrados por código

### Caso 5: Ver Ingresos por Período

1. Acceder a `/ingresos/listado`
2. Seleccionar fecha inicio: "2025-01-01"
3. Seleccionar fecha fin: "2025-01-31"
4. **Resultado**: Ingresos de enero 2025

---

## 🚀 Cómo Probar el Módulo

### 1. Registrar un Nuevo Ingreso

```
URL: http://localhost:3000/ingresos
```

Pasos:
1. Iniciar sesión si no lo has hecho
2. Navegar a "Ingresos"
3. Seleccionar proveedor del dropdown
4. Elegir producto (ej: "Samsung Galaxy S23")
5. Ingresar cantidad (ej: 10)
6. Opcional: Cambiar precio unitario
7. Clic en botón "+"
8. Ver producto agregado en tabla
9. Agregar más productos si deseas
10. Agregar notas opcionales
11. Clic en "Registrar Ingreso"
12. **Resultado**: Ingreso creado con código único, stock incrementado

### 2. Ver Listado de Ingresos

```
URL: http://localhost:3000/ingresos/listado
```

Pasos:
1. Ver tabla con todos los ingresos
2. Revisar resumen (total ingresos, valor total)
3. Aplicar filtros si es necesario
4. Clic en "Ver Detalle" en cualquier ingreso
5. **Resultado**: Modal con información completa

### 3. Consultar Detalle de Ingreso

Pasos:
1. En el listado, buscar un ingreso específico
2. Clic en botón "Ver Detalle"
3. Revisar información:
   - Código de ingreso
   - Fecha y hora
   - Datos del proveedor
   - Lista de productos ingresados
   - Totales y resúmenes

---

## 📝 Validaciones del Sistema

### Validaciones de Formulario

- ✅ Proveedor seleccionado
- ✅ Al menos un producto
- ✅ Cantidades válidas (≥ 1)
- ✅ Sin productos duplicados
- ✅ Precios válidos (≥ 0)

### Validaciones de Base de Datos

- ✅ Proveedor existe
- ✅ Producto existe
- ✅ Incremento atómico del stock
- ✅ Transacción completa o rollback

---

## 🎨 Diseño de la Interfaz

### Colores

- **Verde**: Totales positivos, ingresos completados
- **Azul**: Elementos informativos
- **Rojo**: Errores
- **Gris**: Textos secundarios

### Componentes

- **Cards**: Información agrupada
- **Tables**: Datos tabulares con scroll
- **Badges**: Indicadores visuales
- **Dialogs**: Ventanas modales para detalles
- **Selects**: Selecciones de proveedores y productos
- **Inputs**: Búsqueda y captura de datos

---

## 🔍 Solución de Problemas

### Error: Producto Duplicado

**Problema:** El mismo producto ya está en la lista

**Solución:**
- Eliminar el producto de la lista
- Agregarlo nuevamente con la cantidad correcta
- O actualizar la cantidad (feature futuro)

### Error: Proveedor Requerido

**Problema:** No has seleccionado un proveedor

**Solución:**
- Seleccionar un proveedor del dropdown
- O crear un nuevo proveedor primero

---

## 📞 Scripts de Utilidad

### Crear Ingresos Adicionales

```bash
bun run scripts/create-additional-inbound.ts
```

Este script:
- Crea ingresos adicionales de prueba
- Incrementa stock de productos
- Genera códigos únicos
- Muestra resumen de lo creado

---

## ✅ Checklist de Implementación

- [x] API para crear ingresos
- [x] API para listar ingresos
- [x] API para obtener detalle de ingreso
- [x] Verificación de proveedor y productos
- [x] Incremento automático de stock
- [x] Generación de códigos de ingreso
- [x] Formulario de registro de ingresos
- [x] Listado de ingresos con filtros
- [x] Vista de detalle de ingreso
- [x] Precio unitario personalizable
- [x] Menú actualizado con "Listado de Ingresos"
- [x] Datos de prueba creados
- [x] Documentación completa

---

## 🎯 Próximas Mejoras (Opcionales)

1. **Modificación de Ingresos** - Editar ingresos existentes
2. **Anulación de Ingresos** - Revertir ingresos
3. **Notas por Item** - Notas específicas por producto
4. **Impuestos** - Cálculo automático de impuestos
5. **Facturas de Compra** - Generar facturas de proveedor
6. **Comparativa de Precios** - Ver variaciones de precio
7. **Gráficos de Ingresos** - Visualización con gráficos
8. **Dashboard de Ingresos** - Métricas KPIs

---

## 📚 API Relacionada

- `/api/proveedores` - Gestión de proveedores
- `/api/productos` - Catálogo de productos
- `/api/reportes` - Reportes de inventario
- `/api/dashboard` - Estadísticas generales

---

## ✅ Estado del Módulo

| Componente | Estado | Descripción |
|-----------|---------|-------------|
| **API Crear Ingreso** | ✅ Activo | POST /api/ingresos |
| **API Listado** | ✅ Activo | GET /api/ingresos/listado |
| **API Detalle** | ✅ Activo | GET /api/ingresos/{id} |
| **Frontend Registro** | ✅ Funcional | /ingresos |
| **Frontend Listado** | ✅ Funcional | /ingresos/listado |
| **Menú** | ✅ Actualizado | Incluye "Listado de Ingresos" |
| **Control Stock** | ✅ Implementado | Incremento automático |
| **Códigos Únicos** | ✅ Generados | Formato ING-{timestamp}-{random} |
| **Datos Prueba** | ✅ Creados | 6 ingresos con diferentes proveedores |

---

## 🎉 Conclusión

El módulo de ingresos está **completamente funcional** y listo para usar. Incluye:

- ✅ Registro completo de ingresos
- ✅ Control automático de stock (incremento)
- ✅ Listado con filtros avanzados
- ✅ Detalle completo de cada ingreso
- ✅ Códigos de ingreso únicos
- ✅ Precio unitario personalizable
- ✅ Interfaz intuitiva y elegante
- ✅ Información de proveedores

**Puedes acceder ya mismo:**
- Registro: http://localhost:3000/ingresos
- Listado: http://localhost:3000/ingresos/listado
