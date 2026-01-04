# Admin Control Portal: Building Plan for Netlify Deployment

## Phase 1: Cleanup & Fixes (Day 1)

### 1.1 Delete Duplicate Files

```bash
# Navigate to project
cd admin_control

# Remove duplicate JavaScript files
rm -f src/services/apiService.js
rm -f src/stores/authStore.js
rm -f src/stores/themeStore.js
rm -f src/App.js
rm -f src/main.js
```

### 1.2 Create Environment Configuration

**File:** `.env.example`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME=Admin Control Portal
VITE_APP_VERSION=2.0.0

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
```

**File:** `.env.development`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Admin Control (Dev)
```

**File:** `.env.production`

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_NAME=Admin Control
```

### 1.3 Fix User Interface (authStore.ts)

Replace the User interface:

```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'super_admin';
  is_active?: boolean;
  created_at?: string;
}
```

Remove unused properties:

- `firstName` → use `full_name`
- `lastName` → remove (use `full_name`)
- `tenantId`, `tenantSlug`, `tenantName`, `tenantPlan` → remove

### 1.4 Fix Login Credentials (apiService.ts)

Update to match backend expectations:

```typescript
export interface LoginCredentials {
  username: string;
  password: string;
}

// In auth.login method:
login: async (credentials: LoginCredentials) => {
  const response = await this.post<any>('/api/admin/login', credentials);
  // ... rest of implementation
}
```

---

## Phase 2: Protected Routes (Day 1-2)

### 2.1 Create ProtectedRoute Component

**File:** `src/components/ProtectedRoute.tsx`

```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, saving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && user?.role !== 'super_admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  if (requireAdmin && !['admin', 'super_admin'].includes(user?.role || '')) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### 2.2 Update App.tsx Routes

Wrap protected routes:

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// In Routes:
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/*"
  element={
    <ProtectedRoute requireAdmin>
      <DashboardLayout>
        <AdminDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

---

## Phase 3: API Integration (Day 2-3)

### 3.1 Add Admin API Methods to apiService.ts

```typescript
// Add to ApiService class

admin = {
  getPendingUsers: async (): Promise<any[]> => {
    const response = await this.get<any>('/api/admin/pending');
    return Array.isArray(response) ? response : [];
  },

  approveUser: async (userId: number, notes?: string): Promise<any> => {
    return await this.post(`/api/admin/approve/${userId}`, {
      admin_notes: notes || 'Approved'
    });
  },

  rejectUser: async (userId: number, reason: string): Promise<any> => {
    return await this.post(`/api/admin/reject/${userId}`, {
      reason
    });
  },

  getAllUsers: async (): Promise<any[]> => {
    const response = await this.get<any>('/api/admin/users');
    return Array.isArray(response) ? response : [];
  },

  getLoginHistory: async (params?: {
    user_id?: number;
    service_id?: number;
  }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.service_id) queryParams.append('service_id', params.service_id.toString());
    
    const response = await this.get<any>(`/api/admin/login-history?${queryParams}`);
    return Array.isArray(response) ? response : [];
  },

  getUserStats: async (userId: number): Promise<any> => {
    return await this.get(`/api/admin/user-stats/${userId}`);
  },

  getSystemStatus: async (): Promise<any> => {
    return await this.get('/api/system/status');
  }
};
```

### 3.2 Update MembersPage

**File:** `src/pages/members/MembersPage.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

interface Member {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  approved_at: string;
  last_login?: string;
}

export const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await apiService.admin.getAllUsers();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load members');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading members...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Active Members ({members.length})</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">{member.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{member.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    member.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {member.last_login 
                    ? new Date(member.last_login).toLocaleDateString() 
                    : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

---

## Phase 4: Netlify Configuration (Day 3)

### 4.1 Create netlify.toml

**File:** `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

# Handle SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.ngrok.io https://*.netlify.app;"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 4.2 Create public/_redirects

**File:** `public/_redirects`

```
/*    /index.html   200
```

### 4.3 Update package.json scripts

Add build optimization:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:netlify": "npm run build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:ci": "vitest run"
  }
}
```

---

## Phase 5: Deployment Steps

### 5.1 Deploy to Netlify

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub/GitLab account
   - Select the repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `admin_control`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add:
     - `VITE_API_BASE_URL` = Your API URL (ngrok or production)

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### 5.2 Connect to Local API via ngrok

When running central-auth-api locally:

```bash
# Start the API
cd central-auth-api
docker-compose up -d

# Start ngrok tunnel
ngrok http 80

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update Netlify environment variable VITE_API_BASE_URL
```

---

## Implementation Timeline

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 (AM) | Delete duplicate files | Clean codebase |
| 1 (AM) | Create env configuration | .env files |
| 1 (PM) | Fix interfaces | Aligned types |
| 1 (PM) | Create ProtectedRoute | Route protection |
| 2 (AM) | Add admin API methods | API service |
| 2 (PM) | Wire MembersPage | Working member list |
| 2 (PM) | Wire InvitationsPage | Working pending list |
| 3 (AM) | Create Netlify config | netlify.toml |
| 3 (PM) | Deploy to Netlify | Live site |
| 3 (PM) | Connect to API | Working integration |
