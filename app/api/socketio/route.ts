import { NextRequest, NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Socket server endpoint ready',
      note: 'WebSocket connections are handled client-side'
    });
  } catch (error) {
    console.error('Socket endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Socket endpoint error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Socket server endpoint ready',
      note: 'WebSocket connections are handled client-side'
    });
  } catch (error) {
    console.error('Socket endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Socket endpoint error' }, { status: 500 });
  }
}
