import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener detalle de un ingreso
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ingreso = await db.inboundReceipt.findUnique({
      where: { id },
      include: {
        operation: true,
        supplier: true,
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

    if (!ingreso) {
      return NextResponse.json(
        { error: 'Ingreso no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ingreso })

  } catch (error) {
    console.error('Error al obtener ingreso:', error)
    return NextResponse.json(
      { error: 'Error al obtener ingreso' },
      { status: 500 }
    )
  }
}
