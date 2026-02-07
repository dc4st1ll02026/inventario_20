import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los clientes
export async function GET() {
  try {
    const clientes = await db.customer.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ clientes })

  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo cliente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, address } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    const cliente = await db.customer.create({
      data: {
        name,
        email,
        phone,
        address
      }
    })

    return NextResponse.json({ cliente }, { status: 201 })

  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
