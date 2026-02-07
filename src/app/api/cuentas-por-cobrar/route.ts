import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filterDebt = searchParams.get('filterDebt') === 'true'

    // Obtener todas las operaciones de ventas (OUTBOUND)
    const operaciones = await db.operation.findMany({
      where: { type: 'OUTBOUND' },
      orderBy: { date: 'desc' },
      include: {
        sale: {
          include: {
            customer: true
          }
        }
      }
    })

    const hoy = new Date()
    const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

    // Calcular estado de cada venta
    const cuentasConEstado = await Promise.all(operaciones.map(async (op) => {
      if (!op.sale) return null

      // Verificar si hay un registro de pago para esta venta
      const pagosRegistrados = await db.operation.findMany({
        where: {
          type: 'INBOUND',
          notes: `PAGO_VENTA_${op.id}`
        },
        orderBy: { date: 'desc' }
      })

      const estaPagado = pagosRegistrados.length > 0

      // Determinar fecha de vencimiento (30 días después de la venta)
      const fechaVenta = new Date(op.date)
      const fechaVencimiento = new Date(fechaVenta.getTime() + (30 * 24 * 60 * 60 * 1000))

      let estado = 'VIGENTE'
      let diasRetraso = 0

      if (estaPagado) {
        estado = 'PAGADA'
      } else if (fechaVencimiento < hoyInicio) {
        estado = 'EN_MORA'
        diasRetraso = Math.floor((hoyInicio.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))
      }

      return {
        id: op.id,
        codigoVenta: op.reference,
        clienteId: op.sale.customerId,
        cliente: op.sale.customer.name,
        fechaVenta: op.date.toISOString(),
        fechaVencimiento: fechaVencimiento.toISOString(),
        importeTotal: op.total,
        estado,
        estaPagado,
        diasRetraso
      }
    }))

    // Filtrar cuentas nulas y opcionalmente solo con deuda
    let cuentasFiltradas = cuentasConEstado.filter(c => c !== null)
    if (filterDebt) {
      cuentasFiltradas = cuentasFiltradas.filter(c => !c!.estaPagado)
    }

    // Calcular métricas del dashboard
    const totalCuentas = cuentasFiltradas.length
    const totalPorCobrar = cuentasFiltradas.reduce((sum, c) => sum + c!.importeTotal, 0)
    const totalVigentes = cuentasFiltradas
      .filter(c => c!.estado === 'VIGENTE')
      .reduce((sum, c) => sum + c!.importeTotal, 0)
    const totalEnMora = cuentasFiltradas
      .filter(c => c!.estado === 'EN_MORA')
      .reduce((sum, c) => sum + c!.importeTotal, 0)
    const totalPagadas = cuentasFiltradas
      .filter(c => c!.estado === 'PAGADA')
      .reduce((sum, c) => sum + c!.importeTotal, 0)

    const cuentasEnMora = cuentasFiltradas.filter(c => c!.estado === 'EN_MORA').length

    const dashboard = {
      totalPorCobrar,
      totalVigentes,
      totalEnMora,
      totalPagadas,
      totalCuentas,
      cuentasEnMora
    }

    return NextResponse.json({
      cuentas: cuentasFiltradas,
      dashboard
    })
  } catch (error) {
    console.error('Error al cargar cuentas por cobrar:', error)
    return NextResponse.json(
      { error: 'Error al cargar cuentas por cobrar' },
      { status: 500 }
    )
  }
}
