import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Service from '@/models/Service';

// Helper to verify admin status
async function verifyAdmin(session) {
    if (!session?.user?.email) {
        return false;
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    return user?.isAdmin === true;
}

// GET - Fetch all services
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const services = await Service.find({}).sort({ createdAt: -1 });
        
        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ message: 'Error fetching services', error: error.message }, { status: 500 });
    }
}

// POST - Create a new service
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const serviceData = await request.json();
        
        // Validate required fields
        if (!serviceData.title || !serviceData.slug || !serviceData.description) {
            return NextResponse.json({ 
                message: 'Title, slug, and description are required fields' 
            }, { status: 400 });
        }
        
        await connectDB();
        
        // Check if service with this slug already exists
        const existingService = await Service.findOne({ slug: serviceData.slug });
        if (existingService) {
            return NextResponse.json({ 
                message: 'A service with this slug already exists' 
            }, { status: 409 });
        }
        
        // Create new service
        const newService = await Service.create(serviceData);
        
        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error('Error creating service:', error);
        return NextResponse.json({ message: 'Error creating service', error: error.message }, { status: 500 });
    }
} 