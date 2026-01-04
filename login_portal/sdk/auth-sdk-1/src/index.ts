/**
 * Central Auth SDK
 * 
 * A React SDK for integrating QR-based authentication into your applications.
 * 
 * @example
 * ```tsx
 * import { AuthProvider, LoginPage } from '@yourcompany/central-auth-sdk';
 * 
 * function App() {
 *   return (
 *     <AuthProvider config={{ apiUrl: 'https://api.example.com', serviceId: '1', serviceApiKey: 'key' }}>
 *       <LoginPage onSuccess={(user) => console.log('Logged in:', user)} />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */

// Core Provider
export { AuthProvider, useAuthContext } from './AuthProvider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useQRAuth } from './hooks/useQRAuth';
export { useSession } from './hooks/useSession';

// Complete Pages (drop-in)
export { LoginPage } from './components/LoginPage';

// Individual Components (for custom layouts)
export { QRScanner } from './components/QRScanner';
export { PinEntry } from './components/PinEntry';
export { QRDisplay } from './components/QRDisplay';
export { LoginButton } from './components/LoginButton';
export { AuthStatus } from './components/AuthStatus';

// UI Components
export { Button } from './components/ui/Button';
export { Input } from './components/ui/Input';
export { Card } from './components/ui/Card';
export { Spinner } from './components/ui/Spinner';
export { Alert } from './components/ui/Alert';

// Theming
export { createTheme, defaultTheme, darkTheme } from './themes';
export type { Theme } from './themes';

// Internationalization
export {
    I18nProvider,
    useI18n,
    getTranslations,
    interpolate,
    registerLocale,
    getAvailableLocales,
} from './i18n';
export type { Translations, LocaleCode, LocaleConfig } from './i18n';

// Services
export { AuthService } from './services/authService';
export {
    WebSocketService,
    createWebSocketService,
    isWebSocketSupported,
} from './services/websocketService';
export type { WebSocketStatus, QRStatusUpdate, WebSocketServiceConfig } from './services/websocketService';

// Types
export type {
    AuthConfig,
    AuthState,
    User,
    Session,
    QRAuthState,
    LoginCredentials,
} from './types';
