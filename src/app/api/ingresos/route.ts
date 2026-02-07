import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Crear un nuevo ingreso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { supplierId, items, notes } = body

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Proveedor y productos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el proveedor existe
    const proveedor = await db.supplier.findUnique({
      where: { id: supplierId }
    })

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que los productos existen
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
    }

    // Calcular total del ingreso
    let total = 0
    for (const item of items) {
      const producto = await db.product.findUnique({
        where: { id: item.productId }
      })
      const subtotal = item.quantity * producto!.price
      item.subtotal = subtotal
      total += subtotal
    }

    // Generar código de ingreso aleatorio
    const codigoIngreso = `ING-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

    // Crear la operación
    const operacion = await db.operation.create({
      data: {
        type: 'INBOUND',
        reference: codigoIngreso,
        total,
        notes,
        date: new Date()
      }
    })

    // Crear el ingreso
    const ingreso = await db.inboundReceipt.create({
      data: {
        operationId: operacion.id,
        supplierId
      }
    })

    // Crear los items del ingreso y actualizar stock
    for (const item of items) {
      const producto = await db.product.findUnique({
        where: { id: item.productId }
      })

      if (!producto) continue

      await db.inboundItem.create({
        data: {
          inboundReceiptId: ingreso.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || producto.price,
          subtotal: item.subtotal
        }
      })

      // Actualizar stock del producto (incrementar)
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }

    // Obtener el ingreso completo con todos los detalles
    const ingresoCompleto = await db.inboundReceipt.findUnique({
      where: { id: ingreso.id },
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

    return NextResponse.json({
      ingreso: ingresoCompleto,
      codigoIngreso
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear ingreso:', error)
    return NextResponse.json(
      { error: 'Error al crear el ingreso' },
      { status: 500 }
    )
  }
}
