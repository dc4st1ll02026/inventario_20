import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener información del producto
    const producto = await db.product.findUnique({
      where: { id },
      include: {
        category: true
      }
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Obtener ingresos del producto
    const ingresos = await db.inboundItem.findMany({
      where: { productId: id },
      include: {
        inboundReceipt: {
          include: {
            operation: {
              select: {
                reference: true,
                date: true
              }
            },
            supplier: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        inboundReceipt: {
          operation: {
            date: 'desc'
          }
        }
      }
    })

    // Obtener ventas del producto
    const ventas = await db.saleItem.findMany({
      where: { productId: id },
      include: {
        sale: {
          include: {
            operation: {
              select: {
                reference: true,
                date: true
              }
            },
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        sale: {
          operation: {
            date: 'desc'
          }
        }
      }
    })

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.quantity, 0)
    const totalVentas = ventas.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      producto,
      historial: {
        ingresos: ingresos.map(item => ({
          tipo: 'INGRESO',
          referencia: item.inboundReceipt.operation.reference,
          fecha: item.inboundReceipt.operation.date,
          proveedor: item.inboundReceipt.supplier.name,
          cantidad: item.quantity,
          precioUnitario: item.unitPrice,
          subtotal: item.subtotal
        })),
        ventas: ventas.map(item => ({
          tipo: 'VENTA',
          referencia: item.sale.operation.reference,
          fecha: item.sale.operation.date,
          cliente: item.sale.customer.name,
          cantidad: item.quantity,
          precioUnitario: item.unitPrice,
          subtotal: item.subtotal
        }))
      },
      totales: {
        totalIngresos,
        totalVentas,
        stockActual: producto.stock
      }
    })

  } catch (error) {
    console.error('Error al obtener historial del producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial del producto' },
      { status: 500 }
    )
  }
}
