import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener historial de movimientos de un producto
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productoId')

    if (!productId) {
      return NextResponse.json(
        { error: 'El ID del producto es requerido' },
        { status: 400 }
      )
    }

    // Obtener información del producto
    const producto = await db.product.findUnique({
      where: { id: productId },
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

    console.log('Buscando movimientos para producto:', productId)

    // Obtener movimientos de entrada (inbound items)
    const ingresos = await db.inboundItem.findMany({
      where: { productId: productId },
      include: {
        inboundReceipt: {
          include: {
            operation: true,
            supplier: true
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

    console.log('Ingresos encontrados:', ingresos.length)

    // Obtener movimientos de salida (sale items)
    const ventas = await db.saleItem.findMany({
      where: { productId: productId },
      include: {
        sale: {
          include: {
            operation: true,
            customer: true
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

    console.log('Ventas encontradas:', ventas.length)

    // Combinar y ordenar todos los movimientos
    const movimientos = [
      ...ingresos.map(item => ({
        id: item.id,
        tipo: 'INGRESO',
        fecha: item.inboundReceipt.operation.date,
        referencia: item.inboundReceipt.operation.reference,
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        subtotal: item.subtotal,
        proveedorCliente: item.inboundReceipt.supplier.name,
        notas: item.inboundReceipt.operation.notes
      })),
      ...ventas.map(item => ({
        id: item.id,
        tipo: 'VENTA',
        fecha: item.sale.operation.date,
        referencia: item.sale.operation.reference,
        cantidad: item.quantity,
        precioUnitario: item.unitPrice,
        subtotal: item.subtotal,
        proveedorCliente: item.sale.customer.name,
        notas: item.sale.operation.notes
      }))
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    // Calcular totales
    const totalIngresos = ingresos.reduce((sum, item) => sum + item.quantity, 0)
    const totalVentas = ventas.reduce((sum, item) => sum + item.quantity, 0)
    const valorIngresos = ingresos.reduce((sum, item) => sum + item.subtotal, 0)
    const valorVentas = ventas.reduce((sum, item) => sum + item.subtotal, 0)

    return NextResponse.json({
      producto,
      movimientos,
      resumen: {
        totalIngresos,
        totalVentas,
        stockActual: producto.stock,
        valorIngresos,
        valorVentas
      }
    })

  } catch (error) {
    console.error('Error al obtener historial de producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial de producto' },
      { status: 500 }
    )
  }
}
