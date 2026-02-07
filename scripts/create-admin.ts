import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Intentar crear una tabla de prueba
    await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`
    console.log('Conexión a la base de datos exitosa')

    // Contar usuarios
    const userCount = await prisma.user.count()
    console.log('Usuarios encontrados:', userCount)

    // Crear usuario administrador si no existe
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'administrador' }
    })

    if (!existingAdmin) {
      console.log('Creando usuario administrador...')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('123456', 10)

      const admin = await prisma.user.create({
        data: {
          username: 'administrador',
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN',
          active: true
        }
      })

      console.log('Administrador creado:', { id: admin.id, username: admin.username })
    } else {
      console.log('El administrador ya existe')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
