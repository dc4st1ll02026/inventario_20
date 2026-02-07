'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Ruler } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Unit {
  id: string
  name: string
  symbol: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function UnidadesPage() {
  const { toast } = useToast()
  const [unidades, setUnidades] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: ''
  })

  useEffect(() => {
    loadUnidades()
  }, [])

  const loadUnidades = async () => {
    try {
      const response = await fetch('/api/unidades')
      if (response.ok) {
        const data = await response.json()
        setUnidades(data.unidades || [])
      }
    } catch (error) {
      console.error('Error loading unidades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUnit ? `/api/unidades/${editingUnit.id}` : '/api/unidades'
      const method = editingUnit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: editingUnit ? 'Unidad actualizada' : 'Unidad creada',
          description: 'La operación se realizó exitosamente',
        })
        setIsDialogOpen(false)
        loadUnidades()
        resetForm()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al guardar la unidad',
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta unidad de medida?')) return

    try {
      const response = await fetch(`/api/unidades/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Unidad eliminada',
          description: 'La unidad se eliminó exitosamente',
        })
        loadUnidades()
      } else {
        const data = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Error al eliminar la unidad',
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

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      description: unit.description || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      description: ''
    })
    setEditingUnit(null)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unidades de Medida</h1>
            <p className="text-muted-foreground">
              Gestiona las unidades de medida para productos
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Unidad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
                </DialogTitle>
                <DialogDescription>
                  Complete los datos de la unidad de medida
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
                    <Label htmlFor="symbol">Símbolo *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      required
                      placeholder="Ej: u, kg, L, m"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción opcional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingUnit ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabla de Unidades */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Unidades de Medida</CardTitle>
            <CardDescription>
              {unidades.length} unidad(es) registrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Símbolo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay unidades de medida registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  unidades.map((unidad) => (
                    <TableRow key={unidad.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{unidad.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{unidad.symbol}</Badge>
                      </TableCell>
                      <TableCell>{unidad.description || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={unidad.active ? 'default' : 'secondary'}
                          className={unidad.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                        >
                          {unidad.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(unidad)}
                          disabled={!unidad.active}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(unidad.id)}
                          disabled={!unidad.active}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
