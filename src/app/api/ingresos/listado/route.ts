import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar todos los ingresos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const proveedorId = searchParams.get('proveedorId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const where: any = {}

    if (proveedorId) {
      where.supplierId = proveedorId
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

    const ingresos = await db.inboundReceipt.findMany({
      where,
      include: {
        operation: true,
        supplier: true,
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
    const totalIngresos = ingresos.length
    const valorTotalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.operation.total, 0)

    return NextResponse.json({
      ingresos,
      resumen: {
        totalIngresos,
        valorTotalIngresos
      }
    })

  } catch (error) {
    console.error('Error al obtener ingresos:', error)
    return NextResponse.json(
      { error: 'Error al obtener ingresos' },
      { status: 500 }
    )
  }
}
