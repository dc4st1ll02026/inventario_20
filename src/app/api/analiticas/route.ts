import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface VentasPorMes {
  mes: number
  gestion: number
  cantidadVentas: number
  montoTotal: number
}

interface VentasPorCategoria {
  categoria: string
  cantidad: number
  monto: number
}

interface VentasPorCliente {
  cliente: string
  cantidad: number
  monto: number
}

interface TendenciaVentas {
  mes: string
  cantidad: number
  monto: number
}

// GET - Obtener datos analíticos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const gestionParam = searchParams.get('gestion')

    // Obtener la gestión actual si no se especifica
    const gestionActual = new Date().getFullYear()
    const gestion = gestionParam ? parseInt(gestionParam) : gestionActual

    // Validar rango de gestión (actual a 2030)
    if (gestion < gestionActual || gestion > 2030) {
      return NextResponse.json(
        { error: 'La gestión debe estar entre ' + gestionActual + ' y 2030' },
        { status: 400 }
      )
    }

    // Obtener todas las operaciones de ventas (OUTBOUND) de la gestión
    const operaciones = await db.operation.findMany({
      where: {
        type: 'OUTBOUND',
        /*date: {
          gte: new Date(`${gestion}-01-01T00:00:00Z`),
          lt: new Date(`${gestion + 1}-01-01T00:00:00Z`)
        }*/
      },
      include: {
        sale: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    console.log('operaciones -->', operaciones)

    // Ventas por mes
    const ventasPorMes: Map<string, VentasPorMes> = new Map()
    const ventasPorCategoria: Map<string, VentasPorCategoria> = new Map()
    const ventasPorCliente: Map<string, VentasPorCliente> = new Map()

    operaciones.forEach(op => {
      if (!op.sale) return

      const fecha = new Date(op.date)
      const mes = fecha.getMonth()
      const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'long' })
      const claveMes = `${mes}`

      // Agrupar por mes
      if (!ventasPorMes.has(claveMes)) {
        ventasPorMes.set(claveMes, {
          mes: mes,
          gestion: gestion,
          cantidadVentas: 0,
          montoTotal: 0
        })
      }

      const ventasMes = ventasPorMes.get(claveMes)!
      ventasMes.cantidadVentas++
      ventasMes.montoTotal += op.total

      // Agrupar por categoría
      op.sale.items.forEach(item => {
        const categoriaNombre = item.product.category.name

        if (!ventasPorCategoria.has(categoriaNombre)) {
          ventasPorCategoria.set(categoriaNombre, {
            categoria: categoriaNombre,
            cantidad: 0,
            monto: 0
          })
        }

        const ventasCategoria = ventasPorCategoria.get(categoriaNombre)!
        ventasCategoria.cantidad += item.quantity
        ventasCategoria.monto += item.subtotal
      })

      // Agrupar por cliente
      const clienteNombre = op.sale.customer
      if (!ventasPorCliente.has(clienteNombre)) {
        ventasPorCliente.set(clienteNombre, {
          cliente: clienteNombre,
          cantidad: 0,
          monto: 0
        })
      }

      const ventasCliente = ventasPorCliente.get(clienteNombre)!
      ventasCliente.cantidad++
      ventasCliente.monto += op.total
    })

    // Convertir Map a Array y ordenar
    const ventasPorMesArray = Array.from(ventasPorMes.values()).sort((a, b) => a.mes - b.mes)
    const ventasPorCategoriaArray = Array.from(ventasPorCategoria.values())
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10) // Top 10 categorías
    const ventasPorClienteArray = Array.from(ventasPorCliente.values())
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 10) // Top 10 clientes

    // Métricas generales
    const totalVentas = operaciones.length
    const montoTotalGeneral = operaciones.reduce((sum, op) => sum + op.total, 0)
    const ticketPromedio = totalVentas > 0 ? montoTotalGeneral / totalVentas : 0

    return NextResponse.json({
      gestion: gestion,
      metricas: {
        totalVentas,
        montoTotal: montoTotalGeneral,
        ticketPromedio
      },
      ventasPorMes: ventasPorMesArray,
      ventasPorCategoria: ventasPorCategoriaArray,
      ventasPorCliente: ventasPorClienteArray
    })

  } catch (error) {
    console.error('Error al obtener analíticas:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos analíticos' },
      { status: 500 }
    )
  }
}
