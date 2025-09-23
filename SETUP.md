# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up PostgreSQL Database

### Option A: Using the setup script
1. Update the password in `scripts/setup-db.js`
2. Run: `node scripts/setup-db.js`

### Option B: Manual setup
1. Create database: `createdb cryptobot_pro`
2. Or use psql: `psql -U postgres` then `CREATE DATABASE cryptobot_pro;`

## 3. Environment Variables
Create `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cryptobot_pro"

# Gemini API Key
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Database Setup
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 5. Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com)
2. Sign up and create an API key
3. Add to `.env.local`

## 6. Start the App
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## Features Added
- ✅ Navigation bar with authentication
- ✅ Login/Signup functionality
- ✅ PostgreSQL database integration
- ✅ User authentication with JWT
- ✅ Beautiful landing page with animations
- ✅ Responsive design for mobile/desktop
- ✅ Chart analysis history storage
- ✅ Professional crypto trading signals
- ✅ Advanced AI with Gemini 2.0 Flash
