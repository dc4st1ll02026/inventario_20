'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, X, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/currency-format'

interface Product {
  id: string
  name: string
  description: string | null
  sku: string
  price: number
  stock: number
  categoryId: string
  category: {
    id: string
    name: string
  }
  unitId: string
  unit: {
    id: string
    name: string
    symbol: string
  }
  imageUrl: string | null
}

interface Category {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  symbol: string
  description: string | null
}

export default function ProductosPage() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<Product[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [unidades, setUnidades] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    categoryId: '',
    unitId: '',
    imageUrl: ''
  })
  
  // Estados de búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filteredProductos, setFilteredProductos] = useState<Product[]>([])
  
  // Estado del modal de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  useEffect(() => {
    loadProductos()
    loadCategorias()
    loadUnidades()
  }, [])

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const data = await response.json()
        setProductos(data.productos || [])
      }
    } catch (error) {
      console.error('Error loading productos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error('Error loading categorias:', error)
    }
  }

  const loadUnidades = async () => {
    try {
      const response = await fetch('/api/unidades')
      if (response.ok) {
        const data = await response.json()
        setUnidades(data.unidades || [])
      }
    } catch (error) {
      console.error('Error loading unidades:', error)
    }
  }

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = productos.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProductos(filtered)
    } else {
      setFilteredProductos(productos)
    }
    setCurrentPage(1)
  }, [productos, searchTerm])

  // Calcular productos paginados
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const productosPaginados = filteredProductos.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleItemsPerPageChange = (nuevosItems: string) => {
    const items = parseInt(nuevosItems)
    if (items && [10, 25, 50].includes(items)) {
      setItemsPerPage(items)
      setCurrentPage(1)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, imageUrl: data.imageUrl })
        setImagePreview(data.imageUrl)
        toast({
          title: 'Imagen subida',
          description: 'La imagen se subió correctamente'
        })
      } else {
        const errorData = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error al subir imagen',
          description: errorData.error || 'No se pudo subir la imagen'
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al subir la imagen'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProduct ? `/api/productos/${editingProduct.id}` : '/api/productos'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingProduct ? 'Producto actualizado' : 'Producto creado',
          description: 'La operación se realizó exitosamente',
        })
        setIsDialogOpen(false)
        loadProductos()
        resetForm()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al guardar el producto',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al conectar con el servidor',
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      unitId: product.unitId,
      imageUrl: product.imageUrl || ''
    })
    setImagePreview(product.imageUrl)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/productos/${productToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Producto eliminado',
          description: 'El producto se eliminó exitosamente',
        })
        setIsDeleteDialogOpen(false)
        setProductToDelete(null)
        loadProductos()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al eliminar el producto',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al conectar con el servidor',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: '',
      stock: '',
      categoryId: '',
      unitId: '',
      imageUrl: ''
    })
    setImagePreview(null)
    setEditingProduct(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el inventario de productos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>
                  Complete los datos del producto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Sección de Imagen */}
                  <div className="space-y-2">
                    <Label>Imagen del Producto</Label>
                    <div className="flex items-start gap-4">
                      {imagePreview ? (
                        <div className="relative group">
                          <img
                            src={imagePreview}
                            alt="Vista previa"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-30" />
                          <span className="text-xs text-center">Sin imagen</span>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          id="product-image"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('product-image')?.click()}
                          disabled={uploadingImage}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">Codigo *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Categoría *</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitId">Unidad de Medida *</Label>
                      <Select
                        value={formData.unitId}
                        onValueChange={(value) => setFormData({ ...formData, unitId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map(unidad => (
                            <SelectItem key={unidad.id} value={unidad.id}>
                              {unidad.name} ({unidad.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock Inicial</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Buscador y Paginación */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                <Input
                  placeholder="Buscar por nombre o codigo del producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  Mostrar:
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {filteredProductos.length} productos • Página {currentPage} de {totalPages || 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando productos...</div>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
              </div>
            ) : (
              <>
                <div className="rounded-md border max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Codigo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosPaginados.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>
                            {producto.imageUrl ? (
                              <img
                                src={producto.imageUrl}
                                alt={producto.name}
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="w-16 h-16 border rounded-md flex items-center justify-center bg-muted">
                                <ImageIcon className="h-6 w-6 text-muted-foreground opacity-30" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{producto.sku}</TableCell>
                          <TableCell>{producto.name}</TableCell>
                          <TableCell>{producto.category.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium">
                              {producto.unit.name} ({producto.unit.symbol})
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(producto.price)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              producto.stock === 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : producto.stock < 10
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {producto.stock} {producto.unit.symbol}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(producto)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(producto)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Controles de Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-sm font-medium px-3">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setProductToDelete(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Confirmar Eliminación
                </div>
              </DialogTitle>
              <DialogDescription>
                ¿Está seguro de eliminar el producto: <strong>{productToDelete?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
