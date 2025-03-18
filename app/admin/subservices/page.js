'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../admin.module.css';

export default function AdminSubServicesPage() {
    const { data: session, status } = useSession();
    const [subservices, setSubservices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubServices = async () => {
            try {
                const response = await fetch('/api/admin/subservices', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch subservices');
                }

                const data = await response.json();
                setSubservices(data);
            } catch (err) {
                console.error("Error fetching subservices:", err);
                setError(err.message);
                showToast.error('Failed to load subservices: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchSubServices();
        }
    }, [status, session]);

    const toggleSubServiceStatus = async (subserviceId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/subservices/${subserviceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update subservice');
            }

            const updatedSubService = await response.json();
            setSubservices(subservices.map(subservice => 
                subservice._id === subserviceId ? updatedSubService : subservice
            ));
            
            showToast.success(`SubService ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (err) {
            console.error("Error updating subservice:", err);
            showToast.error('Failed to update subservice: ' + err.message);
        }
    };

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

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>SubServices Management</h1>
                    <div className={adminStyles.headerActions}>
                        <Link href="/admin" className={adminStyles.backLink}>
                            Back to Dashboard
                        </Link>
                        <Link href="/admin/subservices/create" className={adminStyles.createButton}>
                            Add New SubService
                        </Link>
                    </div>
                </div>

                <div className={adminStyles.tableContainer}>
                    <table className={adminStyles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Service</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subservices.length > 0 ? (
                                subservices.map(subservice => (
                                    <tr key={subservice._id}>
                                        <td>{subservice.title}</td>
                                        <td>{subservice.service?.title || subservice.service}</td>
                                        <td>${subservice.price?.toFixed(2)}</td>
                                        <td>
                                            <span className={subservice.isActive ? adminStyles.activeStatus : adminStyles.inactiveStatus}>
                                                {subservice.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(subservice.createdAt).toLocaleDateString()}</td>
                                        <td className={adminStyles.actionCell}>
                                            <Link href={`/admin/subservices/${subservice._id}`} className={adminStyles.viewButton}>
                                                Edit
                                            </Link>
                                            <button 
                                                onClick={() => toggleSubServiceStatus(subservice._id, subservice.isActive)}
                                                className={subservice.isActive ? adminStyles.dangerButton : adminStyles.successButton}
                                            >
                                                {subservice.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={adminStyles.noData}>
                                        {error ? `Error: ${error}` : 'No subservices found'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
} 