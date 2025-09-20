import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding investment products...')

  // Create sample investment products
  const products = [
    {
      name: 'Reksa Dana Pasar Uang Syariah',
      type: 'REKSADANA',
      category: 'PASAR_UANG',
      riskLevel: 'KONSERVATIF',
      expectedReturn: 4.5,
      minInvestment: 10000,
      currentPrice: 1000,
      description: 'Reksa dana pasar uang syariah dengan risiko rendah dan likuiditas tinggi. Cocok untuk investor pemula yang ingin memulai investasi dengan aman.'
    },
    {
      name: 'Reksa Dana Obligasi Pemerintah',
      type: 'REKSADANA',
      category: 'OBLIGASI',
      riskLevel: 'KONSERVATIF',
      expectedReturn: 6.2,
      minInvestment: 100000,
      currentPrice: 1500,
      description: 'Reksa dana yang menginvestasikan dana pada obligasi pemerintah dengan tingkat risiko rendah hingga sedang.'
    },
    {
      name: 'Reksa Dana Campuran Agresif',
      type: 'REKSADANA',
      category: 'CAMPURAN',
      riskLevel: 'AGRESIF',
      expectedReturn: 12.5,
      minInvestment: 50000,
      currentPrice: 2000,
      description: 'Reksa dana campuran dengan alokasi saham dan obligasi yang seimbang, cocok untuk investor dengan profil risiko agresif.'
    },
    {
      name: 'Reksa Dana Saham Syariah',
      type: 'REKSADANA',
      category: 'SAHAM',
      riskLevel: 'AGRESIF',
      expectedReturn: 15.8,
      minInvestment: 100000,
      currentPrice: 2500,
      description: 'Reksa dana saham syariah yang menginvestasikan dana pada saham-saham syariah dengan potensi return tinggi.'
    },
    {
      name: 'Obligasi Ritel Negara (ORI) 023',
      type: 'OBLIGASI',
      category: 'OBLIGASI',
      riskLevel: 'KONSERVATIF',
      expectedReturn: 5.8,
      minInvestment: 1000000,
      currentPrice: 1000000,
      description: 'Obligasi ritel negara dengan tenor 3 tahun dan kupon tetap. Dijamin oleh pemerintah Indonesia dengan tingkat risiko sangat rendah.'
    },
    {
      name: 'Sukuk Ritel (SR) 023',
      type: 'SBN',
      category: 'OBLIGASI',
      riskLevel: 'KONSERVATIF',
      expectedReturn: 5.5,
      minInvestment: 1000000,
      currentPrice: 1000000,
      description: 'Sukuk ritel dengan prinsip syariah, memberikan return yang kompetitif dengan tingkat risiko rendah.'
    },
    {
      name: 'Bitcoin (BTC)',
      type: 'CRYPTO',
      category: 'CRYPTO',
      riskLevel: 'AGRESIF',
      expectedReturn: 25.0,
      minInvestment: 100000,
      currentPrice: 500000000,
      description: 'Bitcoin adalah cryptocurrency pertama dan terbesar berdasarkan kapitalisasi pasar. Cocok untuk investor dengan profil risiko agresif yang siap menghadapi volatilitas tinggi.'
    },
    {
      name: 'Ethereum (ETH)',
      type: 'CRYPTO',
      category: 'CRYPTO',
      riskLevel: 'AGRESIF',
      expectedReturn: 30.0,
      minInvestment: 50000,
      currentPrice: 30000000,
      description: 'Ethereum adalah platform blockchain yang mendukung smart contracts dan aplikasi terdesentralisasi. Memiliki potensi pertumbuhan tinggi dengan risiko volatilitas.'
    },
    {
      name: 'Binance Coin (BNB)',
      type: 'CRYPTO',
      category: 'CRYPTO',
      riskLevel: 'AGRESIF',
      expectedReturn: 20.0,
      minInvestment: 25000,
      currentPrice: 5000000,
      description: 'Binance Coin adalah token utilitas dari ekosistem Binance. Digunakan untuk trading fee dan berbagai layanan dalam platform Binance.'
    },
    {
      name: 'Cardano (ADA)',
      type: 'CRYPTO',
      category: 'CRYPTO',
      riskLevel: 'MODERAT',
      expectedReturn: 15.0,
      minInvestment: 20000,
      currentPrice: 15000,
      description: 'Cardano adalah platform blockchain generasi ketiga yang fokus pada keamanan dan skalabilitas. Menggunakan pendekatan berbasis penelitian untuk pengembangan blockchain.'
    }
  ]

  for (const product of products) {
    await prisma.investmentProduct.upsert({
      where: { name: product.name },
      update: product,
      create: product
    })
  }

  console.log('✅ Investment products seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding investment products:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
