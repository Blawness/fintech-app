import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Cleaning up existing data...')
  
  // Clean up existing data in reverse order of dependencies
  await prisma.userProgress.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.portfolioHolding.deleteMany()
  await prisma.watchlist.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.investmentTransaction.deleteMany()
  await prisma.portfolio.deleteMany()
  await prisma.investmentProduct.deleteMany()
  await prisma.user.deleteMany()
  await prisma.systemSetting.deleteMany()
  
  console.log('✅ Cleanup completed')
}

async function seedUsers() {
  console.log('👥 Creating users...')
  
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Test User',
      riskProfile: 'KONSERVATIF',
      isActive: true
    }
  })

  // Create admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fintech.com',
      passwordHash: adminHashedPassword,
      name: 'Admin Fintech',
      role: 'ADMIN',
      riskProfile: 'MODERAT',
      isActive: true
    }
  })

  console.log('✅ Users created')
  return { user, admin }
}

async function seedPortfolio(userId: string) {
  console.log('💼 Creating portfolio...')
  
  await prisma.portfolio.create({
    data: {
      userId: userId,
      riskProfile: 'KONSERVATIF',
      rdnBalance: 1000000,
      tradingBalance: 0,
    }
  })

  console.log('✅ Portfolio created')
}

async function seedLessons() {
  console.log('📚 Creating lessons...')
  
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
    },
    {
      day: 4,
      title: 'Memahami Fintech Syariah',
      content: `Fintech syariah adalah teknologi keuangan yang beroperasi sesuai dengan prinsip-prinsip syariah Islam.

**Prinsip Fintech Syariah:**
- Menghindari riba (bunga)
- Menghindari gharar (ketidakpastian berlebihan)
- Menghindari maysir (judi/spekulasi)
- Menggunakan akad yang sesuai syariah (murabahah, ijarah, musyarakah, mudharabah)

**Jenis Fintech Syariah:**
1. **Crowdfunding Syariah** - Penggalangan dana untuk proyek yang sesuai syariah
2. **Pembayaran Digital Syariah** - Aplikasi pembayaran non-tunai sesuai prinsip syariah
3. **Lending P2P Syariah** - Platform pinjaman peer-to-peer berbasis syariah
4. **E-Wallet Syariah** - Dompet digital dengan prinsip syariah

**Keuntungan Fintech Syariah:**
- Transparansi dalam transaksi
- Berbagi risiko antara pihak
- Investasi pada sektor halal
- Akses keuangan yang lebih luas

**Contoh Produk Fintech Syariah:**
- Pembiayaan dengan akad murabahah (jual beli)
- Investasi reksa dana syariah
- Tabungan syariah dengan bagi hasil`
    },
    {
      day: 5,
      title: 'Perencanaan Keuangan Pribadi',
      content: `Perencanaan keuangan adalah proses mengelola keuangan untuk mencapai tujuan hidup.

**Langkah-langkah Perencanaan Keuangan:**
1. **Tentukan Tujuan** - Tujuan jangka pendek, menengah, dan panjang
2. **Hitung Aset dan Liabilitas** - Net worth = Aset - Utang
3. **Buat Anggaran** - Alokasi pendapatan untuk kebutuhan, tabungan, investasi
4. **Buat Dana Darurat** - Minimal 3-6 bulan pengeluaran
5. **Mulai Investasi** - Sesuaikan dengan profil risiko
6. **Review Berkala** - Evaluasi dan sesuaikan rencana

**Rumus 50-30-20:**
- 50% untuk kebutuhan pokok
- 30% untuk keinginan
- 20% untuk tabungan dan investasi

**Tujuan Keuangan Umum:**
- Dana darurat
- Pendidikan anak
- Rumah impian
- Pensiun yang nyaman
- Perjalanan ibadah

**Tips Sukses Perencanaan Keuangan:**
1. Mulai sedini mungkin
2. Disiplin dengan anggaran
3. Otomatisasi tabungan dan investasi
4. Hindari utang konsumtif
5. Review dan sesuaikan secara berkala`
    },
    {
      day: 6,
      title: 'Manajemen Risiko dalam Investasi',
      content: `Setiap investasi memiliki risiko. Memahami dan mengelola risiko adalah kunci sukses investasi.

**Jenis Risiko Investasi:**
1. **Risiko Pasar** - Fluktuasi harga karena kondisi pasar
2. **Risiko Kredit** - Emiten gagal bayar
3. **Risiko Likuiditas** - Sulit dijual saat dibutuhkan
4. **Risiko Inflasi** - Nilai investasi tergerus inflasi
5. **Risiko Valuta Asing** - Untuk investasi valas

**Profil Risiko:**
- **Konservatif** - Toleransi risiko rendah, fokus pada stabilitas
- **Moderat** - Keseimbangan antara risiko dan return
- **Agresif** - Toleransi risiko tinggi, mencari return maksimal

**Strategi Mengelola Risiko:**
1. **Diversifikasi** - Jangan taruh semua telur dalam satu keranjang
2. **Asset Allocation** - Alokasi dana ke berbagai jenis aset
3. **Dollar Cost Averaging** - Investasi rutin dengan jumlah tetap
4. **Time Horizon** - Sesuaikan dengan jangka waktu investasi
5. **Stop Loss** - Batas kerugian yang bisa diterima

**Prinsip Investasi:**
- Higher risk, higher return
- Diversifikasi mengurangi risiko
- Investasi jangka panjang lebih stabil
- Jangan investasi uang yang dibutuhkan dalam waktu dekat`
    },
    {
      day: 7,
      title: 'Pajak dan Investasi',
      content: `Memahami perpajakan investasi membantu Anda mengoptimalkan return dan menghindari masalah hukum.

**Jenis Pajak Investasi:**
1. **Pajak Penghasilan (PPh)** - Atas bunga, dividen, capital gain
2. **Pajak Final** - Pajak yang sudah final, tidak bisa dikreditkan
3. **Pajak Tidak Final** - Bisa dikreditkan dengan pajak lainnya

**Pajak per Instrumen Investasi:**
- **Deposito** - Pajak final 20% (jika > Rp7.5 juta/tahun)
- **Obligasi** - Pajak final 15% untuk WNI
- **Saham** - Pajak final 0.1% dari nilai transaksi
- **Reksa Dana** - Pajak final 0.1% dari nilai transaksi
- **Sukuk** - Pajak final 15% untuk WNI

**NPWP untuk Investasi:**
- Wajib memiliki NPWP untuk investasi
- Tanpa NPWP, tarif pajak lebih tinggi (20% vs tarif normal)
- NPWP memudahkan pelaporan pajak

**Tips Optimasi Pajak:**
1. Manfaatkan investasi dengan pajak final rendah
2. Gunakan investasi jangka panjang (capital gain jangka panjang lebih menguntungkan)
3. Manfaatkan investasi syariah (beberapa memiliki insentif pajak)
4. Konsultasi dengan konsultan pajak untuk perencanaan optimal
5. Simpan dokumen investasi untuk pelaporan pajak`
    },
    {
      day: 8,
      title: 'Perencanaan Pensiun yang Sehat',
      content: `Pensiun yang nyaman membutuhkan perencanaan sejak dini. Mulai sekarang, jangan tunggu sampai terlambat.

**Mengapa Perencanaan Pensiun Penting?**
- Harapan hidup meningkat, masa pensiun lebih panjang
- Inflasi mengurangi nilai uang
- Tidak bisa bergantung hanya pada pensiun dari perusahaan
- Biaya kesehatan meningkat seiring usia

**Berapa Kebutuhan Dana Pensiun?**
- Minimal 70-80% dari pengeluaran saat masih bekerja
- Hitung berdasarkan gaya hidup yang diinginkan
- Pertimbangkan inflasi tahunan (sekitar 3-5%)
- Faktor harapan hidup (rata-rata 75-80 tahun)

**Sumber Dana Pensiun:**
1. **BPJS Ketenagakerjaan** - Jaminan pensiun dari pemerintah
2. **Dana Pensiun Perusahaan** - Jika tersedia
3. **Investasi Pribadi** - Tabungan, reksa dana, saham, properti
4. **Asuransi Jiwa** - Perlindungan dan investasi

**Strategi Menabung untuk Pensiun:**
1. **Mulai Sedini Mungkin** - Time value of money bekerja untuk Anda
2. **Investasi Konsisten** - Rutin setiap bulan
3. **Diversifikasi** - Kombinasi berbagai instrumen investasi
4. **Review Berkala** - Sesuaikan dengan perubahan kebutuhan
5. **Tingkatkan Kontribusi** - Saat pendapatan meningkat

**Rumus Sederhana:**
- Mulai investasi 10-15% dari gaji untuk pensiun
- Targetkan dana pensiun 25x pengeluaran tahunan
- Investasi dengan return di atas inflasi`
    }
  ]

  const createdLessons = []
  for (const lessonData of lessons) {
    const lesson = await prisma.lesson.create({
      data: lessonData
    })
    createdLessons.push(lesson)

    // Create quiz for each lesson
    const getQuizData = (day: number) => {
      switch (day) {
        case 1:
          return {
            question: 'Apa itu dana darurat?',
            options: [
              'Uang untuk liburan',
              'Uang yang disisihkan untuk situasi darurat',
              'Uang untuk investasi',
              'Uang untuk belanja'
            ],
            answer: 1
          }
        case 2:
          return {
            question: 'Mana yang BUKAN jenis investasi untuk pemula?',
            options: [
              'Deposito',
              'Reksa Dana',
              'Obligasi',
              'Kartu Kredit'
            ],
            answer: 3
          }
        case 3:
          return {
            question: 'Berapa maksimal Debt-to-Income Ratio yang disarankan?',
            options: [
              '20%',
              '30%',
              '40%',
              '50%'
            ],
            answer: 1
          }
        case 4:
          return {
            question: 'Apa yang dimaksud dengan akad murabahah dalam fintech syariah?',
            options: [
              'Akad sewa menyewa',
              'Akad jual beli dengan margin keuntungan',
              'Akad bagi hasil',
              'Akad pinjaman dengan bunga'
            ],
            answer: 1
          }
        case 5:
          return {
            question: 'Menurut rumus 50-30-20, berapa persen pendapatan yang sebaiknya dialokasikan untuk tabungan dan investasi?',
            options: [
              '10%',
              '15%',
              '20%',
              '30%'
            ],
            answer: 2
          }
        case 6:
          return {
            question: 'Apa strategi terbaik untuk mengurangi risiko investasi?',
            options: [
              'Investasi pada satu instrumen saja',
              'Diversifikasi ke berbagai jenis aset',
              'Investasi semua dana pada saham',
              'Menghindari investasi sama sekali'
            ],
            answer: 1
          }
        case 7:
          return {
            question: 'Berapa tarif pajak final untuk investasi obligasi bagi WNI?',
            options: [
              '10%',
              '15%',
              '20%',
              '25%'
            ],
            answer: 1
          }
        case 8:
          return {
            question: 'Berapa persen dari gaji yang sebaiknya diinvestasikan untuk persiapan pensiun?',
            options: [
              '5-10%',
              '10-15%',
              '15-20%',
              '20-25%'
            ],
            answer: 1
          }
        default:
          return {
            question: 'Pertanyaan default',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            answer: 0
          }
      }
    }

    const quizInfo = getQuizData(lessonData.day)
    const quizData = {
      lessonId: lesson.id,
      question: quizInfo.question,
      options: quizInfo.options,
      answer: quizInfo.answer
    }

    await prisma.quiz.create({
      data: quizData
    })
  }

  console.log('✅ Lessons and quizzes created')
  return createdLessons
}

