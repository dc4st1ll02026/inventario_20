import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

// GET - Obtener un usuario específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const usuario = await db.user.findUnique({
      where: { id },
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

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ usuario })

  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un usuario
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { username, password, name, role, active } = body

    const updateData: any = {
      username,
      name,
      role,
      active
    }

    // Solo actualizar la contraseña si se proporciona
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const usuario = await db.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ usuario })

  } catch (error: any) {
    console.error('Error al actualizar usuario:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese nombre de usuario' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un usuario (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.user.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' })

  } catch (error: any) {
    console.error('Error al eliminar usuario:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
