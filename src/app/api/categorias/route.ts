import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todas las categorías
export async function GET() {
  try {
    const categorias = await db.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ categorias })

  } catch (error) {
    console.error('Error al obtener categorías:', error)
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva categoría
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const categoria = await db.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json({ categoria }, { status: 201 })

  } catch (error: any) {
    console.error('Error al crear categoría:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}
