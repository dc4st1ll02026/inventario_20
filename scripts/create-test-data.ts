import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📦 Creando datos de prueba...')

    // Limpiar datos existentes
    console.log('🧹 Limpiando base de datos...')
    await prisma.saleItem.deleteMany()
    await prisma.inboundItem.deleteMany()
    await prisma.sale.deleteMany()
    await prisma.inboundReceipt.deleteMany()
    await prisma.operation.deleteMany()
    await prisma.product.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.category.deleteMany()

    // Crear categorías
    console.log('📁 Creando categorías...')
    const electronica = await prisma.category.create({
      data: { name: 'Electrónica', description: 'Productos electrónicos y accesorios' }
    })
    const ropa = await prisma.category.create({
      data: { name: 'Ropa', description: 'Ropa y accesorios' }
    })
    const hogar = await prisma.category.create({
      data: { name: 'Hogar', description: 'Artículos para el hogar' }
    })

    // Crear clientes
    console.log('👤 Creando clientes...')
    const cliente1 = await prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '555-0101',
        address: 'Av. Principal 123'
      }
    })
    const cliente2 = await prisma.customer.create({
      data: {
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '555-0102',
        address: 'Calle Secundaria 456'
      }
    })

    // Crear proveedores
    console.log('🏭 Creando proveedores...')
    const proveedor1 = await prisma.supplier.create({
      data: {
        name: 'Tech Suppliers S.A.',
        email: 'ventas@techsuppliers.com',
        phone: '555-0201',
        address: 'Zona Industrial 1'
      }
    })
    const proveedor2 = await prisma.supplier.create({
      data: {
        name: 'Fashion Imports Ltd.',
        email: 'orders@fashionimports.com',
        phone: '555-0202',
        address: 'Zona Industrial 2'
      }
    })

    // Crear productos
    console.log('📦 Creando productos...')
    const producto1 = await prisma.product.create({
      data: {
        name: 'Laptop HP Pavilion 15',
        sku: 'LAP-001',
        description: 'Laptop HP Pavilion 15.6" Intel i5 8GB RAM',
        price: 750.00,
        stock: 25,
        categoryId: electronica.id
      }
    })
    const producto2 = await prisma.product.create({
      data: {
        name: 'Samsung Galaxy S23',
        sku: 'SAM-001',
        description: 'Smartphone Samsung Galaxy S23 256GB',
        price: 699.99,
        stock: 50,
        categoryId: electronica.id
      }
    })
    const producto3 = await prisma.product.create({
      data: {
        name: 'Camiseta Polo Azul',
        sku: 'ROP-001',
        description: 'Camiseta de polo algodón azul',
        price: 29.99,
        stock: 100,
        categoryId: ropa.id
      }
    })
    const producto4 = await prisma.product.create({
      data: {
        name: 'Jeans Slim Fit',
        sku: 'ROP-002',
        description: 'Pantalón jeans slim fit negro',
        price: 59.99,
        stock: 5, // Stock bajo para prueba
        categoryId: ropa.id
      }
    })
    const producto5 = await prisma.product.create({
      data: {
        name: 'Lámpara LED Mesa',
        sku: 'HOG-001',
        description: 'Lámpara de mesa LED ajustable',
        price: 34.99,
        stock: 75,
        categoryId: hogar.id
      }
    })
    const producto6 = await prisma.product.create({
      data: {
        name: 'Set de Cuchillos',
        sku: 'HOG-002',
        description: 'Set de 6 cuchillos de cocina inoxidable',
        price: 49.99,
        stock: 3, // Stock muy bajo para prueba
        categoryId: hogar.id
      }
    })

    // Crear ingresos (Inbound)
    console.log('📥 Creando ingresos...')
    const ingreso1 = await prisma.operation.create({
      data: {
        type: 'INBOUND',
        reference: 'ING-001',
        total: 11250.00,
        notes: 'Ingreso inicial de laptops',
        date: new Date('2025-01-15')
      }
    })
    await prisma.inboundReceipt.create({
      data: {
        operationId: ingreso1.id,
        supplierId: proveedor1.id,
        items: {
          create: [
            {
              productId: producto1.id,
              quantity: 15,
              unitPrice: 750.00,
              subtotal: 11250.00
            }
          ]
        }
      }
    })

    const ingreso2 = await prisma.operation.create({
      data: {
        type: 'INBOUND',
        reference: 'ING-002',
        total: 34999.50,
        notes: 'Ingreso de smartphones',
        date: new Date('2025-01-16')
      }
    })
    await prisma.inboundReceipt.create({
      data: {
        operationId: ingreso2.id,
        supplierId: proveedor1.id,
        items: {
          create: [
            {
              productId: producto2.id,
              quantity: 50,
              unitPrice: 699.99,
              subtotal: 34999.50
            }
          ]
        }
      }
    })

    const ingreso3 = await prisma.operation.create({
      data: {
        type: 'INBOUND',
        reference: 'ING-003',
        total: 4498.50,
        notes: 'Ingreso mixto de ropa',
        date: new Date('2025-01-17')
      }
    })
    await prisma.inboundReceipt.create({
      data: {
        operationId: ingreso3.id,
        supplierId: proveedor2.id,
        items: {
          create: [
            {
              productId: producto3.id,
              quantity: 100,
              unitPrice: 29.99,
              subtotal: 2999.00
            },
            {
              productId: producto4.id,
              quantity: 25,
              unitPrice: 59.99,
              subtotal: 1499.75
            }
          ]
        }
      }
    })

    // Crear ventas (Sales)
    console.log('💰 Creando ventas...')
    const venta1 = await prisma.operation.create({
      data: {
        type: 'OUTBOUND',
        reference: 'VEN-001',
        total: 1499.95,
        notes: 'Venta al cliente Juan Pérez',
        date: new Date('2025-01-18')
      }
    })
    await prisma.sale.create({
      data: {
        operationId: venta1.id,
        customerId: cliente1.id,
        items: {
          create: [
            {
              productId: producto1.id,
              quantity: 2,
              unitPrice: 750.00,
              subtotal: 1500.00
            }
          ]
        }
      }
    })

    const venta2 = await prisma.operation.create({
      data: {
        type: 'OUTBOUND',
        reference: 'VEN-002',
        total: 1049.97,
        notes: 'Venta a María García',
        date: new Date('2025-01-19')
      }
    })
    await prisma.sale.create({
      data: {
        operationId: venta2.id,
        customerId: cliente2.id,
        items: {
          create: [
            {
              productId: producto2.id,
              quantity: 1,
              unitPrice: 699.99,
              subtotal: 699.99
            },
            {
              productId: producto3.id,
              quantity: 5,
              unitPrice: 29.99,
              subtotal: 149.95
            }
          ]
        }
      }
    })

    const venta3 = await prisma.operation.create({
      data: {
        type: 'OUTBOUND',
        reference: 'VEN-003',
        total: 1049.75,
        notes: 'Venta a Juan Pérez',
        date: new Date('2025-01-20')
      }
    })
    await prisma.sale.create({
      data: {
        operationId: venta3.id,
        customerId: cliente1.id,
        items: {
          create: [
            {
              productId: producto4.id,
              quantity: 20,
              unitPrice: 59.99,
              subtotal: 1199.80
            }
          ]
        }
      }
    })

    // Actualizar stocks
    console.log('🔄 Actualizando stocks...')
    await prisma.product.update({
      where: { id: producto1.id },
      data: { stock: 25 }
    })
    await prisma.product.update({
      where: { id: producto2.id },
      data: { stock: 50 }
    })
    await prisma.product.update({
      where: { id: producto3.id },
      data: { stock: 100 }
    })
    await prisma.product.update({
      where: { id: producto4.id },
      data: { stock: 5 }
    })
    await prisma.product.update({
      where: { id: producto5.id },
      data: { stock: 75 }
    })
    await prisma.product.update({
      where: { id: producto6.id },
      data: { stock: 3 }
    })

    console.log('✅ Datos de prueba creados exitosamente!')
    console.log(`
      📊 Resumen:
      - ${6} productos
      - ${2} categorías
      - ${2} clientes
      - ${2} proveedores
      - ${3} ingresos
      - ${3} ventas
      - ${6} movimientos totales
    `)

  } catch (error) {
    console.error('❌ Error al crear datos de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
