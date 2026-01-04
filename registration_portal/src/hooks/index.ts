/**
 * Custom React Hooks for Registration Portal
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type {
    RegistrationSession,
    RegistrationFormData,
    RegistrationStep,
    SystemStatus,
    PolicyAcceptance,
    PhotoUpload,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const SESSION_TIMEOUT_HOURS = 3;
const SESSION_STORAGE_KEY = 'registration_session';
const FORM_DATA_KEY = 'registration_form_data';
const PHOTOS_KEY = 'registration_photos';

// ============================================================================
// useRegistrationSession Hook
// ============================================================================

interface UseRegistrationSessionReturn {
    session: RegistrationSession | null;
    timeRemaining: number;
    isExpired: boolean;
    startSession: (invitationCode: string, invitationId?: number) => void;
    updateStep: (step: RegistrationStep) => void;
    clearSession: () => void;
    formatTime: (seconds: number) => string;
}

export function useRegistrationSession(): UseRegistrationSessionReturn {
    const [session, setSession] = useState<RegistrationSession | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT_HOURS * 60 * 60);
    const [isExpired, setIsExpired] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load existing session on mount
    useEffect(() => {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            try {
                const parsedSession: RegistrationSession = JSON.parse(stored);
                const elapsed = Math.floor((Date.now() - parsedSession.startTime) / 1000);
                const remaining = SESSION_TIMEOUT_HOURS * 60 * 60 - elapsed;

                if (remaining > 0) {
                    setSession(parsedSession);
                    setTimeRemaining(remaining);
                } else {
                    // Session expired
                    sessionStorage.clear();
                    setIsExpired(true);
                }
            } catch (_e) {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!session) return;

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    sessionStorage.clear();
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [session]);

    const startSession = useCallback((invitationCode: string, invitationId?: number) => {
        const newSession: RegistrationSession = {
            startTime: Date.now(),
            invitationCode,
            invitationId,
            step: 'invitation',
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        setSession(newSession);
        setTimeRemaining(SESSION_TIMEOUT_HOURS * 60 * 60);
        setIsExpired(false);
    }, []);

    const updateStep = useCallback((step: RegistrationStep) => {
        if (!session) return;
        const updated = { ...session, step };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
        setSession(updated);
    }, [session]);

    const clearSession = useCallback(() => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(FORM_DATA_KEY);
        sessionStorage.removeItem(PHOTOS_KEY);
        sessionStorage.removeItem('invitation_verified');
        sessionStorage.removeItem('invitation_code');
        sessionStorage.removeItem('registration_data');
        sessionStorage.removeItem('registration_complete');
        sessionStorage.removeItem('reference_number');
        setSession(null);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, []);

    return {
        session,
        timeRemaining,
        isExpired,
        startSession,
        updateStep,
        clearSession,
        formatTime,
    };
}

// ============================================================================
// useRegistrationForm Hook
// ============================================================================

const initialFormData: RegistrationFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    occupation: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    bio: '',
    username: '',
    password: '',
};

interface UseRegistrationFormReturn {
    formData: RegistrationFormData;
    updateField: (field: keyof RegistrationFormData, value: string) => void;
    updateFields: (fields: Partial<RegistrationFormData>) => void;
    resetForm: () => void;
    isValid: (step: number) => boolean;
    errors: Record<string, string>;
    validateField: (field: keyof RegistrationFormData) => string | null;
}

export function useRegistrationForm(): UseRegistrationFormReturn {
    const [formData, setFormData] = useState<RegistrationFormData>(() => {
        const stored = sessionStorage.getItem(FORM_DATA_KEY);
        if (stored) {
            try {
                return { ...initialFormData, ...JSON.parse(stored) };
            } catch {
                return initialFormData;
            }
        }
        return initialFormData;
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Persist form data to session storage
    useEffect(() => {
        sessionStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
    }, [formData]);

    const validateField = useCallback((field: keyof RegistrationFormData): string | null => {
        const value = formData[field];

        switch (field) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) return 'This field is required';
                if (value.length < 2) return 'Must be at least 2 characters';
                break;
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
                break;
            case 'phone':
                if (value && !/^\+?[\d\s-()]{10,}$/.test(value)) return 'Invalid phone number';
                break;
            case 'username':
                if (!value.trim()) return 'Username is required';
                if (value.length < 3) return 'Username must be at least 3 characters';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
                break;
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                break;
        }
        return null;
    }, [formData]);

    const updateField = useCallback((field: keyof RegistrationFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when field is updated
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    }, []);

    const updateFields = useCallback((fields: Partial<RegistrationFormData>) => {
        setFormData((prev) => ({ ...prev, ...fields }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
        sessionStorage.removeItem(FORM_DATA_KEY);
    }, []);

    const isValid = useCallback((step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            const requiredFields: (keyof RegistrationFormData)[] = ['firstName', 'lastName', 'email', 'username', 'password'];
            requiredFields.forEach((field) => {
                const error = validateField(field);
                if (error) newErrors[field] = error;
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validateField]);

    return {
        formData,
        updateField,
        updateFields,
        resetForm,
        isValid,
        errors,
        validateField,
    };
}

// ============================================================================
// usePhotoUpload Hook
// ============================================================================

interface UsePhotoUploadReturn {
    photos: PhotoUpload[];
    addPhotos: (files: File[]) => Promise<void>;
    removePhoto: (index: number) => void;
    clearPhotos: () => void;
    isUploading: boolean;
    uploadProgress: number;
    maxPhotos: number;
}

export function usePhotoUpload(maxPhotos: number = 5): UsePhotoUploadReturn {
    const [photos, setPhotos] = useState<PhotoUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const addPhotos = useCallback(async (files: File[]) => {
        const remainingSlots = maxPhotos - photos.length;
        const filesToAdd = files.slice(0, remainingSlots);

        if (filesToAdd.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const newPhotos: PhotoUpload[] = [];

        for (let i = 0; i < filesToAdd.length; i++) {
            const file = filesToAdd[i];

            // Create preview
            const preview = URL.createObjectURL(file);

            // Upload to server
            const result = await api.uploadPhoto(file, (progress) => {
                setUploadProgress(Math.round(((i + progress / 100) / filesToAdd.length) * 100));
            });

            newPhotos.push({
                file,
                preview,
                uploaded: result.success,
                url: result.data?.url,
            });
        }

        setPhotos((prev) => [...prev, ...newPhotos]);
        setIsUploading(false);
        setUploadProgress(100);
    }, [photos.length, maxPhotos]);

    const removePhoto = useCallback((index: number) => {
        setPhotos((prev) => {
            const removed = prev[index];
            if (removed?.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const clearPhotos = useCallback(() => {
        photos.forEach((photo) => {
            if (photo.preview) URL.revokeObjectURL(photo.preview);
        });
        setPhotos([]);
    }, [photos]);

    // Cleanup on unmount - only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        return () => {
            photos.forEach((photo) => {
                if (photo.preview) URL.revokeObjectURL(photo.preview);
            });
        };
    }, []);

    return {
        photos,
        addPhotos,
        removePhoto,
        clearPhotos,
        isUploading,
        uploadProgress,
        maxPhotos,
    };
}

// ============================================================================
// useAudioRecording Hook
// ============================================================================

interface UseAudioRecordingReturn {
    isRecording: boolean;
    audioBlob: Blob | null;
    audioUrl: string | null;
    recordingTime: number;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    clearRecording: () => void;
    formatTime: (seconds: number) => string;
    error: string | null;
}

export function useAudioRecording(): UseAudioRecordingReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));

                // Stop all tracks
                streamRef.current?.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            setError('Could not access microphone. Please check permissions.');
            console.error('Recording error:', err);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    }, [isRecording]);

    const clearRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setError(null);
    }, [audioUrl]);

    const formatTime = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }, []);

    // Cleanup on unmount - only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return {
        isRecording,
        audioBlob,
        audioUrl,
        recordingTime,
        startRecording,
        stopRecording,
        clearRecording,
        formatTime,
        error,
    };
}

// ============================================================================
// useSystemStatus Hook
// 
// NOTE: InterestPage and ICVP (Invitation Code Validation Page) now implement
// their own inline status checks for more granular control over UI presentation.
// This hook is still useful for simpler status checks in other components.
// ============================================================================

interface UseSystemStatusReturn {
    status: SystemStatus | null;
    isLoading: boolean;
    isOpen: boolean;
    isOffline: boolean;
    isClosingSoon: boolean;
    minutesUntilClose: number | undefined;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useSystemStatus(): UseSystemStatusReturn {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await api.getSystemStatus();

        if (result.success && result.data) {
            setStatus(result.data);
        } else {
            setError(result.error || 'Failed to get system status');
        }

        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStatus();

        // WebSocket Integration
        const API_BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_BASE_URL || 'http://localhost:8000';
        const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
        // Handle trailing slash if present
        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const wsUrl = baseUrl.replace(/^http/, wsProtocol) + '/api/system/ws';

        let socket: WebSocket | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;

            try {
                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log("[WS] Connected to System Status");
                };

                socket.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const newStatus = JSON.parse(event.data);
                        setStatus(newStatus);
                        setIsLoading(false);
                        // Clear any previous error
                        setError(null);
                    } catch (e) {
                        console.error("[WS] Parse error", e);
                    }
                };

                socket.onclose = () => {
                    if (isMounted) {
                        // Try to reconnect after delay
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                };
            } catch (err) {
                console.error("[WS] Connection error", err);
                if (isMounted) {
                    reconnectTimeout = setTimeout(connect, 5000);
                }
            }
        };

        connect();

        return () => {
            isMounted = false;
            if (socket) {
                socket.onclose = null; // Prevent reconnect loop
                socket.close();
            }
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [fetchStatus]);

    const isOpen = status?.status === 'open' || status?.status === 'limited';
    const isOffline = status?.status === 'closed';
    const isClosingSoon = isOpen && (status?.warning ?? false);
    const minutesUntilClose = status?.minutes_until_close;

    return {
        status,
        isLoading,
        isOpen,
        isOffline,
        isClosingSoon,
        minutesUntilClose,
        error,
        refresh: fetchStatus,
    };
}


// ============================================================================
// usePolicyAcceptance Hook
// ============================================================================

interface UsePolicyAcceptanceReturn {
    policies: PolicyAcceptance;
    togglePolicy: (key: keyof PolicyAcceptance) => void;
    allAccepted: boolean;
    reset: () => void;
}

export function usePolicyAcceptance(): UsePolicyAcceptanceReturn {
    const [policies, setPolicies] = useState<PolicyAcceptance>({
        terms: false,
        privacy: false,
        conduct: false,
        ethics: false,
    });

    const togglePolicy = useCallback((key: keyof PolicyAcceptance) => {
        setPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    const allAccepted = Object.values(policies).every(Boolean);

    const reset = useCallback(() => {
        setPolicies({
            terms: false,
            privacy: false,
            conduct: false,
            ethics: false,
        });
    }, []);

    return {
        policies,
        togglePolicy,
        allAccepted,
        reset,
    };
}

// ============================================================================
// useRegistrationGuard Hook
// 
// Protects registration pages from access when MIS is offline.
// Automatically redirects to InterestPage with a toast notification.
// Use this in RFP (Registration Form Page) and ATIPP (Applicant Trust Insurance Processing Page).
// ============================================================================

interface UseRegistrationGuardReturn {
    isOnline: boolean;
    isOffline: boolean;
    isLoading: boolean;
    isRedirecting: boolean;
    statusMessage: string;
}

export function useRegistrationGuard(navigate: (path: string, options?: { replace?: boolean }) => void): UseRegistrationGuardReturn {
    const [status, setStatus] = useState<'open' | 'closed' | 'unknown'>('unknown');
    const [statusMessage, setStatusMessage] = useState('Checking system status...');
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await api.getSystemStatus();
                if (result.success && result.data) {
                    const currentStatus = result.data.status as 'open' | 'closed';
                    setStatus(currentStatus);
                    setStatusMessage(result.data.message);

                    // Redirect if system is closed
                    if (currentStatus === 'closed' && !isRedirecting) {
                        setIsRedirecting(true);

                        // Import toast dynamically to avoid circular deps
                        const { toast } = await import('react-toastify');
                        toast.warning('Registration is currently offline. Redirecting to Interest page...');

                        redirectTimeoutRef.current = setTimeout(() => {
                            navigate('/interest', { replace: true });
                        }, 2000);
                    }
                } else {
                    setStatus('unknown');
                    setStatusMessage('Unable to determine system status');
                }
            } catch {
                setStatus('unknown');
                setStatusMessage('Connection error');
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();

        // Poll every 30 seconds
        const interval = setInterval(checkStatus, 30000);

        return () => {
            clearInterval(interval);
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [navigate, isRedirecting]);

    return {
        isOnline: status === 'open',
        isOffline: status === 'closed',
        isLoading,
        isRedirecting,
        statusMessage,
    };
}
