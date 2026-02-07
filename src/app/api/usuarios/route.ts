import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await db.user.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ usuarios })

  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password, name, role } = body

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Usuario, contraseña y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    const usuario = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role || 'USER',
        active: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ usuario }, { status: 201 })

  } catch (error: any) {
    console.error('Error al crear usuario:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese nombre de usuario' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
