import { API_BASE_URL, authFetch, extractApiDataList, extractApiDataObject } from '@/config/api.config';

export interface UploadImageOptions {
  /** Optional Cloudinary folder, e.g. 'adwika/products', 'products' or 'categories' */
  folder?: string;
  /** Optional custom public ID */
  publicId?: string;
}

export interface UploadImageResponse {
  /** The secure HTTPS URL of the uploaded image */
  url: string;
  secureUrl: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  raw?: any;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'];

function normalizeUploadResult(json: any): UploadImageResponse {
  const data = extractApiDataObject(json) || json;
  const secureUrl: string =
    data?.secureUrl ||
    data?.secure_url ||
    data?.url ||
    data?.imageUrl ||
    json?.secureUrl ||
    json?.secure_url ||
    json?.url ||
    '';

  if (!secureUrl) {
    throw new Error('Image upload succeeded on server, but no URL was returned.');
  }

  return {
    url: secureUrl,
    secureUrl,
    publicId: data?.publicId || data?.public_id || json?.publicId || json?.public_id,
    format: data?.format || json?.format,
    bytes: data?.bytes || json?.bytes,
    width: data?.width || json?.width,
    height: data?.height || json?.height,
    raw: json,
  };
}

export const uploadService = {
  /**
   * Validate image file format and size
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size (${sizeMb} MB) exceeds the 10 MB limit. Please select a smaller image.`,
      };
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(extension);

    if (!isMimeValid && !isExtValid) {
      return {
        valid: false,
        error: 'Unsupported image format. Allowed formats: JPEG, PNG, WEBP, AVIF, GIF, SVG.',
      };
    }

    return { valid: true };
  },

  /**
   * 6.1 Upload Single Image
   * POST /api/v1/upload/image
   * Content-Type: multipart/form-data
   * Form-Data: file, folder?, publicId?
   */
  async uploadImage(file: File, options?: UploadImageOptions): Promise<UploadImageResponse> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file.');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (options?.folder?.trim()) {
      formData.append('folder', options.folder.trim());
    }

    if (options?.publicId?.trim()) {
      formData.append('publicId', options.publicId.trim());
    }

    let response: Response;
    try {
      response = await authFetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      const isNetworkErr =
        err?.message?.toLowerCase().includes('failed to fetch') ||
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('internet');

      if (isNetworkErr) {
        throw new Error(
          `Unable to reach upload server at ${API_BASE_URL}/upload/image. Please verify backend is running.`
        );
      }
      throw err;
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        json?.message ||
        (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
        json?.error ||
        `Image upload failed (${response.status}: ${response.statusText})`;
      throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    }

    return normalizeUploadResult(json);
  },

  /**
   * 6.2 Upload Multiple Images (up to 10 files)
   * POST /api/v1/upload/images
   * Content-Type: multipart/form-data
   * Form-Data: files (array), folder?
   */
  async uploadMultipleImages(
    files: File[],
    options?: { folder?: string }
  ): Promise<{ data: UploadImageResponse[]; message: string }> {
    if (!files || files.length === 0) {
      throw new Error('Please select at least one file to upload.');
    }
    if (files.length > 10) {
      throw new Error('You can upload at most 10 images at a time.');
    }

    for (const file of files) {
      const val = this.validateFile(file);
      if (!val.valid) {
        throw new Error(`File "${file.name}": ${val.error}`);
      }
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (options?.folder?.trim()) {
      formData.append('folder', options.folder.trim());
    }

    const response = await authFetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      body: formData,
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        json?.message ||
        (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
        'Failed to upload multiple images.';
      throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    }

    const list = extractApiDataList(json);
    const results = (list.length > 0 ? list : [json?.data || json]).map(normalizeUploadResult);

    return {
      data: results,
      message: json?.message || 'Images uploaded successfully',
    };
  },

  /**
   * 6.3 Upload from Remote URL
   * POST /api/v1/upload/image-url
   * Request Body (JSON): { url: string, folder?: string }
   */
  async uploadFromUrl(url: string, folder?: string): Promise<UploadImageResponse> {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      throw new Error('Image URL is required.');
    }

    const payload: { url: string; folder?: string } = { url: cleanUrl };
    if (folder?.trim()) {
      payload.folder = folder.trim();
    }

    const response = await authFetch(`${API_BASE_URL}/upload/image-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        json?.message ||
        (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
        'Failed to upload image from URL.';
      throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    }

    return normalizeUploadResult(json);
  },

  /**
   * 6.4 Delete Image
   * DELETE /api/v1/upload/image
   * Request Body (JSON): { publicId: string }
   */
  async deleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
    const cleanPublicId = publicId.trim();
    if (!cleanPublicId) {
      throw new Error('Public ID is required to delete image.');
    }

    const response = await authFetch(`${API_BASE_URL}/upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ publicId: cleanPublicId }),
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg =
        json?.message ||
        (Array.isArray(json?.message) ? json.message.join(', ') : null) ||
        'Failed to delete image from Cloudinary.';
      throw new Error(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
    }

    return {
      success: true,
      message: json?.message || 'Image deleted successfully',
    };
  },
};
