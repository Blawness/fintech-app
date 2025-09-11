# Bibit - Investasi Mudah untuk Semua

## 🎯 **Core Purpose**
Platform investasi reksa dana dan obligasi dengan edukasi keuangan untuk masyarakat Indonesia. Kombinasi antara broker dummy dan sistem pembelajaran keuangan yang interaktif.

## 🚀 **Quick Start**
```bash
npm install
npx prisma generate && npx prisma db push && npx prisma db seed
npm run dev
```

## 📊 **App Architecture**

### **Tech Stack**
- **Frontend**: Next.js 15.3.3 (App Router), React 18.3.1, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL 8.0+
- **Auth**: NextAuth.js v4.24.11
- **UI**: shadcn/ui, Tailwind CSS 3.4.17, Radix UI

### **Key Features**
- ✅ User authentication (email/password)
- ✅ Portfolio management dengan tracking real-time
- ✅ Investasi dummy reksa dana dan obligasi
- ✅ Watchlist untuk monitoring produk investasi
- ✅ Sistem transaksi dengan status tracking
- ✅ Daily financial lessons in Indonesian
- ✅ Interactive quizzes with progress tracking
- ✅ Streak counter and gamification
- ✅ Responsive design dengan UI menyerupai Bibit

## 📁 **Project Structure**
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── products/      # Investment products API
│   │   ├── portfolio/     # Portfolio management API
│   │   ├── transactions/  # Transaction API
│   │   ├── watchlist/     # Watchlist API
│   │   └── profile/       # User profile API
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard (Bibit-style)
│   ├── portfolio/         # Portfolio page
│   ├── explore/           # Explore investment products
│   ├── transactions/      # Transaction history
│   ├── profile/           # User profile
│   ├── lesson/            # Educational content
│   └── globals.css        # Global styles
├── components/ui/         # shadcn/ui components
│   ├── investment-card.tsx    # Investment product card
│   ├── portfolio-summary.tsx  # Portfolio overview
│   └── transaction-history.tsx # Transaction list
├── lib/                   # Utility libraries
├── prisma/                # Database schema & seed
└── docs/                  # Documentation
```

## 🔧 **Development**
- Uses modern Next.js 15 features
- TypeScript for type safety
- Prisma for database operations
- Tailwind for styling
- Hot reload enabled

## 📚 **Key Components**
- `Dashboard`: Portfolio overview dengan UI menyerupai Bibit
- `Portfolio`: Detail portfolio dan alokasi aset
- `Explore`: Browse produk investasi dan watchlist
- `Transactions`: Riwayat transaksi dan order management
- `Profile`: User profile dan settings
- `Lesson`: Daily content + quiz (edukasi keuangan)
- `Auth`: Login/register forms

## 🎨 **UI System**
- shadcn/ui component library
- Tailwind CSS for styling
- Radix UI primitives
- Custom design tokens in globals.css

## 🔐 **Authentication**
- NextAuth.js with Prisma adapter
- JWT-based sessions
- Password hashing with bcryptjs
- Protected routes

## 📊 **Database Schema**
- `User`: Authentication data + risk profile
- `Portfolio`: User portfolio dengan total value & gain
- `PortfolioHolding`: Detail holding per produk
- `InvestmentProduct`: Produk investasi (reksa dana, obligasi, SBN)
- `InvestmentTransaction`: Transaksi buy/sell
- `Watchlist`: Produk yang di-watchlist user
- `Lesson`: Educational content storage
- `Quiz`: Question/answer data
- `UserProgress`: Learning tracking

## 🐛 **Common Issues**
- Database connection: Check `.env.local` DATABASE_URL
- Auth errors: Verify NEXTAUTH_SECRET
- Build errors: Clear `.next` folder and reinstall

## 📖 **Documentation Links**
- [API Reference](./api.md)
- [Styling Guide](./styling.md)
- [Debugging](./debugging.md)
- [Architecture](./architecture.md)

