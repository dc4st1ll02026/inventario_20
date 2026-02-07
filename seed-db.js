import { db } from './src/lib/db.js'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('Iniciando seed de la base de datos...')

    // Verificar si ya existe el administrador
    const existingAdmin = await db.user.findUnique({
      where: { username: 'administrador' }
    })

    if (existingAdmin) {
      console.log('El administrador ya existe')
      process.exit(0)
    }

    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('123456', 10)

    // Crear usuario administrador
    const admin = await db.user.create({
      data: {
        username: 'administrador',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        active: true
      }
    })

    const { password: _, ...adminWithoutPassword } = admin

    console.log('✅ Administrador creado exitosamente')
    console.log('   Usuario: administrador')
    console.log('   Contraseña: 123456')
    console.log('   ID:', adminWithoutPassword.id)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error)
    process.exit(1)
  }
}

seed()
