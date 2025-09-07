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
1. User logs in → Session created
2. Dashboard loads → Calls `/api/progress/[userId]`
3. Lesson page → Calls `/api/lessons/today`
4. Quiz submission → Calls `/api/progress/save`
5. Progress updates → Triggers streak calculation

## 🗄️ **Database Relations**
```
User (1) ←→ (N) UserProgress (N) → (1) Lesson
Lesson (1) ←→ (1) Quiz
```

## ⚡ **Performance Notes**
- APIs use Prisma for efficient queries
- Progress calculations happen server-side
- Session data cached in JWT tokens
- Database connections pooled automatically
