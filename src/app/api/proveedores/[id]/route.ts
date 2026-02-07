import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un proveedor específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const proveedor = await db.supplier.findUnique({
      where: { id }
    })

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ proveedor })

  } catch (error) {
    console.error('Error al obtener proveedor:', error)
    return NextResponse.json(
      { error: 'Error al obtener proveedor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un proveedor
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, email, phone, address } = body

    const proveedor = await db.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address
      }
    })

    return NextResponse.json({ proveedor })

  } catch (error: any) {
    console.error('Error al actualizar proveedor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar proveedor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un proveedor (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si hay ingresos asociados
    const inboundCount = await db.inboundReceipt.count({
      where: { supplierId: id }
    })

    if (inboundCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el proveedor porque tiene ingresos asociados' },
        { status: 400 }
      )
    }

    await db.supplier.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Proveedor eliminado exitosamente' })

  } catch (error: any) {
    console.error('Error al eliminar proveedor:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al eliminar proveedor' },
      { status: 500 }
    )
  }
}
