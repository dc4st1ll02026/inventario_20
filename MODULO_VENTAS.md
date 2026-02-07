# 🛒 MÓDULO DE VENTAS - Guía Completa

## 🎯 Características del Módulo

El módulo de ventas incluye funcionalidades completas para:

1. **Registro de Ventas** - Formulario completo para crear ventas
2. **Listado de Ventas** - Historial completo de todas las ventas
3. **Detalle de Venta** - Vista detallada de cada venta
4. **Verificación de Stock** - Control automático de disponibilidad
5. **Código de Operación** - Generación automática de códigos únicos
6. **Filtros Avanzados** - Búsqueda por cliente, código y fechas

---

## 📁 Estructura del Módulo

### Backend (API Routes)

```
src/app/api/ventas/
├── route.ts              # API para crear nuevas ventas
├── listado/route.ts      # API para listar ventas
└── [id]/route.ts        # API para obtener detalle de venta
```

### Frontend

```
src/app/ventas/
├── page.tsx              # Formulario de registro de ventas
└── listado/page.tsx      # Listado de ventas con filtros
```

### Componentes de Navegación

```
src/components/layout/
└── sidebar.tsx            # Menú actualizado con "Listado de Ventas"
```

---

## 🔌 API Endpoints

### 1. Crear Nueva Venta

```http
POST /api/ventas
```

#### Body de la Petición

