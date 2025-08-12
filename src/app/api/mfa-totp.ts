import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

// In production, generate a real TOTP secret and store it for the user
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;
  // Example secret, replace with real TOTP secret per user
  const secret = 'JBSWY3DPEHPK3PXP';
  const otpauth = `otpauth://totp/BookLocal:${email}?secret=${secret}&issuer=BookLocal`;
  const qr = await QRCode.toDataURL(otpauth);
  res.status(200).json({ otpauth, qr });
}
