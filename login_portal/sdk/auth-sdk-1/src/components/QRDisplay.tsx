/**
 * QRDisplay - Displays a QR code with countdown timer
 */

import React from 'react';
import { useI18n } from '../i18n';

export interface QRDisplayProps {
    /** QR code image (base64 or URL) */
    qrImage: string;
    /** Seconds until expiration */
    expiresIn: number;
    /** Called when QR expires */
    onExpired?: () => void;
    /** Custom class name */
    className?: string;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
    qrImage,
    expiresIn,
    onExpired,
    className = '',
}) => {
    const { t } = useI18n();

    // Handle expiration
    React.useEffect(() => {
        if (expiresIn <= 0) {
            onExpired?.();
        }
    }, [expiresIn, onExpired]);

    // Format time
    const minutes = Math.floor(expiresIn / 60);
    const seconds = expiresIn % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Color based on time remaining
    const getTimerColor = () => {
        if (expiresIn <= 15) return 'text-red-600';
        if (expiresIn <= 30) return 'text-orange-500';
        return 'text-gray-600';
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* QR Code Image */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <img
                    src={qrImage}
                    alt="Login QR Code"
                    className="w-48 h-48"
                />
            </div>

            {/* Timer */}
            <div className={`mt-4 flex items-center gap-2 ${getTimerColor()}`}>
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="font-mono font-medium">
                    {timeString}
                </span>
            </div>

            {/* Instructions */}
            <p className="mt-4 text-sm text-gray-500 text-center max-w-xs">
                {t.qrDisplay.instructions}
            </p>
        </div>
    );
};
