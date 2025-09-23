#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Crypto Bot 4.0 - Deployment Setup\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('📋 Environment Variables Setup:');
console.log('================================\n');

console.log('1. DATABASE_URL');
console.log('   - Vercel Postgres: Get from Vercel Dashboard > Storage > Postgres');
console.log('   - External DB: Get from your database provider\n');

console.log('2. JWT_SECRET (Generated for you):');
console.log(`   ${jwtSecret}\n`);

console.log('3. GEMINI_API_KEY');
console.log('   - Get from: https://makersuite.google.com/app/apikey\n');

console.log('4. NEXTAUTH_URL');
console.log('   - Development: http://localhost:3000');
console.log('   - Production: https://your-app-name.vercel.app\n');

console.log('📝 Add these to your Vercel Environment Variables:');
console.log('==================================================');
console.log(`DATABASE_URL=your_postgres_connection_string`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`GEMINI_API_KEY=your_gemini_api_key`);
console.log(`NEXTAUTH_URL=https://your-app-name.vercel.app\n`);

console.log('🔧 Deployment Commands:');
console.log('=======================');
console.log('1. Install Vercel CLI: npm i -g vercel');
console.log('2. Login: vercel login');
console.log('3. Deploy: vercel');
console.log('4. Production: vercel --prod\n');

console.log('✅ Checklist:');
console.log('=============');
console.log('□ Database created and connection string ready');
console.log('□ Gemini API key obtained');
console.log('□ Environment variables added to Vercel');
console.log('□ Code pushed to GitHub');
console.log('□ Vercel project connected to GitHub repo\n');

console.log('🎉 Ready to deploy! Run: vercel');
