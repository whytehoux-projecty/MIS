import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ApiConfig {
  baseURL: string
  timeout: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  full_name: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  is_active?: boolean
  created_at?: string
}

export interface PendingUser {
  id: number
  email: string
  username: string
  full_name: string
  phone?: string
  is_reviewed: boolean
  created_at: string

  // Extended fields
  occupation?: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  biography?: string
  reference_details?: string
  photo_ids?: string
  audio_oath_id?: string
  invitation_id?: number
  invitation_code?: string
  policies_accepted?: string
}

export interface ActiveUser {
  id: number
  email: string
  username: string
  full_name: string
  auth_key: string
  is_active: boolean
  created_at: string
}

export interface Invitation {
  id: number
  code: string
  pin: string
  intended_for?: string
  notes?: string
  is_used: boolean
  used_by?: string
  created_at: string
  expires_at?: string
}

export interface CreateInvitationRequest {
  intended_for?: string
  notes?: string
  expires_in_hours?: number
  custom_code?: string
  custom_pin?: string
}

export interface Service {
  id: number
  service_name: string
  service_url: string
  api_key: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface RegisterServiceRequest {
  service_name: string
  service_url: string
  description?: string
}

export interface SystemStatus {
  status: string
  message: string
  warning: boolean
  current_time?: string
  is_manual_override?: boolean
  override_reason?: string
  override_expires_at?: string
}

export interface OperatingHours {
  opening_time: string
  closing_time: string
  warning_minutes_before_close: number
  timezone: string
  currently_open: boolean
  is_manually_overridden?: boolean
  manual_status?: string
  override_reason?: string
  override_expires_at?: string
}

export interface ScheduleUpdate {
  opening_hour: number
  opening_minute: number
  closing_hour: number
  closing_minute: number
  warning_minutes: number
  timezone: string
}

export interface SystemToggle {
  status: 'open' | 'closed' | 'auto'
  reason?: string
  duration_minutes?: number
}

export interface ScheduleResponse {
  id: number
  opening_time: string
  closing_time: string
  warning_minutes_before_close: number
  timezone: string
  is_manually_overridden: boolean
  manual_status?: string
  override_reason?: string
  override_expires_at?: string
  updated_at?: string
  updated_by?: number
}

export interface ScheduleAuditLog {
  id: number
  admin_id: number
  action: string
  old_value?: string
  new_value?: string
  reason?: string
  timestamp: string
}

export interface LoginHistory {
  id: number
  user_id: number
  service_id: number
  login_at: string
  logout_at?: string
  session_expires_at: string
}

export interface UserStats {
  total_logins: number
  services_used: number
  last_login?: string
  first_login?: string
}

// Public API Types
export interface InvitationVerifyRequest {
  invitation_code: string
  pin: string
}

export interface InvitationVerifyResponse {
  valid: boolean
  invitation_id: number
  intended_for: string
  message: string
  expires_at: string
}

export interface RegisterRequest {
  invitation_id: number
  invitation_code: string
  full_name: string
  email: string
  date_of_birth: string
  phone_number: string
  address: string
  photo_id: string
}

export interface UserRegistrationResponse {
  success: boolean;
  user_id: number;
  username: string;
  message: string;
}

export interface UploadResponse {
  success: boolean
  file_id: string
  url: string
  message: string
}

export interface SetupStatusResponse {
  step: 'pending' | 'photos_uploaded' | 'oath_submitted' | 'approved' | 'active'
  user_id: number
  username: string
  is_active: boolean
  has_linked_device: boolean
}

// Waitlist Types
export interface WaitlistRequest {
  id: number
  full_name: string
  email: string
  phone?: string
  company?: string
  role?: string
  status: 'pending' | 'approved' | 'invited' | 'rejected'
  reviewed_by?: string
  admin_notes?: string
  rejection_reason?: string
  invitation_id?: string
  created_at: string
  updated_at?: string
}

export interface WaitlistStats {
  total: number
  pending: number
  approved: number
  invited: number
  rejected: number
}

export interface WaitlistApproveRequest {
  admin_notes?: string
  expires_in_hours?: number
}

export interface WaitlistApprovalResponse {
  success: boolean
  request_id: number
  invitation_code: string
  pin: string
  expires_at?: string
  message: string
}


class ApiService {
  private instance: AxiosInstance
  private config: ApiConfig
  private tokens: AuthTokens | null = null
  private user: User | null = null

