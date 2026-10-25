import { readDraft, writeDraft, isDraftUnavailable } from '../../store/draftStorage';
afterEach(() => {jest.restoreAllMocks();localStorage.clear();});
test('a locally saved draft survives reading after a reload', () => {
 expect(writeDraft({generator:{rows:{one:'retained'}}})).toBe(true);
 expect(JSON.parse(readDraft()!)).toEqual({generator:{rows:{one:'retained'}}});
});
test('storage quota failure does not throw and warns the unload guard until recovery', () => {
 const spy=jest.spyOn(Storage.prototype,'setItem').mockImplementation(() => {throw new Error('quota');});
 expect(writeDraft({})).toBe(false); expect(isDraftUnavailable()).toBe(true);
 spy.mockRestore(); expect(writeDraft({})).toBe(true); expect(isDraftUnavailable()).toBe(false);
});
test('blocked browser storage does not prevent starting the app', () => {
 jest.spyOn(Storage.prototype,'getItem').mockImplementation(() => {throw new Error('blocked');});
 expect(readDraft()).toBeNull(); expect(isDraftUnavailable()).toBe(true);
});
