import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import Service from '@/models/Service';

export async function GET() {
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

        // Fetch statistics
        const [totalUsers, totalBookings, activeBookings, totalServices] = await Promise.all([
            User.countDocuments(),
            Booking.countDocuments(),
            Booking.countDocuments({ status: { $nin: ['cancelled', 'completed'] } }),
            Service.countDocuments()
        ]);

        return NextResponse.json({
            totalUsers,
            totalBookings,
            activeBookings,
            totalServices
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch admin statistics' },
            { status: 500 }
        );
    }
} 