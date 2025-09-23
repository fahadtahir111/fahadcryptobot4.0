#!/bin/bash

echo "🚀 Crypto Bot 4.0 - Quick Deploy Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Building project..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at the URL shown above"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Test your deployment"
echo "3. Set up custom domain (optional)"

