import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
