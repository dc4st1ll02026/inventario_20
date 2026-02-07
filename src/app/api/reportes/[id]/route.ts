import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener historial de un producto (ingresos y ventas)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el producto existe
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

    // Obtener items de ingresos
    const ingresos = await db.inboundItem.findMany({
      where: { productId: id },
      include: {
        inboundReceipt: {
          include: {
            operation: {
              select: {
                id: true,
                reference: true,
                date: true,
                total: true,
                notes: true
              }
            },
            supplier: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
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

    // Obtener items de ventas
    const ventas = await db.saleItem.findMany({
      where: { productId: id },
      include: {
        sale: {
          include: {
            operation: {
              select: {
                id: true,
                reference: true,
                date: true,
                total: true,
                notes: true
              }
            },
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
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

    // Calcular estadísticas
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.quantity, 0)
    const totalVentas = ventas.reduce((sum, item) => sum + item.quantity, 0)
    const valorIngresos = ingresos.reduce((sum, item) => sum + item.subtotal, 0)
    const valorVentas = ventas.reduce((sum, item) => sum + item.subtotal, 0)

    const historial = {
      producto,
      estadisticas: {
        totalIngresos,
        totalVentas,
        valorIngresos,
        valorVentas,
        stockActual: producto.stock
      },
      ingresos: ingresos.map(item => ({
        id: item.id,
        fecha: item.inboundReceipt.operation.date,
        referencia: item.inboundReceipt.operation.reference,
        proveedor: item.inboundReceipt.supplier.name,
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        subtotal: item.subtotal
      })),
      ventas: ventas.map(item => ({
        id: item.id,
        fecha: item.sale.operation.date,
        referencia: item.sale.operation.reference,
        cliente: item.sale.customer.name,
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        subtotal: item.subtotal
      }))
    }

    return NextResponse.json({ historial })

  } catch (error) {
    console.error('Error al obtener historial del producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial del producto' },
      { status: 500 }
    )
  }
}
