jest.mock('~utils/authUtils',()=>({clearAuthTokenRefresh:jest.fn()}));
import {gql} from '@apollo/client';
import {apolloClient} from '../apolloClient';
import store from '~store/index';
import fetch from 'cross-fetch';
jest.mock('cross-fetch',()=>({__esModule:true,default:jest.fn()}));
jest.mock('~store/index',()=>({__esModule:true,default:{getState:()=>({}),dispatch:jest.fn()}}));
jest.mock('~store/main/main.selectors',()=>({getAuthToken:()=> 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjF9.signature'}));
jest.mock('notistack',()=>({enqueueSnackbar:jest.fn()}));
jest.mock('@generatedata/utils/lang',()=>({getStrings:()=>({core:{sessionEnded:'expired'}})}));
test('expired token prompts login without sending a protected mutation or clearing generator work',async()=>{
 await expect(apolloClient.mutate({mutation:gql`mutation Protected {saveDataSet(dataSetId:42,content:"{}") {success}}` } )).rejects.toThrow('Session expired');
 expect(fetch).not.toHaveBeenCalled();
 expect(store.dispatch).toHaveBeenCalledWith({type:'SET_LOGIN_DIALOG_VISIBILITY',payload:{visible:true}});
 expect(store.dispatch).not.toHaveBeenCalledWith(expect.objectContaining({type:'CLEAR_GRID'}));
});
