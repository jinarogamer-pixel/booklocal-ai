// @ts-ignore
import handler from '../provider-signup';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../lib/sendEmail', () => ({
  sendTransactionalEmail: jest.fn().mockResolvedValue(undefined)
}));

global.fetch = jest.fn().mockResolvedValue({
  json: async () => ({ success: true })
});

describe('POST /api/provider-signup', () => {
  const mockReq = (body: any): any => ({
    method: 'POST',
    body,
    headers: {},
    socket: { remoteAddress: '1.2.3.4' } as any
  });
  const mockRes = (): any => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should return 400 if validation fails', async () => {
    const req = mockReq({});
    const res = mockRes();
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if CAPTCHA missing', async () => {
    const req = mockReq({ name: 'Test', email: 'a@b.com', phone: '123', services: [], location: '', captchaToken: undefined });
    const res = mockRes();
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 on valid submission', async () => {
    const req = mockReq({
      name: 'Test', email: 'a@b.com', phone: '123', services: ['A'], location: 'Loc', captchaToken: 'token', business_name: '', experience: '', description: ''
    });
    const res = mockRes();
    // Mock supabase insert
    require('../../lib/supabaseClient').supabase = { from: () => ({ insert: async () => ({ error: null }) }) };
    await handler(req as NextApiRequest, res as NextApiResponse);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
