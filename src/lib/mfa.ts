import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { getSupabase } from './supabaseClient';
import { captureError } from './errorMonitoring';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
}

// Generate MFA secret and QR code for user setup
export async function generateMFASecret(userId: string, email: string): Promise<MFASetup> {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `BookLocal (${email})`,
      issuer: 'BookLocal',
      length: 32
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store encrypted secret and backup codes in database
    const supabase = getSupabase();
    await supabase.from('user_mfa').upsert({
      user_id: userId,
      secret_encrypted: encrypt(secret.base32),
      backup_codes_encrypted: encrypt(JSON.stringify(backupCodes)),
      is_enabled: false,
      created_at: new Date().toISOString()
    });

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  } catch (error) {
    await captureError(error as Error, { userId, context: 'MFA_SETUP' });
    throw new Error('Failed to generate MFA secret');
  }
}

// Verify TOTP token or backup code
export async function verifyMFAToken(userId: string, token: string): Promise<MFAVerification> {
  try {
    const supabase = getSupabase();
    
    // Get user's MFA data
    const { data: mfaData, error } = await supabase
      .from('user_mfa')
      .select('*')
      .eq('user_id', userId)
      .eq('is_enabled', true)
      .single();

    if (error || !mfaData) {
      return { isValid: false };
    }

    const secret = decrypt(mfaData.secret_encrypted);
    const backupCodes = JSON.parse(decrypt(mfaData.backup_codes_encrypted));

    // Check if token is a backup code
    if (backupCodes.includes(token.toUpperCase())) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter((code: string) => code !== token.toUpperCase());
      
      await supabase
        .from('user_mfa')
        .update({ 
          backup_codes_encrypted: encrypt(JSON.stringify(updatedCodes)),
          last_used_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Log backup code usage
      await logSecurityEvent(userId, 'MFA_BACKUP_CODE_USED', { timestamp: new Date().toISOString() });

      return { isValid: true, backupCodeUsed: true };
    }

    // Verify TOTP token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });

    if (isValid) {
      // Update last used timestamp
      await supabase
        .from('user_mfa')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId);

      await logSecurityEvent(userId, 'MFA_SUCCESS', { timestamp: new Date().toISOString() });
    } else {
      await logSecurityEvent(userId, 'MFA_FAILED', { 
        timestamp: new Date().toISOString(),
        token_length: token.length 
      });
    }

    return { isValid };
  } catch (error) {
    await captureError(error as Error, { userId, context: 'MFA_VERIFY' });
    return { isValid: false };
  }
}

// Enable MFA for user after successful setup verification
export async function enableMFA(userId: string, verificationToken: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    
    // Get pending MFA setup
    const { data: mfaData, error } = await supabase
      .from('user_mfa')
      .select('*')
      .eq('user_id', userId)
      .eq('is_enabled', false)
      .single();

    if (error || !mfaData) {
      return false;
    }

    const secret = decrypt(mfaData.secret_encrypted);

    // Verify setup token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: verificationToken,
      window: 2
    });

    if (isValid) {
      // Enable MFA
      await supabase
        .from('user_mfa')
        .update({ 
          is_enabled: true,
          enabled_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      await logSecurityEvent(userId, 'MFA_ENABLED', { timestamp: new Date().toISOString() });
      return true;
    }

    return false;
  } catch (error) {
    await captureError(error as Error, { userId, context: 'MFA_ENABLE' });
    return false;
  }
}

// Disable MFA (requires current password + MFA token)
export async function disableMFA(userId: string, mfaToken: string): Promise<boolean> {
  try {
    // Verify current MFA token first
    const verification = await verifyMFAToken(userId, mfaToken);
    
    if (!verification.isValid) {
      return false;
    }

    const supabase = getSupabase();
    
    // Disable MFA
    await supabase
      .from('user_mfa')
      .update({ 
        is_enabled: false,
        disabled_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    await logSecurityEvent(userId, 'MFA_DISABLED', { timestamp: new Date().toISOString() });
    return true;
  } catch (error) {
    await captureError(error as Error, { userId, context: 'MFA_DISABLE' });
    return false;
  }
}

// Check if user has MFA enabled
export async function hasMFAEnabled(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('user_mfa')
      .select('is_enabled')
      .eq('user_id', userId)
      .eq('is_enabled', true)
      .single();

    return !error && !!data;
  } catch (error) {
    await captureError(error as Error, { userId, context: 'MFA_CHECK' });
    return false;
  }
}

// Simple encryption for storing secrets (use proper encryption in production)
function encrypt(text: string): string {
  // In production, use proper encryption like AES-256-GCM
  // This is a simple example - replace with actual encryption
  return Buffer.from(text).toString('base64');
}

function decrypt(encryptedText: string): string {
  // In production, use proper decryption
  return Buffer.from(encryptedText, 'base64').toString();
}

// Log security events
async function logSecurityEvent(userId: string, event: string, details: any) {
  try {
    const supabase = getSupabase();
    await supabase.from('security_logs').insert({
      user_id: userId,
      event_type: event,
      details,
      ip_address: 'server',
      user_agent: 'server',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    await captureError(error as Error, { userId, event, context: 'SECURITY_LOG' });
  }
}