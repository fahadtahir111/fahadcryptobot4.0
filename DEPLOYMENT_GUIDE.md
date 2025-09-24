# 🚀 Vercel Deployment Guide - Crypto Bot 4.0

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - We'll use Vercel Postgres or external service
4. **Gemini API Key** - For AI chart analysis

## 🗄️ Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Click on "Storage" tab
3. Click "Create Database" → "Postgres"
4. Choose a name (e.g., `crypto-bot-db`)
5. Select region closest to your users
6. Click "Create"
7. Copy the connection string

### Option B: External Database (Neon, Supabase, etc.)
1. Sign up for [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a new PostgreSQL database
3. Copy the connection string

## 🔧 Step 2: Environment Variables Setup

### Required Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# JWT Secret (Generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-here"

# Gemini AI API Key
GEMINI_API_KEY="your-gemini-api-key-here"

# Next.js URL (Will be set automatically by Vercel)
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

### How to Generate JWT Secret:
```bash
# Run this command in your terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Step 3: Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (Your account)
# - Link to existing project? N
# - Project name? crypto-bot-4-0
# - Directory? ./
# - Override settings? N
```

### Method 2: GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   - **Install Command**: `npm install`

## ⚙️ Step 4: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Production, Preview, Development |
| `JWT_SECRET` | Your generated JWT secret | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Gemini API key | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |

## 🗃️ Step 5: Database Migration

After deployment, run database migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

Or use Vercel's built-in migration:
1. Go to your project dashboard
2. Click "Functions" tab
3. Create a new API route: `api/migrate/route.ts`
4. Deploy and visit: `https://your-app.vercel.app/api/migrate`

## 🔍 Step 6: Verify Deployment

1. **Check Build Logs**: Go to "Deployments" tab in Vercel dashboard
2. **Test API Endpoints**:
   - `https://your-app.vercel.app/api/test-db` - Database connection
   - `https://your-app.vercel.app/api/auth/signup` - User registration
3. **Test Chart Analysis**: Upload a chart image
4. **Check Database**: Verify data is being stored

## 🛠️ Step 7: Production Optimizations

### Update next.config.js:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['your-app.vercel.app'],
  },
  // Enable server-side features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

module.exports = nextConfig;
```

### Update package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
```

## 🔐 Step 8: Security & Performance

### Security Checklist:
- ✅ JWT_SECRET is secure and random
- ✅ Database connection uses SSL
- ✅ API routes have proper error handling
- ✅ File uploads are validated
- ✅ User authentication is working

### Performance Optimizations:
- ✅ Database queries are optimized
- ✅ Images are properly handled
- ✅ API responses are cached where appropriate
- ✅ Static assets are optimized

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   ```bash
   # Check DATABASE_URL format
   postgresql://username:password@host:port/database?sslmode=require
   ```

2. **Build Failures**:
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all dependencies are in package.json
   ```

3. **API Timeout**:
   ```bash
   # Increase timeout in vercel.json
   "maxDuration": 30
   ```

4. **Environment Variables Not Working**:
   ```bash
   # Redeploy after adding env vars
   vercel --prod
   ```

## 📊 Step 9: Monitoring & Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Error Tracking**: Monitor function logs
3. **Database Monitoring**: Check connection health
4. **Performance**: Monitor Core Web Vitals

## 🔄 Step 10: Continuous Deployment

Your app will automatically redeploy when you push to your main branch. To deploy manually:

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## 📱 Final Checklist

- [ ] Database is connected and migrations run
- [ ] Environment variables are set
- [ ] User registration works
- [ ] Chart analysis works
- [ ] File uploads work
- [ ] Admin dashboard accessible
- [ ] SSL certificate is active
- [ ] Domain is configured (if using custom domain)

## 🎉 Success!

Your crypto bot is now live at: `https://your-app-name.vercel.app`

### Next Steps:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up backup strategies
4. Plan for scaling

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Check API endpoint responses

---

**Happy Trading! 🚀📈**


