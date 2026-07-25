'use client';

import { useCallback, useState } from 'react';
import { authFetch } from '@/lib/apiClient';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/omnichannel/mediaTypes';

function validateFile(file) {
  if (!file) return 'No file selected';
  if (file.size > MAX_FILE_SIZE) return `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'mp3', 'wav', 'mp4', 'mov', 'webm', 'aac', 'm4a'];
    if (!allowedExt.includes(ext)) return 'File type not supported';
  }
  return null;
}

export function useMediaUpload() {
  const [uploads, setUploads] = useState([]);

  const updateUpload = useCallback((id, patch) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const uploadFile = useCallback(async (file, { onProgress } = {}) => {
    const err = validateFile(file);
    if (err) throw new Error(err);

    const id = `up_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const entry = {
      id,
      file,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
      status: 'uploading',
      url: null,
      error: null,
    };
    setUploads((prev) => [...prev, entry]);

    try {
      onProgress?.(10);
      updateUpload(id, { progress: 10 });

      let fullUrl = '';
      let uploaded = false;

      try {
        const sigReq = await authFetch('/api/cloudinary-sign', { method: 'POST' });
        if (sigReq.ok) {
          const sigData = await sigReq.json();
          if (sigData.success) {
            const cloudData = new FormData();
            cloudData.append('file', file);
            cloudData.append('api_key', sigData.apiKey);
            cloudData.append('timestamp', sigData.timestamp);
            cloudData.append('signature', sigData.signature);
            if (sigData.folder) cloudData.append('folder', sigData.folder);

            const xhr = new XMLHttpRequest();
            fullUrl = await new Promise((resolve, reject) => {
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const pct = Math.round((e.loaded / e.total) * 90) + 10;
                  updateUpload(id, { progress: pct });
                  onProgress?.(pct);
                }
              };
              xhr.onload = () => {
                try {
                  const json = JSON.parse(xhr.responseText);
                  if (json.secure_url) resolve(json.secure_url);
                  else reject(new Error(json.error?.message || 'Upload failed'));
                } catch (e) {
                  reject(e);
                }
              };
              xhr.onerror = () => reject(new Error('Upload failed'));
              xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`);
              xhr.send(cloudData);
            });
            uploaded = true;
          }
        }
      } catch {
        /* fallback */
      }

      if (!uploaded) {
        if (file.size > 4.5 * 1024 * 1024) {
          throw new Error('Configure Cloudinary for files over 4.5MB');
        }
        const formData = new FormData();
        formData.append('file', file);
        const req = await fetch('/api/upload', { method: 'POST', body: formData });
        const res = await req.json();
        if (!res.success) throw new Error(res.error || 'Upload failed');
        fullUrl = `${window.location.origin}${res.url}`;
      }

      updateUpload(id, { progress: 100, status: 'done', url: fullUrl });
      onProgress?.(100);
      return { id, url: fullUrl, fileName: file.name, mimeType: file.type, size: file.size };
    } catch (error) {
      updateUpload(id, { status: 'failed', error: error.message, progress: 0 });
      throw error;
    }
  }, [updateUpload]);

  const removeUpload = useCallback((id) => {
    setUploads((prev) => {
      const item = prev.find((u) => u.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const retryUpload = useCallback(async (id) => {
    const item = uploads.find((u) => u.id === id);
    if (!item?.file) return null;
    removeUpload(id);
    return uploadFile(item.file);
  }, [uploads, removeUpload, uploadFile]);

  const clearUploads = useCallback(() => {
    uploads.forEach((u) => { if (u.preview) URL.revokeObjectURL(u.preview); });
    setUploads([]);
  }, [uploads]);

  return { uploads, uploadFile, removeUpload, retryUpload, clearUploads, validateFile };
}

export default useMediaUpload;
