import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import SubService from '@/models/SubService';
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

// GET - Fetch all subservices
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        
        // Get all subservices and populate their service details
        const subservices = await SubService.find({})
            .sort({ createdAt: -1 })
            .populate('service', 'title slug');
        
        return NextResponse.json(subservices);
    } catch (error) {
        console.error('Error fetching subservices:', error);
        return NextResponse.json({ message: 'Error fetching subservices', error: error.message }, { status: 500 });
    }
}

// POST - Create a new subservice
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const subserviceData = await request.json();
        
        // Validate required fields
        if (!subserviceData.title || !subserviceData.slug || !subserviceData.service || !subserviceData.description) {
            return NextResponse.json({ 
                message: 'Title, slug, service, and description are required fields' 
            }, { status: 400 });
        }
        
        await connectDB();
        
        // Check if service exists
        const serviceExists = await Service.findById(subserviceData.service);
        if (!serviceExists) {
            return NextResponse.json({ 
                message: 'The referenced service does not exist' 
            }, { status: 400 });
        }
        
        // Check if subservice with this slug already exists
        const existingSubService = await SubService.findOne({ slug: subserviceData.slug });
        if (existingSubService) {
            return NextResponse.json({ 
                message: 'A subservice with this slug already exists' 
            }, { status: 409 });
        }
        
        // Create new subservice
        const newSubService = await SubService.create(subserviceData);
        
        // Populate the service reference
        await newSubService.populate('service', 'title slug');
        
        return NextResponse.json(newSubService, { status: 201 });
    } catch (error) {
        console.error('Error creating subservice:', error);
        return NextResponse.json({ message: 'Error creating subservice', error: error.message }, { status: 500 });
    }
} 