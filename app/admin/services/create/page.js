'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../../admin.module.css';

export default function CreateServicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        slug: '',
        type: '',
        category: '',
        isActive: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateSlug = () => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-');
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            const response = await fetch('/api/admin/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create service');
            }
            
            const newService = await response.json();
            showToast.success('Service created successfully!');
            
            // Redirect to service list or edit page
            router.push('/admin/services');
        } catch (err) {
            console.error('Error creating service:', err);
            showToast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
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
                    <h1 className={styles.title}>Create New Service</h1>
                    <div className={adminStyles.headerActions}>
                        <Link href="/admin/services" className={adminStyles.backLink}>
                            Back to Services
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={adminStyles.form}>
                    <div className={adminStyles.formGrid}>
                        <div className={adminStyles.formGroup}>
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={generateSlug}
                                required
                                placeholder="Ex: House Cleaning"
                            />
                        </div>

                        <div className={adminStyles.formGroup}>
                            <label htmlFor="slug">Slug</label>
                            <div className={adminStyles.slugField}>
                                <input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    placeholder="ex: house-cleaning"
                                />
                                <button 
                                    type="button" 
                                    onClick={generateSlug}
                                    className={adminStyles.generateButton}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div className={adminStyles.formGroup}>
                            <label htmlFor="category">Category</label>
                            <input
                                id="category"
                                name="category"
                                type="text"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Cleaning"
                            />
                        </div>

                        <div className={adminStyles.formGroup}>
                            <label htmlFor="type">Type</label>
                            <input
                                id="type"
                                name="type"
                                type="text"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Home Service"
                            />
                        </div>

                        <div className={`${adminStyles.formGroup} ${adminStyles.fullWidth}`}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Describe the service..."
                            />
                        </div>

                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                Active
                            </label>
                        </div>
                    </div>

                    <div className={adminStyles.formActions}>
                        <button
                            type="submit"
                            className={adminStyles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Service'}
                        </button>
                        <Link href="/admin/services" className={adminStyles.cancelButton}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 