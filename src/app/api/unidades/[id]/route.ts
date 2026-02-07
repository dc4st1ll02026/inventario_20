import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener una unidad específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const unidad = await db.unit.findUnique({
      where: { id }
    })

    if (!unidad) {
      return NextResponse.json(
        { error: 'Unidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ unidad })

  } catch (error) {
    console.error('Error al obtener unidad:', error)
    return NextResponse.json(
      { error: 'Error al obtener unidad' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una unidad
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, symbol, description } = body

    if (!name || !symbol) {
      return NextResponse.json(
        { error: 'Nombre y símbolo son obligatorios' },
        { status: 400 }
      )
    }

    const unidad = await db.unit.update({
      where: { id },
      data: {
        name,
        symbol,
        description: description || null
      }
    })

    return NextResponse.json({ unidad })

  } catch (error: any) {
    console.error('Error al actualizar unidad:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Unidad no encontrada' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una unidad con ese nombre o símbolo' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar unidad' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una unidad (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.unit.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Unidad eliminada exitosamente' })

  } catch (error) {
    console.error('Error al eliminar unidad:', error)
    return NextResponse.json(
      { error: 'Error al eliminar unidad' },
      { status: 500 }
    )
  }
}
