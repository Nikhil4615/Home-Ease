'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../../admin.module.css';
import { use } from 'react';

export default function BookingDetailPage({ params }) {
    const bookingId = use(params).bookingId;
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use useCallback to stabilize the fetch function
    const fetchBookingDetails = useCallback(async () => {
        if (!bookingId || authStatus !== 'authenticated' || !session) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            console.log(`Fetching booking details for ID: ${bookingId}`);
            
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken || ''}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch booking details');
            }

            console.log('Booking details received:', data);
            setBooking(data);
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError(err.message || 'An unknown error occurred');
            showToast.error(`Failed to load booking details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [bookingId, session, authStatus]);

    // Separate useEffect for authentication redirects
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [authStatus, router]);

    // UseEffect for data fetching
    useEffect(() => {
        if (authStatus === 'authenticated') {
            fetchBookingDetails();
        }
    }, [fetchBookingDetails, authStatus]);

    const updateBookingStatus = async (newStatus) => {
        if (!bookingId) return;
        
        try {
            setLoading(true);
            
            const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken || ''}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update booking');
            }

            setBooking(data);
            showToast.success(`Booking status updated to ${newStatus}`);
        } catch (err) {
            console.error("Error updating booking:", err);
            showToast.error(`Failed to update booking: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (authStatus === 'loading' || loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={adminStyles.loadingContainer}>
                        <div className={adminStyles.circularLoader}></div>
                        <p className={adminStyles.loadingMessage}>
                            Loading booking details...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (authStatus === 'unauthenticated') {
        return null; // Will be redirected by the auth useEffect
    }

    if (error || !booking) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Booking Details</h1>
                    </div>
                    
                    <Link href="/admin/bookings" className={adminStyles.backLink} style={{ marginBottom: '20px', display: 'inline-block' }}>
                        Back to Bookings
                    </Link>

                    <div className={adminStyles.errorContainer}>
                        <h2>Error Loading Booking</h2>
                        <p style={{ marginBottom: '20px' }}>{error || 'Booking not found'}</p>
                        <button 
                            onClick={fetchBookingDetails} 
                            className={adminStyles.successButton}
                            style={{ padding: '12px 24px' }}
                        >
                            Try Again
                        </button>
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

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { hour: '2-digit', minute: '2-digit', hour12: true };
        return new Date(dateString).toLocaleTimeString(undefined, options);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return `${formatDate(dateString)} at ${formatTime(dateString)}`;
    };

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header} style={{ marginBottom: '20px' }}>
                    <h1 className={styles.title}>Booking Details</h1>
                </div>
                
                <Link href="/admin/bookings" className={adminStyles.backLink} style={{ marginBottom: '20px', display: 'inline-block' }}>
                    Back to Bookings
                </Link>

                <div className={adminStyles.detailContainer}>
                    {loading && (
                        <div className={adminStyles.loadingOverlay}>
                            <div style={{ textAlign: 'center' }}>
                                <div className={adminStyles.circularLoader}></div>
                                <p className={adminStyles.loadingMessage}>
                                    Updating booking...
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={adminStyles.detailHeader}>
                        <h2 className={adminStyles.detailTitle}>
                            Booking #{booking._id.slice(-6)}
                        </h2>
                        <span className={getStatusStyle(booking.status)}>
                            {booking.status}
                        </span>
                    </div>

                    <div className={adminStyles.detailCard}>
                        <div className={adminStyles.detailSection}>
                            <h3 className={adminStyles.sectionTitle}>Customer Information</h3>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Name</span>
                                <span className={adminStyles.detailValue}>
                                    {booking.user?.displayName || 'N/A'}
                                </span>
                            </div>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Email</span>
                                <span className={adminStyles.detailValue}>
                                    {booking.user?.email || booking.userEmail || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className={adminStyles.detailSection}>
                            <h3 className={adminStyles.sectionTitle}>Service Information</h3>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Service</span>
                                <span className={adminStyles.detailValue}>
                                    {booking.service?.title || 'N/A'}
                                </span>
                            </div>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>SubService</span>
                                <span className={adminStyles.detailValue}>
                                    {booking.subservice?.title || 'N/A'}
                                </span>
                            </div>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Provider</span>
                                <span className={adminStyles.detailValue}>
                                    {booking.providerName || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className={adminStyles.detailSection}>
                            <h3 className={adminStyles.sectionTitle}>Appointment Details</h3>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Date</span>
                                <span className={adminStyles.detailValue}>
                                    {formatDate(booking.appointmentDate)}
                                </span>
                            </div>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Time</span>
                                <span className={adminStyles.detailValue}>
                                    {formatTime(booking.appointmentDate)}
                                </span>
                            </div>
                        </div>

                        <div className={adminStyles.detailSection}>
                            <h3 className={adminStyles.sectionTitle}>Payment Information</h3>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Total Amount</span>
                                <span className={adminStyles.detailPrice}>
                                    ${booking.totalAmount?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                        </div>

                        <div className={adminStyles.detailSection}>
                            <h3 className={adminStyles.sectionTitle}>Booking History</h3>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Created</span>
                                <span className={adminStyles.detailValue}>
                                    {formatDateTime(booking.createdAt)}
                                </span>
                            </div>
                            <div className={adminStyles.detailRow}>
                                <span className={adminStyles.detailLabel}>Last Updated</span>
                                <span className={adminStyles.detailValue}>
                                    {formatDateTime(booking.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <div className={adminStyles.detailActions}>
                            <h3 className={adminStyles.sectionTitle}>Manage Booking</h3>
                            {booking.status === 'pending' && (
                                <div className={adminStyles.actionButtons}>
                                    <button 
                                        onClick={() => updateBookingStatus('confirmed')}
                                        className={adminStyles.successButton}
                                        disabled={loading}
                                    >
                                        Confirm Booking
                                    </button>
                                    <button 
                                        onClick={() => updateBookingStatus('cancelled')}
                                        className={adminStyles.dangerButton}
                                        disabled={loading}
                                    >
                                        Cancel Booking
                                    </button>
                                </div>
                            )}
                            {booking.status === 'confirmed' && (
                                <div className={adminStyles.actionButtons}>
                                    <button 
                                        onClick={() => updateBookingStatus('completed')}
                                        className={adminStyles.successButton}
                                        disabled={loading}
                                    >
                                        Mark as Completed
                                    </button>
                                </div>
                            )}
                            {(booking.status === 'cancelled' || booking.status === 'completed') && (
                                <p className={adminStyles.statusNote}>
                                    This booking is {booking.status.toLowerCase()} and cannot be modified.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 