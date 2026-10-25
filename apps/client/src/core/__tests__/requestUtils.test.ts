import fetch from 'cross-fetch';
import { boundedFetch, REQUEST_TIMEOUT_MS } from '../requestUtils';
jest.mock('cross-fetch', () => ({__esModule:true,default:jest.fn()}));
const mockFetch = fetch as jest.Mock;
afterEach(() => {jest.useRealTimers();jest.clearAllMocks();});
test('unresponsive API is aborted after 20 seconds without retrying', async () => {
 jest.useFakeTimers();
 mockFetch.mockImplementation((_input,options) => new Promise((_resolve,reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')))));
 const request=boundedFetch('/graphql');
 const assertion=expect(request).rejects.toThrow('aborted');
 jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);
 await assertion;
 expect(mockFetch).toHaveBeenCalledTimes(1);
 expect(jest.getTimerCount()).toBe(0);
});
test('successful API response clears its timeout', async () => {
 jest.useFakeTimers(); mockFetch.mockResolvedValue({ok:true});
 await expect(boundedFetch('/graphql')).resolves.toEqual({ok:true});
 expect(jest.getTimerCount()).toBe(0);
});