async function seedInvestmentProducts() {
  console.log('💹 Creating investment products...')
  
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
    await prisma.investmentProduct.create({
      data: product
    })
  }

  console.log('✅ Investment products created')
  return products.length
}

async function seedSystemSettings() {
  console.log('⚙️ Creating system settings...')
  
  const systemSettings = [
    {
      key: 'market_status',
      value: 'CLOSED'
    },
    {
      key: 'market_hours_start',
      value: '09:00'
    },
    {
      key: 'market_hours_end',
      value: '16:00'
    },
    {
      key: 'trading_fee_percentage',
      value: '0.1'
    },
    {
      key: 'min_trading_amount',
      value: '10000'
    }
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.create({
      data: setting
    })
  }

  console.log('✅ System settings created')
  return systemSettings.length
}

async function main() {
  try {
    console.log('🚀 Starting complete database seeding...')
    
    await cleanup()
    const { user, admin } = await seedUsers()
    await seedPortfolio(user.id)
    const lessons = await seedLessons()
    const productCount = await seedInvestmentProducts()
    const settingsCount = await seedSystemSettings()

    console.log('')
    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`  - 2 users (1 test user, 1 admin)`)
    console.log(`  - 1 portfolio`)
    console.log(`  - ${lessons.length} lessons with quizzes`)
    console.log(`  - ${productCount} investment products`)
    console.log(`  - ${settingsCount} system settings`)
    console.log('')
    console.log('🔑 Test User Credentials:')
    console.log('  Email: test@example.com')
    console.log('  Password: password123')
    console.log('')
    console.log('🔑 Admin Credentials:')
    console.log('  Email: admin@fintech.com')
    console.log('  Password: admin123')
    console.log('')
    console.log('⚠️  Please change passwords after first login!')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




