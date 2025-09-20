#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  No .env file found, using default port 3000');
    return { PORT: '3000' };
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        envVars[key.trim()] = value.trim();
      }
    }
  });

  return envVars;
}

// Get port from environment
function getPort() {
  const envVars = loadEnvFile();
  const port = process.env.PORT || envVars.PORT || '3000';
  console.log(`🚀 Starting application on port ${port}`);
  return port;
}

// Start the Next.js application
function startApp() {
  const port = getPort();
  
  // Set the PORT environment variable
  process.env.PORT = port;
  
  // Start Next.js with the specified port
  const nextProcess = spawn('npx', ['next', 'start', '-p', port], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down application...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down application...');
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });

  nextProcess.on('close', (code) => {
    console.log(`Application exited with code ${code}`);
    process.exit(code);
  });

  nextProcess.on('error', (error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}

// Run the application
startApp();
