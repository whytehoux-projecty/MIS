import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Image, Music, Trash2, RefreshCw, Filter } from 'lucide-react';
export function MediaPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filter, setFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        fetchMedia();
    }, [filter]);
    const fetchMedia = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.media.list(filter);
            setFiles(response.files);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to load media files');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteConfirm)
            return;
        try {
            setDeleting(true);
            const mediaType = deleteConfirm.type === 'photo' ? 'photos' : 'audio';
            await apiService.media.delete(mediaType, deleteConfirm.id);
            setSuccess(`File deleted successfully`);
            setDeleteConfirm(null);
            fetchMedia();
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete file');
        }
        finally {
            setDeleting(false);
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Media Library" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Manage uploaded photos and audio recordings" })] }), _jsxs("button", { onClick: fetchMedia, disabled: loading, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `h-4 w-4 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] }), error && (_jsxs("div", { className: "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex justify-between", children: [_jsx("span", { children: error }), _jsx("button", { onClick: () => setError(null), className: "text-red-600 hover:text-red-800", children: "\u00D7" })] })), success && (_jsxs("div", { className: "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex justify-between", children: [_jsx("span", { children: success }), _jsx("button", { onClick: () => setSuccess(null), className: "text-green-600 hover:text-green-800", children: "\u00D7" })] })), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Filter, { className: "h-5 w-5 text-gray-400" }), _jsx("div", { className: "flex gap-2", children: ['all', 'photos', 'audio'].map((f) => (_jsx("button", { onClick: () => setFilter(f), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: f.charAt(0).toUpperCase() + f.slice(1) }, f))) }), _jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: [files.length, " file", files.length !== 1 ? 's' : ''] })] }), loading && files.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "text-lg text-gray-500 dark:text-gray-400", children: "Loading media..." }) })) : files.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600", children: [_jsx(Image, { className: "h-12 w-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No media files found" })] })) : (_jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: files.map((file) => (_jsxs("div", { className: "group bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative", children: [file.type === 'photo' ? (_jsx("img", { src: file.url, alt: file.filename, className: "w-full h-full object-cover", onError: (e) => {
                                        e.target.style.display = 'none';
                                    } })) : (_jsx(Music, { className: "h-16 w-16 text-gray-400" })), _jsx("div", { className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100", children: _jsx("button", { onClick: () => setDeleteConfirm(file), className: "p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform scale-90 group-hover:scale-100 transition-transform", title: "Delete file", children: _jsx(Trash2, { className: "h-5 w-5" }) }) })] }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [file.type === 'photo' ? (_jsx(Image, { className: "h-4 w-4 text-blue-500" })) : (_jsx(Music, { className: "h-4 w-4 text-purple-500" })), _jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 uppercase", children: file.type })] }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-300 truncate", title: file.filename, children: file.filename }), _jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500", children: formatBytes(file.size_bytes) })] })] }, file.id))) })), deleteConfirm && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-white mb-2", children: "Delete File?" }), _jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-300 mb-4", children: ["Are you sure you want to delete ", _jsx("strong", { children: deleteConfirm.filename }), "? This action cannot be undone."] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setDeleteConfirm(null), className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700", children: "Cancel" }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete' })] })] }) }))] }));
}
