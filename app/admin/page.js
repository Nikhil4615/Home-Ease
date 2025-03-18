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
        totalServices: 0,
        activeServices: 0,
        totalSubServices: 0,
        activeSubServices: 0
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

    if (loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={adminStyles.loadingContainer}>
                        <div className={adminStyles.circularLoader}></div>
                        <p className={adminStyles.loadingMessage}>Loading dashboard...</p>
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
                        <p className={adminStyles.subStat}>
                            Active: {stats.activeServices}
                        </p>
                        <Link href="/admin/services" className={adminStyles.statLink}>
                            Manage Services
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>

                    <div className={adminStyles.statCard}>
                        <h3>SubServices</h3>
                        <p className={adminStyles.statNumber}>{stats.totalSubServices}</p>
                        <p className={adminStyles.subStat}>
                            Active: {stats.activeSubServices}
                        </p>
                        <Link href="/admin/subservices" className={adminStyles.statLink}>
                            Manage SubServices
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
                        <Link href="/admin/services/create" className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add New Service
                        </Link>
                        <Link href="/admin/subservices/create" className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                                <path d="M5 5L19 19"/>
                            </svg>
                            Add New SubService
                        </Link>
                        <Link href="/admin/users" className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Manage Users
                        </Link>
                        <Link href="/admin/bookings" className={adminStyles.actionButton}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            View Bookings
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 