import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFColumn {
  header: string
  dataKey: string
  width?: number
}

export interface PDFOptions {
  title: string
  subtitle?: string
  filename: string
  columns: PDFColumn[]
  data: any[]
  showTotal?: boolean
  totalLabel?: string
  footer?: string
}

/**
 * Exportar datos a PDF usando jsPDF
 */
export function exportToPDF(options: PDFOptions) {
  const { title, subtitle, filename, columns, data, showTotal, totalLabel, footer } = options

  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Crear documento PDF
  const doc = new jsPDF()

  // Configurar fuente
  doc.setFontSize(20)
  doc.text(title, 14, 20)

  if (subtitle) {
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(subtitle, 14, 28)
  }

  // Fecha del reporte
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.setFontSize(10)
  doc.setTextColor(150)
  doc.text(`Generado: ${fecha}`, 14, 35)

  // Preparar datos para la tabla
  const tableColumns = columns.map(col => col.header)
  const tableRows = data.map(row =>
    columns.map(col => {
      const value = row[col.dataKey]
      if (typeof value === 'number' && col.dataKey.toLowerCase().includes('precio')) {
        return `$${value.toFixed(2)}`
      }
      if (typeof value === 'number' && (col.dataKey.toLowerCase().includes('total') || col.dataKey.toLowerCase().includes('subtotal'))) {
        return `$${value.toFixed(2)}`
      }
      return value ?? ''
    })
  )

  // Generar tabla
  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    margin: { top: 40, left: 14, right: 14 }
  })

  // Calcular totales si se solicita
  if (showTotal) {
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(12)
    doc.setTextColor(60)

    // Buscar columnas numéricas para calcular totales
    const numericColumns = columns.filter(col =>
      data.some(row => typeof row[col.dataKey] === 'number')
    )

    numericColumns.forEach((col, index) => {
      const total = data.reduce((sum, row) => sum + (row[col.dataKey] || 0), 0)

      if (total > 0) {
        const label = totalLabel || 'Total'
        const isCurrency = col.dataKey.toLowerCase().includes('precio') ||
                          col.dataKey.toLowerCase().includes('total') ||
                          col.dataKey.toLowerCase().includes('subtotal') ||
                          col.dataKey.toLowerCase().includes('valor')

        const valueStr = isCurrency ? `$${total.toFixed(2)}` : total.toString()

        doc.text(`${label} ${col.header}: ${valueStr}`, 14, finalY + (index * 7))
      }
    })
  }

  // Añadir footer
  if (footer) {
    const finalY = (doc as any).lastAutoTable.finalY + 30
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(footer, 14, finalY)
  }

  // Números de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' })
  }

  // Guardar PDF
  doc.save(`${filename}.pdf`)
}

/**
 * Generar PDF de reporte de stock
 */
export function generateStockPDF(
  productos: any[],
  resumen: any,
  options?: Partial<PDOptions>
) {
  const columns: PDFColumn[] = [
    { header: 'SKU', dataKey: 'sku' },
    { header: 'Producto', dataKey: 'name', width: 50 },
    { header: 'Categoría', dataKey: 'category' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Precio Unit.', dataKey: 'price' },
    { header: 'Valor Total', dataKey: 'valorTotal' }
  ]

  // Transformar datos para mostrar en tabla
  const data = productos.map(p => ({
    ...p,
    category: p.category?.name || '',
    valorTotal: p.stock * p.price
  }))

  exportToPDF({
    title: 'Reporte de Stock',
    subtitle: 'Listado de productos en inventario',
    filename: `reporte-stock-${Date.now()}`,
    columns,
    data,
    showTotal: true,
    totalLabel: 'Total General',
    footer: `Sistema de Inventario - ${resumen.totalProductos} productos registrados`,
    ...options
  })
}

/**
 * Generar PDF de historial de producto
 */
export function generateHistorialPDF(
  producto: any,
  movimientos: any[],
  resumen: any
) {
  const columns: PDFColumn[] = [
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Tipo', dataKey: 'tipo' },
    { header: 'Referencia', dataKey: 'referencia' },
    { header: 'Proveedor/Cliente', dataKey: 'proveedorCliente' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio Unit.', dataKey: 'precioUnitario' },
    { header: 'Subtotal', dataKey: 'subtotal' }
  ]

  exportToPDF({
    title: `Historial de Movimientos - ${producto.name}`,
    subtitle: `SKU: ${producto.sku} | Categoría: ${producto.category?.name}`,
    filename: `historial-${producto.sku}-${Date.now()}`,
    columns,
    data: movimientos.map(m => ({
      ...m,
      fecha: new Date(m.fecha).toLocaleDateString('es-ES')
    })),
    showTotal: false,
    footer: `Stock Actual: ${resumen.stockActual} | Ingresos: ${resumen.totalIngresos} | Ventas: ${resumen.totalVentas}`
  })
}
