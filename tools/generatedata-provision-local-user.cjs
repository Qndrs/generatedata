const fs = require('node:fs');
const {db,sequelize} = require('/app/apps/server/dist/database');
const bcrypt = require('/app/apps/server/node_modules/bcryptjs');
sequelize.options.logging=false;
(async()=>{
 const input=JSON.parse(fs.readFileSync(0,'utf8'));
 for(const [email,password] of [[input.email,input.password],[input.otherEmail,input.otherPassword]]) {
  if(!await db.accounts.findOne({where:{email}})) {
   await db.accounts.create({dateCreated:new Date(),lastUpdated:new Date(),firstName:'Lokale',lastName:'Tester',email,password:await bcrypt.hash(password,10),accountType:'user',accountStatus:'live',country:'Netherlands',region:''});
  }
 }
 console.log('Local test accounts ready (credentials not printed).');
 await sequelize.close();
})().catch(e=>{console.error(e.name);process.exit(1)});
