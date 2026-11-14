import { API_BASE_URL, authFetch } from '@/config/api.config';

export interface UploadImageOptions {
  /** Optional Cloudinary folder, e.g. 'products' or 'categories' (defaults to adwika/general on backend) */
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
   * Upload single image file directly to Cloudinary via backend API
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
      // NOTE: Do not set 'Content-Type': 'multipart/form-data' header.
      // Leaving it unset lets the browser automatically set it with boundary.
      response = await authFetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });
    } catch (err: any) {
      const isNetworkErr = err?.message?.toLowerCase().includes('failed to fetch') ||
        err?.message?.toLowerCase().includes('network') ||
        err?.message?.toLowerCase().includes('internet');

      if (isNetworkErr) {
        throw new Error(
          `Unable to reach upload server at ${API_BASE_URL}/upload/image. Please ensure your backend server is running.`
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

    // Extract Cloudinary secure URL from various standard response structures
    const data = json?.data || json;
    const secureUrl: string =
      data?.secure_url ||
      data?.secureUrl ||
      data?.url ||
      data?.imageUrl ||
      json?.secure_url ||
      json?.secureUrl ||
      json?.imageUrl ||
      json?.url ||
      '';

    if (!secureUrl) {
      throw new Error('Image upload succeeded on server, but no URL was returned.');
    }

    return {
      url: secureUrl,
      secureUrl: secureUrl,
      publicId: data?.public_id || data?.publicId || json?.public_id || json?.publicId,
      format: data?.format || json?.format,
      bytes: data?.bytes || json?.bytes,
      width: data?.width || json?.width,
      height: data?.height || json?.height,
      raw: json,
    };
  },
};

