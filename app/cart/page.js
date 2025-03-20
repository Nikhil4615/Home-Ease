"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '@/styles/Cart.module.css';
import serviceStyles from '@/styles/SubServices.module.css'
import { showToast } from '@/utils/toast';
import { Layout } from '@/components/Layout';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    // Load cart items from localStorage
    useEffect(() => {
        try {
            const items = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(items);
        } catch (error) {
            console.error('Error loading cart:', error);
            showToast.error('Error loading cart items');
        } finally {
            setLoading(false);
        }
    }, []);

    // Calculate total price from subService prices
    const totalPrice = cartItems.reduce((total, item) => {
        return total + (item.subService?.price || 0);
    }, 0);

    const handleRemoveItem = (itemId) => {
        try {
            // Filter out the item from cartItems
            const updatedCart = cartItems.filter(item => item.id !== itemId);
            
            // Update localStorage
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            
            // Update state
            setCartItems(updatedCart);
            
            showToast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            showToast.error('Failed to remove item');
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            showToast.warning('Your cart is empty');
            return;
        }

        try {
            // Clear cart after successful checkout
            localStorage.setItem('cart', '[]');
            setCartItems([]);
            showToast.success('Checkout successful!');
            // Add your checkout logic here
        } catch (error) {
            console.error('Checkout error:', error);
            showToast.error('Checkout failed');
        }
    };

    const renderCartContent = () => {
        if (loading) return <div className={styles.loading}>Loading cart...</div>;
        
        if (status !== 'authenticated') return (
            <div className={styles.container}>
                <h1>Please log in to view your cart</h1>
                <Link href="/" className={styles.continueLink}>
                    Continue Shopping
                </Link>
            </div>
        );

        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Your Cart</h1>
                
                {cartItems.length === 0 ? (
                    <div className={styles.emptyCart}>
                        <p>Your cart is empty</p>
                        <Link href="/services" className={serviceStyles.addToCartButton}>
                            Explore Services
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.cartItems}>
                            {cartItems.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemInfo}>
                                        <h3>{item.subService.title}</h3>
                                        <p className={styles.description}>
                                            {item.subService.description}
                                        </p>
                                        <div className={styles.bookingDetails}>
                                            <p><strong>Date:</strong> {new Date(item.booking.date).toLocaleDateString()}</p>
                                            <p><strong>Time:</strong> {item.booking.time}</p>
                                            <p><strong>Address:</strong> {item.booking.address}</p>
                                            {item.booking.notes && (
                                                <p><strong>Notes:</strong> {item.booking.notes}</p>
                                            )}
                                            <p><strong>Phone:</strong> {item.booking.phone}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <p className={styles.price}>${item.subService.price}</p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cartSummary}>
                            <div className={styles.summaryDetails}>
                                <div className={styles.summaryRow}>
                                    <span>Subtotal:</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Tax (10%):</span>
                                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.total}`}>
                                    <span>Total:</span>
                                    <span>${(totalPrice * 1.1).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className={styles.checkoutButton}
                            >
                                Proceed to Checkout
                            </button>

                            <Link href="/" className={styles.continueLink}>
                                Continue Shopping
                            </Link>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <Layout>
            {renderCartContent()}
        </Layout>
    );
};

export default CartPage;
