export enum InterestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    INVITED = 'invited',
    REGISTRATION_STARTED = 'registration_started',
    REGISTRATION_COMPLETE = 'registration_complete',
    ACTIVATED = 'activated',
    REJECTED = 'rejected',
    INFO_REQUESTED = 'info_requested',
    EXPIRED = 'expired'
}

export enum RequestSource {
    EXTERNAL_SPACE = 'external_space',
    ADMIN_DIRECT = 'admin_direct'
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

export enum MaritalStatus {
    MARRIED = 'married',
    SINGLE_NO_RELATIONSHIP = 'single_no_relationship',
    SINGLE_IN_RELATIONSHIP = 'single_in_relationship'
}

export interface InterestRequest {
    id: number;
    given_name: string;
    middle_name?: string;
    family_name: string;
    alias?: string;

    gender: Gender;
    marital_status: MaritalStatus;

    primary_email: string;
    primary_phone: string;
    additional_emails: string[];
    additional_phones: string[];

    has_referral: boolean;
    referral_member_id?: string;

    face_photo_url?: string;
    government_id_photo_url?: string;

    source: RequestSource;
    status: InterestStatus;
    created_at: string;
    updated_at?: string;

    reviewed_by?: string;
    reviewed_at?: string;
    admin_notes?: string;
    rejection_reason?: string;
    info_request_message?: string;
    info_response?: string;

    invitation_id?: number;
}

export interface Invitation {
    id: number;
    code: string;
    pin: string;
    url_token: string;
    intended_for_email?: string;
    intended_for_name?: string;
    created_by?: string;
    created_at: string;
    expires_at: string;
    is_used: boolean;
    used_at?: string;
    is_link_opened: boolean;
    link_opened_at?: string;
    session_expires_at?: string;
}

export interface AdminInviteCreate {
    given_name: string;
    middle_name?: string;
    family_name: string;
    alias?: string;
    gender: Gender;
    marital_status: MaritalStatus;
    primary_email: string;
    primary_phone: string;
    additional_emails?: string[];
    additional_phones?: string[];
    has_referral?: boolean;
    referral_member_id?: string;
    face_photo_id?: string;
    government_id_photo_id?: string;
    admin_notes?: string;
    expires_in_hours?: number;
}
