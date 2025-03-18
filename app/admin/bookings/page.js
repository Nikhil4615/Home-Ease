'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../admin.module.css';

export default function AdminBookingsPage() {
    const { data: session, status } = useSession();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    const fetchBookings = async (page = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/bookings?page=${page}&limit=10`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await response.json();
            setBookings(data.bookings || []);
            setPagination(data.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                pages: 1
            });
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError(err.message);
            showToast.error('Failed to load bookings: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchBookings();
        }
    }, [status, session]);

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking');
            }

            const updatedBooking = await response.json();
            setBookings(bookings.map(booking => 
                booking._id === bookingId ? updatedBooking : booking
            ));
            
            showToast.success(`Booking status updated to ${newStatus}`);
        } catch (err) {
            console.error("Error updating booking:", err);
            showToast.error('Failed to update booking: ' + err.message);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchBookings(newPage);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={adminStyles.loadingContainer}>
                        <div className={adminStyles.circularLoader}></div>
                        <p className={adminStyles.loadingMessage}>Loading bookings...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return adminStyles.pendingStatus;
            case 'confirmed':
                return adminStyles.activeStatus;
            case 'completed':
                return adminStyles.completedStatus;
            case 'cancelled':
                return adminStyles.inactiveStatus;
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Bookings Management</h1>
                </div>
                
                <Link href="/admin" className={adminStyles.backLink} style={{ marginBottom: '20px', display: 'inline-block' }}>
                    Back to Dashboard
                </Link>

                {bookings.length > 0 ? (
                    <div>
                        {bookings.map(booking => (
                            <div key={booking._id} className={adminStyles.bookingCard}>
                                <div className={adminStyles.bookingCardHeader}>
                                    <h3 className={adminStyles.bookingCardTitle}>
                                        Booking #{booking._id.slice(-6)}
                                    </h3>
                                </div>
                                
                                <div className={adminStyles.bookingCardBody}>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Customer</span>
                                        <span>{booking.user?.displayName || booking.user?.email || booking.userEmail || 'Unknown'}</span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Service</span>
                                        <span>{booking.service?.title || 'Unknown Service'}</span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>SubService</span>
                                        <span>{booking.subservice?.title || 'N/A'}</span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Provider</span>
                                        <span>{booking.providerName || 'N/A'}</span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Date</span>
                                        <span>{formatDate(booking.appointmentDate)}</span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Status</span>
                                        <span className={getStatusStyle(booking.status)}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className={adminStyles.bookingCardRow}>
                                        <span className={adminStyles.bookingCardLabel}>Total</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                            ${booking.totalAmount?.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={adminStyles.bookingCardFooter}>
                                    {booking.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                                className={adminStyles.successButton}
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                                className={adminStyles.dangerButton}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button 
                                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                                            className={adminStyles.successButton}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                    <Link 
                                        href={`/admin/bookings/${booking._id}`} 
                                        className={adminStyles.viewButton}
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                        
                        {/* Pagination Controls */}
                        <div className={adminStyles.paginationControls}>
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)} 
                                disabled={pagination.page <= 1}
                                className={adminStyles.paginationButton}
                            >
                                Previous
                            </button>
                            <span className={adminStyles.paginationInfo}>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)} 
                                disabled={pagination.page >= pagination.pages}
                                className={adminStyles.paginationButton}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={adminStyles.noData}>
                        {error ? `Error: ${error}` : 'No bookings found'}
                    </div>
                )}
            </div>
        </Layout>
    );
} 