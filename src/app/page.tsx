'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalProducts: number
  totalStock: number
  totalSales: number
  totalCustomers: number
  lowStockProducts: number
  recentOperations: Array<{
    id: string
    type: string
    reference: string
    date: string
    total: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    totalSales: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    recentOperations: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al sistema de inventario. Aquí tienes un resumen general.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                SKUs registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stock Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Unidades disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ventas Totales 2026
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Intl.NumberFormat().format(stats.totalSales)} Bs.</div>
              <p className="text-xs text-muted-foreground">
                Acumulado de ventas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Clientes registrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Warning */}
        {stats.lowStockProducts > 0 && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Alerta de Stock Bajo
              </CardTitle>
              <ArrowDownRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {stats.lowStockProducts}
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Productos con stock menor a 10 unidades
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas 10 Operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOperations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay operaciones registradas
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentOperations.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        op.type === 'INBOUND' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {op.type === 'INBOUND' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {op.type === 'INBOUND' ? 'Ingreso' : 'Venta'} #{op.reference}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(op.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        op.type === 'INBOUND' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {op.total.toFixed(2)} Bs.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {op.type === 'INBOUND' ? '+ Stock' : '- Stock'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
