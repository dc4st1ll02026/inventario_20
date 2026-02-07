'use client'

import * as React from "react"
import { Check, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Producto {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  unit: {
    name:string
  }
}

interface ProductSearchProps {
  productos: Producto[]
  selectedProducto: Producto | null
  onSelectProducto: (producto: Producto | null) => void
  placeholder?: string
}

export function ProductSearch({
  productos,
  selectedProducto,
  onSelectProducto,
  placeholder = "Buscar producto..."
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Filtrar productos por búsqueda
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return productos.slice(0, 10) // Mostrar primeros 10 si está vacío

    const searchLower = searchTerm.toLowerCase()
    return productos.filter(producto =>
      producto.name.toLowerCase().includes(searchLower) ||
      producto.sku.toLowerCase().includes(searchLower)
    ).slice(0, 10) // Limitar a 10 resultados

  }, [productos, searchTerm])

  // Manejar cambio en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log('antes')
    setSearchTerm(value)
    console.log('fin')
    setIsOpen(value.length > 0)
    setFocusedIndex(-1)
  }

  // Seleccionar producto
  const handleSelectProducto = (producto: Producto) => {
    onSelectProducto(producto)
    setSearchTerm("")
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  // Limpiar selección
  const handleClear = () => {
    onSelectProducto(null)
    setSearchTerm("")
    setIsOpen(false)
    setFocusedIndex(-1)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex(prev =>
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredProducts[focusedIndex]) {
        handleSelectProducto(filteredProducts[focusedIndex])
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  // Click fuera para cerrar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          listRef.current && !listRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="space-y-2">
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="relative flex h-10 w-full items-center justify-between rounded-md border bg-background px-3">
          <div className="flex flex-1 flex-col">
            {selectedProducto ? (
              <div className="flex flex-col">
                <span className="font-medium text-sm">{selectedProducto.name}</span>
                <span className="text-xs text-muted-foreground">
                  CODIGO: {selectedProducto.sku} | Bs. {selectedProducto.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => !selectedProducto && searchTerm && setIsOpen(true)}
                  placeholder={placeholder}
                  className="flex h-full w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>
          {selectedProducto && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 shrink-0 rounded-full p-1 hover:bg-accent"
              title="Limpiar selección"
            >
              <Check className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>

        {/* Lista de resultados */}
        {isOpen && filteredProducts.length > 0 && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-md border bg-popover shadow-md"
          >
            {filteredProducts.map((producto, index) => (
              <button
                key={producto.id}
                type="button"
                onClick={() => handleSelectProducto(producto)}
                className={cn(
                  "flex w-full flex-col items-start gap-1 border-b px-3 py-2 text-left text-sm transition-colors last:border-0",
                  index === focusedIndex
                    ? "bg-accent"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">{producto.name}</span>
                  <span className="text-xs text-muted-foreground">Stock: {producto.stock}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  CODIGO: {producto.sku} | Bs. {producto.price.toFixed(2)}  | Unidad: {producto.unit.name}                 
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {isOpen && searchTerm && filteredProducts.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-6 text-center text-sm text-muted-foreground shadow-md">
            No se encontraron productos para "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  )
}
