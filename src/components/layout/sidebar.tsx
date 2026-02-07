'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ShoppingBag,
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Ruler,
  FileText,
  ChartColumnBig,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Categorías', href: '/categorias', icon: Settings },
  { name: 'Unidades de Medida', href: '/unidades', icon: Ruler },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Proveedores', href: '/proveedores', icon: Truck },
  { name: 'Nuevo Ingreso', href: '/ingresos', icon: ShoppingCart },
  { name: 'Listado de Ingresos', href: '/ingresos/listado', icon: Package },
  { name: 'Nueva Venta', href: '/ventas', icon: ShoppingBag },
  { name: 'Listado de Ventas', href: '/ventas/listado', icon: ShoppingBag },
  { name: 'Cuentas por Cobrar', href: '/cuentas-por-cobrar', icon: FileText },

  { name: 'Reportes', href: '/reportes', icon: Printer },
  { name: 'Analíticas', href: '/analiticas', icon: ChartColumnBig },
  { name: 'Usuarios', href: '/usuarios', icon: Users, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { isAdmin } = useAuth()

  // Filtrar navegación según el rol del usuario
  const filteredNavigation = navigation.filter(item => {
    // Si el item es adminOnly, solo mostrar si es admin
    if (item.adminOnly && !isAdmin) {
      return false
    }
    return true
  })

  const NavItems = () => (
    <>
      {filteredNavigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background lg:block w-64">
        <ScrollArea className="h-full py-6">
          <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold text-primary">Sistema de Inventario</h1>
            <p className="text-sm text-muted-foreground mt-1">Control de Almacén</p>
          </div>
          <nav className="px-4 space-y-1">
            <NavItems />
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <ScrollArea className="h-full py-6">
            <div className="px-6 mb-8">
              <h1 className="text-2xl font-bold text-primary">Sistema de Inventario</h1>
              <p className="text-sm text-muted-foreground mt-1">Control de Almacén</p>
            </div>
            <nav className="px-4 space-y-1">
              <NavItems />
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
