import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener estadísticas de ventas agrupadas por mes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clienteId = searchParams.get('clienteId')
    const periodo = searchParams.get('periodo') // '6meses', '1ano', 'todo'

    const where: any = {
      operation: {
        type: 'OUTBOUND' // Solo ventas, no ingresos/devoluciones
      }
    }

    if (clienteId && clienteId !== 'all') {
      where.customerId = clienteId
    }

    // Filtro por periodo
    const fechaActual = new Date()
    let fechaInicio: Date | null = null
    let fechaFin: Date | null = null

    if (periodo === '6meses') {
      fechaInicio = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 5, 1)
      fechaFin = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
    } else if (periodo === '1ano') {
      fechaInicio = new Date(fechaActual.getFullYear(), 0, 1)
      fechaFin = new Date(fechaActual.getFullYear(), 11, 31)
    }

    if (fechaInicio && fechaFin) {
      where.operation = {
        ...where.operation,
        date: {
          gte: fechaInicio,
          lte: fechaFin
        }
      }
    }

    const ventas = await db.sale.findMany({
      where,
      include: {
        operation: {
          select: {
            date: true,
            total: true,
            customer: {
              select: {
                id: true,
                name: true
              }
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        operation: {
          date: 'asc'
        }
      }
    })

    // Agrupar ventas por mes
    const ventasPorMes: { [key: string]: number }[] = Array(12).fill({}) as any
    const montoPorMes: { [key: string]: number }[] = Array(12).fill(0) as any

    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]

    ventas.forEach(venta => {
      const fecha = new Date(venta.operation.date)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()
      const key = `${año}-${mes}`

      if (!ventasPorMes[mes]) {
        ventasPorMes[mes] = {}
      }
      
      ventasPorMes[mes][key] = (ventasPorMes[mes][key] || 0) + 1
      montoPorMes[mes] = (montoPorMes[mes] || 0) + venta.operation.total
    })

    // Calcular totales generales
    const totalVentas = ventas.length
    const valorTotalVentas = ventas.reduce((sum, venta) => sum + venta.operation.total, 0)

    // Calcular ventas por categoría
    const ventasPorCategoria: { [key: string]: { cantidad: number; monto: number } } = {}
    ventas.forEach(venta => {
      venta.items.forEach((item: any) => {
        const categoria = item.product.category.name
        if (!ventasPorCategoria[categoria]) {
          ventasPorCategoria[categoria] = { cantidad: 0, monto: 0 }
        }
        ventasPorCategoria[categoria].cantidad += item.quantity
        ventasPorCategoria[categoria].monto += item.subtotal
      })
    })

    // Calcular productos más vendidos
    const productosVendidos: { [key: string]: number } = {}
    ventas.forEach(venta => {
      venta.items.forEach((item: any) => {
        const producto = item.product.name
        if (!productosVendidos[producto]) {
          productosVendidos[producto] = 0
        }
        productosVendidos[producto] += item.quantity
      })
    })

    // Calcular ventas por cliente
    const ventasPorCliente: { [key: string]: { cantidad: number; monto: number } } = {}
    ventas.forEach(venta => {
      const clienteId = venta.operation.customer.id
      if (!ventasPorCliente[clienteId]) {
        ventasPorCliente[clienteId] = { cantidad: 0, monto: 0 }
      }
      ventasPorCliente[clienteId].cantidad += 1
      ventasPorCliente[clienteId].monto += venta.operation.total
    })

    return NextResponse.json({
      ventasPorMes,
      montoPorMes,
      mesesNombres,
      totalVentas,
      valorTotalVentas,
      ventasPorCategoria,
      productosVendidos,
      ventasPorCliente
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de ventas' },
      { status: 500 }
    )
  }
}
