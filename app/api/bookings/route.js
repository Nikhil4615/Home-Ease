import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(request) {
    try {
        // Verify user session
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to MongoDB
        await connectDB();

        // Get request body
        const body = await request.json();
        const encryptedEmail = body.email;
        
        // Decrypt email (base64 decode)
        const email = atob(encryptedEmail);
        
        // Verify email matches session email
        if (email !== session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch bookings from database - handle missing schema case
        let bookings;
        try {
            // Try with population first
            bookings = await Booking.find({ userEmail: email })
                .populate('subServiceId')
                .sort({ createdAt: -1 });
        } catch (populateError) {
            console.warn('Could not populate related models:', populateError.message);
            // Fallback to simple find without population
            bookings = await Booking.find({ userEmail: email })
                .sort({ createdAt: -1 });
        }

        // Transform the data for the frontend
        const transformedBookings = bookings.map(booking => {
            const bookingObj = {
                id: booking._id.toString(),
                date: booking.appointmentDate,
                status: booking.status,
                price: booking.totalAmount,
                providerName: booking.providerName,
                createdAt: booking.createdAt
            };
            
            // Handle populated vs non-populated serviceId
            if (booking.serviceId && typeof booking.serviceId === 'object') {
                bookingObj.serviceId = booking.serviceId._id.toString();
                bookingObj.serviceName = booking.serviceId.name;
            } else {
                bookingObj.serviceId = booking.serviceId?.toString() || '';
                bookingObj.serviceName = 'Service'; // Fallback name
            }
            
            // Handle populated vs non-populated subServiceId
            if (booking.subServiceId && typeof booking.subServiceId === 'object') {
                bookingObj.subServiceId = booking.subServiceId._id.toString();
                bookingObj.subServiceName = booking.subServiceId.title;
            } else {
                bookingObj.subServiceId = booking.subServiceId?.toString() || '';
                bookingObj.subServiceName = 'Service Item'; // Fallback name
            }
            
            return bookingObj;
        });

        return NextResponse.json({ bookings: transformedBookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({
                message: "Email is required"
            }, { status: 400 });
        }

        // Fetch bookings with error handling for missing schema
        let bookings;
        try {
            bookings = await Booking.find({ userEmail: email })
                .populate('serviceId')
                .populate('subServiceId')
                .sort({ createdAt: -1 });
        } catch (populateError) {
            console.warn('Could not populate related models:', populateError.message);
            bookings = await Booking.find({ userEmail: email })
                .sort({ createdAt: -1 });
        }

        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Booking fetch error:', error);
        return NextResponse.json({
            message: "Error fetching bookings",
            error: error.message
        }, { status: 500 });
    }
}
