"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import bookingStyles from '@/styles/bookings.module.css';
import serviceStyles from '@/styles/SubServices.module.css';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import Image from 'next/image';

export default function BookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    useEffect(() => {
        // Only fetch booking data if authenticated
        if (status === 'authenticated') {
            const fetchBookings = async () => {
                try {
                    if (!session?.user?.email) return;
                    
                    const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: btoa(session.user.email) // Base64 encoding for basic encryption
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to fetch bookings');
                    }

                    const data = await response.json();
                    setBookings(data.bookings);
                } catch (error) {
                    console.error('Error fetching bookings:', error);
                    showToast.error('Failed to load bookings');
                } finally {
                    setLoading(false);
                }
            };

            fetchBookings();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [session, status]);

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString(undefined, options);
    };

    // Show loading state while checking authentication
    if (status === 'loading' || (loading && status === 'authenticated')) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className="loading-container">
                        <div className="circular-loader"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error if not authenticated
    if (status === 'unauthenticated') {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className="error-message">
                        Please log in to view your bookings
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Your Bookings</h1>
                </div>
                
                {bookings.length === 0 ? (
                    <div className={styles.panel} style={{textAlign: 'center', padding: '2rem'}}>
                        <h2>No Bookings Found</h2>
                        <p className={styles.noData}>You haven't made any bookings yet.</p>
                        <Link href="/services" className={serviceStyles.addToCartButton}>
                            Explore Services
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.completionContainer}>
                            <div className={styles.completionHeader}>
                                <span>Active Bookings</span>
                                <span>
                                    {bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length}
                                </span>
                            </div>
                        </div>
                        
                        <div className={serviceStyles.subServiceGrid} style={{ position: 'relative', zIndex: 1 }}>
                            {bookings.map((booking) => (
                                <div 
                                    key={booking.id} 
                                    className={serviceStyles.subServiceCard}
                                    data-service-id={booking.serviceId}
                                    data-subservice-id={booking.subServiceId}
                                    style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    <div className={serviceStyles.cardImage} style={{ position: 'relative', overflow: 'hidden' }}>
                                        <div className={`${bookingStyles.statusBadge} ${bookingStyles[booking.status.toLowerCase()]}`}
                                             style={{ zIndex: 2, position: 'absolute', top: '1rem', right: '1rem' }}>
                                            {booking.status}
                                        </div>
                                        <Image
                                            src="/download.jpg"
                                            alt={booking.serviceName || "Service booking image"}
                                            width={300}
                                            height={200}
                                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                            onError={(e) => {
                                                e.target.src = '/logo.png';
                                            }}
                                        />
                                    </div>
                                    <div className={serviceStyles.cardContent} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 className={serviceStyles.cardTitle}>{booking.serviceName}</h3>
                                        <p className={serviceStyles.cardDescription}>{booking.subServiceName}</p>
                                        
                                        <div className={bookingStyles.bookingMetadata} style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            <div className={bookingStyles.metadataItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatDate(booking.date)}</span>
                                            </div>
                                            <div className={bookingStyles.metadataItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                <span>{formatTime(booking.date)}</span>
                                            </div>
                                            <div className={bookingStyles.metadataItem}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.providerName}</span>
                                            </div>
                                        </div>
                                        
                                        <div className={serviceStyles.cardDetails} style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                                            <p className={serviceStyles.cardPrice}>${booking.price.toFixed(2)}</p>
                                            <p className={bookingStyles.bookingId} style={{ margin: 0 }}>ID: {booking.id.substring(0, 8)}</p>
                                        </div>
                                        
                                        <Link 
                                            href={`/services/${booking.serviceId}`}
                                            className={serviceStyles.addToCartButton}
                                            style={{ marginTop: '1rem', width: '100%' }}
                                        >
                                            View Service
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.accountInfo} style={{ marginTop: '2rem' }}>
                            <p>Total Bookings: {bookings.length}</p>
                            <p>Last Booked: {bookings.length > 0 ? formatDate(bookings[0].createdAt) : 'N/A'}</p>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
} 