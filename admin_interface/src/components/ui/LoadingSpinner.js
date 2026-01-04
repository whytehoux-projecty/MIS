import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export const LoadingSpinner = ({ size = 'medium', className }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8',
    };
    return (_jsx("div", { className: cn('flex items-center justify-center', className), children: _jsx("div", { className: cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', sizeClasses[size]) }) }));
};
