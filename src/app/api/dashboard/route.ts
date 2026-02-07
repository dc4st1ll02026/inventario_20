import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Obtener estadísticas generales
    const totalProducts = await db.product.count({
      where: { active: true }
    })

    const totalStock = await db.product.aggregate({
      where: { active: true },
      _sum: { stock: true }
    })

    const totalSales = await db.operation.aggregate({
      where: { type: 'OUTBOUND' },
      _sum: { total: true }
    })

    const totalCustomers = await db.customer.count({
      where: { active: true }
    })

    const lowStockProducts = await db.product.count({
      where: {
        active: true,
        stock: { lt: 10 }
      }
    })

    // Obtener las últimas 10 operaciones
    const recentOperations = await db.operation.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        type: true,
        reference: true,
        date: true,
        total: true
      }
    })

    return NextResponse.json({
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      totalSales: totalSales._sum.total || 0,
      totalCustomers,
      lowStockProducts,
      recentOperations
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}
