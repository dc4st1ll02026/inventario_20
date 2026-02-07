import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🛒 Creando ventas adicionales de prueba...')

    // Obtener clientes existentes
    const clientes = await prisma.customer.findMany()
    
    if (clientes.length === 0) {
      console.log('❌ No hay clientes. Ejecuta primero el script de datos de prueba.')
      return
    }

    // Obtener productos existentes
    const productos = await prisma.product.findMany({
      where: { stock: { gt: 0 } }
    })

    if (productos.length === 0) {
      console.log('❌ No hay productos con stock disponible.')
      return
    }

    // Crear algunas ventas adicionales
    const ventasNuevas = [
      {
        clienteIndex: 0, // Juan Pérez
        productos: [
          { productoIndex: 1, cantidad: 2 }, // Samsung Galaxy S23
          { productoIndex: 4, cantidad: 3 }  // Lámpara LED Mesa
        ],
        notas: 'Venta regular'
      },
      {
        clienteIndex: 1, // María García
        productos: [
          { productoIndex: 0, cantidad: 1 }, // Laptop HP Pavilion
          { productoIndex: 4, cantidad: 2 }  // Lámpara LED Mesa
        ],
        notas: 'Compra online'
      },
      {
        clienteIndex: 0, // Juan Pérez
        productos: [
          { productoIndex: 2, cantidad: 5 }  // Camiseta Polo Azul
        ],
        notas: 'Venta mostrador'
      }
    ]

    for (const venta of ventasNuevas) {
      const cliente = clientes[venta.clienteIndex]
      
      // Calcular total y preparar items
      let total = 0
      const items: any[] = []
      
      for (const itemVenta of venta.productos) {
        const producto = productos[itemVenta.productoIndex]
        const subtotal = itemVenta.cantidad * producto.price
        total += subtotal
        
        items.push({
          productId: producto.id,
          quantity: itemVenta.cantidad,
          unitPrice: producto.price,
          subtotal
        })
      }

      // Generar código de operación
      const codigoOperacion = `VEN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`

      // Crear la operación
      const operacion = await prisma.operation.create({
        data: {
          type: 'OUTBOUND',
          reference: codigoOperacion,
          total,
          notes: venta.notas,
          date: new Date()
        }
      })

      // Crear la venta
      const sale = await prisma.sale.create({
        data: {
          operationId: operacion.id,
          customerId: cliente.id
        }
      })

      // Crear los items y actualizar stock
      for (const item of items) {
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }
        })

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      console.log(`✅ Venta creada: ${codigoOperacion} - Cliente: ${cliente.name} - Total: $${total.toFixed(2)}`)
    }

    // Obtener estadísticas finales
    const todasLasVentas = await prisma.sale.findMany({
      include: {
        operation: true
      }
    })
    
    const totalVentas = todasLasVentas.length
    const valorTotal = todasLasVentas.reduce((sum, v) => sum + v.operation.total, 0)

    console.log(`
      📊 Resumen Final:
      - ${totalVentas} ventas totales
      - Valor acumulado: $${valorTotal.toFixed(2)}
    `)

  } catch (error) {
    console.error('❌ Error al crear ventas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
