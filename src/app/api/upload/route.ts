import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Tipos de imagen permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

// Tamaño máximo: 5MB
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG, GIF y WebP' },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.type.split('/')[1]
    const filename = `${timestamp}-${randomString}.${extension}`

    // Asegurar que el directorio de uploads existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Guardar el archivo
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Retornar la URL pública del archivo
    const imageUrl = `/uploads/products/${filename}`

    return NextResponse.json({
      success: true,
      imageUrl,
      filename
    })

  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
