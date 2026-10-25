import { clearAuthTokenRefresh } from '~utils/authUtils';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable, concat } from '@apollo/client';
import { enqueueSnackbar } from 'notistack';
import { getStrings } from '@generatedata/utils/lang';
import { boundedFetch } from './requestUtils';
import store from '~store/index';
import * as mainSelectors from '~store/main/main.selectors';

// nginx forwards this same-origin route to the internal API container.
const uri = '/graphql';

const httpLink = new HttpLink({
  uri,
  fetch: boundedFetch,
  credentials: 'include'
});

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = mainSelectors.getAuthToken(store.getState());

  // This is a UI expiry check. The server still verifies JWT signatures.
  let expired = false;
  if (token) {
    try { expired = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000 <= Date.now(); }
    catch { expired = true; }
  }
  if (expired && !['LoginMutation', 'RefreshToken', 'Logout'].includes(operation.operationName || '')) {
    clearAuthTokenRefresh();
    store.dispatch({ type: 'LOGOUT' });
    void apolloClient.clearStore().catch(() => {});
    store.dispatch({ type: 'SET_CURRENT_DATA_SET', payload: { dataSetId: null, dataSetName: '' } });
    store.dispatch({ type: 'SET_LOGIN_DIALOG_VISIBILITY', payload: { visible: true } });
    enqueueSnackbar(getStrings().core.sessionEnded, { variant: 'warning', preventDuplicate: true });
    return new Observable(observer => observer.error(new Error('Session expired')));
  }

  // this adds the current active jwt token to all requests so the server can authenticate the user
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache()
});
