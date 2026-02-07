export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
  return `${formatted} Bs.`
}
