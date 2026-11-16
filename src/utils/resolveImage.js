const BACKEND_STATIC_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') 
  : 'http://localhost:4000';

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23EFF1EC"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%237A828A" font-family="sans-serif" font-size="14">Image unavailable</text></svg>';

export const resolveImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return FALLBACK_IMAGE;
  }

  // If already a full URL (e.g., Unsplash, Cloudinary, AWS S3, or Base64/SVG)
  if (
    imagePath.startsWith('http://') || 
    imagePath.startsWith('https://') || 
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  // Clean and prepend backend server base URL for local static uploads
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_STATIC_URL}${cleanPath}`;
};