import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un producto específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const producto = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true
      }
    })

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ producto })

  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un producto
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, sku, price, stock, categoryId, unitId, imageUrl } = body

    const producto = await db.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId,
        unitId,
        imageUrl: imageUrl ?? undefined // Solo actualiza si se proporciona un valor
      },
      include: {
        category: true,
        unit: true
      }
    })

    return NextResponse.json({ producto })

  } catch (error: any) {
    console.error('Error al actualizar producto:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese SKU' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un producto (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.product.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Producto eliminado exitosamente' })

  } catch (error: any) {
    console.error('Error al eliminar producto:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
