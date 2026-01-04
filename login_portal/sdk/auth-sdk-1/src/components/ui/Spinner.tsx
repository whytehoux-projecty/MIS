/**
 * Spinner Component
 */

import React from 'react';

export interface SpinnerProps {
    /** Spinner size */
    size?: 'small' | 'medium' | 'large';
    /** Color */
    color?: string;
    /** Custom class name */
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
    size = 'medium',
    color = 'currentColor',
    className = '',
}) => {
    const sizes = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    return (
        <svg
            className={`animate-spin ${sizes[size]} ${className}`}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke={color}
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill={color}
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};
