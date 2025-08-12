import { captureError, getErrorEventId } from '../errorMonitoring';

let oldEnv: string;
beforeEach(() => {
  oldEnv = process.env.NODE_ENV;
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
});
afterEach(() => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: oldEnv, configurable: true });
});

describe('captureError', () => {
  it('logs error in development', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await captureError('test error', { foo: 'bar', password: 'secret' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Captured error'), 'test error', expect.anything());
    spy.mockRestore();
  });

  it('redacts sensitive fields', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await captureError('test error', { token: 'should-hide', nested: { password: 'hide' } });
    const call = spy.mock.calls.find(([msg]) => msg.includes('Captured error'));
    expect(call?.[2]).toMatchObject({ token: '[REDACTED]', nested: { password: '[REDACTED]' } });
    spy.mockRestore();
  });
});

describe('getErrorEventId', () => {
  it('extracts eventId from error object', () => {
    expect(getErrorEventId({ eventId: 'abc123' })).toBe('abc123');
    expect(getErrorEventId({})).toBeUndefined();
    expect(getErrorEventId(null)).toBeUndefined();
  });
});
