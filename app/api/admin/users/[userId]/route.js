import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// Helper to verify admin status
async function verifyAdmin(session) {
    if (!session?.user?.email) {
        return false;
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    return user?.isAdmin === true;
}

// GET - Fetch a specific user
export async function GET(request, { params }) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const user = await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: 'Error fetching user', error: error.message }, { status: 500 });
    }
}

// PUT - Update entire user
export async function PUT(request, { params }) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const userData = await request.json();
        await connectDB();
        
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { ...userData }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
    }
}

// PATCH - Update specific user fields
export async function PATCH(request, { params }) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const updates = await request.json();
        await connectDB();
        
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Error updating user', error: error.message }, { status: 500 });
    }
}

// DELETE - Remove a user
export async function DELETE(request, { params }) {
    try {
        const { userId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Error deleting user', error: error.message }, { status: 500 });
    }
} 