import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [formData, setFormData] = useState({
        service_name: '',
        service_url: '',
        description: '',
    });
    useEffect(() => {
        fetchServices();
    }, [includeInactive]);
    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await apiService.services.list(includeInactive);
            setServices(Array.isArray(data) ? data : []);
        }
        catch (error) {
            toast.error('Failed to load services: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        if (!formData.service_name || !formData.service_url) {
            toast.error('Service name and URL are required');
            return;
        }
        try {
            setCreateLoading(true);
            const newService = await apiService.services.register(formData);
            toast.success('Service registered successfully!');
            setServices(prev => [newService, ...prev]);
            setShowCreateModal(false);
            setFormData({ service_name: '', service_url: '', description: '' });
        }
        catch (error) {
            toast.error('Failed to register service: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
        finally {
            setCreateLoading(false);
        }
    };
    const handleDeactivate = async (serviceId) => {
        if (!window.confirm('Are you sure you want to deactivate this service?'))
            return;
        try {
            await apiService.services.deactivate(serviceId);
            toast.success('Service deactivated');
            setServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: false } : s));
        }
        catch (error) {
            toast.error('Failed to deactivate service: ' + (error.message || 'Unknown error'));
            console.error(error);
        }
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('API Key copied to clipboard!');
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString();
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 flex justify-center items-center min-h-[400px]", children: _jsx(LoadingSpinner, { size: "large" }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Connected Services" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Manage third-party applications using this authentication system" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: includeInactive, onChange: (e) => setIncludeInactive(e.target.checked), className: "form-checkbox h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-gray-600 dark:text-gray-300", children: "Show inactive" })] }), _jsx("button", { onClick: () => setShowCreateModal(true), className: "px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-lg", children: "+ Register Service" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: services.filter(s => s.is_active).length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Services" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-2xl font-bold text-gray-500", children: services.filter(s => !s.is_active).length }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Inactive Services" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: services.length === 0 ? (_jsxs("div", { className: "col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center", children: [_jsx("p", { className: "text-lg font-medium text-gray-500", children: "No services registered" }), _jsx("p", { className: "text-sm text-gray-400", children: "Register your first service to get started." })] })) : (services.map((service) => (_jsxs("div", { className: `bg-white dark:bg-gray-800 rounded-lg shadow border-2 p-5 transition-all ${service.is_active
                        ? 'border-green-500 dark:border-green-600'
                        : 'border-gray-300 dark:border-gray-600 opacity-60'}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white", children: service.service_name }), _jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${service.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`, children: service.is_active ? 'Active' : 'Inactive' })] }), _jsx("a", { href: service.service_url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline break-all", children: service.service_url }), service.description && (_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-2", children: service.description })), _jsxs("div", { className: "mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("span", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "API Key" }), _jsx("button", { onClick: () => copyToClipboard(service.api_key), className: "text-xs text-blue-600 hover:text-blue-800", children: "Copy" })] }), _jsxs("code", { className: "text-xs font-mono text-gray-700 dark:text-gray-300 break-all", children: [service.api_key.substring(0, 20), "..."] })] }), _jsxs("div", { className: "mt-4 flex justify-between items-center text-xs text-gray-500", children: [_jsxs("span", { children: ["Created: ", formatDate(service.created_at)] }), service.is_active && (_jsx("button", { onClick: () => handleDeactivate(service.id), className: "px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700", children: "Deactivate" }))] })] }, service.id)))) }), showCreateModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-4", children: "Register New Service" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Service Name *" }), _jsx("input", { type: "text", value: formData.service_name, onChange: (e) => setFormData(prev => ({ ...prev, service_name: e.target.value })), placeholder: "My Application", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Service URL *" }), _jsx("input", { type: "url", value: formData.service_url, onChange: (e) => setFormData(prev => ({ ...prev, service_url: e.target.value })), placeholder: "https://myapp.com", className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Description (optional)" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), placeholder: "Brief description of this service...", rows: 2, className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white" })] })] }), _jsxs("div", { className: "flex gap-3 mt-6", children: [_jsx("button", { onClick: () => setShowCreateModal(false), className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: handleCreate, disabled: createLoading, className: "flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50", children: createLoading ? 'Registering...' : 'Register Service' })] })] }) }))] }));
};
export default ServicesPage;
