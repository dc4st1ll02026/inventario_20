import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📦 Creando ingresos adicionales de prueba...')

    // Obtener proveedores existentes
    const proveedores = await prisma.supplier.findMany()
    
    if (proveedores.length === 0) {
      console.log('❌ No hay proveedores. Ejecuta primero el script de datos de prueba.')
      return
    }

    // Obtener productos existentes
    const productos = await prisma.product.findMany()

    if (productos.length === 0) {
      console.log('❌ No hay productos.')
      return
    }

    // Crear algunos ingresos adicionales
    const ingresosNuevos = [
      {
        proveedorIndex: 0, // Tech Suppliers S.A.
        productos: [
          { productoIndex: 1, cantidad: 10 }, // Samsung Galaxy S23
          { productoIndex: 0, cantidad: 5, precioUnitario: 720.00 }  // Laptop HP Pavilion
        ],
        notas: 'Ingreso regular de Q1'
      },
      {
        proveedorIndex: 1, // Fashion Imports Ltd.
        productos: [
          { productoIndex: 3, cantidad: 30 }, // Camiseta Polo Azul
          { productoIndex: 4, cantidad: 25 }  // Jeans Slim Fit
        ],
        notas: 'Reposición de primavera'
      },
      {
        proveedorIndex: 0, // Tech Suppliers S.A.
        productos: [
          { productoIndex: 5, cantidad: 15 }, // Lámpara LED Mesa
          { productoIndex: 2, cantidad: 20 }  // Camiseta Polo Azul
        ],
        notas: 'Pedido especial'
      }
    ]

    for (const ingreso of ingresosNuevos) {
      const proveedor = proveedores[ingreso.proveedorIndex]
      
      // Calcular total y preparar items
      let total = 0
      const items: any[] = []
      
      for (const itemIngreso of ingreso.productos) {
        const producto = productos[itemIngreso.productoIndex]
        const precio = itemIngreso.precioUnitario || producto.price
        const subtotal = itemIngreso.cantidad * precio
        total += subtotal
        
        items.push({
          productId: producto.id,
          quantity: itemIngreso.cantidad,
          unitPrice: precio,
          subtotal
        })
      }

      // Generar código de ingreso
      const codigoIngreso = `ING-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

      // Crear la operación
      const operacion = await prisma.operation.create({
        data: {
          type: 'INBOUND',
          reference: codigoIngreso,
          total,
          notes: ingreso.notas,
          date: new Date()
        }
      })

      // Crear el ingreso
      const inboundReceipt = await prisma.inboundReceipt.create({
        data: {
          operationId: operacion.id,
          supplierId: proveedor.id
        }
      })

      // Crear los items y actualizar stock
      for (const item of items) {
        await prisma.inboundItem.create({
          data: {
            inboundReceiptId: inboundReceipt.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }
        })

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity }
          }
        })
      }

      console.log(`✅ Ingreso creado: ${codigoIngreso} - Proveedor: ${proveedor.name} - Total: $${total.toFixed(2)}`)
    }

    // Obtener estadísticas finales
    const todosLosIngresos = await prisma.inboundReceipt.findMany({
      include: {
        operation: true
      }
    })
    
    const totalIngresos = todosLosIngresos.length
    const valorTotal = todosLosIngresos.reduce((sum, i) => sum + i.operation.total, 0)

    console.log(`
      📊 Resumen Final:
      - ${totalIngresos} ingresos totales
      - Valor acumulado: $${valorTotal.toFixed(2)}
    `)

  } catch (error) {
    console.error('❌ Error al crear ingresos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
