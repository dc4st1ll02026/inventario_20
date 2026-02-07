'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'

interface HeaderProps {
  userName?: string
}

export function Header({ userName = 'Usuario' }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = () => {
    // Eliminar la sesión del localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
    
    router.push('/login')
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false)
  }

  return (
    <>
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Bienvenido, <span className="font-medium text-foreground">{userName}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogoutClick}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              ¿Cerrar Sesión?
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cerrar tu sesión actual?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelLogout}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
