let draftUnavailable = false;
export const isDraftUnavailable = () => draftUnavailable;
export const readDraft = (): string | null => {
  try { return localStorage.getItem('generatedata'); } catch { draftUnavailable = true; return null; }
};
export const discardDraft = (): void => {
  try { localStorage.removeItem('generatedata'); } catch { draftUnavailable = true; }
};
export const writeDraft = (data: unknown): boolean => {
  try {
    localStorage.setItem('generatedata', JSON.stringify(data));
    draftUnavailable = false;
    return true;
  } catch {
    draftUnavailable = true;
    return false;
  }
};
