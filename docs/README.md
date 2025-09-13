# Fintech App Documentation

## 🚀 **Market Simulator - NEW FEATURE!**

### **Overview**
Sistem Market Simulator yang secara otomatis mengupdate harga produk investasi berdasarkan expected return dan tingkat risiko. Harga akan berubah setiap 10 detik dengan volatilitas yang sesuai dengan profil risiko produk.

### **Key Features**
- ✅ **Auto Price Updates**: Update harga setiap 10 detik
- ✅ **Risk-Based Volatility**: 
  - Konservatif: 2% volatilitas
  - Moderat: 5% volatilitas  
  - Agresif: 10% volatilitas
- ✅ **Price History Tracking**: Riwayat perubahan harga
- ✅ **Portfolio Auto-Update**: Portfolio terupdate real-time
- ✅ **Admin Control Panel**: Kontrol penuh untuk admin

### **Quick Start**

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Start Market Simulator**:
   ```bash
   # Method 1: Via Admin Panel (Recommended)
   # - Login sebagai admin
   # - Buka /admin/market
   # - Klik "Start" button
   
   # Method 2: Via Script
   npm run market:start
   
   # Method 3: Via API
   curl -X POST http://localhost:3000/api/market/start
   ```

3. **Monitor Real-time**:
   - Portfolio values update otomatis
   - Price changes terlihat real-time
   - Return calculations update otomatis

### **API Endpoints**

```bash
# Manual simulation
POST /api/market/simulate

# Control simulator (admin only)
POST /api/market/control
{
  "action": "start|stop|status",
  "interval": 10000
}

# Get price history
GET /api/market/history?hours=24&limit=100
```

### **Algorithm**
- 70% mengikuti expected return trend
- 30% pergerakan random berdasarkan volatilitas
- Harga minimum 1% dari harga asli (mencegah negatif)

---

## 📚 **Documentation Index**

### **Core Documentation**
- [Architecture](architecture.md) - System architecture overview
- [API Reference](api.md) - Complete API documentation
- [Investment APIs](api-investment.md) - Investment-specific APIs
- [RBAC](rbac.md) - Role-based access control
- [Styling](styling.md) - UI/UX guidelines

### **New Features**
- [Market Simulator](market-simulator.md) - **NEW!** Market simulation system
- [Debugging Guide](debugging.md) - Troubleshooting guide

### **Quick Reference**
- [Quick Reference](quick-reference.md) - Common commands and shortcuts

---

## 🛠️ **Setup & Installation**

### **Prerequisites**
- Node.js 18+
- MySQL database
- npm/yarn

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd fintech-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### **Database Seeding**
```bash
# Seed admin user
npx prisma db seed --file=prisma/seed-admin.ts

# Seed investment products
npx prisma db seed --file=prisma/seed-investment.ts

# Seed all data
npx prisma db seed
```

---

## 🎯 **Features Overview**

### **User Features**
- 📊 **Investment Platform**: Buy/sell investment products
- 💼 **Portfolio Management**: Track investments and returns
- 📈 **Real-time Updates**: Live price updates and portfolio values
- 📚 **Financial Education**: Interactive lessons and quizzes
- 📱 **Mobile-First Design**: Responsive and user-friendly

### **Admin Features**
- 👥 **User Management**: Manage users and roles
- 📊 **Product Management**: Create/edit investment products
- 💰 **Balance Management**: Inject balances for users
- 📈 **Analytics Dashboard**: Track platform performance
- 🎮 **Market Simulator**: Control market simulation

### **Technical Features**
- 🔐 **Authentication**: NextAuth.js with role-based access
- 🗄️ **Database**: Prisma ORM with MySQL
- 🎨 **UI Components**: Custom Tailwind CSS components
- 📱 **Responsive Design**: Mobile-first approach
- 🔄 **Real-time Updates**: Live data synchronization

---

## 🚀 **Getting Started**

### **For Users**
1. Register/Login at `/auth/signup` or `/auth/signin`
2. Complete your risk profile
3. Explore investment products at `/explore`
4. Start investing at `/investment`
5. Monitor your portfolio at `/portfolio`

### **For Admins**
1. Login with admin credentials
2. Access admin dashboard at `/admin/dashboard`
3. Manage products at `/admin/products`
4. Control market simulator at `/admin/market`
5. Monitor users at `/admin/users`

---

## 🔧 **Development**

### **Project Structure**
```
fintech-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   └── (pages)/           # User pages
├── components/            # React components
├── lib/                   # Utility libraries
├── prisma/               # Database schema & seeds
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

### **Key Technologies**
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (recommended)

---

## 📞 **Support**

### **Common Issues**
- Check [Debugging Guide](debugging.md)
- Review [API Documentation](api.md)
- Check database connection
- Verify environment variables

### **Market Simulator Issues**
- Ensure products are seeded
- Check admin permissions
- Monitor console logs
- Verify database transactions

---

## 🎉 **What's New**

### **Latest Updates**
- ✅ **Market Simulator**: Real-time price simulation
- ✅ **Price History**: Track price changes over time
- ✅ **Admin Controls**: Full market control panel
- ✅ **Auto Portfolio Updates**: Real-time portfolio calculations
- ✅ **Risk-Based Volatility**: Realistic market simulation

### **Coming Soon**
- 📊 Advanced analytics
- 📈 Price charts and graphs
- 🔔 Price alerts
- 📱 Mobile app
- 🌍 Multi-language support

---

*Last updated: January 2024*