```json
{
  "customerId": "cmkm5k06p0003ok4vwwcodfx2",
  "items": [
    {
      "productId": "cmkm5k06s0008ok4vu2riscgg",
      "quantity": 2
    }
  ],
  "notes": "Notas sobre la venta (opcional)"
}
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|------------|-------------|
| customerId | string | Sí | ID del cliente |
| items | Array | Sí | Lista de productos a vender |
| items[].productId | string | Sí | ID del producto |
| items[].quantity | number | Sí | Cantidad a vender |
| notes | string | No | Notas adicionales |

#### Respuesta Exitosa (201)

```json
{
  "venta": {
    "id": "cmkm5k0pk001cok4vdo4ll803",
    "operationId": "cmkm5k0ph001aok4vqtfggb4m",
    "customerId": "cmkm5k06p0003ok4vwwcodfx2",
    "operation": {
      "id": "cmkm5k0ph001aok4vqtfggb4m",
      "type": "OUTBOUND",
      "reference": "VEN-309565-XEP",
      "date": "2025-01-20T12:30:00.000Z",
      "total": 1504.95,
      "notes": "Venta regular"
    },
    "customer": {
      "id": "cmkm5k06p0003ok4vwwcodfx2",
      "name": "Juan Pérez",
      "email": "juan.perez@email.com"
    },
    "items": [...]
  },
  "codigoOperacion": "VEN-309565-XEP"
}
```

#### Errores Posibles

| Código | Mensaje | Causa |
|--------|---------|--------|
| 400 | Cliente y productos son requeridos | Faltan datos obligatorios |
| 400 | Cliente no encontrado | El ID de cliente no existe |
| 400 | Producto no encontrado | Un producto no existe |
| 400 | Stock insuficiente | No hay suficientes unidades |
| 400 | Producto duplicado | El mismo producto se agregó 2 veces |

---

### 2. Listado de Ventas

```http
GET /api/ventas/listado?clienteId={id}&fechaInicio={YYYY-MM-DD}&fechaFin={YYYY-MM-DD}
```

#### Parámetros Query (opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| clienteId | string | Filtrar por cliente específico |
| fechaInicio | string (ISO date) | Fecha de inicio del rango |
| fechaFin | string (ISO date) | Fecha de fin del rango |

#### Respuesta

```json
{
  "ventas": [
    {
      "id": "cmkm5k0pk001cok4vdo4ll803",
      "operationId": "cmkm5k0ph001aok4vqtfggb4m",
      "customerId": "cmkm5k06p0003ok4vwwcodfx2",
      "operation": {
        "id": "cmkm5k0ph001aok4vqtfggb4m",
        "type": "OUTBOUND",
        "reference": "VEN-309565-XEP",
        "date": "2025-01-20T12:30:00.000Z",
        "total": 1504.95,
        "notes": "Venta regular"
      },
      "customer": {
        "id": "cmkm5k06p0003ok4vwwcodfx2",
        "name": "Juan Pérez",
        "email": "juan.perez@email.com"
      },
      "items": [...]
    }
  ],
  "resumen": {
    "totalVentas": 6,
    "valorTotalVentas": 6074.55
  }
}
```

---

### 3. Detalle de Venta

```http
GET /api/ventas/{id}
```

#### Parámetros de URL

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | ID de la venta |

#### Respuesta

```json
{
  "venta": {
    "id": "cmkm5k0pk001cok4vdo4ll803",
    "operation": {
      "id": "cmkm5k0ph001aok4vqtfggb4m",
      "type": "OUTBOUND",
      "reference": "VEN-309565-XEP",
      "date": "2025-01-20T12:30:00.000Z",
      "total": 1504.95,
      "notes": "Venta regular"
    },
    "customer": {
      "id": "cmkm5k06p0003ok4vwwcodfx2",
      "name": "Juan Pérez",
      "email": "juan.perez@email.com",
      "phone": "555-0101",
      "address": "Av. Principal 123"
    },
    "items": [
      {
        "id": "cmkm5k0pk001eok4vk8px3old",
        "saleId": "cmkm5k0pk001cok4vdo4ll803",
        "productId": "cmkm5k06s0008ok4vu2riscgg",
        "quantity": 2,
        "unitPrice": 750.00,
        "subtotal": 1500.00,
        "product": {
          "id": "cmkm5k06s0008ok4vu2riscgg",
          "name": "Laptop HP Pavilion 15",
          "sku": "LAP-001",
          "category": {
            "name": "Electrónica"
          }
        }
      }
    ]
  }
}
```

---

## 🎨 Interfaz de Usuario

### Registro de Ventas (`/ventas`)

#### Funcionalidades

1. **Selección de Cliente**
   - Dropdown con todos los clientes registrados
   - Muestra nombre y email del cliente

2. **Agregar Productos**
   - Lista de productos con stock disponible
   - Muestra SKU, nombre, stock y precio
   - Validación automática de stock
   - Prevención de productos duplicados

3. **Vista Previa**
   - Tabla con productos agregados
   - Cantidad, precio unitario y subtotal por producto
   - Botón para eliminar productos

4. **Cálculos Automáticos**
   - Subtotal por producto
   - Total general de la venta
   - Cantidad total de productos

5. **Formulario Completo**
   - Selección de cliente
   - Lista de productos
   - Notas opcionales
   - Validaciones antes de guardar

#### Flujo de Uso

1. Acceder a **http://localhost:3000/ventas**
2. Seleccionar el cliente
3. Seleccionar producto del dropdown
4. Ingresar cantidad
5. Clic en **"+"** para agregar
6. Repetir pasos 3-5 para más productos
7. Agregar notas (opcional)
8. Clic en **"Registrar Venta"**
9. Confirmar creación en modal

#### Validaciones

- ✅ Cliente seleccionado
- ✅ Al menos un producto
- ✅ Stock disponible suficiente
- ✅ Sin productos duplicados
- ✅ Cantidades válidas (mínimo 1)

---

### Listado de Ventas (`/ventas/listado`)

#### Funcionalidades

1. **Filtros Avanzados**
   - Búsqueda por código de operación
   - Filtrado por cliente
   - Rango de fechas (inicio y fin)

2. **Resumen Estadístico**
   - Total de ventas
   - Valor acumulado

3. **Tabla de Ventas**
   - Código de operación
   - Fecha y hora
   - Cliente con email
   - Cantidad de items
   - Total de venta
   - Botón para ver detalle

4. **Detalle Completo**
   - Modal con toda la información
   - Datos de la venta
   - Información del cliente
   - Lista de productos con detalles
   - Totales y resúmenes

#### Flujo de Uso

1. Acceder a **http://localhost:3000/ventas/listado**
2. Aplicar filtros si es necesario:
   - Buscar por código
   - Filtrar por cliente
   - Seleccionar rango de fechas
3. Revisar tabla de ventas
4. Clic en **"Ver Detalle"** en cualquier venta
5. Ver información completa en modal

#### Información en el Listado

| Columna | Descripción |
|---------|-------------|
| Código Operación | Código único generado automáticamente |
| Fecha | Fecha y hora de la venta |
| Cliente | Nombre y email del cliente |
| Items | Cantidad de productos (badge) |
| Total | Monto total de la venta (verde) |
| Acciones | Botón para ver detalle |

---

## 🔄 Generación de Códigos de Operación

### Formato

```
VEN-{timestamp}-{random}
```

### Ejemplos

- `VEN-309565-XEP`
- `VEN-309576-BSX`
- `VEN-309580-3C7`

### Componentes

| Componente | Descripción |
|-----------|-------------|
| VEN | Prefijo de venta |
| 309565 | Timestamp (últimos 6 dígitos) |
| XEP | Código aleatorio (3 caracteres) |

---

## ✅ Control de Stock

### Verificación Antes de Vender

El sistema verifica automáticamente:

1. **Stock Disponible**
   - Compara cantidad solicitada con stock actual
   - Rechaza si es insuficiente

2. **Actualización Automática**
   - Resta la cantidad vendida del stock
   - Actualiza el inventario en tiempo real

3. **Alertas al Usuario**
   - Mensaje claro si el stock es insuficiente
   - Indica stock disponible del producto

### Ejemplo de Error

```json
{
  "error": "Stock insuficiente para el producto: Laptop HP Pavilion 15",
  "producto": "Laptop HP Pavilion 15",
  "stockDisponible": 25,
  "cantidadSolicitada": 30
}
```

---

## 📊 Datos de Prueba

### Ventas Creadas

| Código | Cliente | Total | Fecha |
|--------|---------|-------|-------|
| VEN-003 | Juan Pérez | $1,049.75 | 2025-01-20 |
| VEN-002 | María García | $1,049.97 | 2025-01-19 |
| VEN-001 | Juan Pérez | $1,499.95 | 2025-01-18 |
| VEN-309565-XEP | Juan Pérez | $1,504.95 | 2025-01-20 |
| VEN-309576-BSX | María García | $819.98 | 2025-01-20 |
| VEN-309580-3C7 | Juan Pérez | $149.95 | 2025-01-20 |

### Resumen

- ✅ 6 ventas totales
- ✅ $6,074.55 valor acumulado
- ✅ 2 clientes diferentes
- ✅ Múltiples productos vendidos
- ✅ Todos los stocks actualizados

---

## 🎯 Casos de Uso

### Caso 1: Venta Rápida

1. Acceder a `/ventas`
2. Seleccionar cliente: "Juan Pérez"
3. Agregar 1 producto con cantidad 1
4. Clic en "Registrar Venta"
5. **Resultado**: Venta creada, stock actualizado

### Caso 2: Venta Múltiples Productos

1. Acceder a `/ventas`
2. Seleccionar cliente
3. Agregar producto 1 (cant. 2)
4. Agregar producto 2 (cant. 3)
5. Agregar producto 3 (cant. 1)
6. Verificar total calculado
7. Clic en "Registrar Venta"
8. **Resultado**: Venta con 3 productos creada

### Caso 3: Consultar Historial

1. Acceder a `/ventas/listado`
2. Ver todas las ventas
3. Filtrar por cliente: "Juan Pérez"
4. Clic en "Ver Detalle" de cualquier venta
5. **Resultado**: Modal con información completa

### Caso 4: Buscar Venta por Código

1. Acceder a `/ventas/listado`
2. Ingresar código: "VEN-309565"
3. **Resultado**: Ventas filtradas por código

### Caso 5: Ver Ventas por Periodo

1. Acceder a `/ventas/listado`
2. Seleccionar fecha inicio: "2025-01-01"
3. Seleccionar fecha fin: "2025-01-31"
4. **Resultado**: Ventas de enero 2025

---

## 🚀 Cómo Probar el Módulo

### 1. Registrar una Nueva Venta

```
URL: http://localhost:3000/ventas
```

Pasos:
1. Iniciar sesión si no lo has hecho
2. Navegar a "Ventas"
3. Seleccionar cliente del dropdown
4. Elegir producto (ej: "Samsung Galaxy S23")
5. Ingresar cantidad (ej: 2)
6. Clic en botón "+"
7. Ver producto agregado en tabla
8. Agregar más productos si deseas
9. Agregar notas opcionales
10. Clic en "Registrar Venta"
11. **Resultado**: Venta creada con código único

### 2. Ver Listado de Ventas

```
URL: http://localhost:3000/ventas/listado
```

Pasos:
1. Ver tabla con todas las ventas
2. Revisar resumen (total ventas, valor total)
3. Aplicar filtros si es necesario
4. Clic en "Ver Detalle" en cualquier venta
5. **Resultado**: Modal con información completa

### 3. Consultar Detalle de Venta

Pasos:
1. En el listado, buscar una venta específica
2. Clic en botón "Ver Detalle"
3. Revisar información:
   - Código de operación
   - Fecha y hora
   - Datos del cliente
   - Lista de productos vendidos
   - Totales y resúmenes

---

## 📝 Validaciones del Sistema

### Validaciones de Formulario

- ✅ Cliente seleccionado
- ✅ Al menos un producto
- ✅ Cantidades válidas (≥ 1)
- ✅ Stock disponible suficiente
- ✅ Sin productos duplicados

### Validaciones de Base de Datos

- ✅ Cliente existe
- ✅ Producto existe
- ✅ Stock disponible antes de vender
- ✅ Actualización atómica del stock
- ✅ Transacción completa o rollback

---

## 🎨 Diseño de la Interfaz

### Colores

- **Verde**: Totales positivos, ventas completadas
- **Azul**: Elementos informativos
- **Rojo**: Errores, stock insuficiente
- **Gris**: Textos secundarios

### Componentes

- **Cards**: Información agrupada
- **Tables**: Datos tabulares con scroll
- **Badges**: Indicadores visuales
- **Dialogs**: Ventanas modales para detalles
- **Selects**: Selecciones de clientes y productos
- **Inputs**: Búsqueda y captura de datos

---

## 🔍 Solución de Problemas

### Error: Stock Insuficiente

**Problema:** Intentas vender más de lo disponible

**Solución:**
- Verificar stock disponible del producto
- Reducir cantidad
- O realizar un ingreso antes de vender

### Error: Producto Duplicado

**Problema:** El mismo producto ya está en la lista

**Solución:**
- Eliminar el producto de la lista
- Agregarlo nuevamente con la cantidad correcta
- O actualizar la cantidad (feature futuro)

### Error: Cliente Requerido

**Problema:** No has seleccionado un cliente

**Solución:**
- Seleccionar un cliente del dropdown
- O crear un nuevo cliente primero

---

## 📞 Scripts de Utilidad

### Crear Ventas Adicionales

```bash
bun run scripts/create-additional-sales.ts
```

Este script:
- Crea ventas adicionales de prueba
- Verifica stock disponible
- Actualiza inventario automáticamente
- Genera códigos únicos

---

## ✅ Checklist de Implementación

- [x] API para crear ventas
- [x] API para listar ventas
- [x] API para obtener detalle de venta
- [x] Verificación de stock antes de vender
- [x] Actualización automática de stock
- [x] Generación de códigos de operación
- [x] Formulario de registro de ventas
- [x] Listado de ventas con filtros
- [x] Vista de detalle de venta
- [x] Modal con información completa
- [x] Menú actualizado con "Listado de Ventas"
- [x] Datos de prueba creados
- [x] Documentación completa

---

## 🎯 Próximas Mejoras (Opcionales)

1. **Anulación de Ventas** - Permitir cancelar ventas
2. **Modificación de Ventas** - Editar ventas existentes
3. **Notas por Item** - Notas específicas por producto
4. **Descuentos** - Aplicar descuentos por item o general
5. **Impuestos** - Cálculo automático de impuestos
6. **Métodos de Pago** - Registro de forma de pago
7. **Exportar a PDF** - Generar facturas
8. **Búsqueda Avanzada** - Buscar por producto, rango de monto
9. **Gráficos de Ventas** - Visualización con gráficos
10. **Dashboard de Ventas** - Métricas KPIs

---

## 📚 API Relacionada

- `/api/clientes` - Gestión de clientes
- `/api/productos` - Catálogo de productos
- `/api/reportes` - Reportes de inventario
- `/api/dashboard` - Estadísticas generales

---

## ✅ Estado del Módulo

| Componente | Estado | Descripción |
|-----------|---------|-------------|
| **API Crear Venta** | ✅ Activo | POST /api/ventas |
| **API Listado** | ✅ Activo | GET /api/ventas/listado |
| **API Detalle** | ✅ Activo | GET /api/ventas/{id} |
| **Frontend Registro** | ✅ Funcional | /ventas |
| **Frontend Listado** | ✅ Funcional | /ventas/listado |
| **Menú** | ✅ Actualizado | Incluye "Listado de Ventas" |
| **Datos Prueba** | ✅ Creados | 6 ventas con diferentes clientes |
| **Control Stock** | ✅ Implementado | Verificación y actualización |

---

## 🎉 Conclusión

El módulo de ventas está **completamente funcional** y listo para usar. Incluye:

- ✅ Registro completo de ventas
- ✅ Control automático de stock
- ✅ Listado con filtros avanzados
- ✅ Detalle completo de cada venta
- ✅ Códigos de operación únicos
- ✅ Interfaz intuitiva y elegante

**Puedes acceder ya mismo:**
- Registro: http://localhost:3000/ventas
- Listado: http://localhost:3000/ventas/listado
