import { captureError } from '../errorMonitoring';

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
    await captureError(new Error('test error'), { foo: 'bar', password: 'secret' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Error captured'), expect.any(Error), expect.anything());
    spy.mockRestore();
  });

  it('handles context data', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await captureError(new Error('test error'), { token: 'should-hide', nested: { password: 'hide' } });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
