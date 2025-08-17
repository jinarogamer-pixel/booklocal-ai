import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'application/pdf',
  'image/heic',
  'image/heif'
];

const DOCUMENT_TYPES = [
  'drivers_license',
  'passport', 
  'business_license',
  'insurance_cert',
  'w9',
  'other'
] as const;

export type DocumentType = typeof DOCUMENT_TYPES[number];

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  documentId?: string;
}

export interface DocumentMetadata {
  userId: string;
  documentType: DocumentType;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Please use JPG, PNG, WebP, PDF, or HEIC files.`
    };
  }

  // Check for suspicious file names
  if (file.name.includes('../') || file.name.includes('..\\')) {
    return {
      valid: false,
      error: 'Invalid file name'
    };
  }

  return { valid: true };
}

/**
 * Upload verification document using Supabase Storage
 * Falls back to base64 storage if Supabase storage not configured
 */
export async function uploadVerificationDocument(
  file: File,
  userId: string,
  documentType: DocumentType
): Promise<UploadResult> {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${documentType}_${uuidv4()}.${fileExtension}`;
    const filePath = `verification/${userId}/${fileName}`;

    // Try Supabase storage first
    try {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(filePath);

      // Store document record in database
      const { data: docRecord, error: dbError } = await supabase
        .from('verification_documents')
        .insert({
          user_id: userId,
          document_type: documentType,
          file_url: urlData.publicUrl,
          file_name: fileName,
          file_size: file.size,
          mime_type: file.type,
          verification_status: 'pending',
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            storage: 'supabase'
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        success: true,
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        fileSize: file.size,
        documentId: docRecord.id
      };

    } catch (supabaseError) {
      console.warn('Supabase storage unavailable, using fallback method:', supabaseError);
      
      // Fallback: Store as base64 in database (for development/testing)
      return await uploadToDatabase(file, userId, documentType);
    }

  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Fallback method: Store file as base64 in database
 * Only for development - not recommended for production
 */
async function uploadToDatabase(
  file: File,
  userId: string,
  documentType: DocumentType
): Promise<UploadResult> {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    const fileName = `${documentType}_${uuidv4()}_${file.name}`;

    // Store in database
    const { data: docRecord, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        file_url: base64, // Store base64 directly
        file_name: fileName,
        file_size: file.size,
        mime_type: file.type,
        verification_status: 'pending',
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          storage: 'database',
          warning: 'File stored as base64 - migrate to proper storage for production'
        }
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      fileUrl: `data:${file.type};base64,${base64}`,
      fileName: fileName,
      fileSize: file.size,
      documentId: docRecord.id
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:mime/type;base64, prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get document by ID
 */
export async function getVerificationDocument(documentId: string) {
  const { data, error } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('verification_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Update document verification status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: 'pending' | 'approved' | 'rejected' | 'expired',
  rejectionReason?: string
) {
  const updateData: any = {
    verification_status: status,
    verified_at: new Date().toISOString()
  };

  if (rejectionReason) {
    updateData.rejection_reason = rejectionReason;
  }

  const { data, error } = await supabase
    .from('verification_documents')
    .update(updateData)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete document (for GDPR compliance)
 */
export async function deleteVerificationDocument(documentId: string) {
  // First get the document to check storage type
  const document = await getVerificationDocument(documentId);
  
  // If stored in Supabase storage, delete the file
  if (document.metadata?.storage === 'supabase') {
    const filePath = document.file_url.split('/').slice(-3).join('/');
    await supabase.storage
      .from('verification-documents')
      .remove([filePath]);
  }

  // Delete database record
  const { error } = await supabase
    .from('verification_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
  return { success: true };
}

/**
 * Batch upload multiple documents
 */
export async function uploadMultipleDocuments(
  files: { file: File; documentType: DocumentType }[],
  userId: string
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const { file, documentType } of files) {
    const result = await uploadVerificationDocument(file, userId, documentType);
    results.push(result);
  }
  
  return results;
}

/**
 * Get upload progress (for future implementation with chunked uploads)
 */
export function createUploadProgress() {
  let progress = 0;
  
  return {
    onProgress: (callback: (progress: number) => void) => {
      // Simulate progress for now
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        callback(progress);
      }, 200);
    }
  };
}

// Export types and constants
export { DOCUMENT_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE };
export type { DocumentMetadata };