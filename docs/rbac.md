# Role-Based Access Control (RBAC) Documentation

## 🎯 **Overview**

Sistem RBAC (Role-Based Access Control) memungkinkan kontrol akses yang granular berdasarkan role pengguna. Aplikasi ini mendukung dua role utama: **USER** dan **ADMIN**.

## 🔐 **Role Definitions**

### **USER Role**
- **Default role** untuk semua user baru
- **Akses**: Dashboard, Portfolio, Explore, Transactions, Profile, Lessons
- **Navigation**: Bottom navigation standar
- **Restrictions**: Tidak dapat akses admin panel

### **ADMIN Role**
- **Role khusus** untuk administrator
- **Akses**: Semua akses USER + Admin Panel
- **Navigation**: Admin bottom navigation dengan icon khusus
- **Permissions**: Kelola produk investasi, monitor statistik

## 🏗️ **RBAC Architecture**

### **Database Schema**
```sql
users (
  id: String (CUID, Primary Key)
  email: String (Unique)
  passwordHash: String
  name: String?
  role: String (Default: "USER") (USER, ADMIN)  -- RBAC Field
  riskProfile: String?
  isActive: Boolean (Default: true)
  createdAt: DateTime
  updatedAt: DateTime
)
```

### **Role Constants**
```typescript
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
```

## 🔧 **Implementation Details**

### **1. Authentication Integration**

#### **NextAuth Configuration** (`lib/auth.ts`)
```typescript
// JWT Callback - Include role in token
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.role = user.role  // Role stored in JWT
  }
  return token
}

// Session Callback - Expose role to client
async session({ session, token }) {
  if (token) {
    session.user.id = token.id as string
    session.user.role = token.role as string  // Role available in session
  }
  return session
}
```

#### **TypeScript Types** (`types/next-auth.d.ts`)
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string  // Role type definition
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string  // Role type definition
  }
}
```

### **2. Route Protection**

#### **Middleware** (`lib/middleware.ts`)
```typescript
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Admin-only routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isAdminRoute) {
    // Check authentication
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Check admin role
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}
```

#### **Protected Routes**
- `/admin/*` - Admin only
- `/api/admin/*` - Admin only
- All other routes - User + Admin

### **3. UI Components**

#### **Role-Based Navigation** (`components/ui/role-based-navigation.tsx`)
```typescript
export function RoleBasedNavigation({ className }: RoleBasedNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Hide navigation on auth pages
  const noNavPages = ['/auth/signin', '/auth/signup', '/auth/error']
  if (noNavPages.includes(pathname)) {
    return null
  }

  // Show admin navigation for admin users
  if (session?.user?.role === 'ADMIN') {
    return <AdminBottomNavigation className={className} />
  }

  // Show regular navigation for regular users
  return <BottomNavigation className={className} />
}
```

#### **Navigation Differences**

**User Navigation:**
- 🏠 Home
- 🕐 History
- 🔍 Search
- ↔️ Transaksi
- 👤 Profil

**Admin Navigation:**
- 🏠 Dashboard
- 📊 Produk
- 💳 Transaksi
- 👥 Users
- 📈 Analytics

### **4. API Protection**

#### **Admin API Example** (`app/api/admin/products/route.ts`)
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check authentication
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin-only logic here
    const products = await prisma.investmentProduct.findMany()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## 🛠️ **Utility Functions**

### **Role Utilities** (`lib/roles.ts`)
```typescript
// Get current user role
export async function getUserRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.role as Role || null
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === ROLES.ADMIN
}

// Check if user is regular user
export async function isUser(): Promise<boolean> {
  const role = await getUserRole()
  return role === ROLES.USER
}

// Check if user has required role
export function hasRole(userRole: string, requiredRole: Role): boolean {
  if (requiredRole === ROLES.ADMIN) {
    return userRole === ROLES.ADMIN
  }
  return true // USER role can access user routes
}
```

## 🚀 **Usage Examples**

### **1. Client-Side Role Check**
```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session } = useSession()
  
  if (session?.user?.role === 'ADMIN') {
    return <AdminOnlyComponent />
  }
  
  return <UserComponent />
}
```

### **2. Server-Side Role Check**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Admin-only logic
}
```

### **3. Conditional Rendering**
```typescript
function Navigation() {
  const { data: session } = useSession()
  
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/portfolio">Portfolio</Link>
      
      {session?.user?.role === 'ADMIN' && (
        <Link href="/admin">Admin Panel</Link>
      )}
    </nav>
  )
}
```

## 🔒 **Security Considerations**

### **1. Server-Side Validation**
- **Always validate roles on server-side**
- **Never trust client-side role checks**
- **Use middleware for route protection**

### **2. JWT Security**
- **Role information stored in JWT**
- **Tokens are signed and verified**
- **Session automatically includes role**

### **3. Database Security**
- **Role field is required and validated**
- **Default role is USER for new accounts**
- **Admin accounts must be created manually**

## 🧪 **Testing RBAC**

### **1. Test Admin Access**
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/signin \
  -d '{"email": "admin@bibit.com", "password": "admin123"}'

# Access admin API
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/products
```

### **2. Test User Access**
```bash
# Login as regular user
curl -X POST http://localhost:3000/api/auth/signin \
  -d '{"email": "user@example.com", "password": "password123"}'

# Try to access admin API (should fail)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/admin/products
# Expected: 403 Forbidden
```

## 📊 **Admin Panel Features**

### **1. Admin Dashboard** (`/admin`)
- **Statistics**: Total users, products, transactions
- **Quick Actions**: Navigate to management pages
- **Real-time Data**: Live platform metrics

### **2. Product Management** (`/admin/products`)
- **CRUD Operations**: Create, read, update, delete products
- **Bulk Actions**: Activate/deactivate multiple products
- **Search & Filter**: Find products quickly
- **Validation**: Ensure data integrity

### **3. User Management** (`/admin/users`) - Future
- **User List**: View all registered users
- **Role Assignment**: Change user roles
- **Account Management**: Activate/deactivate accounts

## 🔄 **Migration Guide**

### **1. Adding New Roles**
```typescript
// 1. Update ROLES constant
export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR'  // New role
} as const

// 2. Update database schema
// 3. Update middleware
// 4. Update UI components
// 5. Update API routes
```

### **2. Adding New Permissions**
```typescript
// 1. Define permission constants
export const PERMISSIONS = {
  READ_PRODUCTS: 'read:products',
  WRITE_PRODUCTS: 'write:products',
  DELETE_PRODUCTS: 'delete:products'
} as const

// 2. Create role-permission mapping
export const ROLE_PERMISSIONS = {
  USER: [PERMISSIONS.READ_PRODUCTS],
  ADMIN: [PERMISSIONS.READ_PRODUCTS, PERMISSIONS.WRITE_PRODUCTS, PERMISSIONS.DELETE_PRODUCTS]
}
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Role Not Working**
- Check if role is properly set in database
- Verify JWT token includes role
- Ensure middleware is properly configured

#### **2. Admin Panel Not Accessible**
- Verify user has ADMIN role
- Check middleware configuration
- Ensure session is valid

#### **3. Navigation Not Switching**
- Check RoleBasedNavigation component
- Verify session data includes role
- Clear browser cache and cookies

### **Debug Commands**
```bash
# Check user role in database
npx prisma studio

# Verify JWT token
# Check browser dev tools > Application > Cookies

# Test API endpoints
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/session
```

## 📚 **Related Documentation**
- [API Reference](./api.md) - Admin APIs
- [Architecture](./architecture.md) - System overview
- [Debugging](./debugging.md) - Common issues
