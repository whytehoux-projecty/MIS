/**
 * Card Component
 */

import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    /** Add shadow */
    shadow?: boolean;
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Custom class name */
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    children,
    shadow = true,
    padding = 'lg',
    className = '',
}) => {
    const paddingSizes = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`
        bg-white dark:bg-gray-800 rounded-xl
        ${shadow ? 'shadow-lg' : ''}
        ${paddingSizes[padding]}
        ${className}
      `}
        >
            {children}
        </div>
    );
};
