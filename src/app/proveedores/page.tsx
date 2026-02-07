'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Supplier {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

export default function ProveedoresPage() {
  const { toast } = useToast()
  const [proveedores, setProveedores] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadProveedores()
  }, [])

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      if (response.ok) {
        const data = await response.json()
        setProveedores(data.proveedores)
      }
    } catch (error) {
      console.error('Error loading proveedores:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSupplier 
        ? `/api/proveedores/${editingSupplier.id}`
        : '/api/proveedores'
      
      const method = editingSupplier ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado',
          description: editingSupplier 
            ? 'El proveedor se ha actualizado exitosamente'
            : 'El proveedor se ha creado exitosamente',
        })
        setIsDialogOpen(false)
        loadProveedores()
        resetForm()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Ha ocurrido un error',
        })
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al guardar el proveedor',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) return

    try {
      const response = await fetch(`/api/proveedores/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Proveedor eliminado',
          description: 'El proveedor se ha eliminado exitosamente',
        })
        loadProveedores()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Ha ocurrido un error',
        })
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al eliminar el proveedor',
      })
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    })
    setEditingSupplier(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestión del catálogo de proveedores
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </DialogTitle>
                <DialogDescription>
                  Complete la información del proveedor
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingSupplier ? 'Actualizar' : 'Crear'} Proveedor
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando proveedores...
            </div>
          ) : proveedores.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay proveedores registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{proveedor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{proveedor.email || '-'}</TableCell>
                    <TableCell>{proveedor.phone || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {proveedor.address || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(proveedor)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(proveedor.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
