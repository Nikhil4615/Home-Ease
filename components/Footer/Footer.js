"use client"; // Add this line to make it a client component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Footer.css'; // Import the CSS file

const Footer = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter signup logic
        console.log('Newsletter signup submitted');
        // Show a toast notification or other feedback
    };

    return (
        <footer className="footer">
            <div className="footerWave"></div>
            <div className="footerContent">
                <div className="footerSection">
                    <Link href="/" className="footerLogo">
                        <Image
                            src="/logo.png"
                            alt="HomeEase Logo"
                            width={40}
                            height={40}
                            className="logoImage"
                        />
                        <span className="logoText">HomeEase</span>
                    </Link>
                    <p className="footerDescription">
                        Your trusted partner for home services. We connect you with professional service providers to make your home life easier.
                    </p>
                    <div className="socialLinks">
                        <a href="https://facebook.com" className="socialIcon" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>
                        <a href="https://twitter.com" className="socialIcon" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                            </svg>
                        </a>
                        <a href="https://instagram.com" className="socialIcon" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a href="https://linkedin.com" className="socialIcon" aria-label="LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="footerSection">
                    <h3 className="footerHeading">Quick Links</h3>
                    <ul className="footerLinks">
                        <li><Link href="/" className="footerLink">Home</Link></li>
                        <li><Link href="/services" className="footerLink">Services</Link></li>
                        <li><Link href="/about" className="footerLink">About Us</Link></li>
                        <li><Link href="/faq" className="footerLink">FAQs</Link></li>
                        <li><Link href="/contact" className="footerLink">Contact</Link></li>
                    </ul>
                </div>

                <div className="footerSection">
                    <h3 className="footerHeading">Services</h3>
                    <ul className="footerLinks">
                        <li><Link href="/services" className="footerLink">Cleaning</Link></li>
                        <li><Link href="/services" className="footerLink">Plumbing</Link></li>
                        <li><Link href="/services" className="footerLink">Electrical</Link></li>
                        <li><Link href="/services" className="footerLink">Gardening</Link></li>
                        <li><Link href="/services" className="footerLink">Painting</Link></li>
                    </ul>
                </div>

                <div className="footerSection">
                    <h3 className="footerHeading">Contact Us</h3>
                    <ul className="contactInfo">
                        <li>
                            <span className="contactIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </span>
                            <span>Athwa ,Surat ,India</span>
                        </li>
                        <li>
                            <span className="contactIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </span>
                            <span>+91 6290857061</span>
                        </li>
                        <li>
                            <span className="contactIcon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </span>
                            <span>nikhiltiwari7424@gmail.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="copyright">
                <p>© {new Date().getFullYear()} HomeEase. All rights reserved.</p>
            </div>

            <button 
                className={`scrollTop ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </button>
        </footer>
    );
};

export default Footer;
