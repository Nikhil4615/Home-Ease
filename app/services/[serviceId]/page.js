// app/pages/services/[serviceId]/page.js
"use client"; // Mark this file as a client component

import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter from next/navigation
import { useEffect, useState } from 'react';
import styles from '@/styles/SubServices.module.css'; // Import the CSS module
import { Layout } from '@/components/Layout';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

const SubServicesPage = () => {
    const { serviceId } = useParams(); // Get the service ID from the URL parameters
    const router = useRouter();
    const [subServices, setSubServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [selectedService, setSelectedService] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        date: '',
        time: '',
        address: '',
        notes: '',
        phone: ''
    });
    const [phoneValid, setPhoneValid] = useState(null);

    const cleanupCart = () => {
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                if (Array.isArray(cart)) {
                    const cleanCart = cart.filter(item => 
                        item && 
                        item.subService && 
                        item.subService._id
                    );
                    localStorage.setItem('cart', JSON.stringify(cleanCart));
                } else {
                    localStorage.setItem('cart', JSON.stringify([]));
                }
            }
        } catch (error) {
            console.error('Error cleaning up cart:', error);
            localStorage.setItem('cart', JSON.stringify([]));
        }
    };

    useEffect(() => {
        cleanupCart();
    }, []);

    useEffect(() => {
        if (serviceId) {
            const fetchSubServices = async () => {
                console.log("Fetching sub-services for serviceId:", serviceId); // Log the serviceId
                try {
                    const response = await fetch(`/api/subservices/${serviceId}`); // Adjust the API endpoint as needed
                    if (!response.ok) {
                        throw new Error('Failed to fetch sub-services');
                    }
                    const data = await response.json();
                    console.log("Fetched sub-services data:", data); // Log the fetched data
                    setSubServices(data);
                } catch (err) {
                    console.error('Error fetching sub-services:', err);
                    setError(err.message);
                    showToast.error('Failed to load services');
                } finally {
                    setLoading(false);
                }
            };

            fetchSubServices();
        }
    }, [serviceId]);

    useEffect(() => {
        console.log("Current user:", user);
    }, [user]);

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\+?[1-9]\d{9,11}$/;
        const isValid = phoneRegex.test(phone);
        setPhoneValid(isValid);
        return isValid;
    };

    const handlePhoneBlur = () => {
        if (bookingDetails.phone) {
            validatePhoneNumber(bookingDetails.phone);
        } else {
            setPhoneValid(null);
        }
    };

    const addToCart = (subService) => {
        if (!user) {
            showToast.warning('Please login to add items to cart');
            return;
        }

        console.log("Selected subService:", subService);

        try {
            let existingCart = [];
            const cartData = localStorage.getItem('cart');
            
            if (cartData) {
                existingCart = JSON.parse(cartData);
                console.log("Existing cart:", existingCart);
            }

            const isDuplicate = existingCart.some(item => 
                item.subService._id === subService._id
            );

            if (isDuplicate) {
                showToast.error('This service is already in your cart');
                return;
            }

            setSelectedService(subService);

        } catch (error) {
            console.error('Error in addToCart:', error);
            showToast.error('Failed to process service selection');
        }
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();

        if (!user) {
            showToast.warning('Please login to make a booking');
            return;
        }

        if (!selectedService) {
            showToast.error('No service selected');
            return;
        }

        if (!bookingDetails.date || !bookingDetails.time || !bookingDetails.address || !bookingDetails.phone) {
            showToast.error('Please fill in all required fields');
            return;
        }

        if (!validatePhoneNumber(bookingDetails.phone)) {
            showToast.error('Please enter a valid phone number');
            return;
        }

        try {
            let existingCart = [];
            const cartData = localStorage.getItem('cart');
            
            if (cartData) {
                existingCart = JSON.parse(cartData);
            }

            const cartItem = {
                id: Date.now().toString(),
                booking: {
                    userId: user.id || user.email,
                    serviceId: serviceId,
                    subServiceId: selectedService._id,
                    date: bookingDetails.date,
                    time: bookingDetails.time,
                    address: bookingDetails.address,
                    notes: bookingDetails.notes || '',
                    phone: bookingDetails.phone,
                    price: selectedService.price
                },
                subService: {
                    _id: selectedService._id,
                    title: selectedService.title,
                    price: selectedService.price,
                    description: selectedService.description,
                    image: selectedService.image
                }
            };

            const updatedCart = [...existingCart, cartItem];
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            console.log("Updated cart:", updatedCart);

            setBookingDetails({
                date: '',
                time: '',
                address: '',
                notes: '',
                phone: ''
            });
            setSelectedService(null);

            showToast.success('Service added to cart successfully!');

            router.push('/cart');

        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast.error('Failed to add service to cart. Please try again.');
        }
    };

    if (loading) return (
        <Layout>
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <p>Loading services...</p>
            </div>
        </Layout>
    );

    if (error) return (
        <div className={styles.errorContainer}>
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
                Retry
            </button>
        </div>
    );

    return (
        <Layout>
            <div className={styles.container}>
                <h2 className={styles.subServiceTitle}>Available Services</h2>
                <div className={styles.subServiceGrid}>
                {subServices.map((subService) => (
                        <div key={subService._id} className={styles.subServiceCard}>
                            <div className={styles.cardImage}>
                                <Image
                                    src={subService.image || '/download.jpg'}
                                    alt={'subservice image'}
                                    width={300}
                                    height={200}
                                    objectFit="cover"
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{subService.title}</h3>
                                <p className={styles.cardDescription}>{subService.description}</p>
                                <div className={styles.cardDetails}>
                                    <p className={styles.cardPrice}>${subService.price}</p>
                                    <p className={styles.cardDuration}>{subService.duration || '1 hour'}</p>
                                </div>
                                <button 
                                    className={styles.addToCartButton}
                                    onClick={() => addToCart(subService)}
                                >
                                    Book Now
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedService && (
                    <div className={styles.modal} onClick={() => setSelectedService(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>Booking Details for {selectedService.title}</h3>
                                <button 
                                    className={styles.closeButton}
                                    onClick={() => setSelectedService(null)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleBookingSubmit}>
                                <div className={`${styles.formGroup} ${
                                    phoneValid === null ? '' : phoneValid ? styles.phoneValid : styles.phoneInvalid
                                }`}>
                                    <label>Phone Number:*</label>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="tel"
                                            value={bookingDetails.phone}
                                            onChange={(e) => {
                                                setBookingDetails({
                                                    ...bookingDetails,
                                                    phone: e.target.value
                                                });
                                                if (e.target.value === '') setPhoneValid(null);
                                            }}
                                            onBlur={handlePhoneBlur}
                                            placeholder=" "
                                            required
                                        />
                                        <span className={styles.floatingLabel}>Enter your phone number</span>
                                    </div>
                                    {phoneValid === false && (
                                        <div className={`${styles.validationMessage} ${styles.error}`}>
                                            Please enter a valid phone number
                                        </div>
                                    )}
                                    {phoneValid === true && (
                                        <div className={`${styles.validationMessage} ${styles.success}`}>
                                            Phone number is valid
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Preferred Date:*</label>
                                    <div className={styles.dateInput}>
                                        <input
                                            type="date"
                                            value={bookingDetails.date}
                                            onChange={(e) => setBookingDetails({
                                                ...bookingDetails,
                                                date: e.target.value
                                            })}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Preferred Time:*</label>
                                    <div className={styles.timeInput}>
                                        <input
                                            type="time"
                                            value={bookingDetails.time}
                                            onChange={(e) => setBookingDetails({
                                                ...bookingDetails,
                                                time: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Service Address:*</label>
                                    <div className={styles.inputWrapper}>
                                        <textarea
                                            value={bookingDetails.address}
                                            onChange={(e) => setBookingDetails({
                                                ...bookingDetails,
                                                address: e.target.value
                                            })}
                                            placeholder=" "
                                            required
                                        />
                                        <span className={styles.floatingLabel}>Enter your complete service address</span>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Additional Notes:</label>
                                    <div className={styles.inputWrapper}>
                                        <textarea
                                            value={bookingDetails.notes}
                                            onChange={(e) => setBookingDetails({
                                                ...bookingDetails,
                                                notes: e.target.value
                                            })}
                                            placeholder=" "
                                        />
                                        <span className={styles.floatingLabel}>Any special instructions or requirements</span>
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button 
                                        type="submit"
                                        className={styles.submitButton}
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => setSelectedService(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
        </Layout>
    );
};

export default SubServicesPage;