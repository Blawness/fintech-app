# API Reference

## 🔗 **Authentication APIs**

### `POST /api/auth/signup`
Register new user account.
```typescript
// Request
{
  "name": "string",
  "email": "user@example.com",
  "password": "string"
}

// Response
{
  "success": true,
  "user": {
    "id": "string",
    "email": "user@example.com",
    "name": "string"
  }
}
```

### `POST /api/auth/[...nextauth]`
NextAuth.js authentication endpoints (login, logout, session).

## 📊 **Progress APIs**

### `POST /api/progress/save`
Save user lesson progress and quiz results.
```typescript
// Request (requires auth)
{
  "lessonId": "string",
  "quizScore": 100 // 0-100
}

// Response
{
  "success": true,
  "progress": { /* UserProgress object */ }
}
```

### `GET /api/progress/[userId]`
Get user's learning statistics.
```typescript
// Response
{
  "progress": [/* UserProgress[] */],
  "stats": {
    "currentStreak": 5,
    "totalLessonsCompleted": 3,
    "averageScore": 85
  }
}
```

## 💰 **Investment APIs**

### `GET /api/products`
Get all active investment products.
```typescript
// Response
[
  {
    "id": "string",
    "name": "Reksa Dana Pasar Uang Syariah",
    "type": "REKSADANA",
    "category": "PASAR_UANG",
    "riskLevel": "KONSERVATIF",
    "expectedReturn": 4.5,
    "minInvestment": 10000,
    "currentPrice": 1000,
    "description": "string",
    "isActive": true
  }
]
```

### `GET /api/portfolio/[userId]`
Get user portfolio with holdings and asset allocation.
```typescript
// Response
{
  "portfolio": {
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
    }
  },
  "holdings": [/* PortfolioHolding[] */]
}
```

### `POST /api/transactions/[userId]`
Create new investment transaction.
```typescript
// Request
{
  "productId": "string",
  "type": "BUY",
  "amount": 100000,
  "units": 100,
  "price": 1000
}

// Response
{
  "id": "string",
  "status": "PENDING",
  "totalValue": 100000
}
```

### `GET /api/transactions/[userId]`
Get user transactions with optional filtering.
```typescript
// Query params: ?type=order&status=PENDING
// Response
[
  {
    "id": "string",
    "type": "BUY",
    "amount": 100000,
    "units": 100,
    "price": 1000,
    "status": "COMPLETED",
    "product": {
      "name": "Reksa Dana Pasar Uang",
      "type": "REKSADANA"
    }
  }
]
```

### `GET /api/watchlist/[userId]`
Get user watchlist.
```typescript
// Response
[
  {
    "id": "string",
    "productId": "string",
    "product": {
      "name": "Reksa Dana Saham",
      "currentPrice": 2500
    }
  }
]
```

### `POST /api/watchlist/[userId]`
Add product to watchlist.
```typescript
// Request
{
  "productId": "string"
}
```

### `GET /api/profile/[userId]`
Get user profile information.
```typescript
// Response
{
  "name": "John Doe",
  "email": "john@example.com",
  "riskProfile": "KONSERVATIF",
  "rdnBalance": 1000000,
  "tradingBalance": 0
}
```

## 📚 **Lesson APIs**

### `GET /api/lessons/today`
Get daily lesson content and quiz.
```typescript
// Response
{
  "id": "string",
  "title": "string",
  "content": "string",
  "day": 1,
  "quiz": {
    "id": "string",
    "question": "string",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "answer": 1 // index of correct answer
  }
}
```

## 🔒 **Authentication Required**
All APIs except signup require authentication via NextAuth.js session.

## 📡 **Error Handling**
```typescript
// Standard error response
{
  "error": "Error message",
  "status": 400
}
```

## 🔄 **Data Flow**

### **Investment Flow**
1. User logs in → Session created
2. Dashboard loads → Calls `/api/portfolio/[userId]` & `/api/products`
3. User browses products → Calls `/api/products`
4. User invests → Calls `/api/transactions/[userId]`
5. Portfolio updates → Real-time calculation
6. User views history → Calls `/api/transactions/[userId]`

### **Educational Flow**
1. User logs in → Session created
2. Lesson page → Calls `/api/lessons/today`
3. Quiz submission → Calls `/api/progress/save`
4. Progress updates → Triggers streak calculation

## 🗄️ **Database Relations**
```
User (1) ←→ (1) Portfolio (1) ←→ (N) PortfolioHolding (N) → (1) InvestmentProduct
User (1) ←→ (N) InvestmentTransaction (N) → (1) InvestmentProduct
User (1) ←→ (N) Watchlist (N) → (1) InvestmentProduct
User (1) ←→ (N) UserProgress (N) → (1) Lesson
Lesson (1) ←→ (1) Quiz
```

## ⚡ **Performance Notes**
- APIs use Prisma for efficient queries
- Progress calculations happen server-side
- Session data cached in JWT tokens
- Database connections pooled automatically

