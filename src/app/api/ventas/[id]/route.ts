import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener detalle de una venta
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const venta = await db.sale.findUnique({
      where: { id },
      include: {
        operation: true,
        customer: true,
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
    })

    if (!venta) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ venta })

  } catch (error) {
    console.error('Error al obtener venta:', error)
    return NextResponse.json(
      { error: 'Error al obtener venta' },
      { status: 500 }
    )
  }
}
