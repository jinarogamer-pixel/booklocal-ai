import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit } from '../../lib/rate-limit';

// Security constants
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: {
    bodyParser: false,
  },
};

// File type detection from magic bytes
function detectFileType(buffer: Buffer): string | null {
  const magicBytes = buffer.subarray(0, 10);
  
  // JPEG
  if (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // PNG
  if (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) {
    return 'image/png';
  }
  
  // WebP
  if (magicBytes.subarray(0, 4).toString() === 'RIFF' && magicBytes.subarray(8, 12).toString() === 'WEBP') {
    return 'image/webp';
  }
  
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting - 5 uploads per minute
  const allowed = await withRateLimit(req, res, {
    limit: 5,
    windowSeconds: 60,
    identifier: 'avatar-upload',
  });

  if (!allowed) {
    return; // withRateLimit already sent the response
  }

  try {
    // Read file data
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Security validations
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'No file data received' });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }

    // Detect actual file type from magic bytes
    const detectedType = detectFileType(buffer);
    if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      });
    }

    // Generate secure filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = detectedType === 'image/jpeg' ? '.jpg' : 
                     detectedType === 'image/png' ? '.png' : '.webp';
    const filename = `avatar-${timestamp}-${randomString}${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filename, buffer, {
        contentType: detectedType,
        upsert: false, // Don't overwrite existing files
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file' });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename);

    return res.status(200).json({ 
      url: urlData.publicUrl,
      filename: filename,
      size: buffer.length,
      type: detectedType
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
