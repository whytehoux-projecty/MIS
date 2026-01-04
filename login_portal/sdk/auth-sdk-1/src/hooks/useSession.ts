/**
 * useSession Hook
 * 
 * Hook for managing session state and lifecycle.
 * 
 * @example
 * ```tsx
 * function SessionInfo() {
 *   const { isActive, expiresIn, refresh } = useSession();
 *   
 *   return (
 *     <div>
 *       <p>Session active: {isActive ? 'Yes' : 'No'}</p>
 *       <p>Expires in: {expiresIn} seconds</p>
 *       <button onClick={refresh}>Refresh Session</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../AuthProvider';

export const useSession = () => {
    const { session, isAuthenticated, refreshSession, logout } = useAuthContext();

    const [expiresIn, setExpiresIn] = useState<number | null>(null);

    // Update expiry countdown
    useEffect(() => {
        if (!session?.expiresAt) {
            setExpiresIn(null);
            return;
        }

        const updateExpiry = () => {
            const now = new Date();
            const diff = Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000);
            setExpiresIn(Math.max(0, diff));

            if (diff <= 0) {
                // Session expired
                logout();
            }
        };

        updateExpiry();
        const interval = setInterval(updateExpiry, 1000);

        return () => clearInterval(interval);
    }, [session?.expiresAt, logout]);

    // Computed values
    const isActive = isAuthenticated && expiresIn !== null && expiresIn > 0;
    const isExpiringSoon = expiresIn !== null && expiresIn > 0 && expiresIn <= 300; // 5 minutes
    const isExpired = expiresIn !== null && expiresIn <= 0;

    // Format expiry time
    const formatExpiresIn = useCallback(() => {
        if (expiresIn === null) return null;

        const minutes = Math.floor(expiresIn / 60);
        const seconds = expiresIn % 60;

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }, [expiresIn]);

    return {
        // State
        session,
        expiresIn,
        expiresInFormatted: formatExpiresIn(),

        // Computed
        isActive,
        isExpiringSoon,
        isExpired,

        // Actions
        refresh: refreshSession,
        logout,
    };
};
