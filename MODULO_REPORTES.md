# 📊 MÓDULO DE REPORTES - Guía de Uso

## 🎯 Características

El módulo de reportes del sistema de inventario incluye funcionalidades completas para:

1. **Reporte de Stock** - Listado completo de productos en inventario
2. **Historial de Producto** - Todos los movimientos de un producto específico
3. **Exportación a CSV** - Formato compatible con Excel y otros sistemas
4. **Exportación a Excel (.xlsx)** - Formato nativo de Microsoft Excel
5. **Exportación a PDF** - Documentos profesionales para impresión/envío

---

## 📁 Estructura del Módulo

### Backend (API Routes)

```
src/app/api/reportes/
├── stock/route.ts          # API para reporte de stock
└── historial/route.ts      # API para historial de movimientos
```

### Utilidades de Exportación

```
src/lib/reports/
├── csv-export.ts          # Exportación a CSV
├── excel-export.ts        # Exportación a Excel (XLSX)
└── pdf-export.ts          # Exportación a PDF (jsPDF)
```

### Frontend

```
src/app/reportes/
└── page.tsx              # Página de reportes con todas las funcionalidades
```

---

## 🔧 Dependencias Instaladas

```json
{
  "pdfmake": "^0.2.x",           // Generación de PDFs
  "xlsx": "^0.18.x"             // Exportación a Excel (ya incluido)
  "jspdf": "^2.5.x",            // Generación de PDFs con tablas
  "jspdf-autotable": "^3.8.x"   // Tablas en PDF
}
```

---

## 📊 Reporte de Stock

### Funcionalidades

- ✅ Listado completo de productos en inventario
- ✅ Filtrado por categoría
- ✅ Filtro de stock bajo (<10 unidades)
- ✅ Resumen con totales:
  - Total de productos
  - Stock total (unidades)
  - Valor del inventario
  - Productos con stock bajo
- ✅ Exportación a CSV, Excel y PDF
- ✅ Tabla con:
  - SKU del producto
  - Nombre del producto
  - Categoría
  - Stock actual
  - Precio unitario
  - Valor total (stock × precio)

### Uso

1. Ir a **http://localhost:3000/reportes**
2. Seleccionar la pestaña **"Reporte de Stock"**
3. Aplicar filtros si es necesario:
   - Categoría específica o todas
   - Solo productos con stock bajo
4. Exportar en el formato deseado:
   - **CSV** - Para Excel, Google Sheets, etc.
   - **Excel** - Formato .xlsx nativo
   - **PDF** - Documento profesional

### API Endpoint

```http
GET /api/reportes/stock?categoriaId={id}&lowStock={boolean}
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|------------|-------------|
| categoriaId | string | No | ID de la categoría (opcional) |
| lowStock | boolean | No | `true` para solo stock bajo |

#### Respuesta

```json
{
  "productos": [
    {
      "id": "cmkm5k06v000cok4v50jknwfv",
      "sku": "LAP-001",
      "name": "Laptop HP Pavilion 15",
      "stock": 25,
      "price": 750.00,
      "category": {
        "id": "cmkm5k06l0000ok4vp1buriwh",
        "name": "Electrónica"
      }
    }
  ],
  "resumen": {
    "totalProductos": 6,
    "totalStock": 258,
    "valorTotalStock": 59822.67,
    "productosStockBajo": 2
  }
}
```

---

## 📈 Historial de Producto

### Funcionalidades

- ✅ Selección de cualquier producto del inventario
- ✅ Historial completo de movimientos:
  - Ingresos (compras a proveedores)
  - Ventas (a clientes)
- ✅ Información detallada de cada movimiento:
  - Fecha y hora
  - Tipo de movimiento
  - Número de referencia
  - Proveedor o cliente
  - Cantidad
  - Precio unitario
  - Subtotal
  - Notas
- ✅ Resumen de movimientos:
  - Total de ingresos (unidades)
  - Total de ventas (unidades)
  - Stock actual
  - Valor de ingresos
  - Valor de ventas
- ✅ Exportación a CSV, Excel y PDF

### Uso

1. Ir a **http://localhost:3000/reportes**
2. Seleccionar la pestaña **"Historial de Producto"**
3. Seleccionar un producto del dropdown
4. Ver el historial completo de movimientos
5. Exportar en el formato deseado:
   - **CSV** - Para análisis en hojas de cálculo
   - **Excel** - Formato .xlsx nativo
   - **PDF** - Documento profesional con historial

### API Endpoint

```http
GET /api/reportes/historial?productoId={id}
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|------------|-------------|
| productoId | string | Sí | ID del producto |

