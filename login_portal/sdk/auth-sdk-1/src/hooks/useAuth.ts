/**
 * useAuth Hook
 * 
 * Primary hook for accessing authentication state and actions.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login('key')}>Login</button>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user?.fullName}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { useAuthContext } from '../AuthProvider';

export const useAuth = () => {
    const context = useAuthContext();

    return {
        // State
        isAuthenticated: context.isAuthenticated,
        user: context.user,
        session: context.session,
        loading: context.loading,
        error: context.error,

        // Actions
        login: context.login,
        logout: context.logout,
        refreshSession: context.refreshSession,
        clearError: context.clearError,
    };
};
