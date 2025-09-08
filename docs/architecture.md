# Architecture Overview

## 🏗️ **System Architecture**

### **Application Layers**
```
┌─────────────────┐
│   Next.js App   │  ← Frontend (React)
├─────────────────┤
│   API Routes    │  ← Backend (Node.js)
├─────────────────┤
│     Prisma      │  ← ORM & Database
├─────────────────┤
│     MySQL       │  ← Database
└─────────────────┘
```

### **Key Technologies**
- **Frontend**: Next.js 15.3.3 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+ via Prisma 6.15.0
- **Auth**: NextAuth.js 4.24.11
- **UI**: shadcn/ui + Tailwind CSS

## 📊 **Data Flow**

### **User Journey**
```
1. User visits / → Dashboard
2. Auth check → Redirect to /auth/signin if needed
3. Dashboard loads → API call to /api/progress/[userId]
4. User clicks lesson → Navigate to /lesson
5. Lesson loads → API call to /api/lessons/today
6. Quiz submission → API call to /api/progress/save
7. Progress updates → Return to dashboard
```

### **Authentication Flow**
```
Login Request → NextAuth → Prisma → MySQL
    ↓
JWT Token Created → Session Stored
    ↓
Protected Routes Access Granted
```

## 🗄️ **Database Schema**

### **Core Tables**
```sql
users (
  id: String (CUID, Primary Key)
  email: String (Unique)
  passwordHash: String
  name: String?
  createdAt: DateTime
  updatedAt: DateTime
)

lessons (
  id: String (CUID, Primary Key)
  title: String
  content: Text
  day: Int (Unique)
  createdAt: DateTime
  updatedAt: DateTime
)

quizzes (
  id: String (CUID, Primary Key)
  lessonId: String (Foreign Key → lessons.id)
  question: String
  options: Json (Array of strings)
  answer: Int (Index of correct option)
  createdAt: DateTime
  updatedAt: DateTime
)

user_progress (
  id: String (CUID, Primary Key)
  userId: String (Foreign Key → users.id)
  lessonId: String (Foreign Key → lessons.id)
  quizScore: Int? (0-100)
  streak: Int (Default: 0)
  completedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime

  Unique: (userId, lessonId)
)
```

### **Relationships**
```
User (1) ←→ (N) UserProgress (N) → (1) Lesson
Lesson (1) ←→ (1) Quiz
```

## 🔄 **API Architecture**

### **Route Structure**
```
api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth handlers
│   └── signup/route.ts           # User registration
├── progress/
│   ├── save/route.ts             # Save progress
│   └── [userId]/route.ts         # Get user progress
└── lessons/
    └── today/route.ts            # Get daily lesson
```

### **Middleware Chain**
```
Request → NextAuth Session Check → Route Handler → Prisma Query → Database
Response ← JSON Serialization ← Data Processing ← Query Result
```

## 🎯 **Component Architecture**

### **Page Components**
- `app/page.tsx` - Dashboard with progress overview
- `app/lesson/page.tsx` - Lesson content + quiz interface
- `app/auth/signin/page.tsx` - Login form
- `app/auth/signup/page.tsx` - Registration form

### **UI Components** (`components/ui/`)
- `Button` - Action buttons with variants
- `Card` - Content containers
- `Progress` - Progress bars
- `RadioGroup` - Quiz answer selection
- `Input` - Form inputs
- `Label` - Form labels

### **Utility Libraries** (`lib/`)
- `auth.ts` - NextAuth configuration
- `prisma.ts` - Database client
- `utils.ts` - Helper functions (cn utility)

## 🔐 **Security Architecture**

### **Authentication**
- **JWT-based**: NextAuth.js handles token creation/validation
- **Session storage**: Secure HTTP-only cookies
- **Password hashing**: bcryptjs with salt rounds
- **Route protection**: Server-side session verification

### **Data Validation**
- **TypeScript**: Compile-time type checking
- **Prisma schemas**: Database-level constraints
- **API validation**: Request body validation

### **Environment Security**
- **Secret keys**: Stored in `.env.local` (gitignored)
- **Database credentials**: Environment-based configuration
- **CORS**: Next.js automatic handling

## 📈 **Performance Architecture**

### **Optimization Strategies**
- **Server-Side Rendering**: Next.js App Router
- **Database Indexing**: Prisma automatic optimization
- **Code Splitting**: Next.js automatic chunking
- **Image Optimization**: Next.js Image component (future use)

### **Caching Strategy**
- **Browser caching**: Static assets
- **Database connection pooling**: Prisma built-in
- **API response caching**: Next.js ISR (future use)

## 🚀 **Deployment Architecture**

### **Development**
- **Local MySQL**: Development database
- **Hot reload**: Next.js dev server
- **Type checking**: TypeScript incremental compilation

### **Production**
- **Vercel/Netlify**: Recommended hosting
- **PlanetScale**: Serverless MySQL (alternative)
- **Environment variables**: Platform-specific config

## 🔧 **Error Handling**

### **Error Types**
- **Database errors**: Connection, query failures
- **Authentication errors**: Invalid credentials, expired sessions
- **Validation errors**: Invalid input data
- **Network errors**: API failures, timeouts

### **Error Recovery**
- **Graceful degradation**: Fallback UI states
- **Retry logic**: Failed API calls
- **User feedback**: Error messages and loading states

## 📊 **Monitoring & Analytics**

### **Built-in Monitoring**
- **Next.js analytics**: Performance metrics
- **Prisma metrics**: Query performance
- **Error boundaries**: React error catching

### **Logging Strategy**
- **Server logs**: API route logging
- **Client logs**: Browser console (development)
- **Database logs**: Prisma query logging

## 🔄 **Future Extensibility**

### **Scalability Considerations**
- **Database**: Easy migration to PlanetScale/Aurora
- **API**: RESTful design allows GraphQL addition
- **UI**: Component-based architecture supports expansion

### **Feature Extensions**
- **Multi-language**: i18n support ready
- **Offline mode**: Service worker integration possible
- **Social features**: User profiles, leaderboards
- **Admin panel**: Content management system

