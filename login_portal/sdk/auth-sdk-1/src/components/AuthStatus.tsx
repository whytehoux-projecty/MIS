/**
 * AuthStatus - Displays current authentication status
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { useI18n } from '../i18n';
import { Button } from './ui/Button';

export interface AuthStatusProps {
    /** Show logout button */
    showLogout?: boolean;
    /** Custom class name */
    className?: string;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
    showLogout = true,
    className = '',
}) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { expiresInFormatted, isExpiringSoon } = useSession();
    const { t } = useI18n();

    if (!isAuthenticated) {
        return (
            <div className={`text-sm text-gray-500 ${className}`}>
                {t.authStatus.notSignedIn}
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        {user?.fullName.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>

                {/* User info */}
                <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.fullName}
                    </p>
                    {expiresInFormatted && (
                        <p className={`text-xs ${isExpiringSoon ? 'text-orange-500' : 'text-gray-500'}`}>
                            {t.authStatus.sessionLabel}: {expiresInFormatted}
                        </p>
                    )}
                </div>
            </div>

            {showLogout && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                >
                    {t.authStatus.signOutButton}
                </Button>
            )}
        </div>
    );
};
