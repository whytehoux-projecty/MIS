import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
export function LoginPage() {
    const navigate = useNavigate();
    const { setUser, setTokens } = useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const result = await apiService.auth.login({
                username: username.trim(),
                password: password
            });
            // Store tokens and user in zustand store
            setTokens(result.tokens);
            setUser(result.user);
            // Navigate to dashboard
            navigate('/dashboard');
        }
        catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4", children: _jsx(Lock, { className: "h-8 w-8 text-white" }) }), _jsx("h1", { className: "text-3xl font-bold text-white", children: "Admin Control" }), _jsx("p", { className: "text-gray-400 mt-2", children: "Sign in to manage your system" })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsxs("div", { className: "flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: error })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" }), _jsx("input", { id: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value), className: "w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "Enter your username", autoComplete: "username", disabled: loading })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" }), _jsx("input", { id: "password", type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), className: "w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition", placeholder: "Enter your password", autoComplete: "current-password", disabled: loading }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-5 w-5", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Signing in..."] })) : ('Sign In') })] }) }), _jsx("p", { className: "text-center text-gray-500 text-sm mt-6", children: "Central Authentication System" })] }) }));
}
export default LoginPage;
