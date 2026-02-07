import * as XLSX from 'xlsx'

/**
 * Exportar datos a Excel (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Reporte',
  columnNames?: Record<keyof T, string>
) {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Obtener las columnas
  const columns = Object.keys(data[0]) as Array<keyof T>

  // Crear un array de arrays con los datos
  // Primera fila: cabeceras con nombres personalizados si existen
  const header = columns.map(col => columnNames?.[col] || String(col))
  const rows = data.map(row =>
    columns.map(col => row[col] ?? '')
  )

  const worksheetData = [header, ...rows]

  // Crear worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // Ajustar ancho de columnas automáticamente
  const colWidths = columns.map((_, i) => ({
    wch: Math.max(
      header[i].toString().length,
      ...rows.map(row => String(row[i]).length)
    ) + 2
  }))
  worksheet['!cols'] = colWidths

  // Crear workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generar y descargar archivo
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

/**
 * Exportar datos con múltiples hojas
 */
export function exportToExcelMultipleSheets(
  data: Array<{ name: string; data: any[]; headers?: string[] }>,
  filename: string
) {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  const workbook = XLSX.utils.book_new()

  data.forEach(sheet => {
    const worksheetData = sheet.headers
      ? [sheet.headers, ...sheet.data]
      : [Object.keys(sheet.data[0] || {}), ...sheet.data.map(row => Object.values(row))]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
  })

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
