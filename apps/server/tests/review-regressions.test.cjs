const test=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {db,sequelize}=require('../dist/database');
const auth=require('../dist/utils/authUtils');
const config=require('@generatedata/config/serverConfig').default;
const context={token:jwt.sign({accountId:42},config.auth.GD_JWT_SECRET,{algorithm:'HS256'}),user:{accountId:42}};
const {dataSetHistory}=require('../dist/schema/dataSets/resolvers/Query/dataSetHistory');
const mutations=[
 ['updateCurrentAccount',require('../dist/schema/accounts/resolvers/Mutation/updateCurrentAccount').updateCurrentAccount],
 ['updateAccount',require('../dist/schema/accounts/resolvers/Mutation/updateAccount').updateAccount],
 ['updatePassword',require('../dist/schema/accounts/resolvers/Mutation/updatePassword').updatePassword],
 ['deleteAccount',require('../dist/schema/accounts/resolvers/Mutation/deleteAccount').deleteAccount],
 ['deleteDataSet',require('../dist/schema/dataSets/resolvers/Mutation/deleteDataSet').deleteDataSet]
];
async function mocked(fn){
 const saved=[];
 const stub=(object,key,value)=>{saved.push([object,key,object[key]]);object[key]=value;};
 try{return await fn(stub);}finally{for(const [object,key,value] of saved.reverse())object[key]=value;}
}
for(const [name,resolve] of mutations){
 test(name+' waits for its database write before reporting success',()=>mocked(async stub=>{
  let release;let settled=false;let invoked=false;
  const gate=new Promise(done=>{release=done;});
  const write=()=>{invoked=true;return gate;};
  const record={dataValues:{accountId:42,accountType:'superuser',password:'fixture',oneTimePassword:''},update:write};
  stub(db.accounts,'findByPk',async()=>record);
  stub(db.accounts,'destroy',write);
  stub(db.dataSets,'findByPk',async()=>record);
  stub(db.dataSets,'destroy',async()=>1);
  stub(db.dataSetHistory,'destroy',write);
  stub(sequelize,'transaction',async callback=>callback({}));
  stub(auth,'isValidPassword',async()=>true);
  stub(auth,'getPasswordHash',async()=> 'fixture-hash');
  const request=resolve(null,{accountId:42,dataSetId:7,currentPassword:'fixture',newPassword:'fixture-next'},context);
  request.then(()=>{settled=true;});
  await new Promise(setImmediate);
  const premature=settled;release(1);
  const result=await request;
  assert.equal(invoked,true,'Expected a write');
  assert.equal(premature,false,'Success must wait for persistence');
  assert.equal(result.success,true);
 }));
 test(name+' propagates a rejected database write',()=>mocked(async stub=>{
  const failure=new Error('synthetic write failure');
  const reject=async()=>{throw failure;};
  const record={dataValues:{accountId:42,accountType:'superuser',password:'fixture',oneTimePassword:''},update:reject};
  stub(db.accounts,'findByPk',async()=>record);stub(db.accounts,'destroy',reject);
  stub(db.dataSets,'findByPk',async()=>record);stub(db.dataSets,'destroy',async()=>1);stub(db.dataSetHistory,'destroy',reject);
  stub(sequelize,'transaction',async callback=>callback({}));
  stub(auth,'isValidPassword',async()=>true);stub(auth,'getPasswordHash',async()=> 'fixture-hash');
  await assert.rejects(resolve(null,{accountId:42,dataSetId:7,currentPassword:'fixture',newPassword:'fixture-next'},context),error=>error===failure);
 }));
}
test('history rejects SQL-like or non-canonical IDs before database access',()=>mocked(async stub=>{
 let lookups=0;stub(db.dataSets,'findOne',async()=>{lookups++;return {};});
 stub(sequelize,'query',async sql=>sql.includes('count(')?[{c:0}]:[[]]);
 for(const dataSetId of ['7 OR 1=1','7; SELECT 1','-1','0','1.5','1e2']){
  const result=await dataSetHistory(null,{dataSetId,limit:10,offset:0},context);
  assert.deepEqual(result,{results:[],totalCount:0});
 }
 assert.equal(lookups,0);
}));
test('history binds validated identifiers and pagination as query parameters',()=>mocked(async stub=>{
 const calls=[];stub(db.dataSets,'findOne',async options=>{assert.deepEqual(options.where,{accountId:42,dataSetId:7});return {};});
 stub(sequelize,'query',async(sql,options)=>{calls.push({sql,options});return sql.includes('count(')?[{c:'0'}]:[[]];});
 const result=await dataSetHistory(null,{dataSetId:'7',limit:10,offset:0},context);
 assert.equal(result.totalCount,0);assert.equal(calls.length,2);
 assert.ok(calls[0].sql.includes(':dataSetId'));
 assert.deepEqual(calls[0].options.replacements,{dataSetId:7,limit:10,offset:0});
 assert.deepEqual(calls[1].options.replacements,{dataSetId:7});
}));

test('admin expiry validation compares millisecond timestamps consistently',()=>mocked(async stub=>{
 let saved;
 const record={dataValues:{accountType:'superuser'},update:async data=>{saved=data;}};
 stub(db.accounts,'findByPk',async()=>record);
 const resolve=require('../dist/schema/accounts/resolvers/Mutation/updateAccount').updateAccount;
 const result=await resolve(null,{accountId:42,accountStatus:'live',expiryDate:String(Date.now()-60000)},context);
 assert.equal(result.success,true);assert.equal(saved.accountStatus,'expired');
}));

test('failed best-effort login metrics do not reject login or become unhandled rejections',()=>mocked(async stub=>{
 const helpers=require('../dist/schema/accounts/helpers');
 const resolve=require('../dist/schema/auth/resolvers/Mutation/login').login;
 const record={dataValues:{accountId:42,accountStatus:'live',password:'fixture',oneTimePassword:'',expiryDate:null},update:async values=>{
  if(Object.hasOwn(values,'lastLoggedIn'))throw new Error('synthetic metric failure');
 }};
 stub(db.accounts,'findOne',async()=>record);stub(auth,'isValidPassword',async()=>true);
 stub(helpers,'getAccountNumRowsGenerated',async()=>0);
 const result=await resolve(null,{email:'fixture@example.invalid',password:'fixture'},{});
 assert.equal(result.success,true);
 await new Promise(setImmediate);
}));
