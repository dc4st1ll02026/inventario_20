import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todas las unidades
export async function GET(req: NextRequest) {
  try {
    const unidades = await db.unit.findMany({
      where: {
        active: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ unidades })

  } catch (error) {
    console.error('Error al obtener unidades:', error)
    return NextResponse.json(
      { error: 'Error al obtener unidades' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva unidad
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, symbol, description } = body

    // Validaciones
    if (!name || !symbol) {
      return NextResponse.json(
        { error: 'El nombre y el símbolo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una unidad con el mismo nombre o símbolo
    const existingUnit = await db.unit.findFirst({
      where: {
        OR: [
          { name: { equals: name } },
          { symbol: { equals: symbol } }
        ],
        active: true
      }
    })

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Ya existe una unidad con ese nombre o símbolo' },
        { status: 400 }
      )
    }

    // Crear la nueva unidad
    const newUnit = await db.unit.create({
      data: {
        name,
        symbol,
        description: description || null
      }
    })

    return NextResponse.json(
      { unidad: newUnit, message: 'Unidad creada exitosamente' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error al crear unidad:', error)
    return NextResponse.json(
      { error: 'Error al crear unidad' },
      { status: 500 }
    )
  }
}
