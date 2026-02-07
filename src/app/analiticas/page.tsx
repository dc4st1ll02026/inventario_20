'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart, BarChart3, Package, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/currency-format'

interface VentasPorMes {
  mes: number
  gestion: number
  cantidadVentas: number
  montoTotal: number
}

interface VentasPorCategoria {
  categoria: string
  cantidad: number
  monto: number
}

interface VentasPorCliente {
  cliente: string
  cantidad: number
  monto: number
}

interface Metricas {
  totalVentas: number
  montoTotal: number
  ticketPromedio: number
}

interface AnaliticasData {
  gestion: number
  metricas: Metricas
  ventasPorMes: VentasPorMes[]
  ventasPorCategoria: VentasPorCategoria[]
  ventasPorCliente: VentasPorCliente[]
}

// Nombres de meses en español
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Colores para gráficos
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#db2777', '#6610f2'
]

export default function AnaliticasPage() {
  const { toast } = useToast()
  const [data, setData] = useState<AnaliticasData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gestion, setGestion] = useState(new Date().getFullYear())
  const [availableGestiones, setAvailableGestiones] = useState<number[]>([])

  useEffect(() => {
    // Generar lista de gestiones desde la actual hasta 2030
    const gestionActual = new Date().getFullYear()
    const gestiones = []
    for (let g = gestionActual; g <= 2030; g++) {
      gestiones.push(g)
    }
    setAvailableGestiones(gestiones)
    loadAnaliticas(gestionActual)
  }, [])

  const loadAnaliticas = async (gestion: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analiticas?gestion=${gestion}`)
      if (response.ok) {
        const analiticasData = await response.json()
        setData(analiticasData)
      } else {
        const errorData = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorData.error || 'No se pudieron cargar las analíticas',
        })
      }
    } catch (error) {
      console.error('Error al cargar analíticas:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al conectar con el servidor',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGestionChange = (newGestion: string) => {
    setGestion(parseInt(newGestion))
    loadAnaliticas(parseInt(newGestion))
  }

  // Preparar datos para gráficos
  const ventasPorMesData = data?.ventasPorMes.map(v => ({
    mes: MESES[v.mes],
    cantidad: v.cantidadVentas,
    monto: v.montoTotal
  })) || []

  const topCategoriasData = data?.ventasPorCategoria.map((v, i) => ({
    name: v.categoria,
    monto: v.monto
  })) || []

  const topClientesData = data?.ventasPorCliente.map((v, i) => ({
    name: v.cliente,
    monto: v.monto
  })) || []

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analíticas</h1>
            <p className="text-muted-foreground">
              Análisis detallado del comportamiento de ventas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={gestion.toString()} onValueChange={handleGestionChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Seleccionar gestión" />
              </SelectTrigger>
              <SelectContent>
                {availableGestiones.map(g => (
                  <SelectItem key={g} value={g.toString()}>
                    Gestión {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => loadAnaliticas(gestion)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Cargando analíticas...</div>
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-muted-foreground">
            No hay datos disponibles para la gestión seleccionada
          </div>
        ) : (
          <>
            {/* Métricas Generales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.metricas.totalVentas}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ventas en gestión {data.gestion}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.metricas.montoTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gestión {data.gestion}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(data.metricas.ticketPromedio)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por venta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Productos</CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.ventasPorCategoria.reduce((sum, v) => sum + v.cantidad, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Categorías únicas: {data.ventasPorCategoria.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico 1: Cantidad de Ventas por Mes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Cantidad de Ventas por Mes
                </CardTitle>
                <CardDescription>
                  Número de transacciones realizadas cada mes en gestión {data.gestion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasPorMesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px'
                        }}
                        formatter={(value) => value + ' ventas'}
                      />
                      <Bar 
                        dataKey="cantidad" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico 2: Monto Total de Ventas por Mes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Monto Total de Ventas por Mes
                </CardTitle>
                <CardDescription>
                  Importe total de ventas por mes en gestión {data.gestion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ventasPorMesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="mes" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px'
                        }}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar 
                        dataKey="monto" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico 3: Top 10 Categorías por Monto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Top 10 Categorías por Monto
                </CardTitle>
                <CardDescription>
                  Categorías de productos con mayor facturación en gestión {data.gestion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategoriasData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value as number)}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        width={150}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px'
                        }}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar 
                        dataKey="monto" 
                        fill="#f59e0b"
                        radius={[0, 4, 4, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico 4: Distribución de Ventas por Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Top 10 Clientes por Monto
                </CardTitle>
                <CardDescription>
                  Clientes con mayor volumen de compras en gestión {data.gestion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topClientesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatCurrency(value as number)}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        width={150}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '6px'
                        }}
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Bar 
                        dataKey="monto" 
                        fill="#ef4444"
                        radius={[0, 4, 4, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
