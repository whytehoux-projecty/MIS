/**
 * LoginPage - Complete drop-in login page component
 * 
 * A fully featured login page that handles the entire QR authentication flow.
 * Just drop this component into your app and you're done!
 * 
 * @example
 * ```tsx
 * <LoginPage 
 *   onSuccess={(user) => navigate('/dashboard')}
 *   title="Welcome Back"
 * />
 * ```
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQRAuth } from '../hooks/useQRAuth';
import { useAuthContext } from '../AuthProvider';
import { useI18n } from '../i18n';
import { QRDisplay } from './QRDisplay';
import { PinEntry } from './PinEntry';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { Alert } from './ui/Alert';

export interface LoginPageProps {
    /** Called when login is successful */
    onSuccess?: (user: { id: number; username: string; fullName: string; email: string }) => void;
    /** Called when login fails */
    onError?: (error: Error) => void;
    /** Page title (overrides i18n) */
    title?: string;
    /** Subtitle text (overrides i18n) */
    subtitle?: string;
    /** Show manual key entry option */
    showManualEntry?: boolean;
    /** Custom styles */
    className?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
    onSuccess,
    onError,
    title,
    subtitle,
    showManualEntry = true,
    className = '',
}) => {
    const { isAuthenticated, user, login, error: authError, clearError } = useAuth();
    const { config } = useAuthContext();
    const { t, interpolate } = useI18n();
    const {
        step,
        qrImage,
        expiresIn,
        error: qrError,
        startQRAuth,
        verifyPin,
        retry,
        reset,
    } = useQRAuth();

    const [showManual, setShowManual] = useState(false);
    const [membershipKey, setMembershipKey] = useState('');
    const [manualLoading, setManualLoading] = useState(false);

    // Use provided props or fall back to i18n translations
    const displayTitle = title ?? t.login.title;
    const displaySubtitle = subtitle ?? t.login.subtitle;

    // Start QR auth on mount or when switching modes
    useEffect(() => {
        if (!showManual) {
            startQRAuth();
        }
        return () => {
            reset();
        };
    }, [showManual, startQRAuth, reset]);

    // Handle successful login
    useEffect(() => {
        if (isAuthenticated && user) {
            onSuccess?.(user);
        }
    }, [isAuthenticated, user, onSuccess]);

    // Handle errors
    useEffect(() => {
        const error = authError || qrError;
        if (error) {
            onError?.(new Error(error));
        }
    }, [authError, qrError, onError]);

    // Manual login handler
    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!membershipKey.trim()) return;

        setManualLoading(true);
        clearError();

        try {
            await login(membershipKey);
        } catch (err) {
            // Error handled by useAuth
        } finally {
            setManualLoading(false);
        }
    };

    // Get branding
    const branding = config.branding;
    const primaryColor = branding?.primaryColor || '#10b981';

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 ${className}`} role="main" aria-label="Login Page">
            <Card className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    {branding?.logo && (
                        <img
                            src={branding.logo}
                            alt={branding.name || 'Company Logo'}
                            className="h-12 mx-auto mb-4"
                        />
                    )}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {displayTitle}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {displaySubtitle}
                    </p>
                </div>

                {/* Error Alert */}
                {(authError || qrError) && (
                    <Alert type="error" className="mb-6" aria-live="polite">
                        {authError || qrError}
                    </Alert>
                )}

                {/* QR Code View */}
                {!showManual && (
                    <div className="space-y-6">
                        {/* QR Display */}
                        {step === 'generating' && (
                            <div className="flex justify-center py-12" aria-label={t.states.generatingQR}>
                                <Spinner size="large" />
                            </div>
                        )}

                        {step === 'waiting' && qrImage && (
                            <QRDisplay
                                qrImage={qrImage}
                                expiresIn={expiresIn || 0}
                                onExpired={retry}
                            />
                        )}

                        {step === 'scanned' && (
                            <div className="space-y-4">
                                <Alert type="success">
                                    {t.alerts.qrScannedEnterPin}
                                </Alert>
                                <PinEntry
                                    onSubmit={verifyPin}
                                    length={6}
                                />
                            </div>
                        )}

                        {step === 'verifying' && (
                            <div className="flex flex-col items-center py-8" aria-label={t.states.verifying}>
                                <Spinner size="large" />
                                <p className="mt-4 text-gray-600">{t.states.verifying}</p>
                            </div>
                        )}

                        {step === 'expired' && (
                            <div className="text-center space-y-4">
                                <Alert type="warning">
                                    {t.alerts.qrExpiredGenerateNew}
                                </Alert>
                                <Button onClick={retry} style={{ backgroundColor: primaryColor }}>
                                    {t.qrDisplay.generateNewButton}
                                </Button>
                            </div>
                        )}

                        {step === 'error' && (
                            <div className="text-center space-y-4">
                                <Button onClick={retry} style={{ backgroundColor: primaryColor }}>
                                    {t.errors.generic.includes('try again') ? t.errors.generic : 'Try Again'}
                                </Button>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t.success.signedIn}
                                </h3>
                                {user && (
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        {interpolate(t.success.welcomeBack, { name: user.fullName })}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Manual Entry View */}
                {showManual && (
                    <form onSubmit={handleManualLogin} className="space-y-4">
                        <Input
                            label={t.login.membershipKeyLabel}
                            type="password"
                            value={membershipKey}
                            onChange={(e) => setMembershipKey(e.target.value)}
                            placeholder={t.login.membershipKeyPlaceholder}
                            disabled={manualLoading}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            fullWidth
                            loading={manualLoading}
                            style={{ backgroundColor: primaryColor }}
                        >
                            {t.login.signInButton}
                        </Button>
                    </form>
                )}

                {/* Toggle between QR and Manual */}
                {showManualEntry && step !== 'success' && (
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setShowManual(!showManual);
                                clearError();
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            {showManual
                                ? t.login.qrCodeLink
                                : t.login.manualEntryLink}
                        </button>
                    </div>
                )}

                {/* Footer */}
                {branding?.name && (
                    <div className="mt-8 text-center text-sm text-gray-500">
                        {t.login.poweredBy} {branding.name}
                    </div>
                )}
            </Card>
        </div>
    );
};
