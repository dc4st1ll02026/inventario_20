import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { saleId, paymentDate, paymentNotes } = body

    if (!saleId || !paymentDate) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: saleId y paymentDate son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar que la venta existe
    const venta = await db.operation.findUnique({
      where: { id: saleId },
      include: {
        sale: {
          include: {
            customer: true
          }
        }
      }
    })

    if (!venta || !venta.sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si ya está pagada
    const pagosExistentes = await db.operation.findMany({
      where: {
        type: 'INBOUND',
        notes: `PAGO_VENTA_${saleId}`
      }
    })

    if (pagosExistentes.length > 0) {
      return NextResponse.json(
        { error: 'Esta venta ya ha sido pagada' },
        { status: 400 }
      )
    }

    // Crear operación de pago
    const fechaPago = new Date(paymentDate)
    const operacionPago = await db.operation.create({
      data: {
        type: 'INBOUND',
        reference: `PAGO-${venta.reference}-${Date.now()}`,
        date: fechaPago,
        total: venta.total,
        notes: `PAGO_VENTA_${saleId}`
      }
    })

    // Crear recibo de pago
    await db.inboundReceipt.create({
      data: {
        operationId: operacionPago.id,
        supplierId: venta.sale.customerId // Usar el customer como "supplier" del pago
      }
    })

    return NextResponse.json({
      success: true,
      mensaje: `Pago registrado exitosamente para la venta ${venta.reference}`,
      pago: {
        id: operacionPago.id,
        reference: operacionPago.reference,
        amount: venta.total,
        paymentDate: fechaPago.toISOString()
      }
    })
  } catch (error) {
    console.error('Error al registrar pago:', error)
    return NextResponse.json(
      { error: 'Error al registrar pago' },
      { status: 500 }
    )
  }
}
