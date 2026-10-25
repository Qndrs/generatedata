import type { AccountStatus } from '@generatedata/server';
import { enqueueSnackbar } from 'notistack';
import { getStrings } from '@generatedata/utils/lang';
import { format } from 'date-fns';
import type { Dispatch } from 'redux';
import {
  CREATE_USER_ACCOUNT,
  RENAME_DATA_SET,
  SAVE_ACCOUNT,
  SAVE_CURRENT_ACCOUNT,
  SAVE_CURRENT_DATA_SET,
  SAVE_NEW_DATA_SET,
  UPDATE_PASSWORD
} from '~core/mutations';
import type { AccountEditingData, SaveDataDialogType } from '~store/account/account.reducer';
import { getEditingData, getSelectedAccountsPageTab } from '~store/account/account.selectors';
import { getCurrentDataSetId, getDataSetSavePackage } from '~store/generator/generator.selectors';
import { SET_ONE_TIME_PASSWORD } from '~store/main/main.actions';
import { SelectedAccountsTab, SelectedAccountTab } from '~types/account';
import type { GDAction } from '~types/general';
import { apolloClient } from '../../core/apolloClient';

const pendingMutations = new Set<string>();
const accountMutation = async (options: any): Promise<any> => {
  const key = options.mutation.loc?.source.body || String(options.mutation);
  if (pendingMutations.has(key)) return { data: null };
  pendingMutations.add(key);
  try {
    const response = await apolloClient.mutate(options);
    if (!response.data || Object.values(response.data).some((result: any) => result?.success === false)) {
      enqueueSnackbar(getStrings().core.operationRejected, { variant: 'error' });
      return { data: null };
    }
    return response;
  } catch {
    enqueueSnackbar(getStrings().core.operationUnconfirmed, { variant: 'error', preventDuplicate: true });
    return { data: null };
  } finally {
    pendingMutations.delete(key);
  }
};

export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const updateAccount = (data: AccountEditingData): GDAction => ({
  type: UPDATE_ACCOUNT,
  payload: {
    ...data
  }
});

export const CHANGE_ACCOUNT_TAB = 'CHANGE_ACCOUNT_TAB';
export const onChangeTab = (tab: SelectedAccountTab): GDAction => ({
  type: CHANGE_ACCOUNT_TAB,
  payload: {
    tab
  }
});

export const CHANGE_ACCOUNTS_TAB = 'CHANGE_ACCOUNTS_TAB';
export const onChangeAccountsTab = (tab: SelectedAccountsTab): GDAction => ({
  type: CHANGE_ACCOUNTS_TAB,
  payload: {
    tab
  }
});

export const ON_EDIT_ACCOUNT = 'ON_EDIT_ACCOUNT';
export const editAccount = (accountInfo: any): GDAction => ({
  type: ON_EDIT_ACCOUNT,
  payload: {
    accountInfo
  }
});

export const ON_EDIT_YOUR_ACCOUNT = 'ON_EDIT_YOUR_ACCOUNT';
export const onEditYourAccount = (): GDAction => ({
  type: ON_EDIT_YOUR_ACCOUNT
});

export const CANCEL_ACCOUNT_CHANGES = 'CANCEL_ACCOUNT_CHANGES';
export const cancelChanges = (): GDAction => ({ type: CANCEL_ACCOUNT_CHANGES });

export const YOUR_ACCOUNT_UPDATED = 'YOUR_ACCOUNT_UPDATED';
export const yourAccountUpdated = (): GDAction => ({
  type: YOUR_ACCOUNT_UPDATED
});

// simple garbage collection. If the user happened to be on Edit Account page when navigating away, reset it back
// to the main Accounts page. Otherwise the data may not still be available when navigating back
export const onCleanupAccountsPage =
  (): any =>
    async (dispatch: Dispatch, getState: any): Promise<any> => {
      const tab = getSelectedAccountsPageTab(getState());

      if (tab === 'editAccount') {
        dispatch(onChangeAccountsTab('accounts'));
      }
    };

export const saveYourAccount =
  (): any =>
    async (dispatch: Dispatch, getState: any): Promise<any> => {
      const i18n = getStrings();

      const { firstName, lastName, email, country, region } = getEditingData(getState());

      const response = await accountMutation({
        mutation: SAVE_CURRENT_ACCOUNT,
        variables: { firstName, lastName, email, country, region }
      });

      if (!response.data?.updateCurrentAccount?.success) return;
      enqueueSnackbar(i18n.core.yourAccountUpdated, { variant: 'success' });
      dispatch(yourAccountUpdated());
    };

// for an admin updating an account
export const saveAccount =
  (data: any): any =>
    async (dispatch: Dispatch): Promise<any> => {
      const i18n = getStrings();
      const { accountId, firstName, lastName, email, country, region, disabled, expiryDate } = data;

      const accountStatus = getAccountStatus(disabled, expiryDate);

      let cleanExpiryDate = null;
      if (expiryDate) {
        cleanExpiryDate = expiryDate;
      }

      const response = await accountMutation({
        mutation: SAVE_ACCOUNT,
        variables: {
          accountId,
          accountStatus,
          firstName,
          lastName,
          email,
          country,
          region,
          expiryDate: cleanExpiryDate
        }
      });

      if (!response.data?.updateAccount?.success) return;
      enqueueSnackbar(i18n.core.userAccountUpdated, { variant: 'success' });

      dispatch(onChangeAccountsTab('accounts'));
    };

export const clearOneTimePassword = (): GDAction => ({
  type: SET_ONE_TIME_PASSWORD,
  payload: {
    password: ''
  }
});

