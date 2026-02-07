'use client'

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Producto {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

interface ProductSelectProps {
  productos: Producto[]
  selectedProducto: Producto | null
  onSelectProducto: (producto: Producto | null) => void
  placeholder?: string
}

export function ProductSelect({
  productos,
  selectedProducto,
  onSelectProducto,
  placeholder = "Selecciona un producto..."
}: ProductSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // Filtrar productos por búsqueda
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return productos

    const searchLower = searchTerm.toLowerCase()
    return productos.filter(producto =>
      producto.name.toLowerCase().includes(searchLower) ||
      producto.sku.toLowerCase().includes(searchLower)
    )
  }, [productos, searchTerm])

  // Seleccionar producto
  const handleSelect = (producto: Producto) => {
    onSelectProducto(producto)
    setOpen(false)
    setSearchTerm("")
  }

  // Limpiar selección
  const handleClear = () => {
    onSelectProducto(null)
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !selectedProducto && "text-muted-foreground"
            )}
          >
            <div className="flex flex-1 flex-col">
              {selectedProducto ? (
                <div className="flex flex-col">
                  <span className="font-medium">{selectedProducto.name}</span>
                  <span className="text-xs text-muted-foreground">
                    SKU: {selectedProducto.sku} | Bs. {selectedProducto.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            {selectedProducto && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="ml-2 rounded-full p-1 hover:bg-accent"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar producto por nombre o SKU..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {searchTerm ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No se encontraron productos para "{searchTerm}"
                  </p>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Escribe para buscar productos...
                  </p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((producto) => (
                  <CommandItem
                    key={producto.id}
                    value={producto.id}
                    onSelect={() => handleSelect(producto)}
                    className="flex flex-col items-start gap-1 p-3"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{producto.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Stock: {producto.stock}</span>
                        {selectedProducto?.id === producto.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SKU: {producto.sku} | Bs. {producto.price.toFixed(2)}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Info del producto seleccionado */}
      {selectedProducto && (
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium">Producto seleccionado:</p>
          <p className="text-sm">{selectedProducto.name}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              SKU: {selectedProducto.sku}
            </p>
            <p className="text-xs text-muted-foreground">
              Stock actual: {selectedProducto.stock} unidades
            </p>
            <p className="text-sm font-semibold">
              Precio base: Bs. {selectedProducto.price.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
