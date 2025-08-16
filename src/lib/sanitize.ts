import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  // Use DOMPurify to remove all HTML tags and attributes
  const sanitized = DOMPurify.sanitize(str, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Keep text content, remove only tags
  });
  
  // Additional sanitization for common injection patterns
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/vbscript:/gi, '')   // Remove vbscript: URLs
    .replace(/data:/gi, '')       // Remove data: URLs
    .replace(/on\w+\s*=/gi, '')   // Remove event handlers
    .trim();
}

export function sanitizeHtml(html: string, allowedTags: string[] = []): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Allow specific safe HTML tags if needed
  const safeTags = allowedTags.length > 0 ? allowedTags : ['p', 'br', 'strong', 'em'];
  const safeAttrs = ['href', 'title'];
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: safeTags,
    ALLOWED_ATTR: safeAttrs,
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload']
  });
}

export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'file';
  }
  
  // Remove dangerous characters and keep only safe ones
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.')         // Prevent directory traversal
    .replace(/^\.+/, '')             // Remove leading dots
    .substring(0, 255);              // Limit length
}
