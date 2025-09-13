# Market Simulator Documentation

## 🎯 **Overview**

Market Simulator adalah sistem yang secara otomatis mengupdate harga produk investasi berdasarkan expected return dan tingkat risiko. Sistem ini mensimulasikan pergerakan pasar yang realistis dengan volatilitas yang sesuai dengan profil risiko produk.

## 🚀 **Features**

### 1. **Automatic Price Updates**
- Update harga setiap 10 detik (dapat dikonfigurasi)
- Algoritma yang mengikuti expected return
- Volatilitas berdasarkan tingkat risiko

### 2. **Risk-Based Volatility**
- **Konservatif**: 2% volatilitas (pergerakan stabil)
- **Moderat**: 5% volatilitas (pergerakan sedang)
- **Agresif**: 10% volatilitas (pergerakan volatile)

### 3. **Price History Tracking**
- Menyimpan riwayat perubahan harga
- Tracking perubahan dalam persentase
- Data historis untuk analisis

### 4. **Portfolio Auto-Update**
- Portfolio otomatis terupdate dengan harga baru
- Return calculation real-time
- Gain/loss calculation otomatis

## 🔧 **API Endpoints**

### **Market Simulation**
```
POST /api/market/simulate
```
Menjalankan simulasi pasar sekali untuk semua produk aktif.

**Response:**
```json
{
  "message": "Market simulation completed",
  "updated": 5,
  "products": [
    {
      "id": "cuid",
      "name": "Reksa Dana Pasar Uang",
      "oldPrice": 1000,
      "newPrice": 1002.5,
      "change": 2.5,
      "changePercent": 0.25
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **Market Control**
```
POST /api/market/control
```
Mengontrol market simulator (start/stop/status).

**Request Body:**
```json
{
  "action": "start|stop|status",
  "interval": 10000
}
```

### **Price History**
```
GET /api/market/history?productId=cuid&hours=24&limit=100
```
Mendapatkan riwayat perubahan harga.

**Query Parameters:**
- `productId`: ID produk (optional)
- `hours`: Jumlah jam ke belakang (default: 24)
- `limit`: Maksimal record (default: 100)

## 📊 **Algorithm**

### **Price Calculation**
```typescript
// 1. Calculate trend based on expected return
const trendPerInterval = expectedReturn / intervalsPerYear

// 2. Generate random factor
const randomFactor = (Math.random() - 0.5) * 2

// 3. Calculate price change
const trendChange = currentPrice * trendPerInterval * 0.7  // 70% trend
const randomChange = currentPrice * volatility * randomFactor * 0.3  // 30% random

// 4. Apply change
const newPrice = currentPrice + trendChange + randomChange
```

### **Volatility Configuration**
```typescript
const RISK_VOLATILITY = {
  'KONSERVATIF': 0.02,  // 2%
  'MODERAT': 0.05,      // 5%
  'AGRESIF': 0.10       // 10%
}
```

## 🎮 **Admin Controls**

### **Market Control Panel**
- Start/Stop simulator
- Set interval update
- Manual simulation
- View price history
- Real-time status monitoring

### **Access Control**
- Hanya admin yang dapat mengontrol simulator
- Authentication required untuk semua endpoints

## 📈 **Database Schema**

### **PriceHistory Table**
```sql
CREATE TABLE price_history (
  id VARCHAR(191) PRIMARY KEY,
  productId VARCHAR(191) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  change DECIMAL(10,2) NOT NULL,
  changePercent DECIMAL(5,2) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES investment_products(id)
);
```

## 🔄 **Starting Market Simulator**

### **Method 1: Via Admin Panel (Recommended)**
1. Login sebagai admin
2. Buka `/admin/market`
3. Klik tombol "Start"
4. Set interval (default: 10 detik)

### **Method 2: Via API**
```bash
# Start simulator
curl -X POST http://localhost:3000/api/market/start \
  -H "Content-Type: application/json" \
  -d '{"interval": 10000}'
```

### **Method 3: Via Script**
```bash
# Start market simulator
npm run market:start

# Test market simulator
npm run market:test
```

## 📱 **Frontend Integration**

### **Real-time Updates**
- Portfolio values update otomatis
- Price changes terlihat real-time
- Return calculations update otomatis

### **Admin Dashboard**
- Market control panel
- Price history visualization
- Real-time monitoring

## 🛠️ **Configuration**

### **Environment Variables**
```env
NODE_ENV=production  # Auto-start simulator
```

### **Customizable Parameters**
- Update interval (default: 10 seconds)
- Volatility levels per risk
- Trend vs random factor ratio
- Price minimum threshold

## 🔍 **Monitoring**

### **Logs**
- Market simulation completion logs
- Error handling and logging
- Performance monitoring

### **Status Endpoints**
- Real-time status checking
- Health monitoring
- Error reporting

## 🚨 **Error Handling**

- Graceful error handling
- Database transaction safety
- Portfolio update rollback
- Price validation (minimum 1% of original)

## 📋 **Best Practices**

1. **Start simulator** setelah semua produk ter-seed
2. **Monitor performance** untuk interval yang optimal
3. **Backup price history** secara berkala
4. **Test thoroughly** sebelum production deployment

## 🔧 **Troubleshooting**

### **Simulator tidak start**
- Check environment variables
- Verify database connection
- Check admin permissions

### **Harga tidak berubah**
- Verify produk aktif
- Check expected return values
- Monitor error logs

### **Portfolio tidak update**
- Check portfolio holdings
- Verify price calculation
- Monitor database transactions
