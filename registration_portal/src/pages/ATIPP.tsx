/**
 * ATIPP - Applicant Trust Insurance Processing Page
 * Record membership oath and accept policies
 * Connected to Central Auth API backend
 * Theme: Light grey (#d9d9d9) with Chaco Black (#28282B)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { useAudioRecording, usePolicyAcceptance, useRegistrationSession, useRegistrationForm, useRegistrationGuard } from '../hooks';


const OATH_TEXT = `I solemnly declare that I will uphold the values and principles of this organization. 
I commit to act with integrity, respect fellow members, and contribute positively to our community. 
I understand that membership is a privilege and I will honor this trust placed in me.`;

const POLICIES = [
    { key: 'terms', label: 'Terms and Conditions' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'conduct', label: 'Code of Conduct' },
    { key: 'ethics', label: 'Ethical Guidelines' },
] as const;

export const ATIPP: React.FC = () => {
    const navigate = useNavigate();

    // Registration guard - protects page from offline access
    const { isRedirecting, statusMessage } = useRegistrationGuard(navigate);

    // Hooks
    const {
        isRecording,
        audioBlob,
        audioUrl,
        recordingTime,
        startRecording,
        stopRecording,
        clearRecording,
        formatTime,
        error: recordingError,
    } = useAudioRecording();

    const { policies, togglePolicy, allAccepted } = usePolicyAcceptance();
    const { session, timeRemaining, formatTime: formatSessionTime } = useRegistrationSession();
    const { formData } = useRegistrationForm();

    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Check prerequisites
    useEffect(() => {
        const verified = sessionStorage.getItem('invitation_verified');
        const registrationData = sessionStorage.getItem('registration_data');

        if (!verified || !registrationData) {
            toast.error('Please complete registration first');
            navigate('/register');
        }
    }, [navigate]);

    // Show recording error
    useEffect(() => {
        if (recordingError) {
            toast.error(recordingError);
        }
    }, [recordingError]);

    // Verify recording
    const verifyRecording = async () => {
        if (!audioBlob) return;

        setVerifying(true);

        try {
            // Upload the audio recording
            const uploadResult = await api.uploadOathRecording(audioBlob);

            if (uploadResult.success) {
                // Store the recording ID for submission
                sessionStorage.setItem('oath_recording_id', uploadResult.data?.file_id || '');
                setIsVerified(true);
                toast.success('Oath recording verified!');
            } else {
                toast.error(uploadResult.error || 'Verification failed. Please try again.');
            }
        } catch (error) {
            toast.error('Verification failed. Please try again.');
            console.error('Verification error:', error);
        } finally {
            setVerifying(false);
        }
    };

    // Handle final submission
    const handleSubmit = async () => {
        if (!isVerified) {
            toast.error('Please verify your oath recording');
            return;
        }

        if (!allAccepted) {
            toast.error('Please accept all policies');
            return;
        }

        setLoading(true);

        try {
            // Get stored data
            const registrationData = JSON.parse(sessionStorage.getItem('registration_data') || '{}');
            const oathRecordingId = sessionStorage.getItem('oath_recording_id') || '';

            // Prepare user data for API
            const userData = {
                email: registrationData.email || formData.email,
                username: registrationData.username || formData.username,
                password: registrationData.password || formData.password,
                full_name: `${registrationData.firstName || formData.firstName} ${registrationData.lastName || formData.lastName}`.trim(),
                phone: registrationData.phone || formData.phone,
                date_of_birth: registrationData.dateOfBirth || formData.dateOfBirth,
                occupation: registrationData.occupation || formData.occupation,
                address: registrationData.address || formData.address,
                city: registrationData.city || formData.city,
                state: registrationData.state || formData.state,
                postal_code: registrationData.postalCode || formData.postalCode,
                country: registrationData.country || formData.country,
                bio: registrationData.bio || formData.bio,
            };

            // Submit registration to API
            const result = await api.submitRegistration(
                userData,
                [], // Photo IDs - would come from photo upload
                oathRecordingId,
                { ...policies } as Record<string, boolean>
            );

            if (result.success) {
                // Generate reference number
                const referenceNumber = `REF-${Date.now().toString(36).toUpperCase()}`;

                // Store completion data
                sessionStorage.setItem('registration_complete', 'true');
                sessionStorage.setItem('reference_number', referenceNumber);
                sessionStorage.setItem('user_id', result.data?.id?.toString() || '');

                toast.success('Application submitted successfully!');
                navigate('/complete');
            } else {
                toast.error(result.error || 'Submission failed. Please try again.');
            }
        } catch (error) {
            toast.error('Submission failed. Please try again.');
            console.error('Submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get timer color class
    const getTimerClass = () => {
        if (timeRemaining < 300) return 'text-red-600';
        if (timeRemaining < 900) return 'text-yellow-700';
        return 'text-[#28282B]';
    };

    // Show redirecting screen if system is offline
    if (isRedirecting) {
        return (
            <div className="min-h-screen flex">
                {/* ═══════════════════════════════════════════════════════════
                LEFT SIDE - Chaco Black Background
            ═══════════════════════════════════════════════════════════ */}
                <div className="hidden lg:block lg:w-1/2 bg-[#28282B]">
                    {/* You can add decorative elements here if needed */}
                </div>

                {/* ═══════════════════════════════════════════════════════════
                RIGHT SIDE - Content Area
            ═══════════════════════════════════════════════════════════ */}
                <div className="w-full lg:w-1/2 bg-[#d9d9d9] flex items-center justify-center p-4 min-h-screen">
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
                            <p className="text-gray-600 mb-2">{statusMessage}</p>
                            <p className="text-gray-500 text-sm">Redirecting to Interest page...</p>
                        </div>
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
            <div className="hidden lg:block lg:w-1/2 bg-[#28282B]">
                {/* You can add decorative elements here if needed */}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                RIGHT SIDE - Content Area
            ═══════════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-1/2 bg-[#d9d9d9] py-8 px-4 min-h-screen">
                <div className="max-w-2xl mx-auto">


                    {/* Timer */}
                    {session && (
                        <div className="text-center mb-4">
                            <span className={`font-mono text-sm ${getTimerClass()}`}>
                                ⏱ {formatSessionTime(timeRemaining)} remaining
                            </span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#28282B]/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#28282B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-[#28282B] mb-2 uppercase font-['boxing'] tracking-[0.1em]">Membership Oath</h1>
                        <p className="text-gray-600">Record yourself reading the oath below</p>
                    </div>

                    {/* Oath text */}
                    <div className="bg-white p-6 mb-6 border-4 border-[#28282B]">
                        <h2 className="text-lg font-semibold text-[#28282B] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#28282B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Read the following oath:
                        </h2>
                        <blockquote className="border-l-4 border-[#28282B] pl-4 text-gray-700 italic leading-relaxed bg-gray-50 py-4 pr-4">
                            {OATH_TEXT}
                        </blockquote>
                    </div>

                    {/* Recording section */}
                    <div className="bg-white p-6 mb-6 border-4 border-[#28282B]">
                        <h2 className="text-lg font-semibold text-[#28282B] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#28282B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Record Your Oath
                        </h2>

                        {!audioUrl ? (
                            <div className="text-center py-8">
                                {/* Recording button */}
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-24 h-24 flex items-center justify-center mx-auto transition-all border-4 ${isRecording
                                        ? 'bg-red-500 border-red-600 animate-pulse'
                                        : 'bg-[#28282B] border-[#28282B] hover:bg-[#28282B]/90'
                                        }`}
                                >
                                    {isRecording ? (
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="6" width="12" height="12" rx="2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                        </svg>
                                    )}
                                </button>

                                <p className="text-gray-600 mt-4">
                                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                                </p>

                                {isRecording && (
                                    <div className="mt-4">
                                        <p className="text-red-600 font-mono text-2xl">
                                            {formatTime(recordingTime)}
                                        </p>
                                        <div className="flex items-center justify-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 bg-red-500 animate-pulse audio-bar-delay-${i} h-[${10 + Math.random() * 20}px]`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Audio player */}
                                <div className="bg-gray-100 p-4 border-2 border-[#28282B]">
                                    <audio src={audioUrl} controls className="w-full" />
                                </div>

                                {/* Recording info */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>Duration: {formatTime(recordingTime)}</span>
                                    {isVerified && (
                                        <span className="text-green-600 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            clearRecording();
                                            setIsVerified(false);
                                        }}
                                        className="flex-1 px-4 py-3 border-2 border-[#28282B] text-[#28282B] hover:bg-[#28282B] hover:text-white transition"
                                    >
                                        RECORD AGAIN
                                    </button>

                                    {!isVerified ? (
                                        <button
                                            onClick={verifyRecording}
                                            disabled={verifying}
                                            className="flex-1 px-4 py-3 bg-[#28282B] text-white hover:bg-[#28282B]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {verifying ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    VERIFYING...
                                                </>
                                            ) : (
                                                'VERIFY RECORDING'
                                            )}
                                        </button>
                                    ) : (
                                        <div className="flex-1 px-4 py-3 bg-green-100 text-green-700 flex items-center justify-center gap-2 border-2 border-green-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            VERIFIED
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Policy acceptance */}
                    <div className="bg-white p-6 mb-6 border-4 border-[#28282B]">
                        <h2 className="text-lg font-semibold text-[#28282B] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#28282B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Accept Policies
                        </h2>

                        <div className="space-y-4">
                            {POLICIES.map(({ key, label }) => (
                                <label
                                    key={key}
                                    className="flex items-center gap-3 cursor-pointer group p-3 hover:bg-gray-50 transition"
                                >
                                    <input
                                        type="checkbox"
                                        checked={policies[key]}
                                        onChange={() => togglePolicy(key)}
                                        className="w-5 h-5 border-2 border-[#28282B] text-[#28282B] focus:ring-[#28282B] cursor-pointer"
                                    />
                                    <span className="text-gray-700 group-hover:text-[#28282B] transition flex-1">
                                        I accept the{' '}
                                        <a href={`#${key}`} className="text-[#28282B] font-semibold hover:underline">
                                            {label}
                                        </a>
                                    </span>
                                    {policies[key] && (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </label>
                            ))}
                        </div>

                        {/* Progress indicator */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    {Object.values(policies).filter(Boolean).length} of {POLICIES.length} accepted
                                </span>
                                {allAccepted && (
                                    <span className="text-green-600">All policies accepted ✓</span>
                                )}
                            </div>
                            <div className="w-full bg-gray-200 h-2 mt-2">
                                <div
                                    className={`bg-[#28282B] h-2 transition-all w-[${(Object.values(policies).filter(Boolean).length / POLICIES.length) * 100}%]`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !isVerified || !allAccepted}
                        className="w-full py-4 bg-[#28282B] text-white font-semibold hover:bg-[#28282B]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                SUBMITTING APPLICATION...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                SUBMIT APPLICATION
                            </>
                        )}
                    </button>

                    {/* Requirements checklist */}
                    {(!isVerified || !allAccepted) && (
                        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-500">
                            <p className="text-yellow-700 text-sm font-medium mb-2">Before you can submit:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li className={isVerified ? 'text-green-600' : ''}>
                                    {isVerified ? '✓' : '○'} Record and verify your oath
                                </li>
                                <li className={allAccepted ? 'text-green-600' : ''}>
                                    {allAccepted ? '✓' : '○'} Accept all policies
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Back button */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => navigate('/register')}
                            className="text-gray-500 hover:text-[#28282B] text-sm transition"
                        >
                            ← Back to registration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};