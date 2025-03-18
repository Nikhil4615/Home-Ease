'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { showToast } from '@/utils/toast';
import styles from './ErrorMessage.module.css';

export const ErrorMessage = () => {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error === 'unauthorized' && message) {
      showToast.error(decodeURIComponent(message.replace(/\+/g, ' ')));
    }
  }, [searchParams]);
  
  return null; // This component doesn't render anything, it just shows a toast
}; 