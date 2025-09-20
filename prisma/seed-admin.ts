import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin user...')

  try {
    // Create admin user
    const adminEmail = 'admin@fintech.com'
    const adminPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash: hashedPassword,
        name: 'Admin Fintech',
        role: 'ADMIN',
        riskProfile: 'MODERAT',
        isActive: true
      },
      create: {
        email: adminEmail,
        passwordHash: hashedPassword,
        name: 'Admin Fintech',
        role: 'ADMIN',
        riskProfile: 'MODERAT',
        isActive: true
      }
    })

    console.log('✅ Admin user created/updated:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isActive: adminUser.isActive
    })

    console.log('🔑 Admin credentials:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
