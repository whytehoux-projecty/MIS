/**
 * ARFSP - Applicant Registration Form Submission Page
 * Registration submission confirmation
 * Connected to Central Auth API backend
 * Theme: Light grey (#d9d9d9) with Chaco Black (#28282B)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';


interface RegistrationDetails {
    referenceNumber: string;
    email: string;
    fullName: string;
    submittedAt: string;
}

export const ARFSP: React.FC = () => {
    const navigate = useNavigate();
    const [details, setDetails] = useState<RegistrationDetails | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Check if registration was completed
        const complete = sessionStorage.getItem('registration_complete');
        if (!complete) {
            navigate('/');
            return;
        }

        // Get registration details
        const referenceNumber = sessionStorage.getItem('reference_number') || '';
        const registrationData = JSON.parse(sessionStorage.getItem('registration_data') || '{}');

        setDetails({
            referenceNumber,
            email: registrationData.email || '',
            fullName: `${registrationData.firstName || ''} ${registrationData.lastName || ''}`.trim(),
            submittedAt: new Date().toLocaleString(),
        });
    }, [navigate]);

    const handleCopyReference = () => {
        if (details?.referenceNumber) {
            navigator.clipboard.writeText(details.referenceNumber);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleStartOver = () => {
        // Clear all session data
        sessionStorage.clear();
        navigate('/');
    };

    const handleCheckStatus = async () => {
        if (!details?.referenceNumber) return;

        const result = await api.getRegistrationStatus(details.referenceNumber);
        if (result.success && result.data) {
            alert(`Status: ${result.data.status}\n${result.data.message}`);
        }
    };

    if (!details) {
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
                <div className="w-full lg:w-1/2 bg-[#d9d9d9] flex items-center justify-center min-h-screen">
                    <div className="w-8 h-8 border-4 border-[#28282B] border-t-transparent animate-spin" />
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
            <div className="w-full lg:w-1/2 bg-[#d9d9d9] flex items-center justify-center p-4 min-h-screen">
                <div className="max-w-lg w-full">
                    {/* Success Card */}
                    <div className="bg-white p-8 border-4 border-[#28282B] text-center">

                        {/* Success Icon */}
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-green-100 flex items-center justify-center mx-auto border-4 border-green-600">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-[#28282B] mb-2 uppercase application-title">Application Submitted!</h1>
                        <p className="text-gray-600 mb-8">
                            Your membership application has been received and is pending review.
                        </p>

                        {/* Reference Number */}
                        <div className="bg-gray-100 p-4 mb-6 border-2 border-[#28282B]">
                            <p className="text-sm text-gray-600 mb-2">Your Reference Number</p>
                            <div className="flex items-center justify-center gap-3">
                                <code className="text-2xl font-mono text-[#28282B] tracking-wider">
                                    {details.referenceNumber}
                                </code>
                                <button
                                    onClick={handleCopyReference}
                                    className="p-2 text-gray-500 hover:text-[#28282B] transition hover:bg-gray-200"
                                    title="Copy reference number"
                                >
                                    {copied ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {copied && (
                                <p className="text-xs text-green-600 mt-2">
                                    Copied to clipboard!
                                </p>
                            )}
                        </div>

                        {/* Details */}
                        <div className="text-left space-y-3 mb-8">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Applicant</span>
                                <span className="text-[#28282B] font-medium">{details.fullName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Email</span>
                                <span className="text-[#28282B] font-medium">{details.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Submitted</span>
                                <span className="text-[#28282B] font-medium">{details.submittedAt}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Status</span>
                                <span className="text-yellow-600 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 animate-pulse" />
                                    Pending Review
                                </span>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 border-2 border-blue-500 p-4 mb-6 text-left">
                            <h3 className="text-blue-700 font-semibold mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                What happens next?
                            </h3>
                            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                                <li>Our admin team will review your application</li>
                                <li>You'll receive an email notification once reviewed</li>
                                <li>If approved, you'll get login credentials via email</li>
                                <li>The review process typically takes 1-3 business days</li>
                            </ol>
                        </div>

                        {/* Important Note */}
                        <div className="bg-yellow-50 border-2 border-yellow-500 p-4 mb-6 text-left">
                            <h3 className="text-yellow-700 font-semibold mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Important
                            </h3>
                            <p className="text-sm text-gray-700">
                                Please save your reference number. You'll need it to check your application status or for any inquiries.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleCheckStatus}
                                className="w-full px-6 py-3 border-2 border-[#28282B] text-[#28282B] hover:bg-[#28282B] hover:text-white transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                CHECK APPLICATION STATUS
                            </button>

                            <button
                                onClick={handleStartOver}
                                className="w-full px-6 py-3 bg-[#28282B] text-white hover:bg-[#28282B]/90 transition"
                            >
                                RETURN TO HOME
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-gray-500">
                        <p>
                            Questions? Contact us at{' '}
                            <a href="mailto:support@example.com" className="text-[#28282B] font-semibold hover:underline">
                                support@example.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};