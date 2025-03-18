import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        // Return authentication status
        return NextResponse.json({
            authenticated: !!session,
            user: session?.user ? {
                name: session.user.name,
                email: session.user.email,
                isAdmin: session.user.isAdmin || false,
            } : null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Auth status error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to check authentication status',
                authenticated: false,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
} 