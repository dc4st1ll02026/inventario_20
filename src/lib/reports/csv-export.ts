/**
 * Exportar datos a CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columnNames?: Record<keyof T, string>
) {
  if (!data || data.length === 0) {
    throw new Error('No hay datos para exportar')
  }

  // Obtener las columnas del primer objeto
  const columns = Object.keys(data[0]) as Array<keyof T>

  // Crear la cabecera
  const header = columns.map(col => columnNames?.[col] || String(col)).join(',')

  // Crear las filas
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col]
      // Escapar comillas y envolver en comillas si contiene comas
      const strValue = String(value ?? '')
      return strValue.includes(',') || strValue.includes('"')
        ? `"${strValue.replace(/"/g, '""')}"`
        : strValue
    }).join(',')
  )

  // Combinar cabecera y filas
  const csv = [header, ...rows].join('\n')

  // Crear Blob y descargar
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
