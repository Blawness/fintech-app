# FinEdu - Aplikasi Micro-Learning Edukasi Keuangan

Aplikasi web micro-learning untuk edukasi keuangan masyarakat Indonesia, mirip Duolingo versi finansial.

## 🚀 Fitur Utama

- **Autentikasi Pengguna**: Login/Register dengan email dan password
- **Daily Lesson**: Materi pembelajaran keuangan harian dalam bahasa Indonesia
- **Quiz Interaktif**: Pertanyaan pilihan ganda terkait lesson
- **Progress Tracking**: Menyimpan progress, skor quiz, dan streak belajar harian
- **Dashboard**: Tampilan kemajuan pembelajaran dengan statistik

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS dengan custom design system

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database
- npm atau yarn

## 🚀 Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd fintech-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   - Buat database MySQL dengan nama `fintech_learning`
   - Update file `.env.local` dengan kredensial database Anda:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/fintech_learning"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Setup Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```

6. **Buka browser**
   - Akses `http://localhost:3000`
   - Gunakan demo account: `test@example.com` / `password123`

## 📊 Database Schema

### Tabel User
- `id`: Primary key
- `email`: Email unik pengguna
- `passwordHash`: Password terenkripsi
- `name`: Nama pengguna
- `createdAt`, `updatedAt`: Timestamp

### Tabel Lesson
- `id`: Primary key
- `title`: Judul pelajaran
- `content`: Konten pelajaran (Text)
- `day`: Nomor hari (1, 2, 3, dst)
- `createdAt`, `updatedAt`: Timestamp

### Tabel Quiz
- `id`: Primary key
- `lessonId`: Foreign key ke Lesson
- `question`: Pertanyaan quiz
- `options`: Array pilihan jawaban (JSON)
- `answer`: Index jawaban benar (0, 1, 2, 3)
- `createdAt`, `updatedAt`: Timestamp

### Tabel UserProgress
- `id`: Primary key
- `userId`: Foreign key ke User
- `lessonId`: Foreign key ke Lesson
- `quizScore`: Skor quiz (0-100)
- `streak`: Streak belajar harian
- `completedAt`: Waktu selesai
- `createdAt`, `updatedAt`: Timestamp

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Daftar pengguna baru
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Progress
- `POST /api/progress/save` - Simpan progress pengguna
- `GET /api/progress/[userId]` - Ambil progress pengguna

### Lessons
- `GET /api/lessons/today` - Ambil lesson dan quiz hari ini

## 📱 Halaman Aplikasi

### Dashboard (`/`)
- Statistik pengguna (streak, pelajaran selesai, skor rata-rata)
- Progress bar pembelajaran
- Tombol untuk memulai pelajaran

### Lesson (`/lesson`)
- Tampilan materi pembelajaran
- Quiz interaktif dengan pilihan ganda
- Feedback hasil quiz

### Authentication
- `/auth/signin` - Halaman login
- `/auth/signup` - Halaman registrasi

## 🎯 Contoh Data

Aplikasi sudah dilengkapi dengan 3 contoh pelajaran:

1. **Dana Darurat** - Dasar-dasar dana darurat dan cara menyisihkannya
2. **Investasi untuk Pemula** - Pengenalan instrumen investasi
3. **Mengelola Utang** - Tips mengelola utang dengan bijak

## 🚀 Deployment

1. **Setup production database**
2. **Update environment variables**
3. **Build aplikasi**
   ```bash
   npm run build
   ```
4. **Deploy ke platform pilihan** (Vercel, Netlify, dll)

## 📝 Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run start` - Jalankan production server
- `npm run db:push` - Push schema ke database
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database dengan data contoh

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

- Email: yudhahafiz@gmail.com
- Project Link: [(https://github.com/Blawness/fintech-app)](https://github.com/Blawness/fintech-app)
