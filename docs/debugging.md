# Debugging Guide

## 🚨 **Common Issues & Solutions**

### **Database Connection Errors**

#### **Error: Can't reach database server**
```
Error: P1001: Can't reach database server at `localhost:3306`
```
**Solutions:**
1. Check `.env.local` DATABASE_URL format
2. Verify MySQL server is running
3. Test connection: `mysql -u username -p -h host`
4. Check firewall/port blocking

#### **Error: Environment variable not found: DATABASE_URL**
```
Error: Environment variable not found: DATABASE_URL.
```
**Solutions:**
1. Ensure `.env.local` exists in project root
2. Check file contains `DATABASE_URL="mysql://..."`
3. Restart development server: `npm run dev`
4. Clear Prisma cache: `npx prisma generate --force`

### **Authentication Issues**

#### **Error: NEXTAUTH_SECRET not found**
**Solutions:**
1. Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
2. Add to `.env.local`: `NEXTAUTH_SECRET="generated-secret"`
3. Restart server

#### **Session not persisting**
**Debug steps:**
1. Check browser cookies for `next-auth.session-token`
2. Verify `NEXTAUTH_URL` matches current domain
3. Test API route: `/api/auth/session`

### **Build & Runtime Errors**

#### **Error: Module not found**
**Common causes:**
1. Missing dependency: `npm install`
2. Case sensitivity (Windows vs Unix)
3. Import path issues

#### **TypeScript Errors**
**Quick fixes:**
1. `npm run build` to see all errors
2. Check `@types/*` packages installed
3. Verify import statements

### **Component Issues**

#### **Styling not applying**
**Debug steps:**
1. Check Tailwind classes in browser devtools
2. Verify `globals.css` imported in `layout.tsx`
3. Test with inline styles as fallback

#### **Component not rendering**
**Check:**
1. Import statement correct
2. Component exported properly
3. Props passed correctly

## 🛠️ **Debug Commands**

### **Database Debugging**
```bash
# Test connection
npx prisma db push --preview-feature

# View generated client
npx prisma generate --schema=./prisma/schema.prisma

# Reset database
npx prisma migrate reset --force
```

### **Next.js Debugging**
```bash
# Clear cache
rm -rf .next && npm run dev

# Build with verbose output
npm run build --verbose

# Check TypeScript
npx tsc --noEmit
```

### **Network Debugging**
```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/lessons/today

# Check database connectivity
mysql -u user -p -h host -e "SELECT 1"
```

## 🔍 **Browser DevTools**

### **Console Logs**
- Check for JavaScript errors
- Look for network request failures
- Monitor React component lifecycle

### **Network Tab**
- Verify API calls succeed (200 status)
- Check request/response payloads
- Monitor loading times

### **Application Tab**
- Inspect localStorage/sessionStorage
- Check service worker status
- Verify cookies are set

## 📊 **Performance Debugging**

### **Slow Page Loads**
**Check:**
1. Bundle size: `npm run build && npm run analyze`
2. Database queries: Enable Prisma query logging
3. Image optimization: Use Next.js Image component

### **Memory Leaks**
**Debug:**
1. React DevTools Profiler
2. Chrome Memory tab
3. Check for unmounted component updates

## 🔧 **Environment Setup**

### **Development Environment**
```bash
# Check Node version
node --version  # Should be 18+

# Verify npm
npm --version

# Check MySQL
mysql --version

# Verify Prisma
npx prisma --version
```

### **Environment Variables**
Required in `.env.local`:
```env
DATABASE_URL="mysql://user:pass@host:port/db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

## 🚀 **Quick Troubleshooting Flow**

### **App Won't Start**
1. ✅ `npm install` - Install dependencies
2. ✅ Check `.env.local` - Environment variables
3. ✅ `npx prisma generate` - Generate Prisma client
4. ✅ `npm run dev` - Start development server

### **Database Issues**
1. ✅ Verify MySQL running
2. ✅ Test connection manually
3. ✅ Check DATABASE_URL format
4. ✅ Run `npx prisma db push`

### **Authentication Problems**
1. ✅ Check NEXTAUTH_SECRET
2. ✅ Verify NEXTAUTH_URL
3. ✅ Clear browser cookies
4. ✅ Test `/api/auth/session`

### **Styling Problems**
1. ✅ Verify Tailwind config
2. ✅ Check globals.css imported
3. ✅ Test with browser devtools
4. ✅ Clear .next cache

## 📝 **Error Logging**

### **Client-Side Logging**
```typescript
// Add to components for debugging
console.log('Component mounted:', props)
console.error('API Error:', error)
```

### **Server-Side Logging**
```typescript
// In API routes
console.log('Request received:', req.method, req.url)
console.error('Database error:', error.message)
```

### **Prisma Logging**
```typescript
// In lib/prisma.ts
export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
})
```

## 🆘 **Getting Help**

### **Issue Checklist**
- [ ] Node.js version 18+
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database accessible
- [ ] Prisma client generated
- [ ] No TypeScript errors
- [ ] Browser cache cleared

### **Support Resources**
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
- Tailwind docs: https://tailwindcss.com/docs
