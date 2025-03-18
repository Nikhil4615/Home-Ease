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

// GET - Fetch a specific subservice
export async function GET(request, { params }) {
    try {
        const { subserviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const subservice = await SubService.findById(subserviceId).populate('service', 'title slug');
        
        if (!subservice) {
            return NextResponse.json({ message: 'SubService not found' }, { status: 404 });
        }
        
        return NextResponse.json(subservice);
    } catch (error) {
        console.error('Error fetching subservice:', error);
        return NextResponse.json({ message: 'Error fetching subservice', error: error.message }, { status: 500 });
    }
}

// PUT - Update entire subservice
export async function PUT(request, { params }) {
    try {
        const { subserviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const subserviceData = await request.json();
        await connectDB();
        
        // Check if service exists (if service is being updated)
        if (subserviceData.service) {
            const serviceExists = await Service.findById(subserviceData.service);
            if (!serviceExists) {
                return NextResponse.json({ 
                    message: 'The referenced service does not exist' 
                }, { status: 400 });
            }
        }
        
        // Check for slug uniqueness if slug is being changed
        if (subserviceData.slug) {
            const existingSubService = await SubService.findOne({
                slug: subserviceData.slug,
                _id: { $ne: subserviceId }
            });
            
            if (existingSubService) {
                return NextResponse.json({ 
                    message: 'A subservice with this slug already exists' 
                }, { status: 409 });
            }
        }
        
        const updatedSubService = await SubService.findByIdAndUpdate(
            subserviceId, 
            subserviceData, 
            { new: true, runValidators: true }
        ).populate('service', 'title slug');
        
        if (!updatedSubService) {
            return NextResponse.json({ message: 'SubService not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedSubService);
    } catch (error) {
        console.error('Error updating subservice:', error);
        return NextResponse.json({ message: 'Error updating subservice', error: error.message }, { status: 500 });
    }
}

// PATCH - Update specific subservice fields
export async function PATCH(request, { params }) {
    try {
        const { subserviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const updates = await request.json();
        await connectDB();
        
        // Check if service exists (if service is being updated)
        if (updates.service) {
            const serviceExists = await Service.findById(updates.service);
            if (!serviceExists) {
                return NextResponse.json({ 
                    message: 'The referenced service does not exist' 
                }, { status: 400 });
            }
        }
        
        // Check for slug uniqueness if slug is being updated
        if (updates.slug) {
            const existingSubService = await SubService.findOne({
                slug: updates.slug,
                _id: { $ne: subserviceId }
            });
            
            if (existingSubService) {
                return NextResponse.json({ 
                    message: 'A subservice with this slug already exists' 
                }, { status: 409 });
            }
        }
        
        const updatedSubService = await SubService.findByIdAndUpdate(
            subserviceId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        ).populate('service', 'title slug');
        
        if (!updatedSubService) {
            return NextResponse.json({ message: 'SubService not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedSubService);
    } catch (error) {
        console.error('Error updating subservice:', error);
        return NextResponse.json({ message: 'Error updating subservice', error: error.message }, { status: 500 });
    }
}

// DELETE - Remove a subservice
export async function DELETE(request, { params }) {
    try {
        const { subserviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const deletedSubService = await SubService.findByIdAndDelete(subserviceId);
        
        if (!deletedSubService) {
            return NextResponse.json({ message: 'SubService not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'SubService deleted successfully' });
    } catch (error) {
        console.error('Error deleting subservice:', error);
        return NextResponse.json({ message: 'Error deleting subservice', error: error.message }, { status: 500 });
    }
}