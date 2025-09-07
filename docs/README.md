# FinEdu - Financial Education Micro-Learning App

## 🎯 **Core Purpose**
Micro-learning platform for Indonesian financial literacy education. Duolingo-style interface for financial knowledge acquisition.

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
- ✅ Daily financial lessons in Indonesian
- ✅ Interactive quizzes with progress tracking
- ✅ Streak counter and gamification
- ✅ Responsive design

## 📁 **Project Structure**
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── lesson/            # Lesson page
│   └── globals.css        # Global styles
├── components/ui/         # shadcn/ui components
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
- `Dashboard`: User progress overview
- `Lesson`: Daily content + quiz
- `Auth`: Login/register forms
- `Progress`: User tracking system

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
- `User`: Authentication data
- `Lesson`: Content storage
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
