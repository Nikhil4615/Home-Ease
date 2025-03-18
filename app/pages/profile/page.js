'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { showToast } from '@/utils/toast';
import styles from '@/styles/Profile.module.css';
import { useRouter } from 'next/navigation';
import { AdminToggle } from '@/components/AdminToggle/AdminToggle';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [activeAddress, setActiveAddress] = useState(0);
  const [formChanged, setFormChanged] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Check authentication
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Only fetch user data if authenticated
    if (status === 'authenticated') {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user', {
            headers: {
              'Content-Type': 'application/json',
              // Add session token if needed
              Authorization: `Bearer ${session?.accessToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const userData = await response.json();
          console.log("Fetched user data:", userData);
          setUser(userData);
          calculateProfileCompletion(userData);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError(err.message);
          showToast.error('Failed to load profile: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [status, session, router]);

  const calculateProfileCompletion = (userData) => {
    if (!userData) return 0;

    const fields = [
      { name: 'displayName', weight: 20 },
      { name: 'phoneNumber', weight: 15 },
      { name: 'photoURL', weight: 15 },
      { name: 'addresses', weight: 50, isArray: true },
    ];

    let totalCompletion = 0;
    
    fields.forEach(field => {
      if (field.isArray) {
        // Check if at least one complete address exists
        if (userData.addresses && userData.addresses.length > 0) {
          const addressCompletion = userData.addresses.reduce((highest, address) => {
            const addressFields = ['street', 'city', 'state', 'zipCode'];
            const filledFields = addressFields.filter(f => address[f]?.trim()).length;
            const addressPercentage = (filledFields / addressFields.length) * field.weight;
            return Math.max(highest, addressPercentage);
          }, 0);
          totalCompletion += addressCompletion;
        }
      } else if (userData[field.name]) {
        totalCompletion += field.weight;
      }
    });

    setCompletionPercentage(Math.round(totalCompletion));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
    setFormChanged(true);
    
    // Reset image error state when the photoURL is changed
    if (name === 'photoURL') {
      setImageError(false);
    }
  };

  const handleAddressChange = (e, index, field) => {
    const { value } = e.target;
    const updatedAddresses = [...(user.addresses || [])];
    
    if (!updatedAddresses[index]) {
      updatedAddresses[index] = {};
    }
    
    updatedAddresses[index][field] = value;
    
    setUser(prevUser => ({ ...prevUser, addresses: updatedAddresses }));
    setFormChanged(true);
  };

  const handleAddAddress = () => {
    const addresses = user.addresses || [];
    setUser(prevUser => ({
      ...prevUser,
      addresses: [...addresses, { street: '', city: '', state: '', zipCode: '', isDefault: addresses.length === 0 }]
    }));
    setActiveAddress(addresses.length);
    setFormChanged(true);
  };

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = (user.addresses || []).map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }));
    
    setUser(prevUser => ({ ...prevUser, addresses: updatedAddresses }));
    setFormChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      if (!user?.email) {
        throw new Error('Email is required');
      }

      const response = await fetch(`/api/user/profile/${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      calculateProfileCompletion(updatedUser);
      setFormChanged(false);
      showToast.success('Profile updated successfully!');
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
      showToast.error('Failed to update profile: ' + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading' || (loading && !user)) {
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

  // Show error if not authenticated
  if (status === 'unauthenticated') {
    return (
      <Layout>
        <div className={styles.container}>
          <div className="error-message">
            Please log in to view your profile
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error && !user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className="error-message">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  // Show no data state
  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className="no-data">No user data found.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Profile</h1>
        </div>
        
        {/* Profile Completion Indicator */}
        <div className={styles.completionContainer}>
          <div className={styles.completionHeader}>
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className={styles.completionBar}>
            <div 
              className={styles.completionFill} 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          {completionPercentage < 100 && (
            <p className={styles.completionMessage}>
              Complete your profile to get the most out of our services.
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.profileGrid}>
            {/* Basic Information */}
            <div className={styles.panel}>
              <h2>Basic Information</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email (cannot be changed)</label>
                <input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={user.displayName || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={user.phoneNumber || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="photoURL">Profile Picture URL</label>
                <input
                  id="photoURL"
                  name="photoURL"
                  type="text"
                  value={user.photoURL || ''}
                  onChange={handleInputChange}
                  placeholder="Enter profile image URL"
                />
                <div className={styles.profileContainer}>
                  <div className={styles.profilePreview}>
                    {user.photoURL && !imageError ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile preview" 
                        className={styles.profileImage}
                        onError={(e) => {
                          console.log("Image failed to load");
                          setImageError(true);
                          e.target.src = '/placeholder-avatar.png';
                        }} 
                      />
                    ) : (
                      <div className={styles.profilePlaceholder}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className={styles.panel}>
              <h2>Address Information</h2>
              
              {/* Address Tabs */}
              {user.addresses && user.addresses.length > 0 && (
                <div className={styles.addressTabs}>
                  {user.addresses.map((address, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`${styles.addressTab} ${
                        activeAddress === index ? styles.active : ''
                      } ${address.isDefault ? styles.default : ''}`}
                      onClick={() => setActiveAddress(index)}
                    >
                      {address.city || `Address ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Active Address Form */}
              {user.addresses && user.addresses[activeAddress] ? (
                <div>
                  <div className={styles.formGroup}>
                    <label htmlFor="street">Street</label>
                    <input
                      id="street"
                      type="text"
                      value={user.addresses[activeAddress].street || ''}
                      onChange={(e) => handleAddressChange(e, activeAddress, 'street')}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      value={user.addresses[activeAddress].city || ''}
                      onChange={(e) => handleAddressChange(e, activeAddress, 'city')}
                    />
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="state">State</label>
                      <input
                        id="state"
                        type="text"
                        value={user.addresses[activeAddress].state || ''}
                        onChange={(e) => handleAddressChange(e, activeAddress, 'state')}
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="zipCode">Zip Code</label>
                      <input
                        id="zipCode"
                        type="text"
                        value={user.addresses[activeAddress].zipCode || ''}
                        onChange={(e) => handleAddressChange(e, activeAddress, 'zipCode')}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleSetDefaultAddress(activeAddress)}
                    disabled={user.addresses[activeAddress].isDefault}
                    className={`${styles.defaultButton} ${
                      user.addresses[activeAddress].isDefault ? styles.isDefault : styles.notDefault
                    }`}
                  >
                    {user.addresses[activeAddress].isDefault 
                      ? 'Default Address' 
                      : 'Set as Default'}
                  </button>
                </div>
              ) : (
                <p className={styles.noData}>No addresses added yet.</p>
              )}
              
              <button
                type="button"
                onClick={handleAddAddress}
                className={styles.addButton}
              >
                Add New Address
              </button>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!formChanged || submitLoading}
            className={`${styles.saveButton} ${
              !formChanged || submitLoading ? styles.disabled : styles.active
            }`}
          >
            {submitLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        
        <div className={styles.accountInfo}>
          <p>Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          <p>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</p>
        </div>
        
        {/* Admin Toggle for Development */}
        <AdminToggle />
      </div>
    </Layout>
  );
}