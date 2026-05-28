const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('qilin/1000/2008/7', 12)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { username: 'sir.kaz' },
      update: {},
      create: {
        username: 'sir.kaz',
        email: 'sirkaz@team.qilin',
        passwordHash,
        displayName: 'Sir Kaz',
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('Admin account created successfully:', {
      username: admin.username,
      displayName: admin.displayName,
      role: admin.role,
      isActive: admin.isActive,
    })
  } catch (error) {
    console.error('Error creating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
