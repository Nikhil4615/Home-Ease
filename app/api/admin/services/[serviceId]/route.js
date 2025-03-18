import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Service from '@/models/Service';
import SubService from '@/models/SubService';

// Helper to verify admin status
async function verifyAdmin(session) {
    if (!session?.user?.email) {
        return false;
    }
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    return user?.isAdmin === true;
}

// GET - Fetch a specific service
export async function GET(request, { params }) {
    try {
        const { serviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        const service = await Service.findById(serviceId);
        
        if (!service) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }
        
        // Get the subservices associated with this service
        const subservices = await SubService.find({ service: serviceId });
        
        return NextResponse.json({
            ...service.toObject(),
            subservices
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        return NextResponse.json({ message: 'Error fetching service', error: error.message }, { status: 500 });
    }
}

// PUT - Update entire service
export async function PUT(request, { params }) {
    try {
        const { serviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const serviceData = await request.json();
        await connectDB();
        
        // Check for slug uniqueness if slug is being changed
        if (serviceData.slug) {
            const existingService = await Service.findOne({
                slug: serviceData.slug,
                _id: { $ne: serviceId }
            });
            
            if (existingService) {
                return NextResponse.json({ 
                    message: 'A service with this slug already exists' 
                }, { status: 409 });
            }
        }
        
        const updatedService = await Service.findByIdAndUpdate(
            serviceId, 
            serviceData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedService) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ message: 'Error updating service', error: error.message }, { status: 500 });
    }
}

// PATCH - Update specific service fields
export async function PATCH(request, { params }) {
    try {
        const { serviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        const updates = await request.json();
        await connectDB();
        
        // Check for slug uniqueness if slug is being updated
        if (updates.slug) {
            const existingService = await Service.findOne({
                slug: updates.slug,
                _id: { $ne: serviceId }
            });
            
            if (existingService) {
                return NextResponse.json({ 
                    message: 'A service with this slug already exists' 
                }, { status: 409 });
            }
        }
        
        const updatedService = await Service.findByIdAndUpdate(
            serviceId, 
            { $set: updates }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedService) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }
        
        return NextResponse.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        return NextResponse.json({ message: 'Error updating service', error: error.message }, { status: 500 });
    }
}

// DELETE - Remove a service
export async function DELETE(request, { params }) {
    try {
        const { serviceId } = params;
        const session = await getServerSession(authOptions);
        
        if (!await verifyAdmin(session)) {
            return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
        }
        
        await connectDB();
        
        // Check if this service has associated subservices
        const subservicesCount = await SubService.countDocuments({ service: serviceId });
        if (subservicesCount > 0) {
            return NextResponse.json({ 
                message: 'Cannot delete service that has associated subservices',
                subservicesCount
            }, { status: 400 });
        }
        
        const deletedService = await Service.findByIdAndDelete(serviceId);
        
        if (!deletedService) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ message: 'Error deleting service', error: error.message }, { status: 500 });
    }
} 