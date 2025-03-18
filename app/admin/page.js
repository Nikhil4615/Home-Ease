'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import styles from '@/styles/Profile.module.css';
import adminStyles from './admin.module.css';
import Link from 'next/link';
import { showToast } from '@/utils/toast';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBookings: 0,
        activeBookings: 0,
        totalServices: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await fetch('/api/admin/stats', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch admin statistics');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching admin stats:", err);
                setError(err.message);
                showToast.error('Failed to load admin statistics');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchAdminStats();
        }
    }, [status, session]);

    if (status === 'loading' || loading) {
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

    if (status === 'unauthenticated') {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className="error-message">
                        Please log in to access the admin dashboard
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                </div>

                {/* Stats Grid */}
                <div className={adminStyles.statsGrid}>
                    <div className={adminStyles.statCard}>
                        <h3>Total Users</h3>
                        <p className={adminStyles.statNumber}>{stats.totalUsers}</p>
                        <Link href="/admin/users" className={adminStyles.statLink}>
                            View All Users
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>

                    <div className={adminStyles.statCard}>
                        <h3>Total Bookings</h3>
                        <p className={adminStyles.statNumber}>{stats.totalBookings}</p>
                        <p className={adminStyles.subStat}>
                            Active: {stats.activeBookings}
                        </p>
                        <Link href="/admin/bookings" className={adminStyles.statLink}>
                            Manage Bookings
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>

                    <div className={adminStyles.statCard}>
                        <h3>Services</h3>
                        <p className={adminStyles.statNumber}>{stats.totalServices}</p>
                        <Link href="/admin/services" className={adminStyles.statLink}>
                            Manage Services
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={adminStyles.quickActions}>
                    <h2>Quick Actions</h2>
                    <div className={adminStyles.actionGrid}>
                        <button className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add New Service
                        </button>
                        <button className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Manage Users
                        </button>
                        <button className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            View Bookings
                        </button>
                        <button className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            Settings
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 