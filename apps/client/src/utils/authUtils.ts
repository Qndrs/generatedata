import clientConfig from '@generatedata/config/clientConfig';
import { SignInWithGoogleButton, initGoogleAuth } from '~core/auth/google/google';

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
export const clearAuthTokenRefresh = (): void => {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = undefined;
};
export const setAuthTokenRefresh = (_tokenExpiry: number, onRefresh: any): void => {
  clearAuthTokenRefresh();
  const delay = Math.max(1000, clientConfig.auth.GD_JWT_LIFESPAN_MINS * 60000 - 60000);
  refreshTimer = setTimeout(() => {
    refreshTimer = undefined;
    onRefresh();
  }, delay);
};

export const initAuthVendors = (): void => {
  if (clientConfig.auth.GD_GOOGLE_AUTH_CLIENT_ID) {
    initGoogleAuth();
  }
};

export const hasVendorLogin = (): boolean => {
  return !!clientConfig.auth.GD_GOOGLE_AUTH_CLIENT_ID;
};

export const getVendorLoginButtons = (): React.ReactNode[] => {
  const buttons: any[] = [];

  if (clientConfig.auth.GD_GOOGLE_AUTH_CLIENT_ID) {
    buttons.push(SignInWithGoogleButton);
  }

  return buttons;
};
