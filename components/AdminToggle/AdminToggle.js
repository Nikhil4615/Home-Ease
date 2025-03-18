'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { showToast } from '@/utils/toast';
import styles from './AdminToggle.module.css';

export const AdminToggle = () => {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  
  // Only show this component in development environment
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  const toggleAdmin = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ devKey: 'dev-mode' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle admin status');
      }
      
      const data = await response.json();
      showToast.success(data.message);
      
      // Update the session with the new admin status
      await update({
        ...session,
        user: {
          ...session?.user,
          isAdmin: data.isAdmin
        }
      });
      
    } catch (error) {
      console.error('Error toggling admin status:', error);
      showToast.error(error.message || 'Failed to toggle admin status');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.adminToggleSection}>
        <div className={styles.adminStatusInfo}>
          <h3>Developer Settings</h3>
          <p className={styles.warning}>
            <strong>Warning:</strong> These settings are for development only
          </p>
          <p>
            Current Admin Status: 
            <span className={session?.user?.isAdmin ? styles.isAdmin : styles.notAdmin}>
              {session?.user?.isAdmin ? ' Admin' : ' Not Admin'}
            </span>
          </p>
        </div>
        <button 
          className={styles.toggleButton} 
          onClick={toggleAdmin}
          disabled={loading}
        >
          {loading ? 'Updating...' : session?.user?.isAdmin ? 'Disable Admin' : 'Enable Admin'}
        </button>
      </div>
    </div>
  );
}; 