# Architecture Overview

## 🏗️ **System Architecture**

### **Application Layers**
```
┌─────────────────┐
│   Next.js App   │  ← Frontend (React) - Bibit-style UI + Admin Panel
├─────────────────┤
│   API Routes    │  ← Backend (Node.js) - Investment APIs + Admin APIs
├─────────────────┤
│   Middleware    │  ← Route Protection & RBAC
├─────────────────┤
│     Prisma      │  ← ORM & Database
├─────────────────┤
│     MySQL       │  ← Database
└─────────────────┘
```

### **Platform Features**

#### **User Features**
- **Portfolio Management**: Real-time tracking dengan alokasi aset
- **Dummy Trading**: Simulasi investasi reksa dana & obligasi
- **Watchlist**: Monitoring produk investasi favorit
- **Transaction History**: Riwayat transaksi dengan status tracking
- **Educational Content**: Micro-learning keuangan
- **Smart Navigation**: Role-based bottom navigation

#### **Admin Features**
- **Product Management**: CRUD operations untuk produk investasi
- **Admin Dashboard**: Statistik platform dan monitoring
- **User Management**: Overview data pengguna
- **Admin Navigation**: Navbar khusus dengan icon manajemen
- **Role-Based Access**: Proteksi route otomatis

### **Key Technologies**
- **Frontend**: Next.js 15.3.3 (App Router)
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+ via Prisma 6.15.0
- **Auth**: NextAuth.js 4.24.11
- **UI**: shadcn/ui + Tailwind CSS

## 📊 **Data Flow**

### **User Journey**
```
1. User visits / → Redirect to /dashboard
2. Auth check → Redirect to /auth/signin if needed
3. Dashboard loads → API calls to portfolio & products
4. User browses products → Navigate to /explore
5. User invests → API call to /api/transactions
6. Portfolio updates → Real-time calculation
7. User views history → Navigate to /transactions
8. Educational content → Navigate to /lesson (optional)
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
  role: String (Default: "USER") (USER, ADMIN)
  riskProfile: String? (KONSERVATIF, MODERAT, AGRESIF)
  isActive: Boolean (Default: true)
  createdAt: DateTime
  updatedAt: DateTime
)

portfolios (
  id: String (CUID, Primary Key)
  userId: String (Foreign Key → users.id, Unique)
  totalValue: Float (Default: 0)
  totalGain: Float (Default: 0)
  totalGainPercent: Float (Default: 0)
  riskProfile: String
  rdnBalance: Float (Default: 0)
  tradingBalance: Float (Default: 0)
  createdAt: DateTime
  updatedAt: DateTime
)

investment_products (
  id: String (CUID, Primary Key)
  name: String
  type: String (REKSADANA, OBLIGASI, SBN)
  category: String (PASAR_UANG, OBLIGASI, CAMPURAN, SAHAM)
  riskLevel: String (KONSERVATIF, MODERAT, AGRESIF)
  expectedReturn: Float
  minInvestment: Float
  currentPrice: Float
  description: Text
  isActive: Boolean (Default: true)
  createdAt: DateTime
  updatedAt: DateTime
)

investment_transactions (
  id: String (CUID, Primary Key)
  userId: String (Foreign Key → users.id)
  productId: String (Foreign Key → investment_products.id)
  type: String (BUY, SELL)
  amount: Float
  units: Float
  price: Float
  totalValue: Float
  status: String (PENDING, COMPLETED, CANCELLED)
  createdAt: DateTime
  updatedAt: DateTime
)

portfolio_holdings (
  id: String (CUID, Primary Key)
  portfolioId: String (Foreign Key → portfolios.id)
  productId: String (Foreign Key → investment_products.id)
  units: Float
  averagePrice: Float
  currentValue: Float
  gain: Float
  gainPercent: Float
  createdAt: DateTime
  updatedAt: DateTime
  
  Unique: (portfolioId, productId)
)

watchlists (
  id: String (CUID, Primary Key)
  userId: String (Foreign Key → users.id)
  productId: String (Foreign Key → investment_products.id)
  createdAt: DateTime
  
  Unique: (userId, productId)
)

-- Educational tables (existing)
lessons, quizzes, user_progress
```

### **Relationships**
```
User (1) ←→ (1) Portfolio (1) ←→ (N) PortfolioHolding (N) → (1) InvestmentProduct
User (1) ←→ (N) InvestmentTransaction (N) → (1) InvestmentProduct
User (1) ←→ (N) Watchlist (N) → (1) InvestmentProduct
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
├── admin/                        # Admin-only APIs
│   └── products/
│       ├── route.ts              # Admin product CRUD
│       └── [id]/route.ts         # Individual product management
├── products/
│   └── route.ts                  # Public product listing
├── portfolio/
│   └── [userId]/route.ts         # Portfolio management
├── transactions/
│   └── [userId]/route.ts         # Transaction management
├── watchlist/
│   └── [userId]/route.ts         # Watchlist management
├── profile/
│   └── [userId]/route.ts         # User profile management
├── progress/
│   ├── save/route.ts             # Save progress
│   └── [userId]/route.ts         # Get user progress
└── lessons/
    └── today/route.ts            # Get daily lesson
```

### **Middleware Chain**
```
Request → NextAuth Session Check → Role Check (RBAC) → Route Handler → Prisma Query → Database
Response ← JSON Serialization ← Data Processing ← Query Result
```

### **RBAC Middleware Flow**
```
1. Request hits /admin/* route
2. Middleware checks session exists
3. Middleware verifies role === "ADMIN"
4. If unauthorized → Redirect to /dashboard
5. If authorized → Continue to route handler
```

## 🎯 **Component Architecture**

### **Page Components**

#### **User Pages**
- `app/page.tsx` - Redirect to dashboard
- `app/dashboard/page.tsx` - Main dashboard (Bibit-style)
- `app/portfolio/page.tsx` - Portfolio overview & asset allocation
- `app/explore/page.tsx` - Browse investment products & watchlist
- `app/transactions/page.tsx` - Transaction history & order management
- `app/profile/page.tsx` - User profile & settings with logout
- `app/lesson/page.tsx` - Educational content + quiz interface

#### **Admin Pages**
- `app/admin/layout.tsx` - Admin layout with header & navigation
- `app/admin/dashboard/page.tsx` - Admin dashboard with statistics
- `app/admin/products/page.tsx` - Product management interface

#### **Auth Pages**
- `app/auth/signin/page.tsx` - Login form (clean, no navbar)
- `app/auth/signup/page.tsx` - Registration form (clean, no navbar)

### **UI Components** (`components/ui/`)

#### **Core Components**
- `Button` - Action buttons with variants
- `Card` - Content containers
- `Progress` - Progress bars
- `RadioGroup` - Quiz answer selection
- `Input` - Form inputs
- `Label` - Form labels
- `Badge` - Status indicators

#### **Business Components**
- `InvestmentCard` - Investment product display
- `PortfolioSummary` - Portfolio overview component
- `TransactionHistory` - Transaction list component

#### **Navigation Components**
- `BottomNavigation` - User bottom navigation
- `AdminBottomNavigation` - Admin bottom navigation
- `RoleBasedNavigation` - Smart navigation based on role

### **Utility Libraries** (`lib/`)
- `auth.ts` - NextAuth configuration with role support
- `prisma.ts` - Database client
- `utils.ts` - Helper functions (cn utility)
- `roles.ts` - RBAC utility functions
- `middleware.ts` - Route protection middleware

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

