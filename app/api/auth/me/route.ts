import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    // Use auth middleware to verify token and get user
    const user = await authMiddleware(req);
    
    // If middleware returns a NextResponse, it means there was an error
    if (user instanceof NextResponse) {
      return user;
    }
    
    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}