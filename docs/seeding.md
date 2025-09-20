# Database Seeding Guide

This document explains the database seeding system for the fintech learning app.

## Available Seeding Scripts

### 1. Complete Seeding (Recommended)
```bash
npm run db:seed:complete
```
**What it does:**
- Cleans up all existing data
- Creates test user and admin user
- Creates portfolio for test user
- Creates lessons with quizzes
- Creates investment products
- Creates system settings

**Use this for:** Fresh database setup or complete reset

### 2. Individual Seeding Scripts

#### Basic Seeding
```bash
npm run db:seed
```
Creates test user, portfolio, lessons, quizzes, investment products, and system settings.

#### Admin User Only
```bash
npm run db:seed:admin
```
Creates/updates admin user with credentials.

#### Investment Products Only
```bash
npm run db:seed:investment
```
Creates investment products only.

#### Combined Seeding
```bash
npm run db:seed:all
```
Runs basic seeding followed by admin seeding.

## Default Credentials

### Test User
- **Email:** test@example.com
- **Password:** password123
- **Role:** USER
- **Risk Profile:** KONSERVATIF

### Admin User
- **Email:** admin@fintech.com
- **Password:** admin123
- **Role:** ADMIN
- **Risk Profile:** MODERAT

⚠️ **Important:** Change these passwords after first login!

## What Gets Created

### Users
- 1 test user for development/testing
- 1 admin user for system administration

### Portfolio
- Portfolio for test user with 1,000,000 RDN balance
- Conservative risk profile

### Lessons & Quizzes
- 3 financial literacy lessons
- Each lesson has a corresponding quiz
- Topics: Emergency funds, Investment basics, Debt management

### Investment Products
- 6 investment products covering different risk levels
- Reksa Dana (Money Market, Bond, Mixed, Stock)
- Government Bonds (ORI, Sukuk)
- Various risk profiles and expected returns

### System Settings
- Market status and hours
- Trading fees and minimum amounts
- System configuration parameters

## Database Cleanup

The complete seeding script automatically cleans up existing data before seeding. This ensures:
- No duplicate data
- Fresh start every time
- Consistent database state

## Error Handling

All seeding scripts include:
- Comprehensive error handling
- Detailed logging
- Graceful failure with proper cleanup
- Clear success/failure messages

## Usage Examples

### Fresh Development Setup
```bash
# Reset database and seed everything
npm run db:push
npm run db:seed:complete
```

### Add Admin User to Existing Database
```bash
npm run db:seed:admin
```

### Update Investment Products
```bash
npm run db:seed:investment
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check your `.env` file and database status
2. **Permission errors**: Ensure database user has proper permissions
3. **Duplicate key errors**: Use complete seeding to clean up first

### Reset Everything
```bash
# Complete reset
npm run db:push
npm run db:seed:complete
```

## File Structure

```
prisma/
├── seed.ts              # Basic seeding (test user + data)
├── seed-admin.ts        # Admin user only
├── seed-investment.ts   # Investment products only
└── seed-complete.ts     # Complete seeding (recommended)
```

## Best Practices

1. **Use complete seeding** for fresh setups
2. **Use individual scripts** for specific updates
3. **Always backup** production data before seeding
4. **Change default passwords** immediately
5. **Test seeding** in development before production
