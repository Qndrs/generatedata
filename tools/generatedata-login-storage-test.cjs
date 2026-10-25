const assert=require('node:assert/strict');
const fs=require('node:fs');
const rawCredentials=JSON.parse(fs.readFileSync(0,'utf8'));
const credentials={email:rawCredentials.otherEmail,password:rawCredentials.otherPassword,otherEmail:rawCredentials.email,otherPassword:rawCredentials.password};
const endpoint='http://web:9000/graphql';
async function gql(query,variables={},token='',cookie='') {
 const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`} : {}),...(cookie?{cookie:`refreshToken=${cookie}`} : {})},body:JSON.stringify({query,variables})});
 const result=await response.json();
 assert.equal(response.status,200); assert.equal(result.errors,undefined,JSON.stringify(result.errors)); return result.data;
}
const loginQuery='mutation($email:String!,$password:String!){login(email:$email,password:$password){success token refreshToken accountId}}';
async function login(email,password){return (await gql(loginQuery,{email,password})).login;}
(async()=>{
 assert.equal((await login(credentials.email,'intentionally-wrong-local-password')).success,false);
 const session=await login(credentials.email,credentials.password); assert.equal(session.success,true); assert.ok(session.token); assert.ok(session.refreshToken);
 console.log('PASS: wrong password rejected; actual password login through nginx succeeds');
 const other=await login(credentials.otherEmail,credentials.otherPassword); assert.equal(other.success,true);
 const name='Aanmeld- en opslagtest '+Date.now();
 const content=JSON.stringify({test:'local-login-save',revision:1});
 const created=(await gql('mutation($name:String!,$content:String!){saveNewDataSet(dataSetName:$name,content:$content){success dataSetId}}',{name,content},session.token)).saveNewDataSet;
 assert.equal(created.success,true); assert.ok(created.dataSetId);
 const update='mutation($id:ID!,$content:String!){saveDataSet(dataSetId:$id,content:$content){success}}';
 assert.equal((await gql(update,{id:created.dataSetId,content:'{}'},other.token)).saveDataSet.success,false);
 assert.equal((await gql(update,{id:created.dataSetId,content:'{}'})).saveDataSet.success,false);
 const listing='query {dataSets(limit:100,offset:0){totalCount results{dataSetId dataSetName content}}}';
 const hidden=(await gql(listing,{},other.token)).dataSets.results;
 assert.equal(hidden.some(x=>x.dataSetId===created.dataSetId),false);
 console.log('PASS: anonymous/other-user updates denied and dataset isolated per account');
 const nextContent=JSON.stringify({test:'local-login-save',revision:2});
 assert.equal((await gql(update,{id:created.dataSetId,content:nextContent},session.token)).saveDataSet.success,true);
 const saved=(await gql(listing,{},session.token)).dataSets.results.find(x=>x.dataSetId===created.dataSetId);
 assert.equal(saved.content,nextContent); assert.equal(saved.dataSetName,name);
 console.log('PASS: dataset creation, update and exact readback');
 const history=(await gql('query($id:ID!){dataSetHistory(dataSetId:$id,limit:10,offset:0){totalCount results{content}}}',{id:created.dataSetId},session.token)).dataSetHistory;
 assert.equal(history.totalCount,2); assert.equal(history.results.length,2);
 console.log('PASS: saved dataset version history');
 const refreshed=(await gql('mutation{refreshToken{success token refreshToken}}',{},'',session.refreshToken)).refreshToken;
 assert.equal(refreshed.success,true); assert.ok(refreshed.token);
 const loaded=(await gql(listing,{},refreshed.token)).dataSets.results.find(x=>x.dataSetId===created.dataSetId);
 assert.equal(loaded.content,nextContent);
 assert.equal((await gql('mutation{refreshToken{success}}',{},'',session.refreshToken)).refreshToken.success,false);
 console.log('PASS: session refresh/rotation and dataset readback after refresh');
 assert.equal((await gql('mutation{logout{success}}',{},'',refreshed.refreshToken)).logout.success,true);
 assert.equal((await gql('mutation{refreshToken{success}}',{},'',refreshed.refreshToken)).refreshToken.success,false);
 console.log('PASS: logout revokes refresh session');
 const {db,sequelize}=require('/app/apps/server/dist/database'); sequelize.options.logging=false;
 const account=await db.accounts.findOne({where:{email:credentials.email}});
 try {
  await account.update({accountStatus:'disabled'});
  assert.equal((await login(credentials.email,credentials.password)).success,false);
  console.log('PASS: disabled account cannot log in');
 } finally {await account.update({accountStatus:'live'}); await sequelize.close();}
 console.log('ALL LOCAL LOGIN/STORAGE INTEGRATION CHECKS PASSED');
})().catch(e=>{console.error(e.message);process.exit(1)});


