import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// WARNING: This endpoint is for development testing only!
// It should be disabled or password-protected in production

export async function POST(request) {
    try {
        // Require authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify development environment or admin password
        // Note: In production, check for env variables to disable this or require a specific key
        const { devKey } = await request.json();
        if (process.env.NODE_ENV === 'production' && devKey !== process.env.ADMIN_DEV_KEY) {
            return NextResponse.json(
                { message: 'This endpoint is disabled in production' },
                { status: 403 }
            );
        }

        await connectDB();
        
        // Find the user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Toggle admin status
        const isAdmin = !user.isAdmin;
        
        // Update user
        await User.updateOne(
            { email: session.user.email },
            { $set: { isAdmin } }
        );

        return NextResponse.json({
            message: `Admin status ${isAdmin ? 'enabled' : 'disabled'}`,
            isAdmin
        });

    } catch (error) {
        console.error('Toggle admin error:', error);
        return NextResponse.json(
            { message: 'Failed to toggle admin status' },
            { status: 500 }
        );
    }
} 