  constructor(config: ApiConfig) {
    this.config = config
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      async (config: any) => {
        if (this.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${this.tokens.accessToken}`
        }
        return config
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: any) => {
        if (error.response?.status === 401) {
          await this.clearAuth()
        }
        return Promise.reject(error)
      }
    )
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens
    localStorage.setItem('auth_tokens', JSON.stringify(tokens))
  }

  async setUser(user: User): Promise<void> {
    this.user = user
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  async loadStoredAuth(): Promise<{ tokens: AuthTokens | null; user: User | null }> {
    try {
      const tokensStr = localStorage.getItem('auth_tokens')
      const userStr = localStorage.getItem('auth_user')
      const tokens = tokensStr ? JSON.parse(tokensStr) : null
      const user = userStr ? JSON.parse(userStr) : null
      this.tokens = tokens
      this.user = user
      return { tokens, user }
    } catch (error) {
      console.error('Error loading stored auth:', error)
      return { tokens: null, user: null }
    }
  }

  async clearAuth(): Promise<void> {
    this.tokens = null
    this.user = null
    localStorage.removeItem('auth_tokens')
    localStorage.removeItem('auth_user')
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put(url, data, config)
    return response.data
  }

  async apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config)
    return response.data
  }

  // Auth methods
  auth = {
    login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
      const response = await this.post<any>('/api/admin/login', credentials)
      if (!response.access_token) {
        throw new Error(response.detail || 'Login failed')
      }
      const tokens: AuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token || '',
        tokenType: response.token_type || 'bearer'
      }
      const user: User = response.user || {
        id: 0,
        username: credentials.username,
        email: '',
        full_name: '',
        role: 'admin'
      }
      await this.setTokens(tokens)
      await this.setUser(user)
      return { tokens, user }
    },

    register: async (data: RegisterData): Promise<any> => {
      const response = await this.post<any>('/api/register/', data)
      if (response.detail) throw new Error(response.detail)
      return response
    },

    logout: async (): Promise<void> => {
      await this.clearAuth()
    },

    loadStoredAuth: async (): Promise<{ tokens: AuthTokens | null; user: User | null }> => {
      return await this.loadStoredAuth()
    },

    requestPasswordReset: async (email: string): Promise<void> => {
      await this.post('/api/auth/password-reset/request', { email })
    },

    resetPassword: async (token: string, password: string): Promise<void> => {
      await this.post('/api/auth/password-reset/confirm', { token, password })
    },

    verifyEmail: async (token: string): Promise<void> => {
      await this.post('/api/auth/verify-email', { token })
    },

    resendVerification: async (email: string): Promise<void> => {
      await this.post('/api/auth/verify-email/resend', { email })
    },
  }

  // Admin User Management
  admin = {
    getPendingUsers: async (skip = 0, limit = 100): Promise<PendingUser[]> => {
      return await this.get<PendingUser[]>(`/api/admin/pending?skip=${skip}&limit=${limit}`)
    },

    getPendingUser: async (userId: number): Promise<PendingUser> => {
      return await this.get<PendingUser>(`/api/admin/pending/${userId}`)
    },

    approveUser: async (userId: number, notes?: string): Promise<ActiveUser> => {
      return await this.post<ActiveUser>(`/api/admin/approve/${userId}`, {
        admin_notes: notes || 'Approved'
      })
    },

    rejectUser: async (userId: number, reason: string): Promise<{ success: boolean; message: string }> => {
      return await this.post(`/api/admin/reject/${userId}`, { reason })
    },

    requestInfo: async (userId: number, question: string): Promise<{ success: boolean; message: string }> => {
      return await this.post(`/api/admin/request-info/${userId}`, { question })
    },

    getAllUsers: async (skip = 0, limit = 100): Promise<ActiveUser[]> => {
      return await this.get<ActiveUser[]>(`/api/admin/users?skip=${skip}&limit=${limit}`)
    },

    getLoginHistory: async (params?: {
      user_id?: number
      service_id?: number
      skip?: number
      limit?: number
    }): Promise<LoginHistory[]> => {
      const queryParams = new URLSearchParams()
      if (params?.user_id) queryParams.append('user_id', params.user_id.toString())
      if (params?.service_id) queryParams.append('service_id', params.service_id.toString())
      if (params?.skip) queryParams.append('skip', params.skip.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      return await this.get<LoginHistory[]>(`/api/admin/login-history?${queryParams}`)
    },

    getUserStats: async (userId: number): Promise<UserStats> => {
      return await this.get<UserStats>(`/api/admin/user-stats/${userId}`)
    },
  }

  // Invitation Management
  invitations = {
    create: async (data: CreateInvitationRequest): Promise<Invitation> => {
      return await this.post<Invitation>('/api/invitation/create', data)
    },

    list: async (includeUsed = false, skip = 0, limit = 50): Promise<Invitation[]> => {
      return await this.get<Invitation[]>(
        `/api/invitation/list?include_used=${includeUsed}&skip=${skip}&limit=${limit}`
      )
    },

    delete: async (invitationId: number): Promise<{ message: string }> => {
      return await this.apiDelete<{ message: string }>(`/api/invitation/${invitationId}`)
    },

    verify: async (code: string, pin: string): Promise<{
      valid: boolean
      invitation_id?: number
      intended_for?: string
      message: string
      expires_at?: string
    }> => {
      return await this.post('/api/invitation/verify', {
        invitation_code: code,
        pin: pin
      })
    },
  }

  // Service Management
  services = {
    register: async (data: RegisterServiceRequest): Promise<Service> => {
      return await this.post<Service>('/api/services/register', data)
    },

    list: async (includeInactive = false): Promise<Service[]> => {
      return await this.get<Service[]>(`/api/services/list?include_inactive=${includeInactive}`)
    },

    deactivate: async (serviceId: number): Promise<{ success: boolean; message: string }> => {
      return await this.post(`/api/services/deactivate/${serviceId}`)
    },
  }

  // System Status
  system = {
    getStatus: async (): Promise<SystemStatus> => {
      return await this.get<SystemStatus>('/api/system/status')
    },

    getOperatingHours: async (): Promise<OperatingHours> => {
      return await this.get<OperatingHours>('/api/system/operating-hours')
    },

    healthCheck: async (): Promise<{
      status: string
      api_version: string
      system: SystemStatus
    }> => {
      return await this.get('/health')
    },

    // Schedule Management (Admin only)
    updateOperatingHours: async (schedule: ScheduleUpdate): Promise<ScheduleResponse> => {
      return await this.put<ScheduleResponse>('/api/admin/system/operating-hours', schedule)
    },

    toggleSystemStatus: async (toggle: SystemToggle): Promise<ScheduleResponse> => {
      return await this.post<ScheduleResponse>('/api/admin/system/toggle', toggle)
    },

    getCurrentSchedule: async (): Promise<ScheduleResponse> => {
      return await this.get<ScheduleResponse>('/api/admin/system/schedule')
    },

    getScheduleAuditLog: async (skip = 0, limit = 50): Promise<ScheduleAuditLog[]> => {
      return await this.get<ScheduleAuditLog[]>(
        `/api/admin/system/audit-log?skip=${skip}&limit=${limit}`
      )
    },
  }

  // Waitlist Management (Admin only)
  waitlist = {
    getPending: async (skip = 0, limit = 50): Promise<WaitlistRequest[]> => {
      return await this.get<WaitlistRequest[]>(`/api/waitlist/pending?skip=${skip}&limit=${limit}`)
    },

    getAll: async (status?: string, skip = 0, limit = 50): Promise<WaitlistRequest[]> => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      params.append('skip', skip.toString())
      params.append('limit', limit.toString())
      return await this.get<WaitlistRequest[]>(`/api/waitlist/all?${params}`)
    },

    getStats: async (): Promise<WaitlistStats> => {
      return await this.get<WaitlistStats>('/api/waitlist/stats')
    },

    getDetails: async (requestId: number): Promise<WaitlistRequest> => {
      return await this.get<WaitlistRequest>(`/api/waitlist/${requestId}`)
    },

    approve: async (requestId: number, data?: WaitlistApproveRequest): Promise<WaitlistApprovalResponse> => {
      return await this.post<WaitlistApprovalResponse>(`/api/waitlist/${requestId}/approve`, data || {})
    },

    reject: async (requestId: number, reason: string): Promise<{ success: boolean; message: string }> => {
      return await this.post(`/api/waitlist/${requestId}/reject`, { reason })
    },
  }

  // Media Management
  media = {
    list: async (mediaType: 'all' | 'photos' | 'audio' = 'all'): Promise<{
      success: boolean
      count: number
      files: Array<{
        id: string
        type: 'photo' | 'audio'
        filename: string
        url: string
        size_bytes: number
        created_at: number
      }>
    }> => {
      return await this.get(`/api/upload/list?media_type=${mediaType}`)
    },

    delete: async (mediaType: 'photos' | 'audio', fileId: string): Promise<{ success: boolean; message: string }> => {
      return await this.apiDelete(`/api/upload/${mediaType}/${fileId}`)
    },
  }

  // Public Membership Initiation (No Auth / Specific Flow)
  public = {
    // Invitation
    verifyInvitation: async (data: InvitationVerifyRequest): Promise<InvitationVerifyResponse> => {
      // Note: No auth header should be simpler, but current interceptor just adds it if present.
      // Ideally should be able to skip auth header, but backend public routes ignore it anyway.
      return await this.post<InvitationVerifyResponse>('/api/invitation/verify', data)
    },

    // Registration
    checkEmail: async (email: string): Promise<boolean> => {
      // Returns true if available, false if taken
      try {
        const result = await this.get<{ available: boolean }>(`/api/register/check-email?email=${encodeURIComponent(email)}`)
        return result.available
      } catch {
        return false
      }
    },

    checkUsername: async (username: string): Promise<boolean> => {
      try {
        const result = await this.get<{ available: boolean }>(`/api/register/check-username?username=${encodeURIComponent(username)}`)
        return result.available
      } catch {
        return false
      }
    },

    register: async (data: RegisterRequest): Promise<UserRegistrationResponse> => {
      return await this.post<UserRegistrationResponse>('/api/register/submit', data)
    },

    // Uploads
    uploadPhoto: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      return await this.instance.post('/api/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data)
    },

    uploadAudio: async (file: Blob, filename?: string): Promise<UploadResponse> => {
      const formData = new FormData()
      formData.append('file', file, filename || 'oath.webm')
      return await this.instance.post('/api/upload/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data)
    },

    // Setup/Status check for newly registered user
    checkSetupStatus: async (username: string): Promise<SetupStatusResponse> => {
      // This endpoint might need to be created if not exists, or verify logic
      // reusing system status for now as placeholder or need to implement specific status endpoint
      // Actually, we don't have a public "check user status" endpoint that exposes this detail for security.
      // But assuming we need one for the setup page polling.
      // Implementation TBD: Backend gap might exist here for public polling.
      // Using a safe placeholder that throws for now if not implemented.
      return await this.get<SetupStatusResponse>(`/api/register/status/${username}`)
    }
  }

  // Getters
  get isAuthenticated(): boolean {
    return !!this.tokens?.accessToken
  }

  get currentUser(): User | null {
    return this.user
  }

  get currentTokens(): AuthTokens | null {
    return this.tokens
  }
}

// Create default API service instance
export const apiService = new ApiService({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
})