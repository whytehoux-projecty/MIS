import React, { useEffect, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useThemeStore } from "./stores/themeStore";
import { useAuthStore } from "./stores/authStore";
import { apiService } from "./services/apiService";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Auth Pages
const LoginPage = React.lazy(() =>
  import("./pages/auth/LoginPage").then((m) => ({
    default: m.LoginPage,
  }))
);

const AdminDashboard = React.lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  }))
);
const ApplicationReviewPage = React.lazy(() =>
  import("./pages/admin/ApplicationReviewPage").then((m) => ({
    default: m.ApplicationReviewPage,
  }))
);
const AdminUnauthorized = React.lazy(() =>
  import("./pages/admin/Unauthorized").then((m) => ({ default: m.default }))
);
const MembersPage = React.lazy(() =>
  import("./pages/members/MembersPage").then((m) => ({
    default: m.MembersPage,
  }))
);
const InvitationsPage = React.lazy(() =>
  import("./pages/invitations/InvitationsPage").then((m) => ({
    default: m.InvitationsPage,
  }))
);
const MediaPage = React.lazy(() =>
  import("./pages/media/MediaPage").then((m) => ({ default: m.MediaPage }))
);
const SettingsPage = React.lazy(() =>
  import("./pages/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
  }))
);
const ProfilePage = React.lazy(() =>
  import("./pages/profile/ProfilePage").then((m) => ({
    default: m.ProfilePage,
  }))
);
const AnalyticsPage = React.lazy(() =>
  import("./pages/analytics/AnalyticsPage").then((m) => ({
    default: m.AnalyticsPage,
  }))
);
const ServicesPage = React.lazy(() =>
  import("./pages/services/ServicesPage").then((m) => ({
    default: m.ServicesPage,
  }))
);
const SystemSchedulePage = React.lazy(() =>
  import("./pages/settings/SystemSchedulePage").then((m) => ({
    default: m.default,
  }))
);
const WaitlistPage = React.lazy(() =>
  import("./pages/waitlist/WaitlistPage").then((m) => ({
    default: m.default,
  }))
);


const InvitationPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/InvitationPage").then((m) => ({
    default: m.InvitationPage,
  }))
);
// The rest of membership-initiation pages will be migrated next
const RegistrationPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/RegistrationPage").then(
    (m) => ({
      default: m.RegistrationPage,
    })
  )
);
const OathPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/OathPage").then((m) => ({
    default: m.OathPage,
  }))
);
const SetupPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/SetupPage").then((m) => ({
    default: m.SetupPage,
  }))
);
const TelegramConnectPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/TelegramConnectPage").then(
    (m) => ({
      default: m.TelegramConnectPage,
    })
  )
);
const SubmissionConfirmationPageMI = React.lazy(() =>
  import(
    "./modules/membership-initiation/pages/SubmissionConfirmationPage"
  ).then((m) => ({
    default: m.SubmissionConfirmationPage,
  }))
);
const MobileConnectPageMI = React.lazy(() =>
  import("./modules/membership-initiation/pages/MobileConnectPage").then(
    (m) => ({
      default: m.MobileConnectPage,
    })
  )
);

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated, tokens } = useAuthStore();

  // Check if we have valid tokens
  if (!isAuthenticated || !tokens?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


function App() {
  const { theme, initializeTheme } = useThemeStore();
  const { loadStoredAuth, isAuthenticated, tokens } = useAuthStore();

  useEffect(() => {
    initializeTheme();
    // Load stored auth on app start
    loadStoredAuth();
  }, [initializeTheme, loadStoredAuth]);

  // Sync tokens to apiService when they change
  useEffect(() => {
    if (tokens) {
      apiService.setTokens(tokens);
    }
  }, [tokens]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Suspense
        fallback={
          <div className="p-6">
            <LoadingSpinner size="large" />
          </div>
        }>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/applications/:id" element={<ApplicationReviewPage />} />

              <Route path="/members" element={<MembersPage />} />
              <Route path="/invitations" element={<InvitationsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/system-schedule" element={<SystemSchedulePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
            </Route>
          </Route>

          {/* Membership Initiation Routes - Public */}
          <Route path="/membership/invitation" element={<InvitationPageMI />} />
          <Route path="/membership/invitation/:invitationId" element={<InvitationPageMI />} />
          <Route path="/membership/registration" element={<RegistrationPageMI />} />
          <Route path="/membership/oath" element={<OathPageMI />} />
          <Route path="/membership/setup" element={<SetupPageMI />} />
          <Route path="/membership/telegram-connect" element={<TelegramConnectPageMI />} />
          <Route path="/membership/submission-confirmation" element={<SubmissionConfirmationPageMI />} />
          <Route path="/membership/mobile-connect" element={<MobileConnectPageMI />} />

          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
