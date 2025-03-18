'use client';

import { AuthProvider } from '@/context/AuthContext';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }) {
    return (
        <SessionProvider>
            {/* Comment out Firebase AuthProvider to avoid auth conflicts */}
            {/* <AuthProvider> */}
                {children}
            {/* </AuthProvider> */}
        </SessionProvider>
    );
} 