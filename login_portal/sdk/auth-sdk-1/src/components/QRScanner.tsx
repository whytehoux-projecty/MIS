/**
 * QRScanner - Camera-based QR code scanner (for mobile apps)
 * 
 * This component is used in mobile apps to scan QR codes
 * displayed on other services.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useI18n } from '../i18n';
import { Alert } from './ui/Alert';

export interface QRScannerProps {
    /** Called when a QR code is successfully scanned */
    onScan: (decodedText: string) => void;
    /** Called when there's an error */
    onError?: (error: string) => void;
    /** Width of the scanner */
    width?: number;
    /** Height of the scanner */
    height?: number;
    /** Custom class name */
    className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
    onScan,
    onError,
    width = 300,
    height = 300,
    className = '',
}) => {
    const { t } = useI18n();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isStarted, setIsStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const containerId = 'qr-scanner-container';

    useEffect(() => {
        // Initialize scanner
        const initScanner = async () => {
            try {
                // Create scanner instance
                scannerRef.current = new Html5QrcodeScanner(
                    containerId,
                    {
                        fps: 10,
                        qrbox: { width: Math.min(width - 50, 250), height: Math.min(height - 50, 250) },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                    },
                    false // verbose
                );

                // Render scanner
                scannerRef.current.render(
                    (decodedText) => {
                        // Success callback
                        onScan(decodedText);

                        // Clear scanner after successful scan
                        if (scannerRef.current) {
                            scannerRef.current.clear().catch(console.error);
                        }
                    },
                    (errorMessage) => {
                        // Error callback - only handle actual errors
                        if (errorMessage.includes('Permission denied') ||
                            errorMessage.includes('NotAllowedError')) {
                            setPermissionDenied(true);
                            setError(t.errors.cameraPermissionDenied);
                            onError?.(errorMessage);
                        } else if (errorMessage.includes('NotFoundError')) {
                            setError(t.qrScanner.noCameraError);
                            onError?.(errorMessage);
                        }
                        // Ignore scan failures (no QR in frame)
                    }
                );

                setIsStarted(true);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to initialize scanner';
                setError(errorMsg);
                onError?.(errorMsg);
            }
        };

        initScanner();

        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [onScan, onError, width, height, t]);

    if (permissionDenied) {
        return (
            <div className={`flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
                <svg
                    className="w-16 h-16 text-red-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m0 0v2m0-2h2m-2 0H10m3-10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v0m4 0h3a2 2 0 012 2v0m0 0v3"
                    />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t.qrScanner.permissionTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
                    {t.qrScanner.permissionMessage}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                    {t.qrScanner.tryAgainButton}
                </button>
            </div>
        );
    }

    if (error && !permissionDenied) {
        return (
            <Alert type="error" className={className}>
                {error}
            </Alert>
        );
    }

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div
                id={containerId}
                className={`border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-[${width}px] h-[${height}px]`}
            />

            {!isStarted && (
                <div className="flex items-center gap-2 mt-4 text-gray-500">
                    <svg
                        className="w-5 h-5 animate-spin"
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
                    <span>{t.qrScanner.initializingCamera}</span>
                </div>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {t.qrScanner.scanInstructions}
            </p>
        </div>
    );
};
