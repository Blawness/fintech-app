# Market Simulator Setup Guide

## 🚨 **Error Fix: PrismaClient Browser Issue**

### **Problem**
```
Error: PrismaClient is unable to run in this browser environment
```

### **Solution**
Market simulator sekarang berjalan di server-side saja, bukan di client-side.

---

## 🚀 **Setup Instructions**

### **Step 1: Start Development Server**
```bash
npm run dev
```

### **Step 2: Start Market Simulator**

#### **Option A: Via Admin Panel (Recommended)**
1. Buka browser ke `http://localhost:3000`
2. Login sebagai admin
3. Navigate ke `/admin/market`
4. Klik tombol "Start"
5. Set interval (default: 10 detik)

#### **Option B: Via Script**
```bash
# Di terminal terpisah
npm run market:start
```

#### **Option C: Via API**
```bash
# Start simulator
curl -X POST http://localhost:3000/api/market/start \
  -H "Content-Type: application/json" \
  -d '{"interval": 10000}'

# Check status
curl http://localhost:3000/api/market/control
```

### **Step 3: Verify It's Working**
1. Buka `/admin/market` di browser
2. Lihat status "Running"
3. Monitor price changes di "Last Market Update"
4. Check price history dengan tombol "Show History"

---

## 🔧 **Troubleshooting**

### **Market Simulator Not Starting**
1. **Check Server**: Pastikan `npm run dev` sudah running
2. **Check Admin Access**: Login sebagai admin dulu
3. **Check Database**: Pastikan database terhubung
4. **Check Products**: Pastikan ada produk investasi yang aktif

### **No Price Changes**
1. **Check Products**: Pastikan ada produk dengan `isActive: true`
2. **Check Expected Return**: Pastikan produk punya `expectedReturn` > 0
3. **Check Console**: Lihat log di terminal untuk error

### **Portfolio Not Updating**
1. **Check Holdings**: Pastikan user punya portfolio holdings
2. **Check Database**: Pastikan transaksi database berhasil
3. **Check API**: Test `/api/portfolio/[userId]` endpoint

---

## 📊 **How It Works**

### **Server-Side Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │───▶│  Market Control  │───▶│ Market Simulator│
│   (Client)      │    │     API          │    │   (Server)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Database       │
                       │   (Price Update) │
                       └──────────────────┘
```

### **Price Update Flow**
1. Market simulator berjalan di server
2. Setiap 10 detik, update harga semua produk
3. Simpan price history ke database
4. Update portfolio holdings
5. Client dapat melihat perubahan via API

---

## 🎯 **Testing**

### **Manual Test**
```bash
# Test market simulation
curl -X POST http://localhost:3000/api/market/simulate

# Test price history
curl http://localhost:3000/api/market/history?hours=1&limit=10

# Test products
curl http://localhost:3000/api/products
```

### **Admin Panel Test**
1. Buka `/admin/market`
2. Klik "Simulate Once"
3. Lihat hasil di "Last Market Update"
4. Klik "Show History" untuk lihat riwayat

---

## 📝 **Notes**

- Market simulator hanya berjalan di server-side
- Tidak ada auto-start di production
- Harus di-start manual via admin panel atau API
- PrismaClient tidak bisa berjalan di browser
- Semua database operations di server-side

---

## 🆘 **Still Having Issues?**

1. **Check Logs**: Lihat console di terminal
2. **Check Network**: Lihat Network tab di browser
3. **Check Database**: Pastikan database connection OK
4. **Restart Server**: Stop dan start ulang `npm run dev`
5. **Clear Cache**: Clear browser cache dan restart

---

*Last updated: January 2024*
