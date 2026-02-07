'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { ProductSearchCombobox } from '@/components/product-search-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Save,
  ArrowLeft,
  DollarSign,
  Calendar
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Producto {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: {
    name: string
  }
}

interface Cliente {
  id: string
  name: string
  email: string
  phone: string
}

interface VentaItem {
  productId: string
  quantity: number
  subtotal: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [selectedProducto, setSelectedProducto] = useState<string>('')
  const [cantidad, setCantidad] = useState<number>(1)
  const [notas, setNotas] = useState<string>('')
  const [paymentType, setPaymentType] = useState<string>('CASH')
  const [items, setItems] = useState<VentaItem[]>([])

  useEffect(() => {
    loadClientes()
    loadProductos()
  }, [])

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

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const data = await response.json()
        setProductos(data.productos)
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const agregarItem = () => {
    if (!selectedProducto || cantidad < 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selecciona un producto y una cantidad válida'
      })
      return
    }

    const producto = productos.find(p => p.id === selectedProducto)
    if (!producto) return

    // Verificar stock disponible
    if (producto.stock < cantidad) {
      toast({
        variant: 'destructive',
        title: 'Stock insuficiente',
        description: `Solo hay ${producto.stock} unidades disponibles de ${producto.name}`
      })
      return
    }

    // Verificar si el producto ya está en la lista
    const itemExistente = items.find(i => i.productId === selectedProducto)
    if (itemExistente) {
      toast({
        variant: 'destructive',
        title: 'Producto duplicado',
        description: 'Este producto ya está en la lista de venta'
      })
      return
    }

    const subtotal = cantidad * producto.price
    const newItem: VentaItem = {
      productId: selectedProducto,
      quantity: cantidad,
      subtotal
    }

    setItems([...items, newItem])
    setSelectedProducto('')
    setCantidad(1)
  }

  const removerItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const guardarVenta = async () => {
    if (!selectedCliente || items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description: 'Selecciona un cliente y agrega al menos un producto'
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: selectedCliente,
          items,
          notes,
          paymentType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'No se pudo crear la venta'
        })
        return
      }

      const paymentTypeText = paymentType === 'CASH' ? 'al contado' : 'a crédito'
      toast({
        title: 'Venta creada exitosamente',
        description: `Código de operación: ${data.codigoOperacion} (${paymentTypeText})`
      })

      router.push('/ventas/listado')

    } catch (error) {
      console.error('Error al crear venta:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la venta'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearProducto = () => {
    setSelectedProducto('')
    setCantidad(1)
  }

  const productoSeleccionado = productos.find(p => p.id === selectedProducto)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Venta</h1>
            <p className="text-muted-foreground">
              Registrar una nueva venta de productos
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Información de la Venta
                </CardTitle>
                <CardDescription>
                  Completa los datos para registrar la venta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.name}
                          {cliente.email && <span className="text-muted-foreground ml-2">({cliente.email})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Pago */}
                <div className="space-y-2 pt-2 border-t">
                  <Label>Tipo de Pago *</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de pago..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>Al Contado</span>
                            <span className="text-xs text-muted-foreground">Pago inmediato</span>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="CREDIT">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span>A Crédito</span>
                            <span className="text-xs text-muted-foreground">Pago en 30 días</span>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agregar Producto */}
                <div className="space-y-3 pt-4 border-t">
                  <Label>Agregar Producto</Label>
                  <div className="flex flex-col gap-3">
                    <ProductSearchCombobox
                      products={productos}
                      selectedProductId={selectedProducto}
                      onSelectProduct={setSelectedProducto}
                      onClear={handleClearProducto}
                      placeholder="Buscar producto por nombre o SKU..."
                      emptyMessage="No se encontraron productos disponibles"
                      onlyWithStock={true}
                    />

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="cantidad" className="text-sm text-muted-foreground">
                          Cantidad
                        </Label>
                        <Input
                          id="cantidad"
                          type="number"
                          min="1"
                          value={cantidad}
                          onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                          disabled={!selectedProducto}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={agregarItem}
                          disabled={!selectedProducto}
                          className="px-6"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {productoSeleccionado && (
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Producto:</p>
                        <p className="font-medium">{productoSeleccionado.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Stock disponible:</p>
                        <p className="font-medium">{productoSeleccionado.stock} unidades</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Precio unitario:</p>
                        <p className="font-medium">${productoSeleccionado.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Subtotal ({cantidad} un.):</p>
                        <p className="font-bold text-primary">${(productoSeleccionado.price * cantidad).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Agrega notas o comentarios sobre la venta..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de Venta */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Venta</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos agregados
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tabla de productos */}
                    <div className="rounded-md border max-h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Unit.</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => {
                            const producto = productos.find(p => p.id === item.productId)
                            if (!producto) return null

                            return (
                              <TableRow key={item.productId}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{producto.name}</p>
                                    <p className="text-xs text-muted-foreground">{producto.sku}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{producto.price.toFixed(2)} Bs.</TableCell>
                                <TableCell className="text-right font-medium">{item.subtotal.toFixed(2)} Bs.</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removerItem(item.productId)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total de la Venta:</span>
                        <span>{calcularTotal().toFixed(2)} Bs.</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total de productos:</span>
                        <span>{items.length}</span>
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <Button
                      onClick={guardarVenta}
                      className="w-full"
                      size="lg"
                      disabled={loading || items.length === 0 || !selectedCliente}
                    >
                      {loading ? (
                        <>
                          <Save className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Registrar Venta
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
