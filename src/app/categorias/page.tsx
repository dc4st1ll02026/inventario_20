'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  description: string | null
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCategorias()
  }, [])

  const loadCategorias = async () => {
    try {
      const response = await fetch('/api/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error('Error loading categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCategory ? `/api/categorias/${editingCategory.id}` : '/api/categorias'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingCategory ? 'Categoría actualizada' : 'Categoría creada',
          description: 'La operación se realizó exitosamente',
        })
        setIsDialogOpen(false)
        loadCategorias()
        resetForm()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al guardar la categoría',
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Categoría eliminada',
          description: 'La categoría se eliminó exitosamente',
        })
        loadCategorias()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al eliminar la categoría',
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
      description: ''
    })
    setEditingCategory(null)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground">
              Gestiona las categorías de productos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </DialogTitle>
                <DialogDescription>
                  Complete los datos de la categoría
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
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
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Categorías</CardTitle>
            <CardDescription>
              {categorias.length} categorías registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay categorías registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium">{categoria.name}</TableCell>
                      <TableCell>{categoria.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(categoria)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(categoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
