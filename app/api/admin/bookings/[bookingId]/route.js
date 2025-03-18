import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    try {
        console.log('GET request received for booking detail:', params.bookingId);
        
        // Validate session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            console.log('Unauthorized: No valid session');
            return NextResponse.json(
                { message: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        await connectDB();
        
        // Check if user is admin
        const user = await User.findOne({ email: session.user.email });
        if (!user?.isAdmin) {
            console.log('Forbidden: Not an admin user', session.user.email);
            return NextResponse.json(
                { message: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const { bookingId } = params;
        
        // Validate booking ID format
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            console.log('Bad request: Invalid booking ID format', bookingId);
            return NextResponse.json(
                { message: 'Invalid booking ID format' },
                { status: 400 }
            );
        }

        console.log('Fetching booking with ID:', bookingId);
        
        // Fetch booking with populated references
        const booking = await Booking.findById(bookingId)
            .populate('serviceId', 'title')
            .populate('subServiceId', 'title');

        if (!booking) {
            console.log('Not found: Booking not found with ID', bookingId);
            return NextResponse.json(
                { message: 'Booking not found' },
                { status: 404 }
            );
        }

        console.log('Booking found, preparing response');
        
        // Get user info for the booking
        const bookingObj = booking.toObject();
        let userData = { email: booking.userEmail };
        
        if (booking.userEmail) {
            try {
                const userRecord = await User.findOne(
                    { email: booking.userEmail },
                    'email displayName'
                );
                
                if (userRecord) {
                    userData = {
                        email: userRecord.email,
                        displayName: userRecord.displayName
                    };
                }
            } catch (error) {
                console.error('Error finding user:', error);
                // Continue with default userData
            }
        }

        const populatedBooking = {
            ...bookingObj,
            user: userData,
            service: bookingObj.serviceId,
            subservice: bookingObj.subServiceId
        };

        // Return success response
        return NextResponse.json(populatedBooking);

    } catch (error) {
        console.error('Admin booking fetch error:', error);
        
        return NextResponse.json(
            { 
                message: 'Failed to fetch booking details',
                error: error.message 
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        console.log('PATCH request received for booking update:', params.bookingId);
        
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        await connectDB();
        
        // Check if user is admin
        const user = await User.findOne({ email: session.user.email });
        if (!user?.isAdmin) {
            return NextResponse.json(
                { message: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const { bookingId } = params;
        
        // Validate booking ID format
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json(
                { message: 'Invalid booking ID format' },
                { status: 400 }
            );
        }
        
        // Parse request body with error handling
        let requestBody;
        try {
            requestBody = await request.json();
        } catch (error) {
            return NextResponse.json(
                { message: 'Invalid request body' },
                { status: 400 }
            );
        }
        
        const { status } = requestBody;
        
        if (!status) {
            return NextResponse.json(
                { message: 'Status is required' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        console.log(`Updating booking ${bookingId} status to: ${status}`);
        
        // Update booking status
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { 
                new: true,
                runValidators: true 
            }
        ).populate('serviceId', 'title')
         .populate('subServiceId', 'title');

        if (!booking) {
            return NextResponse.json(
                { message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Format response to match what the frontend expects
        const bookingObj = booking.toObject();
        
        // Fetch user information
        let userData = { email: booking.userEmail };
        if (booking.userEmail) {
            try {
                const userRecord = await User.findOne(
                    { email: booking.userEmail },
                    'email displayName'
                );
                
                if (userRecord) {
                    userData = {
                        email: userRecord.email,
                        displayName: userRecord.displayName
                    };
                }
            } catch (error) {
                console.error('Error finding user:', error);
                // Continue with default userData
            }
        }

        const updatedBooking = {
            ...bookingObj,
            user: userData,
            service: bookingObj.serviceId,
            subservice: bookingObj.subServiceId
        };

        console.log('Booking updated successfully');
        
        return NextResponse.json(updatedBooking);

    } catch (error) {
        console.error('Admin booking update error:', error);
        return NextResponse.json(
            { 
                message: 'Failed to update booking',
                error: error.message 
            },
            { status: 500 }
        );
    }
} 