export const savePassword =
  (currentPassword: string, newPassword: string, onSuccess: () => void, onError: () => void): any =>
    async (dispatch: Dispatch): Promise<any> => {
      const i18n = getStrings();

      const { data } = await accountMutation({
        mutation: UPDATE_PASSWORD,
        variables: { currentPassword, newPassword }
      });

      if (!data?.updatePassword?.success) {
        onError();
        return;
      }

      dispatch(clearOneTimePassword());
      enqueueSnackbar(i18n.core.passwordUpdated, { variant: 'success' });
      onSuccess();
    };

export const SHOW_SAVE_DATA_SET_DIALOG = 'SHOW_SAVE_DATA_SET_DIALOG';
export const showSaveDataSetDialog = (dialogType: SaveDataDialogType): GDAction => ({
  type: SHOW_SAVE_DATA_SET_DIALOG,
  payload: {
    dialogType
  }
});

export const HIDE_SAVE_DATA_SET_DIALOG = 'HIDE_SAVE_DATA_SET_DIALOG';
export const hideSaveDataSetDialog = (): GDAction => ({
  type: HIDE_SAVE_DATA_SET_DIALOG
});

export const LOAD_DATA_SETS = 'LOAD_DATA_SETS';
export const SET_CURRENT_DATA_SET = 'SET_CURRENT_DATA_SET';

export const saveNewDataSet =
  (dataSetName: string): any =>
    async (dispatch: Dispatch, getState: any): Promise<any> => {
      const i18n = getStrings();
      const state = getState();
      const context = state.generator?.currentDataSet;
      const data: any = getDataSetSavePackage(state);

      const response = await accountMutation({
        mutation: SAVE_NEW_DATA_SET,
        variables: {
          dataSetName,
          content: JSON.stringify(data)
        }
      });

      if (response.data?.saveNewDataSet?.success && getState().generator?.currentDataSet === context) {
        dispatch({
          type: SET_CURRENT_DATA_SET,
          payload: {
            dataSetName,
            savedSnapshot: JSON.stringify(data),
            dataSetId: parseInt(response.data.saveNewDataSet.dataSetId as string, 10)
          }
        });

        dispatch(hideSaveDataSetDialog());
        enqueueSnackbar(i18n.core.dataSetSaved, { variant: 'success' });
      }

    // Failed requests deliberately leave the dialog and generator intact.
    };

export const UPDATE_CURRENT_DATA_SET_LAST_SAVED = 'UPDATE_CURRENT_DATA_SET_LAST_SAVED';
export const updateCurrentDataSetLastSaved = (lastSaved: any, savedSnapshot?: string): GDAction => ({
  type: UPDATE_CURRENT_DATA_SET_LAST_SAVED,
  payload: {
    lastSaved,
    savedSnapshot
  }
});

export const saveCurrentDataSet =
  (successMsg?: string): any =>
    async (dispatch: Dispatch, getState: any): Promise<any> => {
      const i18n = getStrings();

      const successMessage = successMsg || i18n.core.dataSetSaved;
      const state = getState();
      const context = state.generator?.currentDataSet;
      const data: any = getDataSetSavePackage(state);
      const dataSetId = getCurrentDataSetId(state);

      const response = await accountMutation({
        mutation: SAVE_CURRENT_DATA_SET,
        variables: {
          dataSetId,
          content: JSON.stringify(data)
        }
      });

      if (response?.data?.saveDataSet?.success && getState().generator?.currentDataSet === context) {
        dispatch(updateCurrentDataSetLastSaved(response.data.saveDataSet.savedDate, JSON.stringify(data)));
        enqueueSnackbar(successMessage, { variant: 'success' });
      }
    };

export const UPDATE_CURRENT_DATA_SET_NAME = 'UPDATE_CURRENT_DATA_SET_NAME';
export const renameDataSet =
  (dataSetName: string): any =>
    async (dispatch: Dispatch, getState: any): Promise<any> => {
      const state = getState();
      const context = state.generator?.currentDataSet;
      const dataSetId = getCurrentDataSetId(state);

      const { data } = await accountMutation({
        mutation: RENAME_DATA_SET,
        variables: {
          dataSetId,
          dataSetName
        }
      });

      if (data?.renameDataSet?.success && getState().generator?.currentDataSet === context) {
        dispatch({
          type: UPDATE_CURRENT_DATA_SET_NAME,
          payload: {
            dataSetName
          }
        });
        enqueueSnackbar(getStrings().core.dataSetNameUpdated, { variant: 'success' });
      }
    };

export const createAccount =
  (data: any) =>
    async (dispatch: Dispatch): Promise<any> => {
      const i18n = getStrings();
      const { firstName, lastName, email, country, region, disabled, expiry, expiryDate, oneTimePassword } = data;
      const accountStatus = getAccountStatus(disabled, expiryDate);

      const expiryDateValue = expiry && expiry !== 'none' ? expiryDate.toString() : null;
      const response = await accountMutation({
        mutation: CREATE_USER_ACCOUNT,
        variables: {
          firstName,
          lastName,
          email,
          country,
          region,
          accountStatus,
          oneTimePassword,
          expiryDate: expiryDateValue
        }
      });

      if (response?.data?.createUserAccount?.success) {
        dispatch(onChangeAccountsTab('accounts'));
        enqueueSnackbar(i18n.core.accountCreatedDesc, { variant: 'success' });
      }
    };

export const getAccountStatus = (disabled: boolean, expiryDate: number): AccountStatus => {
  let accountStatus: AccountStatus = 'live';
  if (disabled) {
    accountStatus = 'disabled';
  } else {
    // check the expiry date hasn't already passed
    if (expiryDate) {
      const now = Number(format(new Date(), 'T'));
      const expiryDateNum = parseInt(expiryDate.toString()); // ensure it's a number

      if (expiryDateNum < now) {
        accountStatus = 'expired';
      }
    }
  }

  return accountStatus;
};
