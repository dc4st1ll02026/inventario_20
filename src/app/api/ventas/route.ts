import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Crear una nueva venta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, items, notes } = body

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cliente y productos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const cliente = await db.customer.findUnique({
      where: { id: customerId }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar stock disponible de cada producto
    for (const item of items) {
      const producto = await db.product.findUnique({
        where: { id: item.productId }
      })

      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 404 }
        )
      }

      if (producto.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para el producto: ${producto.name}`,
            producto: producto.name,
            stockDisponible: producto.stock,
            cantidadSolicitada: item.quantity
          },
          { status: 400 }
        )
      }
    }

    // Calcular total de la venta
    let total = 0
    for (const item of items) {
      const producto = await db.product.findUnique({
        where: { id: item.productId }
      })
      const subtotal = item.quantity * producto!.price
      item.subtotal = subtotal
      total += subtotal
    }

    // Generar código de operación aleatorio
    const codigoOperacion = `VEN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // Crear la operación
    const operacion = await db.operation.create({
      data: {
        type: 'OUTBOUND',
        reference: codigoOperacion,
        total,
        notes,
        date: new Date()
      }
    })

    // Crear la venta
    const venta = await db.sale.create({
      data: {
        operationId: operacion.id,
        customerId
      }
    })

    // Crear los items de la venta y actualizar stock
    for (const item of items) {
      const producto = await db.product.findUnique({
        where: { id: item.productId }
      })

      if (!producto) continue

      await db.saleItem.create({
        data: {
          saleId: venta.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: producto.price,
          subtotal: item.subtotal
        }
      })

      // Actualizar stock del producto
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // Obtener la venta completa con todos los detalles
    const ventaCompleta = await db.sale.findUnique({
      where: { id: venta.id },
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

    return NextResponse.json({
      venta: ventaCompleta,
      codigoOperacion
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear venta:', error)
    return NextResponse.json(
      { error: 'Error al crear la venta' },
      { status: 500 }
    )
  }
}
