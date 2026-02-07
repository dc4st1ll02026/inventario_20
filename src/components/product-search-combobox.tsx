'use client'

import * as React from 'react'
import { Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category?: {
    name: string
  }
}

interface ProductSearchComboboxProps {
  products: Product[]
  selectedProductId: string
  onSelectProduct: (productId: string) => void
  onClear?: () => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  onlyWithStock?: boolean
}

export function ProductSearchCombobox({
  products,
  selectedProductId,
  onSelectProduct,
  onClear,
  placeholder = 'Buscar producto...',
  emptyMessage = 'No se encontraron productos',
  disabled = false,
  onlyWithStock = true,
}: ProductSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  // Filtrar productos
  const availableProducts = onlyWithStock
    ? products.filter((p) => p.stock > 0)
    : products

  // Filtrar productos según búsqueda
  const filteredProducts = availableProducts.filter((product) => {
    const searchLower = search.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower)
    )
  })

  const handleSelectProduct = (productId: string) => {
    onSelectProduct(productId)
    setOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onClear?.()
    setSearch('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearch('')
    }
  }

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'justify-between text-left font-normal',
              !selectedProduct && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
          >
            {selectedProduct ? (
              <div className="flex flex-col items-start truncate">
                <span className="truncate">{selectedProduct.name}</span>
                <span className="text-xs text-muted-foreground">
                  SKU: {selectedProduct.sku}
                </span>
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
            {!disabled && !selectedProduct && (
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Escribe el nombre o SKU..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => handleSelectProduct(product.id)}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedProduct?.id === product.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {product.price.toFixed(2)} Bs.
                      </Badge>
                    </div>
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        <span>Codigo: {product.sku}</span>
                        {product.category && (
                          <span>{product.category.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProduct && onClear && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="shrink-0"
          title="Limpiar selección"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
