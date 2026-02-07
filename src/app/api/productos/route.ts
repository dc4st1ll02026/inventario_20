import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los productos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get('categoriaId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const where: any = {}
    if (categoriaId) {
      where.categoryId = categoriaId
    }
    if (!includeInactive) {
      where.active = true
    }

    const productos = await db.product.findMany({
      where,
      include: {
        category: true,
        unit: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('xproducts --> ',productos)

    return NextResponse.json({ productos })

  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, sku, price, stock, categoryId, unitId, imageUrl } = body

    if (!name || !sku || !price || !categoryId || !unitId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: nombre, sku, precio, categoría y unidad son obligatorios' },
        { status: 400 }
      )
    }

    const producto = await db.product.create({
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId,
        unitId,
        imageUrl: imageUrl || null
      },
      include: {
        category: true,
        unit: true
      }
    })

    return NextResponse.json({ producto }, { status: 201 })

  } catch (error: any) {
    console.error('Error al crear producto:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un producto con ese SKU' },
        { status: 400 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Categoría o unidad no encontrada' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
