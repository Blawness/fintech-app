# Custom Port Start Scripts

This document explains how to use the custom start scripts that read the port configuration from your `.env` file.

## Environment Configuration

Add a `PORT` variable to your `.env` file:

```env
# App
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Available Scripts

### Development Server
```bash
npm run dev
```
- Reads port from `.env` file
- Runs Prisma generate and db push
- Starts Next.js development server on the specified port

### Production Server
```bash
npm run start
```
- Reads port from `.env` file
- Starts Next.js production server on the specified port

### Alternative Methods

#### Using the scripts directly:
```bash
# Development
node scripts/dev-with-port.js

# Production
node scripts/start-with-port.js
```

#### Using the batch/shell scripts:
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

## Default Fallback

If no `PORT` is specified in the `.env` file, the scripts will default to port 3000.

## Original Scripts

The original Next.js scripts are still available:
- `npm run dev:default` - Original development script
- `npm run start:default` - Original production script

## Features

- ✅ Reads port from `.env` file
- ✅ Graceful shutdown handling (Ctrl+C)
- ✅ Error handling and logging
- ✅ Cross-platform compatibility
- ✅ Fallback to default port if not specified
