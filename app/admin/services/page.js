'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../admin.module.css';

export default function AdminServicesPage() {
    const { data: session, status } = useSession();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/admin/services', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const data = await response.json();
                setServices(data);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError(err.message);
                showToast.error('Failed to load services: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchServices();
        }
    }, [status, session]);

    const toggleServiceStatus = async (serviceId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update service');
            }

            const updatedService = await response.json();
            setServices(services.map(service => 
                service._id === serviceId ? updatedService : service
            ));
            
            showToast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (err) {
            console.error("Error updating service:", err);
            showToast.error('Failed to update service: ' + err.message);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={adminStyles.loadingContainer}>
                        <div className={adminStyles.circularLoader}></div>
                        <p className={adminStyles.loadingMessage}>Loading services...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Services Management</h1>
                    <div className={adminStyles.headerActions}>
                        <Link href="/admin" className={adminStyles.backLink}>
                            Back to Dashboard
                        </Link>
                        <Link href="/admin/services/create" className={adminStyles.createButton}>
                            Add New Service
                        </Link>
                    </div>
                </div>

                <div className={adminStyles.tableContainer}>
                    <table className={adminStyles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length > 0 ? (
                                services.map(service => (
                                    <tr key={service._id}>
                                        <td>{service.title}</td>
                                        <td>{service.category}</td>
                                        <td>{service.type}</td>
                                        <td>
                                            <span className={service.isActive ? adminStyles.activeStatus : adminStyles.inactiveStatus}>
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(service.createdAt).toLocaleDateString()}</td>
                                        <td className={adminStyles.actionCell}>
                                            <Link href={`/admin/services/${service._id}`} className={adminStyles.viewButton}>
                                                Edit
                                            </Link>
                                            <button 
                                                onClick={() => toggleServiceStatus(service._id, service.isActive)}
                                                className={service.isActive ? adminStyles.dangerButton : adminStyles.successButton}
                                            >
                                                {service.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={adminStyles.noData}>
                                        {error ? `Error: ${error}` : 'No services found'}
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