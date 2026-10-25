import { enqueueSnackbar } from 'notistack';
import { apolloClient } from '../apolloClient';
import { saveNewDataSet, saveCurrentDataSet, renameDataSet, saveYourAccount, saveAccount } from '../../store/account/account.actions';
import { login, updateRefreshToken, sendPasswordResetEmail } from '../../store/main/main.actions';

jest.mock('../apolloClient', () => ({ apolloClient: { mutate: jest.fn(), clearStore: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('notistack', () => ({ enqueueSnackbar: jest.fn() }));
jest.mock('@generatedata/utils/lang', () => ({ getStrings: () => ({core: { operationRejected: 'rejected', operationUnconfirmed: 'unconfirmed', connectionUnavailable: 'offline', sessionEnded: 'expired', contactAdministrator: 'administrator', dataSetSaved: 'saved' }}) }));
jest.mock('@generatedata/utils/general', () => ({ setTourComponents: jest.fn() }));
jest.mock('~utils/authUtils', () => ({ setAuthTokenRefresh: jest.fn(), clearAuthTokenRefresh: jest.fn() }));
jest.mock('~store/generator/generator.actions', () => ({ CLEAR_GRID: 'CLEAR_GRID' }));
jest.mock('~store/generator/generator.selectors', () => ({ getCurrentDataSetId: () => 42, getDataSetSavePackage: () => ({ rows: {one: {dataType: 'Names', title: 'draft'}} }) }));
jest.mock('~store/account/account.selectors', () => ({ getEditingData: () => ({firstName: 'Demo'}), getSelectedAccountsPageTab: () => 'accounts' }));
jest.mock('~store/account/account.reducer', () => ({ SaveDataDialogType: {save:'save'} }));
jest.mock('~store/main/main.selectors', () => ({ getLocale: () => 'nl' }));
jest.mock('@generatedata/config/clientConfig', () => ({ auth: {GD_PASSWORD_RESET_ENABLED: false} }));

const mutate = apolloClient.mutate as jest.Mock;
const notify = enqueueSnackbar as jest.Mock;
const dispatch = jest.fn();
beforeEach(() => jest.clearAllMocks());

test('rejected new save leaves dialog and draft unchanged without a success message', async () => {
  mutate.mockResolvedValue({data:{saveNewDataSet:{success:false}}});
  await saveNewDataSet('Demo')(dispatch, () => ({}));
  expect(dispatch).not.toHaveBeenCalled();
  expect(notify).toHaveBeenCalledWith('rejected', expect.objectContaining({variant:'error'}));
});

test('network failure while updating never advances last saved or clears the draft', async () => {
  mutate.mockRejectedValue(new Error('offline'));
  await expect(saveCurrentDataSet()(dispatch, () => ({}))).resolves.toBeUndefined();
  expect(dispatch).not.toHaveBeenCalled();
  expect(notify).toHaveBeenCalledWith('unconfirmed', expect.objectContaining({variant:'error'}));
});

test('rapid duplicate saves create only one request and release the lock after failure', async () => {
  let fail: (reason: Error) => void = () => {};
  mutate.mockImplementationOnce(() => new Promise((_resolve,reject) => {fail=reject;}));
  const first=saveNewDataSet('Demo')(dispatch, () => ({}));
  await saveNewDataSet('Demo')(dispatch, () => ({}));
  expect(mutate).toHaveBeenCalledTimes(1);
  fail(new Error('offline')); await first;
  mutate.mockResolvedValue({data:{saveNewDataSet:{success:true,dataSetId:'12'}}});
  await saveNewDataSet('Demo')(dispatch, () => ({}));
  expect(mutate).toHaveBeenCalledTimes(2);
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type:'SET_CURRENT_DATA_SET'}));
  expect(dispatch).toHaveBeenCalledWith({type:'HIDE_SAVE_DATA_SET_DIALOG'});
});

test('failed rename never claims success or changes the dataset name', async () => {
  mutate.mockResolvedValue({data:{renameDataSet:{success:false}}});
  await renameDataSet('Changed')(dispatch, () => ({}));
  expect(dispatch).not.toHaveBeenCalled();
  expect(notify.mock.calls.every(call => call[1].variant !== 'success')).toBe(true);
});

test('account update rejection preserves the form and selected account', async () => {
  mutate.mockResolvedValue({data:{updateCurrentAccount:{success:false}}});
  await saveYourAccount()(dispatch, () => ({}));
  mutate.mockResolvedValue({data:{updateAccount:{success:false}}});
  await saveAccount({})(dispatch);
  expect(dispatch).not.toHaveBeenCalled();
  expect(notify.mock.calls.every(call => call[1].variant !== 'success')).toBe(true);
});

test('login network failure always stops the spinner and gives a connection error', async () => {
  mutate.mockRejectedValue(new Error('offline'));
  const onError=jest.fn();
  await login('demo@example.invalid','fake',jest.fn(),onError)(dispatch);
  expect(onError).toHaveBeenCalledWith('networkError');
  expect(dispatch).toHaveBeenLastCalledWith({type:'STOP_DIALOG_PROCESSING'});
});

test.each([false,true])('failed refresh settles initial loading and preserves generator rows (network=%s)', async network => {
  if(network) mutate.mockRejectedValue(new Error('offline'));
  else mutate.mockResolvedValue({data:{refreshToken:{success:false}}});
  await updateRefreshToken()(dispatch);
  expect(dispatch).toHaveBeenLastCalledWith({type:'ONLOAD_AUTH_DETERMINED'});
  expect(dispatch).toHaveBeenCalledWith({type:'LOGOUT'});
  expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({type:'CLEAR_GRID'}));
  expect(dispatch).toHaveBeenCalledWith({type:'SET_CURRENT_DATA_SET',payload:{dataSetId:null,dataSetName:''}});
});

test('manual recovery never sends an unconfigured reset email', async () => {
  await sendPasswordResetEmail('demo@example.invalid',jest.fn())(dispatch);
  expect(mutate).not.toHaveBeenCalled();
  expect(notify).toHaveBeenCalledWith('administrator', {variant:'info'});
  expect(dispatch).toHaveBeenLastCalledWith({type:'STOP_DIALOG_PROCESSING'});
});

test('logout cancellation keeps the session and draft and sends no server request', async () => {
 const {logout}=await import('../../store/main/main.actions');
 const confirm=jest.spyOn(window,'confirm').mockReturnValue(false);
 await logout()(dispatch,()=>({generator:{},content:{}}));
 // The mocked selector returns a configured draft, so confirmation is required.
 expect(confirm).toHaveBeenCalled(); expect(mutate).not.toHaveBeenCalled();
 expect(dispatch).not.toHaveBeenCalled(); confirm.mockRestore();
});

test.each(['new','current','rename'])('late %s response cannot change a different dataset context',async kind=>{
 let finish:(value:any)=>void=()=>{};
 mutate.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 let state={generator:{currentDataSet:{dataSetId:42}}};
 const action=kind==='new'?saveNewDataSet('Old draft'):kind==='rename'?renameDataSet('Old name'):saveCurrentDataSet();
 const pending=action(dispatch,()=>state);
 state={generator:{currentDataSet:{dataSetId:99}}};
 finish({data:{saveNewDataSet:{success:true,dataSetId:'43'},saveDataSet:{success:true,savedDate:'1'},renameDataSet:{success:true}}});
 await pending;
 expect(dispatch).not.toHaveBeenCalled();
});
