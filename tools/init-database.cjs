const fs = require('node:fs');
const mysql = require('../apps/server/node_modules/mysql2/promise');
const bcrypt = require('../apps/server/node_modules/bcryptjs');
(async () => {
  for (const key of ['MYSQL_PASSWORD','DG_ADMIN_PASSWORD','DG_ADMIN_EMAIL']) if (!process.env[key]) throw new Error('Missing setting: '+key);
  const connection = await mysql.createConnection({host:'db',user:'gdapp',password:process.env.MYSQL_PASSWORD,database:'generatedata',multipleStatements:true});
  try {
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length) {
      const names = tables.map(row=>Object.values(row)[0]);
      if (!['accounts','datasets','dataset_history','settings'].every(name=>names.includes(name))) throw new Error('Incomplete schema: restore or investigate; refusing to overwrite existing tables');
      console.log('Existing schema preserved; accounts and passwords unchanged.');
      return;
    }
    let sql = fs.readFileSync('/app/packages/config/build/templates/dbStructure.template.sql','utf8');
    sql = sql.slice(0, sql.indexOf('/* the admin account'));
    sql = sql.replace(/^CREATE DATABASE.*$/gm,'').replace(/^CREATE USER.*$/gm,'').replace(/^GRANT .*$/gm,'').replace(/^FLUSH PRIVILEGES;.*$/gm,'');
    await connection.query(sql);
    const password = await bcrypt.hash(process.env.DG_ADMIN_PASSWORD,10);
    await connection.execute("INSERT INTO accounts (account_id,date_created,last_updated,account_type,account_status,first_name,last_name,email,password,country,region) VALUES (1,NOW(),NOW(),'superuser','live','Lokale','Beheerder',?,?,'Netherlands','')",[process.env.DG_ADMIN_EMAIL,password]);
    console.log('New local schema and administrator initialized. Credentials are not printed.');
  } finally { await connection.end(); }
})().catch(error=>{console.error('Initialization failed:',error.code||error.message);process.exit(1);});
