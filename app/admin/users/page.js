'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../admin.module.css';

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/admin/users', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.message);
                showToast.error('Failed to load users: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, session]);

    const toggleAdminStatus = async (userId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({ isAdmin: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();
            setUsers(users.map(user => 
                user._id === userId ? updatedUser : user
            ));
            
            showToast.success(`Admin status ${!currentStatus ? 'granted' : 'revoked'}`);
        } catch (err) {
            console.error("Error updating user:", err);
            showToast.error('Failed to update user: ' + err.message);
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
                    <h1 className={styles.title}>User Management</h1>
                    <Link href="/admin" className={adminStyles.backLink}>
                        Back to Dashboard
                    </Link>
                </div>

                <div className={adminStyles.tableContainer}>
                    <table className={adminStyles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Admin</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.displayName || 'No Name'}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phoneNumber || 'None'}</td>
                                        <td>
                                            <span className={user.isAdmin ? adminStyles.activeStatus : adminStyles.inactiveStatus}>
                                                {user.isAdmin ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className={adminStyles.actionCell}>
                                            <Link href={`/admin/users/${user._id}`} className={adminStyles.viewButton}>
                                                View
                                            </Link>
                                            <button 
                                                onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                                                className={user.isAdmin ? adminStyles.dangerButton : adminStyles.successButton}
                                            >
                                                {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className={adminStyles.noData}>
                                        {error ? `Error: ${error}` : 'No users found'}
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