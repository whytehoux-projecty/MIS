import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Image, Music, Trash2, RefreshCw, Filter } from 'lucide-react';

interface MediaFile {
  id: string;
  type: 'photo' | 'audio';
  filename: string;
  url: string;
  size_bytes: number;
  created_at: number;
}

type MediaFilter = 'all' | 'photos' | 'audio';

export function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<MediaFile | null>(null);
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const mediaType = deleteConfirm.type === 'photo' ? 'photos' : 'audio';
      await apiService.media.delete(mediaType, deleteConfirm.id);
      setSuccess(`File deleted successfully`);
      setDeleteConfirm(null);
      fetchMedia();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage uploaded photos and audio recordings
          </p>
        </div>
        <button
          onClick={fetchMedia}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">×</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <div className="flex gap-2">
          {(['all', 'photos', 'audio'] as MediaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Media Grid */}
      {loading && files.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500 dark:text-gray-400">Loading media...</div>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Image className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No media files found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
                {file.type === 'photo' ? (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Music className="h-16 w-16 text-gray-400" />
                )}

                {/* Delete overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setDeleteConfirm(file)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transform scale-90 group-hover:scale-100 transition-transform"
                    title="Delete file"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  {file.type === 'photo' ? (
                    <Image className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Music className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                    {file.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatBytes(file.size_bytes)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete File?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.filename}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}