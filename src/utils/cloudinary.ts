import { projectId } from './supabase/info';

// Cloud name is public and safe to include
const CLOUD_NAME_DEFAULT = 'dxpabpzkf';

/**
 * Fetches a secure signature from the backend for Cloudinary uploads.
 * The API_SECRET is NEVER exposed to the browser.
 */
async function getCloudinarySignature(
  params: Record<string, string>,
  accessToken: string
): Promise<{ signature: string; api_key: string; cloud_name: string }> {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/cloudinary-signature`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(params), // Send params directly, not wrapped
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get Cloudinary signature');
  }

  return response.json();
}

/**
 * Uploads a file to Cloudinary.
 * @param file The file (or URL string for migration) to upload.
 * @param accessToken The user's auth token for backend signature request.
 * @param onProgress Optional callback for upload progress.
 * @returns The secure, optimized URL of the uploaded image.
 */
export async function uploadToCloudinary(
  file: File | string,
  accessToken?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!accessToken) {
    const stored = sessionStorage.getItem('access_token');
    if (stored) {
      accessToken = stored;
    } else {
      throw new Error('Authentication required for upload');
    }
  }

  const timestamp = Math.round((new Date()).getTime() / 1000).toString();
  const folder = 'products';

  const params: Record<string, string> = {
    timestamp,
    folder,
    format: 'webp',
  };

  // For URL migration, derive a consistent public_id to avoid duplicates
  if (typeof file === 'string') {
    try {
      const urlObj = new URL(file);
      const pathname = urlObj.pathname;
      let name = pathname.split('/').pop() || 'image';
      name = name.split('.')[0];
      params.public_id = name;
    } catch (e) {
      // ignore
    }
  }

  // Get secure signature from backend
  const { signature, api_key, cloud_name } = await getCloudinarySignature(params, accessToken);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('format', 'webp');
  formData.append('signature', signature);
  if (params.public_id) {
    formData.append('public_id', params.public_id);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name || CLOUD_NAME_DEFAULT}/image/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        // Optimize delivery: f_auto + q_auto
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        resolve(optimizedUrl);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Cloudinary upload failed'));
        } catch {
          reject(new Error('Cloudinary upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

/**
 * Uploads a video file to Cloudinary.
 * @param file The video file to upload.
 * @param accessToken The user's auth token for backend signature request.
 * @param onProgress Optional callback for upload progress.
 * @returns The secure URL of the uploaded video.
 */
export async function uploadVideoToCloudinary(
  file: File,
  accessToken?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!accessToken) {
    const stored = sessionStorage.getItem('access_token');
    if (stored) {
      accessToken = stored;
    } else {
      throw new Error('Authentication required for upload');
    }
  }

  const timestamp = Math.round((new Date()).getTime() / 1000).toString();
  const folder = 'videos';

  const params: Record<string, string> = {
    timestamp,
    folder,
    resource_type: 'video',
  };

  // Get secure signature from backend
  const { signature, api_key, cloud_name } = await getCloudinarySignature(params, accessToken);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', api_key);
  formData.append('timestamp', timestamp);
  formData.append('folder', folder);
  formData.append('resource_type', 'video');
  formData.append('signature', signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloud_name || CLOUD_NAME_DEFAULT}/video/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.error?.message || 'Cloudinary video upload failed'));
        } catch {
          reject(new Error('Cloudinary video upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}
