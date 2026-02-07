import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar todas las ventas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clienteId = searchParams.get('clienteId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const where: any = {}

    if (clienteId) {
      where.customerId = clienteId
    }

    if (fechaInicio || fechaFin) {
      where.operation = {}
      if (fechaInicio) {
        where.operation.date = {
          ...(where.operation.date || {}),
          gte: new Date(fechaInicio)
        }
      }
      if (fechaFin) {
        where.operation.date = {
          ...(where.operation.date || {}),
          lte: new Date(fechaFin)
        }
      }
    }

    const ventas = await db.sale.findMany({
      where,
      include: {
        operation: true,
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    // Calcular totales generales
    const totalVentas = ventas.length
    const valorTotalVentas = ventas.reduce((sum, venta) => sum + venta.operation.total, 0)

    return NextResponse.json({
      ventas,
      resumen: {
        totalVentas,
        valorTotalVentas
      }
    })

  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}
