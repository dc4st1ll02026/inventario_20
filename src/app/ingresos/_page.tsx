'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Package, 
  Trash2, 
  Plus, 
  Save,
  ArrowLeft,
  Truck
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

interface Proveedor {
  id: string
  name: string
  email: string
  phone: string
}

interface IngresoItem {
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export default function NuevoIngresoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<Producto[]>([])  
  const [selectedProveedor, setSelectedProveedor] = useState<string>('')
  const [selectedProducto, setSelectedProducto] = useState<string>('')
  const [cantidad, setCantidad] = useState<number>(1)
  const [precioUnitario, setPrecioUnitario] = useState<string>('')
  const [notas, setNotas] = useState<string>('')
  const [items, setItems] = useState<IngresoItem[]>([])

  useEffect(() => {
    loadProveedores()
    loadProductos()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      if (response.ok) {
        const data = await response.json()
        setProveedores(data.proveedores)
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
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

    // Verificar si el producto ya está en la lista
    const itemExistente = items.find(i => i.productId === selectedProducto)
    if (itemExistente) {
      toast({
        variant: 'destructive',
        title: 'Producto duplicado',
        description: 'Este producto ya está en la lista de ingreso'
      })
      return
    }

    // Usar el precio ingresado o el precio del producto
    const precio = precioUnitario ? parseFloat(precioUnitario) : producto.price
    const subtotal = cantidad * precio

    const newItem: IngresoItem = {
      productId: selectedProducto,
      quantity: cantidad,
      unitPrice: precio,
      subtotal
    }

    setItems([...items, newItem])
    setSelectedProducto('')
    setCantidad(1)
    setPrecioUnitario('')
  }

  const removerItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId))
  }

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const guardarIngreso = async () => {
    if (!selectedProveedor || items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description: 'Selecciona un proveedor y agrega al menos un producto'
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/ingresos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplierId: selectedProveedor,
          items,
          notes
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'No se pudo crear el ingreso'
        })
        return
      }

      toast({
        title: 'Ingreso creado exitosamente',
        description: `Código de operación: ${data.codigoIngreso}`
      })

      router.push('/ingresos/listado')

    } catch (error) {
      console.error('Error al crear ingreso:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el ingreso'
      })
    } finally {
      setLoading(false)
    }
  }

  const proveedorSeleccionado = proveedores.find(p => p.id === selectedProveedor)
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
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Ingreso</h1>
            <p className="text-muted-foreground">
              Registrar un nuevo ingreso de productos
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Información del Ingreso
                </CardTitle>
                <CardDescription>
                  Completa los datos para registrar el ingreso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proveedor */}
                <div className="space-y-2">
                  <Label>Proveedor *</Label>
                  <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proveedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.id} value={proveedor.id}>
                          {proveedor.name}
                          {proveedor.email && <span className="text-muted-foreground ml-2">({proveedor.email})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Agregar Producto */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Agregar Producto</Label>
                  <div className="space-y-2">
                    <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((producto) => (
                          <SelectItem key={producto.id} value={producto.id}>
                            <div className="flex flex-col">
                              <span>{producto.name}</span>
                              <span className="text-xs text-muted-foreground">
                                SKU: {producto.sku} | Stock: {producto.stock} | ${producto.price.toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                        placeholder="Cant."
                        className="flex-1"
                      />

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precioUnitario}
                        onChange={(e) => setPrecioUnitario(e.target.value)}
                        placeholder="Precio Unit."
                        className="flex-1"
                      />
                    </div>

                    <Button onClick={agregarItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {productoSeleccionado && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Producto seleccionado:</p>
                    <p className="text-sm">{productoSeleccionado.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock actual: {productoSeleccionado.stock} unidades
                    </p>
                    {productoSeleccionado.price && (
                      <>
                        <p className="text-sm font-semibold mt-2">
                          Precio base: ${productoSeleccionado.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Si no ingresas precio unitario, se usará el precio base
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Notas */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Agrega notas o comentarios sobre el ingreso..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de Ingreso */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ingreso</CardTitle>
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
                                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-medium">${item.subtotal.toFixed(2)}</TableCell>
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
                        <span>Total del Ingreso:</span>
                        <span>${calcularTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total de productos:</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total unidades:</span>
                        <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <Button
                      onClick={guardarIngreso}
                      className="w-full"
                      size="lg"
                      disabled={loading || items.length === 0 || !selectedProveedor}
                    >
                      {loading ? (
                        <>
                          <Save className="h-4 w-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Registrar Ingreso
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
