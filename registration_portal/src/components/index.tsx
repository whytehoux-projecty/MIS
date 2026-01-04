/**
 * Reusable UI Components for Registration Portal
 */

import React from 'react';

// ============================================================================
// Loading Spinner
// ============================================================================

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <svg
            className={`animate-spin ${sizeClasses[size]} ${className}`}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
        </svg>
    );
};

// ============================================================================
// Button
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    disabled,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30',
        secondary: 'bg-gray-700 text-white hover:bg-gray-600',
        outline: 'border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white',
        ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Spinner size="sm" /> : icon}
            {children}
        </button>
    );
};

// ============================================================================
// Input
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                    {props.required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${error ? 'border-red-500' : 'border-gray-600'
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {hint && !error && <p className="text-gray-500 text-xs">{hint}</p>}
        </div>
    );
};

// ============================================================================
// Textarea
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    hint,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-300">
                    {label}
                    {props.required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none ${error ? 'border-red-500' : 'border-gray-600'
                    } ${className}`}
                {...props}
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {hint && !error && <p className="text-gray-500 text-xs">{hint}</p>}
        </div>
    );
};

// ============================================================================
// Checkbox
// ============================================================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    className = '',
    ...props
}) => {
    return (
        <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
            <input
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                {...props}
            />
            <span className="text-sm text-gray-400 group-hover:text-white transition">
                {label}
            </span>
        </label>
    );
};

// ============================================================================
// Card
// ============================================================================

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'glass-dark';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'glass-dark',
}) => {
    const variantClasses = {
        default: 'bg-gray-800 border border-gray-700',
        glass: 'glass',
        'glass-dark': 'glass-dark',
    };

    return (
        <div className={`rounded-2xl p-6 ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

// ============================================================================
// Progress Bar
// ============================================================================

interface ProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    label,
    showPercentage = false,
    className = '',
}) => {
    const percentage = Math.round((value / max) * 100);

    return (
        <div className={className}>
            {(label || showPercentage) && (
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    {label && <span>{label}</span>}
                    {showPercentage && <span>{percentage}%</span>}
                </div>
            )}
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

// ============================================================================
// Alert
// ============================================================================

interface AlertProps {
    variant: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const Alert: React.FC<AlertProps> = ({
    variant,
    title,
    children,
    className = '',
}) => {
    const variantClasses = {
        info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        error: 'bg-red-500/10 border-red-500/30 text-red-400',
    };

    const icons = {
        info: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
        success: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        ),
        warning: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        ),
        error: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
    };

    return (
        <div className={`border rounded-xl p-4 ${variantClasses[variant]} ${className}`}>
            <div className="flex gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[variant]}
                </svg>
                <div>
                    {title && <h4 className="font-semibold mb-1">{title}</h4>}
                    <div className="text-sm text-gray-300">{children}</div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// Timer Display
// ============================================================================

interface TimerDisplayProps {
    timeRemaining: number;
    formatTime: (seconds: number) => string;
    className?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    timeRemaining,
    formatTime,
    className = '',
}) => {
    const getTimerClass = () => {
        if (timeRemaining < 300) return 'text-red-400 bg-red-500/20';
        if (timeRemaining < 900) return 'text-yellow-400 bg-yellow-500/20';
        return 'text-emerald-400 bg-emerald-500/20';
    };

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getTimerClass()} ${className}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
        </div>
    );
};

// ============================================================================
// Step Indicator
// ============================================================================

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
    labels?: string[];
    className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps,
    labels = [],
    className = '',
}) => {
    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div
                        key={step}
                        className={`flex items-center ${step < totalSteps ? 'flex-1' : ''}`}
                    >
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step <= currentStep
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                        >
                            {step < currentStep ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step
                            )}
                        </div>
                        {step < totalSteps && (
                            <div
                                className={`flex-1 h-1 mx-2 transition-all ${step < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
            {labels.length > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                    {labels.map((label, i) => (
                        <span key={i} className={currentStep === i + 1 ? 'text-emerald-400' : ''}>
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// System Status Badge
// ============================================================================

interface SystemStatusBadgeProps {
    status: 'open' | 'closed' | 'limited' | null;
    className?: string;
}

export const SystemStatusBadge: React.FC<SystemStatusBadgeProps> = ({
    status,
    className = '',
}) => {
    if (!status) return null;

    const isOpen = status === 'open' || status === 'limited';

    return (
        <span className={`inline-flex items-center gap-2 text-xs ${isOpen ? 'text-emerald-400' : 'text-red-400'
            } ${className}`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            System {status}
        </span>
    );
};
