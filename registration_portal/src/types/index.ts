/**
 * Type definitions for Registration Portal
 * Aligned with Central Auth API backend schemas
 */

// ============================================================================
// User & Registration Types
// ============================================================================

export interface UserRegister {
    email: string;
    username: string;
    password: string;
    full_name: string;
    phone?: string;
    // Extended fields for registration portal
    date_of_birth?: string;
    occupation?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    bio?: string;
}

export interface PendingUserResponse {
    id: number;
    email: string;
    username: string;
    full_name: string;
    phone?: string;
    is_reviewed: boolean;
    created_at: string;
}

export interface UserResponse {
    id: number;
    email: string;
    username: string;
    full_name: string;
    auth_key: string;
    is_active: boolean;
    created_at: string;
}

// ============================================================================
// Invitation Types
// ============================================================================

export interface InvitationVerifyRequest {
    invitation_code: string;
    pin: string;
}

export interface InvitationVerifyResponse {
    valid: boolean;
    invitation_id: number;
    message: string;
    expires_at?: string;
}

// ============================================================================
// Registration Session Types
// ============================================================================

export interface RegistrationSession {
    startTime: number;
    invitationCode: string;
    invitationId?: number;
    step: RegistrationStep;
}

export type RegistrationStep = 'invitation' | 'personal' | 'address' | 'photos' | 'oath' | 'complete';

export interface RegistrationFormData {
    // Personal Info
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    occupation: string;
    // Address
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    bio: string;
    // Credentials
    username: string;
    password: string;
}

// ============================================================================
// Oath Types
// ============================================================================

export interface OathSubmission {
    user_id: number;
    audio_blob: Blob;
    policies_accepted: PolicyAcceptance;
}

export interface PolicyAcceptance {
    terms: boolean;
    privacy: boolean;
    conduct: boolean;
    ethics: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    detail?: string;
    error?: string;
}

export interface ApiError {
    detail: string;
    status_code?: number;
}

// ============================================================================
// System Status Types
// ============================================================================

export interface SystemStatus {
    status: 'open' | 'closed' | 'limited';
    message: string;
    warning?: boolean;
    minutes_until_close?: number;
    current_time?: string;
    is_manual_override?: boolean;
    override_reason?: string;
    override_expires_at?: string;
    operating_hours?: {
        start: string;
        end: string;
        timezone: string;
    };
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface PhotoUpload {
    file: File;
    preview: string;
    uploadProgress?: number;
    uploaded?: boolean;
    url?: string;
}

export interface UploadResponse {
    success: boolean;
    file_id: string;
    url: string;
}

// ============================================================================
// Waitlist/Interest Types
// ============================================================================

export interface WaitlistSubmitRequest {
    full_name: string;
    email: string;
    phone?: string;
    company?: string;
    role?: string;
}

export interface WaitlistSubmitResponse {
    success: boolean;
    message: string;
    request_id?: number;
}