#### Respuesta

```json
{
  "producto": {
    "id": "cmkm5k06v000cok4v50jknwfv",
    "sku": "ROP-001",
    "name": "Camiseta Polo Azul",
    "stock": 100,
    "category": {
      "name": "Ropa"
    }
  },
  "movimientos": [
    {
      "id": "cmkm5k0pg0019ok4vzww39vyr",
      "tipo": "VENTA",
      "fecha": "2025-01-19T00:00:00.000Z",
      "referencia": "VEN-002",
      "cantidad": 5,
      "precioUnitario": 29.99,
      "subtotal": 149.95,
      "proveedorCliente": "María García",
      "notas": "Venta a María García"
    }
  ],
  "resumen": {
    "totalIngresos": 100,
    "totalVentas": 5,
    "stockActual": 100,
    "valorIngresos": 2999,
    "valorVentas": 149.95
  }
}
```

---

## 📤 Funciones de Exportación

### Exportación a CSV

**Características:**
- ✅ Compatibilidad total con Excel
- ✅ Soporte para caracteres especiales y acentos
- ✅ Escapar de comillas y comas
- ✅ Codificación UTF-8

**Uso en código:**

```typescript
import { exportToCSV } from '@/lib/reports/csv-export'

const columnNames = {
  sku: 'SKU',
  name: 'Producto',
  stock: 'Stock',
  price: 'Precio'
}

exportToCSV(data, 'reporte-stock', columnNames)
```

### Exportación a Excel (.xlsx)

**Características:**
- ✅ Formato nativo de Microsoft Excel
- ✅ Hojas con nombres personalizados
- ✅ Ancho de columnas automático
- ✅ Soporte para múltiples hojas

**Uso en código:**

```typescript
import { exportToExcel } from '@/lib/reports/excel-export'

// Una hoja
exportToExcel(data, 'reporte-stock', 'Stock', columnNames)

// Múltiples hojas
exportToExcelMultipleSheets([
  { name: 'Stock', data: stockData },
  { name: 'Movimientos', data: movimientosData }
], 'reporte-completo')
```

### Exportación a PDF

**Características:**
- ✅ Documentos profesionales con jsPDF
- ✅ Tablas formateadas con autoTable
- ✅ Encabezados personalizados
- ✅ Números de página
- ✅ Fecha de generación automática
- ✅ Totales y resúmenes
- ✅ Footer personalizable

**Uso en código:**

```typescript
import { generateStockPDF, generateHistorialPDF } from '@/lib/reports/pdf-export'

// Reporte de stock
generateStockPDF(productos, resumen)

// Historial de producto
generateHistorialPDF(producto, movimientos, resumen)

// PDF personalizado
exportToPDF({
  title: 'Reporte Personalizado',
  subtitle: 'Subtítulo del reporte',
  filename: 'reporte',
  columns: [
    { header: 'Columna 1', dataKey: 'col1' },
    { header: 'Columna 2', dataKey: 'col2' }
  ],
  data: datos,
  showTotal: true,
  footer: 'Pie de página'
})
```

---

## 🎨 Diseño de la Interfaz

### Paleta de Colores

- **Primary**: Azul para acciones principales
- **Destructive**: Rojo para errores y alertas
- **Success**: Verde para stock e ingresos
- **Info**: Azul claro para ventas

### Componentes

- **Cards**: Información agrupada
- **Tables**: Datos tabulares con scroll
- **Badges**: Indicadores visuales (stock, tipo)
- **Tabs**: Navegación entre tipos de reporte
- **Select**: Filtros y selecciones
- **Buttons**: Acciones principales

