/**
 * ICVP - Invitation Code Validation Page
 * Verify invitation code and PIN
 * Connected to Central Auth API backend
 * Theme: Light grey (#d9d9d9) with Chaco Black (#28282B)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { useRegistrationSession } from '../hooks';


// System status type (matches backend response)
interface SystemStatusData {
    status: 'open' | 'closed' | 'unknown';
    message: string;
    warning?: boolean;
    is_manual_override?: boolean;
    minutes_until_close?: number;
}

export const ICVP: React.FC = () => {
    const navigate = useNavigate();

    // Hooks
    const { session, timeRemaining, startSession, formatTime } = useRegistrationSession();

    // Form state
    const [invitationCode, setInvitationCode] = useState('');
    const [pin, setPin] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // System status state
    const [systemStatus, setSystemStatus] = useState<SystemStatusData>({
        status: 'unknown',
        message: 'Checking system status...'
    });
    const [statusLoading, setStatusLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    // Fetch system status on mount - REDIRECT IF OFFLINE
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await api.getSystemStatus();
                if (result.success && result.data) {
                    const status = result.data.status as 'open' | 'closed';

                    setSystemStatus({
                        status: status,
                        message: result.data.message,
                        warning: result.data.warning,
                        is_manual_override: result.data.is_manual_override,
                        minutes_until_close: result.data.minutes_until_close
                    });

                    // SECURITY: Redirect to InterestPage if system is closed
                    if (status === 'closed') {
                        setRedirecting(true);
                        toast.warning('Registration is currently offline. You will be redirected to submit your interest.');
                        setTimeout(() => {
                            navigate('/interest', { replace: true });
                        }, 2000);
                    }
                } else {
                    setSystemStatus({
                        status: 'unknown',
                        message: 'Unable to determine system status'
                    });
                }
            } catch {
                setSystemStatus({
                    status: 'unknown',
                    message: 'Connection error'
                });
            } finally {
                setStatusLoading(false);
            }
        };

        checkStatus();

        // Poll every 30 seconds (will trigger redirect if system goes offline mid-session)
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    const isOnline = systemStatus.status === 'open';
    const isOffline = systemStatus.status === 'closed';

    // Get timer color class
    const getTimerClass = () => {
        if (timeRemaining < 300) return 'text-red-600 bg-red-100'; // < 5 min
        if (timeRemaining < 900) return 'text-yellow-700 bg-yellow-100'; // < 15 min
        return 'text-[#28282B] bg-[#28282B]/10';
    };

    // Get status indicator styles
    const getStatusStyles = () => {
        if (statusLoading) {
            return {
                bgColor: 'bg-gray-400',
                pulseColor: 'bg-gray-300',
                textColor: 'text-gray-600',
                label: 'Checking...'
            };
        }

        switch (systemStatus.status) {
            case 'open':
                return systemStatus.warning ? {
                    bgColor: 'bg-amber-500',
                    pulseColor: 'bg-amber-400',
                    textColor: 'text-amber-700',
                    label: `Closing Soon (${systemStatus.minutes_until_close}min)`
                } : {
                    bgColor: 'bg-emerald-500',
                    pulseColor: 'bg-emerald-400',
                    textColor: 'text-emerald-700',
                    label: 'MIS Online'
                };
            case 'closed':
                return {
                    bgColor: 'bg-red-500',
                    pulseColor: 'bg-red-400',
                    textColor: 'text-red-700',
                    label: 'MIS Offline'
                };
            default:
                return {
                    bgColor: 'bg-gray-400',
                    pulseColor: 'bg-gray-300',
                    textColor: 'text-gray-600',
                    label: 'Unknown'
                };
        }
    };

    const statusStyles = getStatusStyles();

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invitationCode.trim() || !pin.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        // Double-check system status before proceeding
        if (isOffline) {
            toast.error('Registration is currently closed. Please try again during operating hours.');
            navigate('/interest', { replace: true });
            return;
        }

        setLoading(true);

        try {
            // Call API to verify invitation
            const result = await api.verifyInvitation({
                invitation_code: invitationCode.toUpperCase().trim(),
                pin: pin.trim(),
            });

            if (result.success && result.data?.valid) {
                // Start or continue session
                if (!session) {
                    startSession(invitationCode, result.data.invitation_id);
                }

                // Store invitation verification in session
                sessionStorage.setItem('invitation_verified', 'true');
                sessionStorage.setItem('invitation_code', invitationCode);

                toast.success('Invitation verified! Continue to registration.');
                navigate('/register');
            } else {
                toast.error(result.error || 'Invalid invitation code or PIN');
            }
        } catch (error) {
            toast.error('Failed to verify invitation. Please try again.');
            console.error('Invitation verification error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Show redirecting screen if system is offline
    if (redirecting) {
        return (
            <div className="min-h-screen bg-[#d9d9d9] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white p-8 border-4 border-[#28282B]">
                        <div className="w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-[#28282B] mb-4 uppercase font-['boxing']">
                            Registration Offline
                        </h1>
                        <p className="text-gray-600 mb-2">{systemStatus.message}</p>
                        <p className="text-gray-500 text-sm">Redirecting to Interest page...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* ═══════════════════════════════════════════════════════════
                LEFT SIDE - Chaco Black Background
            ═══════════════════════════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#28282B] items-center justify-center p-12">
                <div className="text-left">
                    <h1 className="text-white font-['DigitalDream'] font-bold text-6xl lg:text-7xl leading-tight tracking-wider opacity-90">
                        <div className="mb-2">MIS</div>
                        <div className="mb-2">REGISTRATION</div>
                        <div>PORTAL</div>
                    </h1>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RIGHT SIDE - Content Area
            ═══════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-1/2 bg-[#d9d9d9] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative min-h-screen">

                {/* ═══════════════════════════════════════════════════════════
                    LIVING STATUS BEACON - Fixed Top Right Corner
                ═══════════════════════════════════════════════════════════ */}
                <div className="fixed top-4 right-4 z-50">
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
                        {/* Animated Pulse Orb */}
                        <div className="relative">
                            <div
                                className={`absolute inset-0 rounded-full ${statusStyles.pulseColor} ${isOnline ? 'animate-ping-fast' : isOffline ? 'animate-pulse-slow' : ''
                                    } opacity-75`}
                            />
                            <div className={`relative w-3 h-3 rounded-full ${statusStyles.bgColor}`} />
                        </div>
                        <span className={`text-sm font-semibold ${statusStyles.textColor} whitespace-nowrap`}>
                            {statusStyles.label}
                        </span>
                    </div>
                </div>

                <div className="max-w-md w-full">
                    {/* Timer */}
                    {session && (
                        <div className="text-center mb-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${getTimerClass()}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">Time remaining to complete registration</p>
                        </div>
                    )}

                    {/* Closing Soon Warning */}
                    {isOnline && systemStatus.warning && (
                        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 justify-center">
                                <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-amber-700 text-sm font-medium">
                                    System closing in {systemStatus.minutes_until_close} minutes - Complete quickly!
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Card */}
                    <div className="bg-white p-8 border-4 border-[#28282B]">

                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-[#28282B] mb-2 uppercase font-['boxing'] tracking-[0.1em]">
                                Verify Your Invitation
                            </h1>
                            <p className="text-gray-600 text-sm">Enter the code and PIN from your invitation</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Invitation Code */}
                            <div>
                                <label className="block text-sm font-medium text-[#28282B] mb-2">
                                    Invitation Code
                                </label>
                                <input
                                    type="text"
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., INV-ABC123"
                                    className="w-full px-4 py-3 bg-white border-2 border-[#28282B] text-[#28282B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28282B] transition uppercase rounded-none"
                                    disabled={loading || statusLoading}
                                    autoComplete="off"
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: XXX-XXXXXX</p>
                            </div>

                            {/* PIN */}
                            <div>
                                <label className="block text-sm font-medium text-[#28282B] mb-2">
                                    PIN Code
                                </label>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="4-digit PIN"
                                    maxLength={4}
                                    className="w-full px-4 py-3 bg-white border-2 border-[#28282B] text-[#28282B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#28282B] transition text-center text-2xl tracking-widest rounded-none"
                                    disabled={loading || statusLoading}
                                    inputMode="numeric"
                                    autoComplete="off"
                                />
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 w-5 h-5 border-2 border-[#28282B] text-[#28282B] focus:ring-[#28282B] cursor-pointer rounded-none"
                                    disabled={loading}
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                                    I agree to the{' '}
                                    <a href="#terms" className="text-[#28282B] font-semibold hover:underline">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#privacy" className="text-[#28282B] font-semibold hover:underline">Privacy Policy</a>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || !invitationCode || !pin || !termsAccepted || statusLoading}
                                className="w-full bg-[#28282B] text-white py-4 font-semibold hover:bg-[#28282B]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-none text-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        VERIFYING...
                                    </>
                                ) : (
                                    'CONTINUE'
                                )}
                            </button>
                        </form>

                        {/* Back link */}
                        <div className="text-center mt-6">
                            <button
                                onClick={() => navigate('/interest')}
                                className="text-gray-500 hover:text-[#28282B] text-sm transition"
                            >
                                ← Back to Interest Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
