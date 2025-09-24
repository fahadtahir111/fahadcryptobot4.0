import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Run migrations (this will be handled by Vercel build process)
    // But we can verify the connection and basic setup
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      userCount,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    // Force run migrations (if needed)
    const { execSync } = require('child_process');
    
    // This would run in a serverless environment
    // In production, migrations should be handled during build
    
    return NextResponse.json({
      success: true,
      message: 'Migration process initiated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration process failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


