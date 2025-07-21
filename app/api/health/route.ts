import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    // Check MongoDB connection
    await connectToDatabase();
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: mongoStatus
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Service is experiencing issues',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}