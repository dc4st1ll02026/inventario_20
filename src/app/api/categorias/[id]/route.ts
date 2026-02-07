import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Actualizar una categoría
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description } = body

    const categoria = await db.category.update({
      where: { id },
      data: {
        name,
        description
      }
    })

    return NextResponse.json({ categoria })

  } catch (error: any) {
    console.error('Error al actualizar categoría:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una categoría (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si hay productos en esta categoría
    const productsInCategory = await db.product.count({
      where: { categoryId: id, active: true }
    })

    if (productsInCategory > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría porque tiene productos activos' },
        { status: 400 }
      )
    }

    await db.category.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' })

  } catch (error: any) {
    console.error('Error al eliminar categoría:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
