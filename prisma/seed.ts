import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Test User',
      riskProfile: 'KONSERVATIF',
    },
  })

  // Create admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fintech.com' },
    update: {},
    create: {
      email: 'admin@fintech.com',
      passwordHash: adminHashedPassword,
      name: 'Admin Fintech',
      role: 'ADMIN',
      riskProfile: 'MODERAT',
    },
  })

  // Create portfolio for user
  await prisma.portfolio.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      riskProfile: 'KONSERVATIF',
      rdnBalance: 1000000,
      tradingBalance: 0,
    },
  })

  // Create sample lessons
  const lessons = [
    {
      day: 1,
      title: 'Apa itu Dana Darurat?',
      content: `Dana darurat adalah sejumlah uang yang disisihkan khusus untuk menghadapi situasi darurat atau kejadian tak terduga yang membutuhkan biaya besar.

**Mengapa Dana Darurat Penting?**
- Melindungi keuangan Anda dari kejadian tak terduga
- Menghindari utang untuk kebutuhan mendesak
- Memberikan ketenangan pikiran
- Membantu Anda tetap fokus pada tujuan keuangan jangka panjang

**Berapa Besar Dana Darurat yang Dibutuhkan?**
- Minimal 3-6 bulan pengeluaran rutin
- Untuk freelancer: 6-12 bulan pengeluaran
- Sesuaikan dengan stabilitas pendapatan Anda

**Tips Menyisihkan Dana Darurat:**
1. Mulai dengan jumlah kecil, konsisten setiap bulan
2. Pisahkan dari rekening utama
3. Pilih instrumen yang mudah dicairkan (tabungan, deposito)
4. Jangan gunakan untuk kebutuhan non-darurat`
    },
    {
      day: 2,
      title: 'Mengenal Investasi untuk Pemula',
      content: `Investasi adalah kegiatan menanamkan modal atau dana dengan harapan mendapatkan keuntungan di masa depan.

**Jenis Investasi untuk Pemula:**
1. **Deposito** - Aman, bunga tetap, jangka waktu tertentu
2. **Reksa Dana** - Dikelola profesional, risiko rendah-sedang
3. **Obligasi** - Surat utang pemerintah/korporasi
4. **Saham** - Kepemilikan sebagian perusahaan

**Prinsip Investasi:**
- Mulai sedini mungkin (time value of money)
- Diversifikasi (jangan taruh semua telur dalam satu keranjang)
- Investasi jangka panjang lebih stabil
- Sesuaikan dengan profil risiko Anda

**Tips Memulai Investasi:**
1. Tentukan tujuan investasi
2. Kenali profil risiko Anda
3. Mulai dengan jumlah kecil
4. Pelajari instrumen investasi
5. Konsisten dan sabar`
    },
    {
      day: 3,
      title: 'Mengelola Utang dengan Bijak',
      content: `Utang bisa menjadi alat yang membantu atau merugikan, tergantung bagaimana Anda mengelolanya.

**Jenis Utang:**
- **Utang Produktif**: untuk investasi yang menghasilkan (KPR, modal usaha)
- **Utang Konsumtif**: untuk kebutuhan sehari-hari (kartu kredit, cicilan barang)

**Prinsip Mengelola Utang:**
1. **Debt-to-Income Ratio** maksimal 30%
2. Prioritaskan utang dengan bunga tinggi
3. Jangan berutang untuk gaya hidup
4. Selalu bayar tepat waktu

**Strategi Melunasi Utang:**
- **Debt Snowball**: lunasi utang terkecil dulu
- **Debt Avalanche**: lunasi utang dengan bunga tertinggi dulu
- Konsolidasi utang jika memungkinkan
- Negosiasikan suku bunga

**Tips Menghindari Utang Berlebihan:**
1. Buat anggaran bulanan
2. Bedakan kebutuhan vs keinginan
3. Bawa uang tunai saat belanja
4. Hindari kartu kredit jika tidak disiplin`
    }
  ]

  for (const lessonData of lessons) {
    const lesson = await prisma.lesson.upsert({
      where: { day: lessonData.day },
      update: {},
      create: lessonData,
    })

    // Create quiz for each lesson
    const quizData = {
      lessonId: lesson.id,
      question: lessonData.day === 1 ? 'Apa itu dana darurat?' :
                lessonData.day === 2 ? 'Mana yang BUKAN jenis investasi untuk pemula?' :
                'Berapa maksimal Debt-to-Income Ratio yang disarankan?',
      options: lessonData.day === 1 ? [
        'Uang untuk liburan',
        'Uang yang disisihkan untuk situasi darurat',
        'Uang untuk investasi',
        'Uang untuk belanja'
      ] : lessonData.day === 2 ? [
        'Deposito',
        'Reksa Dana',
        'Obligasi',
        'Kartu Kredit'
      ] : [
        '20%',
        '30%',
        '40%',
        '50%'
      ],
      answer: lessonData.day === 1 ? 1 : lessonData.day === 2 ? 3 : 1
    }

    await prisma.quiz.upsert({
      where: { lessonId: lesson.id },
      update: {},
      create: quizData,
    })
  }

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
    }
  ]

  for (const product of products) {
    await prisma.investmentProduct.upsert({
      where: { name: product.name },
      update: product,
      create: product
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
