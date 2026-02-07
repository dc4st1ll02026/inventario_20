'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Package,
  Search,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV } from '@/lib/reports/csv-export'
import { exportToExcel } from '@/lib/reports/excel-export'
import { generateStockPDF, generateHistorialPDF } from '@/lib/reports/pdf-export'

interface Producto {
  id: string
  sku: string
  name: string
  stock: number
  price: number
  category: {
    id: string
    name: string
  }
}

interface Movimiento {
  id: string
  tipo: string
  fecha: string
  referencia: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  proveedorCliente: string
  notas?: string
}

export default function ReportesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [categorias, setCategorias] = useState<any[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [resumen, setResumen] = useState<any>({})
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  // Historial
  const [selectedProducto, setSelectedProducto] = useState<string>('')
  const [productoDetalle, setProductoDetalle] = useState<any>(null)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [resumenHistorial, setResumenHistorial] = useState<any>(null)
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  useEffect(() => {
    loadCategorias()
    loadStockReport()
  }, [selectedCategoria, lowStockOnly])

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias)
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const loadStockReport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategoria !== 'all') {
        params.append('categoriaId', selectedCategoria)
      }
      if (lowStockOnly) {
        params.append('lowStock', 'true')
      }

      const response = await fetch(`/api/reportes/stock?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProductos(data.productos)
        setResumen(data.resumen)
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el reporte'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadHistorial = async (productoId: string) => {
    if (!productoId) return

    try {
      setLoadingHistorial(true)
      const response = await fetch(`/api/reportes/historial?productoId=${productoId}`)
      if (response.ok) {
        const data = await response.json()
        setProductoDetalle(data.producto)
        setMovimientos(data.movimientos)
        setResumenHistorial(data.resumen)
      }
    } catch (error) {
      console.error('Error al cargar historial:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el historial del producto'
      })
    } finally {
      setLoadingHistorial(false)
    }
  }

  // Exportaciones Stock
  const exportStockToCSV = () => {
    try {
      const columnNames = {
        sku: 'SKU',
        name: 'Producto',
        stock: 'Stock',
        price: 'Precio Unit.',
        category: 'Categoría'
      }
      const data = productos.map(p => ({
        ...p,
        category: p.category.name,
        valorTotal: (p.stock * p.price).toFixed(2)
      }))
      exportToCSV(data, 'reporte-stock', columnNames)
      toast({
        title: 'Exportación exitosa',
        description: 'Reporte exportado a CSV'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a CSV'
      })
    }
  }

  const exportStockToExcel = () => {
    try {
      const columnNames = {
        sku: 'SKU',
        name: 'Producto',
        stock: 'Stock',
        price: 'Precio Unit.',
        category: 'Categoría',
        valorTotal: 'Valor Total'
      }
      const data = productos.map(p => ({
        ...p,
        category: p.category.name,
        valorTotal: p.stock * p.price
      }))
      exportToExcel(data, 'reporte-stock', 'Stock', columnNames)
      toast({
        title: 'Exportación exitosa',
        description: 'Reporte exportado a Excel'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a Excel'
      })
    }
  }

  const exportStockToPDF = () => {
    try {
      const data = productos.map(p => ({
        ...p,
        category: p.category.name,
        valorTotal: p.stock * p.price
      }))
      generateStockPDF(data, resumen)
      toast({
        title: 'Exportación exitosa',
        description: 'Reporte exportado a PDF'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a PDF'
      })
    }
  }

  // Exportaciones Historial
  const exportHistorialToCSV = () => {
    try {
      const columnNames = {
        fecha: 'Fecha',
        tipo: 'Tipo',
        referencia: 'Referencia',
        proveedorCliente: 'Proveedor/Cliente',
        cantidad: 'Cantidad',
        precioUnitario: 'Precio Unit.',
        subtotal: 'Subtotal'
      }
      exportToCSV(movimientos, `historial-${productoDetalle?.sku || 'producto'}`, columnNames)
      toast({
        title: 'Exportación exitosa',
        description: 'Historial exportado a CSV'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a CSV'
      })
    }
  }

  const exportHistorialToExcel = () => {
    try {
      const columnNames = {
        fecha: 'Fecha',
        tipo: 'Tipo',
        referencia: 'Referencia',
        proveedorCliente: 'Proveedor/Cliente',
        cantidad: 'Cantidad',
        precioUnitario: 'Precio Unit.',
        subtotal: 'Subtotal'
      }
      exportToExcel(movimientos, `historial-${productoDetalle?.sku || 'producto'}`, 'Historial', columnNames)
      toast({
        title: 'Exportación exitosa',
        description: 'Historial exportado a Excel'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a Excel'
      })
    }
  }

  const exportHistorialToPDF = () => {
    try {
      generateHistorialPDF(productoDetalle, movimientos, resumenHistorial)
      toast({
        title: 'Exportación exitosa',
        description: 'Historial exportado a PDF'
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo exportar a PDF'
      })
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">
              Genera y exporta reportes de inventario y movimientos
            </p>
          </div>
          <Button variant="outline" onClick={loadStockReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stock">
              <Package className="h-4 w-4 mr-2" />
              Reporte de Stock
            </TabsTrigger>
            <TabsTrigger value="historial">
              <BarChart3 className="h-4 w-4 mr-2" />
              Historial de Producto
            </TabsTrigger>
          </TabsList>

          {/* Tab: Reporte de Stock */}
          <TabsContent value="stock" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium mb-2 block">Categoría</label>
                  <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant={lowStockOnly ? "default" : "outline"}
                    onClick={() => setLowStockOnly(!lowStockOnly)}
                    className="gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {lowStockOnly ? 'Mostrando Stock Bajo' : 'Solo Stock Bajo'}
                  </Button>
                </div>

                <div className="flex items-end gap-2 ml-auto">
                  <Button variant="outline" onClick={exportStockToCSV} className="gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={exportStockToExcel} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button onClick={exportStockToPDF} className="gap-2" color="orange">
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resumen */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.totalProductos || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resumen.totalStock || 0}</div>
                  <p className="text-xs text-muted-foreground">Unidades disponibles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor del Stock</CardTitle>
                  <span className="text-muted-foreground">Bs.</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(resumen.valorTotalStock || 0).toFixed(2)} Bs.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {resumen.productosStockBajo || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Productos con &lt;10 unidades</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de productos */}
            <Card>
              <CardHeader>
                <CardTitle>Listado de Productos</CardTitle>
                <CardDescription>
                  {productos.length} productos encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : productos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos que coincidan con los filtros
                  </div>
                ) : (
                  <div className="rounded-md border max-h-[600px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Producto</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productos.map((producto) => (
                          <TableRow key={producto.id}>
                            <TableCell className="font-mono text-sm">{producto.sku}</TableCell>
                            <TableCell className="font-medium">{producto.name}</TableCell>
                            <TableCell>{producto.category.name}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={producto.stock < 10 ? "destructive" : "default"}
                              >
                                {producto.stock}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{producto.price.toFixed(2)} Bs.</TableCell>
                            <TableCell className="text-right font-medium">
                              {(producto.stock * producto.price).toFixed(2)} Bs.
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Historial de Producto */}
          <TabsContent value="historial" className="space-y-4">
            {/* Selector de producto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seleccionar Producto</CardTitle>
                <CardDescription>
                  Busca un producto para ver su historial completo de movimientos
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <label className="text-sm font-medium mb-2 block">Producto</label>
                  <Select
                    value={selectedProducto}
                    onValueChange={(value) => {
                      setSelectedProducto(value)
                      loadHistorial(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {productoDetalle && (
                  <div className="flex items-end gap-2 ml-auto">
                    <Button variant="outline" onClick={exportHistorialToCSV} className="gap-2">
                      <FileText className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button variant="outline" onClick={exportHistorialToExcel} className="gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel
                    </Button>
                    <Button onClick={exportHistorialToPDF} className="gap-2">
                      <FileDown className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles del producto */}
            {productoDetalle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p className="text-lg font-semibold">{productoDetalle.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Producto</p>
                      <p className="text-lg font-semibold">{productoDetalle.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                      <p className="text-lg font-semibold">{productoDetalle.category?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock Actual</p>
                      <p className="text-lg font-semibold">{productoDetalle.stock}</p>
                    </div>
                  </div>

                  {resumenHistorial && (
                    <div className="mt-6 pt-6 border-t grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Ingresos</p>
                        <p className="text-lg font-semibold text-green-600">
                          {resumenHistorial.totalIngresos} u.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Ventas</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {resumenHistorial.totalVentas} u.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valor Ingresos</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${(resumenHistorial.valorIngresos || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Valor Ventas</p>
                        <p className="text-lg font-semibold text-blue-600">
                          ${(resumenHistorial.valorVentas || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tabla de movimientos */}
            {productoDetalle && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Movimientos</CardTitle>
                  <CardDescription>
                    {movimientos.length} movimientos encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistorial ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : movimientos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay movimientos registrados para este producto
                    </div>
                  ) : (
                    <div className="rounded-md border max-h-[600px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Referencia</TableHead>
                            <TableHead>Proveedor/Cliente</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimientos.map((mov) => (
                            <TableRow key={mov.id}>
                              <TableCell className="text-sm">
                                {new Date(mov.fecha).toLocaleDateString('es-ES')}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={mov.tipo === 'INGRESO' ? 'default' : 'secondary'}
                                >
                                  {mov.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {mov.referencia}
                              </TableCell>
                              <TableCell>{mov.proveedorCliente}</TableCell>
                              <TableCell className="text-right">{mov.cantidad}</TableCell>
                              <TableCell className="text-right">
                                ${mov.precioUnitario.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${mov.subtotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
