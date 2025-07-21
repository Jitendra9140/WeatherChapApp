import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from './mongodb';
import User from '@/models/User';

interface JwtPayload {
  id: string;
}

/**
 * Middleware to protect routes that require authentication
 * This can be used in API route handlers
 */
export async function authMiddleware(req: NextRequest) {
  try {
    // Get token from header
    const authHeader = req.headers.get('Authorization');
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this route' },
        { status: 401 }
      );
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'secret'
      ) as JwtPayload;
      
      // Connect to database
      await connectToDatabase();
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      // Return user object
      return user;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this route' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}