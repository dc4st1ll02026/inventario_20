import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener reporte de stock de productos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get('categoriaId')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: any = {
      active: true
    }

    if (categoriaId) {
      where.categoryId = categoriaId
    }

    if (lowStock) {
      where.stock = { lt: 10 }
    }

    const productos = await db.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Calcular estadísticas
    const stats = {
      totalProductos: productos.length,
      totalStock: productos.reduce((sum, p) => sum + p.stock, 0),
      stockBajo: productos.filter(p => p.stock < 10).length,
      sinStock: productos.filter(p => p.stock === 0).length
    }

    return NextResponse.json({
      productos,
      stats
    })

  } catch (error) {
    console.error('Error al obtener reporte de stock:', error)
    return NextResponse.json(
      { error: 'Error al obtener reporte de stock' },
      { status: 500 }
    )
  }
}