---

## 🧪 Datos de Prueba

### Script de Prueba

Para generar datos de prueba:

```bash
bun run scripts/create-test-data.ts
```

Esto crea:
- ✅ 6 productos (3 categorías)
- ✅ 2 clientes
- ✅ 2 proveedores
- ✅ 3 ingresos
- ✅ 3 ventas
- ✅ Movimientos de stock

### Datos Creados

**Productos:**
1. Laptop HP Pavilion 15 - 25 unidades
2. Samsung Galaxy S23 - 50 unidades
3. Camiseta Polo Azul - 100 unidades
4. Jeans Slim Fit - 5 unidades (stock bajo)
5. Lámpara LED Mesa - 75 unidades
6. Set de Cuchillos - 3 unidades (stock muy bajo)

---

## 📝 Ejemplos de Uso

### Escenario 1: Reporte Diario de Stock

1. Acceder a http://localhost:3000/reportes
2. Seleccionar pestaña "Reporte de Stock"
3. No aplicar filtros (ver todo)
4. Clic en botón **"PDF"**
5. Guardar archivo con fecha: `reporte-stock-20250120.pdf`

### Escenario 2: Productos con Stock Bajo

1. Acceder a http://localhost:3000/reportes
2. Seleccionar pestaña "Reporte de Stock"
3. Activar filtro **"Solo Stock Bajo"**
4. Ver productos con <10 unidades
5. Exportar a **Excel** para análisis

### Escenario 3: Auditoría de Producto

1. Acceder a http://localhost:3000/reportes
2. Seleccionar pestaña "Historial de Producto"
3. Seleccionar producto (ej: "Laptop HP Pavilion 15")
4. Revisar todos los movimientos
5. Exportar a **PDF** para auditoría

---

## 🔍 Solución de Problemas

### Error al exportar

**Problema:** No se descarga el archivo

**Solución:**
1. Verificar que haya datos disponibles
2. Revisar consola del navegador
3. Asegurar que el popup no esté bloqueado
4. Verificar permisos de descarga

### PDF se ve mal

**Problema:** Tablas cortadas o sin formato

**Solución:**
1. Reducir cantidad de datos por página
2. Usar filtros para limitar resultados
3. Verificar que jsPDF esté cargado correctamente

### Excel no abre

**Problema:** Archivo .xlsx corrupto

**Solución:**
1. Verificar que la librería xlsx esté instalada
2. Revisar los datos que se están exportando
3. Probar exportar a CSV primero

---

## 📚 API Complementaria

### Categorías

```http
GET /api/categorias
```

### Productos

```http
GET /api/productos?categoriaId={id}
```

### Dashboard

```http
GET /api/dashboard
```

---

## ✅ Checklist de Implementación

- [x] API de reporte de stock
- [x] API de historial de producto
- [x] Exportación a CSV
- [x] Exportación a Excel (.xlsx)
- [x] Exportación a PDF (jsPDF)
- [x] Frontend con pestañas
- [x] Filtros por categoría
- [x] Filtro de stock bajo
- [x] Tablas con scroll
- [x] Badges de estado
- [x] Resúmenes y totales
- [x] Datos de prueba
- [x] Documentación completa

---

## 🎯 Próximas Mejoras (Opcionales)

1. **Gráficos de tendencias** - Usar Recharts para visualizar stock
2. **Reportes programados** - Enviar reportes por email automáticamente
3. **Comparativa periodos** - Comparar stock mensual
4. **KPIs adicionales** - Rotación de inventario, margen, etc.
5. **Filtros de fechas** - Rango de fechas personalizado
6. **Exportación por email** - Enviar reportes directamente
7. **Plantillas personalizadas** - Configurar formatos de reporte
8. **Dashboard de reportes** - Vista de métricas clave

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar `dev.log` para errores detallados
2. Verificar consola del navegador
3. Probar con datos de prueba primero
4. Revisar documentación de librerías:
   - jsPDF: https://github.com/parallax/jsPDF
   - xlsx: https://github.com/SheetJS/sheetjs
