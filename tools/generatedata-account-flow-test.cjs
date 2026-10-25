// Local disposable test instance only. Reads its administrator credentials from stdin.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const admin = JSON.parse(fs.readFileSync(0, 'utf8'));
async function request(query, variables = {}, token = '') {
 const response = await fetch('http://web:9000/graphql', {method:'POST', headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({query,variables})});
 assert.equal(response.status,200);
 const result = await response.json(); assert.equal(result.errors,undefined,'GraphQL request failed'); return result.data;
}
const loginQuery='mutation($email:String!,$password:String!){login(email:$email,password:$password){success token wasOneTimeLogin}}';
const login=async (email,password)=>(await request(loginQuery,{email,password})).login;
(async()=>{
 const session=await login(admin.email,admin.password); assert.equal(session.success,true);
 const email='gebruikersflow-'+Date.now()+'@example.invalid';
 const temporary=crypto.randomBytes(20).toString('hex');const permanent=crypto.randomBytes(20).toString('hex');
 const mutation='mutation($email:String!,$temporary:String!){createUserAccount(firstName:"Gebruikersflow",lastName:"Proefaccount",email:$email,country:"Netherlands",region:"",accountStatus:live,oneTimePassword:$temporary){success}}';
 assert.equal((await request(mutation,{email,temporary})).createUserAccount.success,false);
 assert.equal((await request(mutation,{email,temporary},session.token)).createUserAccount.success,true);
 const first=await login(email,temporary);assert.equal(first.success,true);assert.equal(first.wasOneTimeLogin,true);
 const change='mutation($current:String!,$next:String!){updatePassword(currentPassword:$current,newPassword:$next){success}}';
 assert.equal((await request(change,{current:temporary,next:permanent},first.token)).updatePassword.success,true);
 assert.equal((await login(email,temporary)).success,false);
 const normal=await login(email,permanent);assert.equal(normal.success,true);assert.equal(normal.wasOneTimeLogin,false);
 assert.equal((await request(mutation,{email:'denied-'+email,temporary},normal.token)).createUserAccount.success,false);
 console.log('PASS: administrator creates an account; anonymous/ordinary users cannot create accounts.');
 console.log('PASS: temporary-password onboarding, permanent login and rejection of old temporary password.');
})().catch(()=>{console.error('Account flow verification failed (credentials omitted).');process.exit(1);});
