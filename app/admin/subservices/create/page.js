'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import adminStyles from '../../admin.module.css';

export default function CreateSubServicePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        slug: '',
        service: '',
        price: '',
        isActive: true
    });

    // Fetch available services
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
                showToast.error('Failed to load services: ' + err.message);
            } finally {
                setLoadingServices(false);
            }
        };

        if (status === 'authenticated') {
            fetchServices();
        }
    }, [status, session]);

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
            
            // Validate price is a number
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                throw new Error('Price must be a positive number');
            }
            
            // Create the subservice with numeric price
            const subserviceData = {
                ...formData,
                price
            };
            
            const response = await fetch('/api/admin/subservices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify(subserviceData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create subservice');
            }
            
            const newSubService = await response.json();
            showToast.success('SubService created successfully!');
            
            // Redirect to subservice list
            router.push('/admin/subservices');
        } catch (err) {
            console.error('Error creating subservice:', err);
            showToast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loadingServices) {
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
                    <h1 className={styles.title}>Create New SubService</h1>
                    <div className={adminStyles.headerActions}>
                        <Link href="/admin/subservices" className={adminStyles.backLink}>
                            Back to SubServices
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
                                placeholder="Ex: Basic Cleaning"
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
                                    placeholder="ex: basic-cleaning"
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
                            <label htmlFor="service">Parent Service</label>
                            <select
                                id="service"
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                required
                                className={adminStyles.select}
                            >
                                <option value="">Select a service</option>
                                {services.map(service => (
                                    <option key={service._id} value={service._id}>
                                        {service.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={adminStyles.formGroup}>
                            <label htmlFor="price">Price ($)</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="49.99"
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
                                placeholder="Describe the subservice..."
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
                            {loading ? 'Creating...' : 'Create SubService'}
                        </button>
                        <Link href="/admin/subservices" className={adminStyles.cancelButton}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 