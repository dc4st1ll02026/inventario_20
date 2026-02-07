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
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

export default function ClientesPage() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes)
      }
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingCustomer 
        ? `/api/clientes/${editingCustomer.id}`
        : '/api/clientes'
      
      const method = editingCustomer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingCustomer ? 'Cliente actualizado' : 'Cliente creado',
          description: editingCustomer 
            ? 'El cliente se ha actualizado exitosamente'
            : 'El cliente se ha creado exitosamente',
        })
        setIsDialogOpen(false)
        loadClientes()
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
      console.error('Error saving customer:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al guardar el cliente',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Cliente eliminado',
          description: 'El cliente se ha eliminado exitosamente',
        })
        loadClientes()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Ha ocurrido un error',
        })
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al eliminar el cliente',
      })
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
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
    setEditingCustomer(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gestión del catálogo de clientes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
                <DialogDescription>
                  Complete la información del cliente
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
                    {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
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
              Cargando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay clientes registrados
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
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cliente.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{cliente.phone || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cliente.address || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cliente.id)}
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
