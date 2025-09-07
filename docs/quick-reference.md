# Quick Reference Guide

## 🚀 **Essential Commands**
```bash
# Install & setup
npm install
npx prisma generate && npx prisma db push && npx prisma db seed

# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run lint            # Check code quality

# Database
npx prisma studio       # Database GUI
npx prisma db push      # Push schema changes
npx prisma db seed      # Seed with sample data
```

## 📁 **File Structure**
```
fintech-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Auth pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard
├── components/ui/         # UI components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # DB client
│   └── utils.ts          # Helpers
├── prisma/               # Database
│   ├── schema.prisma     # Schema definition
│   └── seed.ts           # Sample data
└── docs/                 # Documentation
```

## 🔧 **Environment Variables**
```env
# Required in .env.local
DATABASE_URL="mysql://user:pass@host:port/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

## 📊 **Database Tables**
- `users` - User accounts
- `lessons` - Daily content
- `quizzes` - Questions/answers
- `user_progress` - Learning tracking

## 🔗 **Key API Endpoints**
- `GET /api/lessons/today` - Daily lesson
- `POST /api/progress/save` - Save progress
- `GET /api/progress/[userId]` - User stats
- `POST /api/auth/signup` - Register user

## 🎨 **UI Components**
- `Button` - Actions (variants: default, outline, ghost)
- `Card` - Content containers
- `Progress` - Progress bars
- `RadioGroup` - Quiz answers
- `Input/Label` - Form elements

## 🎯 **Core Features**
1. **Authentication** - NextAuth.js with email/password
2. **Daily Lessons** - Financial content in Indonesian
3. **Interactive Quizzes** - Multiple choice questions
4. **Progress Tracking** - Streaks, scores, completion
5. **Responsive UI** - Mobile-first design

## 🐛 **Quick Debug**
```bash
# Clear cache
rm -rf .next

# Check database
npx prisma db push

# Verify environment
cat .env.local

# Test API
curl http://localhost:3000/api/lessons/today
```

## 📝 **Development Notes**
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MySQL via Prisma ORM
- **Auth**: NextAuth.js v4

## 🎨 **Styling Quick Reference**
```tsx
// Layout patterns
<div className="container mx-auto px-4 py-8">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Component usage
<Button variant="default" size="lg">Click me</Button>
<Card><CardContent>Content</CardContent></Card>
<Progress value={75} />

// Colors
className="bg-primary text-primary-foreground"
className="hover:bg-primary/90"
```

## 🔐 **Authentication Quick Reference**
```typescript
// Server-side session check
const session = await getServerSession(authOptions)
if (!session) return { redirect: { destination: '/auth/signin' } }

// Client-side session usage
const { data: session } = useSession()
if (!session) router.push('/auth/signin')
```

## 📊 **Database Quick Reference**
```typescript
// Basic queries
const user = await prisma.user.findUnique({ where: { email } })
const lessons = await prisma.lesson.findMany({ include: { quiz: true } })

// Progress tracking
await prisma.userProgress.upsert({
  where: { userId_lessonId: { userId, lessonId } },
  update: { quizScore, streak },
  create: { userId, lessonId, quizScore, streak }
})
```

## 🚀 **Deployment Checklist**
- [ ] Environment variables configured
- [ ] Database accessible
- [ ] Prisma client generated
- [ ] Build successful
- [ ] Static assets optimized
- [ ] Authentication configured

## 📞 **Help Resources**
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
