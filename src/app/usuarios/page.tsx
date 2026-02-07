'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Pencil, Trash2, ShieldCheck, User, Users, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface User {
  id: string
  username: string
  name: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin, isLoading: authLoading } = useAuth()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'USER'
  })

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página',
      })
      router.push('/')
    }
  }, [isAdmin, authLoading, router, toast])

  useEffect(() => {
    if (isAdmin) {
      loadUsuarios()
    }
  }, [isAdmin])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Verificando permisos...</div>
        </div>
      </AppLayout>
    )
  }

  // No renderizar si no es administrador
  if (!isAdmin) {
    return null
  }

  const loadUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios')
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios)
      }
    } catch (error) {
      console.error('Error loading usuarios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUser 
        ? `/api/usuarios/${editingUser.id}`
        : '/api/usuarios'
      
      const method = editingUser ? 'PUT' : 'POST'
      
      const payload = editingUser && !formData.password
        ? { ...formData, password: undefined }
        : formData
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({
          title: editingUser ? 'Usuario actualizado' : 'Usuario creado',
          description: editingUser 
            ? 'El usuario se ha actualizado exitosamente'
            : 'El usuario se ha creado exitosamente',
        })
        setIsDialogOpen(false)
        loadUsuarios()
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
      console.error('Error saving user:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al guardar el usuario',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'Usuario eliminado',
          description: 'El usuario se ha eliminado exitosamente',
        })
        loadUsuarios()
      } else {
        const error = await response.json()
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.error || 'Ha ocurrido un error',
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ha ocurrido un error al eliminar el usuario',
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'USER'
    })
    setEditingUser(null)
  }

  const activeUsers = usuarios.filter(u => u.active).length
  const adminUsers = usuarios.filter(u => u.role === 'ADMIN' && u.active).length

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestión de usuarios del sistema
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription>
                  Complete la información del usuario
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
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
                      <Label htmlFor="username">Usuario *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Contraseña {editingUser ? '(dejar en blanco para mantener actual)' : '*'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Usuario</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingUser ? 'Actualizar' : 'Crear'} Usuario
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">usuarios con acceso activo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <p className="text-xs text-muted-foreground">administradores del sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay usuarios registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{usuario.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{usuario.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {usuario.role === 'ADMIN' ? (
                          <ShieldCheck className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={
                          usuario.role === 'ADMIN' 
                            ? 'text-yellow-700 dark:text-yellow-400 font-medium'
                            : ''
                        }>
                          {usuario.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {usuario.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(usuario.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                          disabled={!usuario.active}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                          disabled={!usuario.active}
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
