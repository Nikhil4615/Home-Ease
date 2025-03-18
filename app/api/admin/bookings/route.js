import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized' },
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

        // Get pagination params from query
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        // Fetch all bookings with populated references
        const bookings = await Booking.find()
            .populate('serviceId', 'title')
            .populate('subServiceId', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const total = await Booking.countDocuments();
        
        // Get all unique user emails from bookings
        const userEmails = [...new Set(bookings.map(booking => booking.userEmail))];
        
        // Fetch all users in one query
        const users = await User.find({ 
            email: { $in: userEmails } 
        }, 'email displayName');
        
        // Create lookup map for quick access
        const userMap = users.reduce((map, user) => {
            map[user.email] = {
                email: user.email,
                displayName: user.displayName
            };
            return map;
        }, {});
        
        // Map bookings with user data
        const populatedBookings = bookings.map(booking => {
            const bookingObj = booking.toObject();
            const userData = userMap[booking.userEmail] || { email: booking.userEmail };
            
            return {
                ...bookingObj,
                user: userData,
                service: bookingObj.serviceId,
                subservice: bookingObj.subServiceId
            };
        });

        return NextResponse.json({
            bookings: populatedBookings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Admin bookings error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch bookings', error: error.message },
            { status: 500 }
        );
    }
}