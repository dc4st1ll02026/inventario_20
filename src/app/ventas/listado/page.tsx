'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ShoppingBag, 
  Eye, 
  RefreshCw,
  Search,
  DollarSign,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Venta {
  id: string
  operation: {
    id: string
    type: string
    reference: string
    date: string
    total: number
    notes: string | null
  }
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: {
      id: string
      name: string
      sku: string
      category: {
        name: string
      }
    }
  }>
}

export default function ListadoVentasPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [ventas, setVentas] = useState<Venta[]>([])
  const [resumen, setResumen] = useState<any>({})
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null)
  
  const [filtroCliente, setFiltroCliente] = useState<string>('all')
  const [filtroCodigo, setFiltroCodigo] = useState<string>('')
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<string>('')
  const [filtroFechaFin, setFiltroFechaFin] = useState<string>('')

  const [clientes, setClientes] = useState<any[]>([])

  useEffect(() => {
    loadClientes()
    loadVentas()
  }, [filtroCliente, filtroFechaInicio, filtroFechaFin])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes)
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const loadVentas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroCliente !== 'all') {
        params.append('clienteId', filtroCliente)
      }
      if (filtroFechaInicio) {
        params.append('fechaInicio', filtroFechaInicio)
      }
      if (filtroFechaFin) {
        params.append('fechaFin', filtroFechaFin)
      }

      const response = await fetch(`/api/ventas/listado?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        let ventasFiltradas = data.ventas
        if (filtroCodigo) {
          ventasFiltradas = ventasFiltradas.filter((v: Venta) =>
            v.operation.reference.toLowerCase().includes(filtroCodigo.toLowerCase())
          )
        }
        
        setVentas(ventasFiltradas)
        setResumen(data.resumen)
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el listado de ventas'
      })
    } finally {
      setLoading(false)
    }
  }

  const verDetalle = async (ventaId: string) => {
    try {
      const response = await fetch(`/api/ventas/${ventaId}`)
      if (response.ok) {
        const data = await response.json()
        setVentaSeleccionada(data.venta)
      }
    } catch (error) {
      console.error('Error al cargar detalle de venta:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar el detalle de la venta'
      })
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const ventasFiltradas = filtroCodigo
    ? ventas.filter(v => v.operation.reference.toLowerCase().includes(filtroCodigo.toLowerCase()))
    : ventas

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listado de Ventas</h1>
            <p className="text-muted-foreground">
              Historial completo de ventas realizadas
            </p>
          </div>
          <Button variant="outline" onClick={loadVentas} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Resumen */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.totalVentas || 0}</div>
              <p className="text-xs text-muted-foreground">Ventas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(resumen.valorTotalVentas || 0).toFixed(2)} Bs.
              </div>
              <p className="text-xs text-muted-foreground">Acumulado de ventas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Código de Operación</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar código..."
                    value={filtroCodigo}
                    onChange={(e) => setFiltroCodigo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={filtroCliente} onValueChange={setFiltroCliente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha Desde</Label>
                <Input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Hasta</Label>
                <Input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas Realizadas</CardTitle>
            <CardDescription>
              {ventasFiltradas.length} ventas encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ventasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay ventas que coincidan con los filtros
              </div>
            ) : (
              <div className="rounded-md border max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código Operación</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasFiltradas.map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="font-mono font-medium">
                          {venta.operation.reference}
                        </TableCell>
                        <TableCell>
                          {formatearFecha(venta.operation.date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{venta.customer.name}</p>
                            {venta.customer.email && (
                              <p className="text-xs text-muted-foreground">{venta.customer.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{venta.items.length} productos</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {venta.operation.total.toFixed(2)} Bs.
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verDetalle(venta.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Detalle de Venta */}
        {ventaSeleccionada && (
          <Dialog open={!!ventaSeleccionada} onOpenChange={(open) => !open && setVentaSeleccionada(null)} >
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" style={{ width: '800px', maxWidth: '90vw' }}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Detalle de Venta
                </DialogTitle>
                <DialogDescription>
                  Información completa de la venta #{ventaSeleccionada.operation.reference}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Información General */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Información de la Venta</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Código:</span>
                        <span className="ml-2 font-mono font-medium">{ventaSeleccionada.operation.reference}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="ml-2">{formatearFecha(ventaSeleccionada.operation.date)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge className="ml-2" variant="outline">
                          {ventaSeleccionada.operation.type === 'OUTBOUND' ? 'Venta' : 'Otro'}
                        </Badge>
                      </div>
                      {ventaSeleccionada.operation.notes && (
                        <div>
                          <span className="text-muted-foreground">Notas:</span>
                          <span className="ml-2">{ventaSeleccionada.operation.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Información del Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="ml-2 font-medium">{ventaSeleccionada.customer.name}</span>
                      </div>
                      {ventaSeleccionada.customer.email && (
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2">{ventaSeleccionada.customer.email}</span>
                        </div>
                      )}
                      {ventaSeleccionada.customer.phone && (
                        <div>
                          <span className="text-muted-foreground">Teléfono:</span>
                          <span className="ml-2">{ventaSeleccionada.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resumen Total */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Total de la Venta:</span>
                      <span className="text-3xl font-bold text-green-600">
                        {ventaSeleccionada.operation.total.toFixed(2)} Bs.
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalle de Productos */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Productos Vendidos</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-right">Cantidad</TableHead>
                          <TableHead className="text-right">Precio Unit.</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ventaSeleccionada.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product.name}</TableCell>
                            <TableCell className="font-mono text-sm">{item.product.sku}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.product.category.name}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.unitPrice.toFixed(2)} Bs.</TableCell>
                            <TableCell className="text-right font-bold">{item.subtotal.toFixed(2)} Bs.</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Resumen de Items */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Total Items</div>
                      <div className="text-2xl font-bold">{ventaSeleccionada.items.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Total Unidades</div>
                      <div className="text-2xl font-bold">
                        {ventaSeleccionada.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-muted-foreground">Promedio por Item</div>
                      <div className="text-2xl font-bold">
                        {(ventaSeleccionada.operation.total / ventaSeleccionada.items.length).toFixed(2)} Bs.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  )
}
