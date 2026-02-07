import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un cliente específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cliente = await db.customer.findUnique({
      where: { id }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cliente })

  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un cliente
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, email, phone, address } = body

    const cliente = await db.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address
      }
    })

    return NextResponse.json({ cliente })

  } catch (error: any) {
    console.error('Error al actualizar cliente:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un cliente (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si hay ventas asociadas
    const salesCount = await db.sale.count({
      where: { customerId: id }
    })

    if (salesCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el cliente porque tiene ventas asociadas' },
        { status: 400 }
      )
    }

    await db.customer.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' })

  } catch (error: any) {
    console.error('Error al eliminar cliente:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
