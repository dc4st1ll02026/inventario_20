import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener reporte de stock de productos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get('categoriaId')
    const lowStock = searchParams.get('lowStock') === 'true'

    const where: any = { active: true }
    if (categoriaId) {
      where.categoryId = categoriaId
    }
    if (lowStock) {
      where.stock = { lt: 10 }
    }

    const productos = await db.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    })

    // Calcular totales
    const totalProductos = productos.length
    const totalStock = productos.reduce((sum, p) => sum + p.stock, 0)
    const valorTotalStock = productos.reduce((sum, p) => sum + (p.stock * p.price), 0)

    return NextResponse.json({
      productos,
      resumen: {
        totalProductos,
        totalStock,
        valorTotalStock,
        productosStockBajo: productos.filter(p => p.stock < 10).length
      }
    })

  } catch (error) {
    console.error('Error al obtener reporte de stock:', error)
    return NextResponse.json(
      { error: 'Error al obtener reporte de stock' },
      { status: 500 }
    )
  }
}
