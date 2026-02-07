import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los proveedores
export async function GET() {
  try {
    const proveedores = await db.supplier.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ proveedores })

  } catch (error) {
    console.error('Error al obtener proveedores:', error)
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo proveedor
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

    const proveedor = await db.supplier.create({
      data: {
        name,
        email,
        phone,
        address
      }
    })

    return NextResponse.json({ proveedor }, { status: 201 })

  } catch (error) {
    console.error('Error al crear proveedor:', error)
    return NextResponse.json(
      { error: 'Error al crear proveedor' },
      { status: 500 }
    )
  }
}
