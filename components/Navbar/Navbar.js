"use client"; // Add this line to make it a client component

import React, { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Link from 'next/link'; // Import Link from Next.js
import Image from 'next/image';
import './Navbar.css'; // Assuming you have some CSS for styling
import { showToast } from '@/utils/toast';
import { useRouter } from 'next/navigation'; // Add this import

const Navbar = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const router = useRouter(); // Add router

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Update cart count
    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

    const handleGoogleLogin = async () => {
        try {
            showToast.info('Connecting to Google...');
            const result = await signIn('google', { 
                callbackUrl: '/',
                redirect: false
            });
            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error signing in:", error);
            showToast.error(error.message || 'Failed to login');
        }
    };

    const handleLogout = async () => {
        try {
            showToast.info('Logging out...');
            setShowProfile(false);
            await signOut({ 
                callbackUrl: '/',
                redirect: false
            });
            localStorage.removeItem('cart');
            showToast.success('Logged out successfully');
            router.refresh();
        } catch (error) {
            console.error("Error logging out: ", error);
            showToast.error('Failed to logout');
        }
    };

    const getInitial = () => {
        return session?.user?.name?.[0] || session?.user?.email?.[0] || 'U';
    };

    const ProfileImage = ({ user, size = 'small' }) => {
        const imageSize = size === 'large' ? 60 : 40;
        
        if (!user?.image) {
            return (
                <div className={`profile-initial ${size === 'large' ? 'profile-initial-large' : ''}`}>
                    {user?.name?.[0] || user?.email?.[0] || 'U'}
                </div>
            );
        }

        return (
            <div className={`profile-image-container ${size === 'large' ? 'profile-image-large' : ''}`}>
                <Image
                    src={user.image}
                    alt="Profile"
                    width={imageSize}
                    height={imageSize}
                    className="profile-avatar"
                    priority={size === 'small'}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                    }}
                />
            </div>
        );
    };

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-left">
                <Link href="/" className="logo-link">
                    <div className="logo-container">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="nav-logo"
                            priority
                        />
                        <span className="site-name">HomeEase</span>
                    </div>
                </Link>
            </div>
            <div className="navbar-right">
                <Link href="/cart" className="cart-link">
                    <div className="cart-icon-container">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeWidth="2" d="M3 3h2l3 9h12l1.5 3H8.25M6 21a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="cart-count">{cartCount}</span>
                        )}
                    </div>
                </Link>
                {loading ? (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                    </div>
                ) : session?.user ? (
                    <div className="user-profile">
                        <button 
                            className="profile-circle"
                            onClick={() => setShowProfile(!showProfile)}
                            aria-expanded={showProfile}
                            aria-label="Toggle profile menu"
                        >
                            <ProfileImage user={session.user} />
                        </button>
                        
                        {showProfile && (
                            <div className="profile-dropdown" onMouseLeave={() => setShowProfile(false)}>
                                <div className="profile-header">
                                    <div className="profile-info">
                                        <div className="profile-avatar-large">
                                            <ProfileImage user={session.user} size="large" />
                                        </div>
                                        <div className="profile-details">
                                            <h2>{session.user.name || 'User'}</h2>
                                            <p>{session.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="profile-content">
                                    <Link 
                                        href="/pages/profile" 
                                        className="profile-link"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <span>Profile Settings</span>
                                    </Link>
                                    
                                    <Link 
                                        href="/bookings" 
                                        className="profile-link"
                                        onClick={() => setShowProfile(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span>My Bookings</span>
                                    </Link>
                                </div>
                                
                                <button 
                                    type="button"
                                    onClick={handleLogout}
                                    className="logout-button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button 
                        onClick={handleGoogleLogin}
                        className="login-button"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Login with Google</span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
