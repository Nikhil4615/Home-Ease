import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// GET - Fetch all users
export async function GET(request) {
    try {
        // Check session - middleware already handles admin check, this is extra security
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Find current user to verify admin status (double check)
        const adminUser = await User.findOne({ email: session.user.email });
        if (!adminUser?.isAdmin) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        // Get all users, sorted by creation date (newest first)
        const users = await User.find({}).sort({ createdAt: -1 });
        
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
    }
}

// POST - Create a new user (if needed for admin-initiated user creation)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Verify admin status
        const adminUser = await User.findOne({ email: session.user.email });
        if (!adminUser?.isAdmin) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        // Get user data from request body
        const userData = await request.json();
        
        // Validate required fields
        if (!userData.email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 409 });
        }
        
        // Create new user
        const newUser = await User.create(userData);
        
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
    }
} 