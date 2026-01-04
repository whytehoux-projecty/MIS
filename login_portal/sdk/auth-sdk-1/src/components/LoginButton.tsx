/**
 * LoginButton - A simple button that triggers QR login
 */

import React from 'react';
import { useI18n } from '../i18n';
import { Button } from './ui/Button';

export interface LoginButtonProps {
    /** Called when button is clicked */
    onClick: () => void;
    /** Button text (overrides i18n) */
    text?: string;
    /** Loading state */
    loading?: boolean;
    /** Custom class name */
    className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
    onClick,
    text,
    loading = false,
    className = '',
}) => {
    const { t } = useI18n();

    return (
        <Button
            onClick={onClick}
            loading={loading}
            className={className}
            leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            }
        >
            {text ?? t.loginButton.defaultText}
        </Button>
    );
};
