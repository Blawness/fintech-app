# Investment API Documentation

## 🚀 **Investment Platform APIs**

### **Products API**

#### `GET /api/products`
Get all active investment products.

**Response:**
```json
[
  {
    "id": "cuid",
    "name": "Reksa Dana Pasar Uang Syariah",
    "type": "REKSADANA",
    "category": "PASAR_UANG",
    "riskLevel": "KONSERVATIF",
    "expectedReturn": 4.5,
    "minInvestment": 10000,
    "currentPrice": 1000,
    "description": "Reksa dana pasar uang syariah...",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `POST /api/products`
Create new investment product.

**Request Body:**
```json
{
  "name": "Product Name",
  "type": "REKSADANA",
  "category": "PASAR_UANG",
  "riskLevel": "KONSERVATIF",
  "expectedReturn": 4.5,
  "minInvestment": 10000,
  "currentPrice": 1000,
  "description": "Product description"
}
```

### **Portfolio API**

#### `GET /api/portfolio/[userId]`
Get user portfolio with holdings and asset allocation.

**Response:**
```json
{
  "portfolio": {
    "id": "cuid",
    "userId": "cuid",
    "totalValue": 1000000,
    "totalGain": 50000,
    "totalGainPercent": 5.0,
    "riskProfile": "KONSERVATIF",
    "rdnBalance": 500000,
    "tradingBalance": 0,
    "assetAllocation": {
      "moneyMarket": 30.0,
      "bonds": 40.0,
      "stocks": 20.0,
      "mixed": 10.0,
      "cash": 0.0
    },
    "monthlyStreak": 5
  },
  "holdings": [
    {
      "id": "cuid",
      "productId": "cuid",
      "units": 100,
      "averagePrice": 1000,
      "currentValue": 105000,
      "gain": 5000,
      "gainPercent": 5.0,
      "product": {
        "name": "Reksa Dana Pasar Uang",
        "type": "REKSADANA"
      }
    }
  ]
}
```

#### `PUT /api/portfolio/[userId]`
Update portfolio settings.

**Request Body:**
```json
{
  "riskProfile": "MODERAT",
  "rdnBalance": 1000000,
  "tradingBalance": 500000
}
```

### **Transactions API**

#### `GET /api/transactions/[userId]`
Get user transactions with optional filtering.

**Query Parameters:**
- `type`: 'order' | 'history'
- `status`: 'PENDING' | 'COMPLETED' | 'CANCELLED'

**Response:**
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "productId": "cuid",
    "type": "BUY",
    "amount": 100000,
    "units": 100,
    "price": 1000,
    "totalValue": 100000,
    "status": "COMPLETED",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "name": "Reksa Dana Pasar Uang",
      "type": "REKSADANA"
    }
  }
]
```

#### `POST /api/transactions/[userId]`
Create new transaction.

**Request Body:**
```json
{
  "productId": "cuid",
  "type": "BUY",
  "amount": 100000,
  "units": 100,
  "price": 1000
}
```

### **Watchlist API**

#### `GET /api/watchlist/[userId]`
Get user watchlist.

**Response:**
```json
[
  {
    "id": "cuid",
    "userId": "cuid",
    "productId": "cuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "name": "Reksa Dana Saham",
      "type": "REKSADANA",
      "currentPrice": 2500
    }
  }
]
```

#### `POST /api/watchlist/[userId]`
Add product to watchlist.

**Request Body:**
```json
{
  "productId": "cuid"
}
```

#### `DELETE /api/watchlist/[userId]?productId=cuid`
Remove product from watchlist.

### **Profile API**

#### `GET /api/profile/[userId]`
Get user profile information.

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "riskProfile": "KONSERVATIF",
  "rdnBalance": 1000000,
  "tradingBalance": 0
}
```

#### `PUT /api/profile/[userId]`
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "riskProfile": "MODERAT"
}
```

## 🔧 **Error Handling**

All APIs return consistent error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 📊 **Data Models**

### **InvestmentProduct**
```typescript
interface InvestmentProduct {
  id: string
  name: string
  type: 'REKSADANA' | 'OBLIGASI' | 'SBN'
  category: 'PASAR_UANG' | 'OBLIGASI' | 'CAMPURAN' | 'SAHAM'
  riskLevel: 'KONSERVATIF' | 'MODERAT' | 'AGRESIF'
  expectedReturn: number
  minInvestment: number
  currentPrice: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### **Portfolio**
```typescript
interface Portfolio {
  id: string
  userId: string
  totalValue: number
  totalGain: number
  totalGainPercent: number
  riskProfile: string
  rdnBalance: number
  tradingBalance: number
  assetAllocation: {
    moneyMarket: number
    bonds: number
    stocks: number
    mixed: number
    cash: number
  }
  monthlyStreak: number
  createdAt: string
  updatedAt: string
}
```

### **Transaction**
```typescript
interface Transaction {
  id: string
  userId: string
  productId: string
  type: 'BUY' | 'SELL'
  amount: number
  units: number
  price: number
  totalValue: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
}
```
