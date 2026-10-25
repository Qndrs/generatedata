const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const mysql=require('../apps/server/node_modules/mysql2/promise');
const {worker}=require('./test-helpers/built-worker.cjs');
(async()=>{
 const connection=await mysql.createConnection({host:'db',user:'gdapp',password:process.env.MYSQL_PASSWORD,database:'generatedata',multipleStatements:true});
 try {
  const tableName='quality_export_'+crypto.randomBytes(6).toString('hex');
  const rows=[['Zoë "Demo"',7],["O'Voorbeeld",8]];
  const send=worker('ET-SQL.worker-');
  const columns=[{title:'name',dataType:'Names',metadata:{general:{dataType:'string'},sql:{field_MySQL:'TEXT'}}},{title:'count',dataType:'AutoIncrement',metadata:{general:{dataType:'number'},sql:{field_MySQL:'INT'}}}];
  let sql=send({columns,rows,isFirstBatch:true,isLastBatch:true,currentBatch:1,batchSize:2,settings:{databaseType:'MySQL',tableName,createTable:true,dropTable:false,addPrimaryKey:true,encloseInBackQuotes:true,statementType:'insert',insertBatchSize:10}});
  sql=sql.replace('CREATE TABLE ','CREATE TEMPORARY TABLE ');
  await connection.query(sql);
  const [actual]=await connection.query('SELECT name, count FROM ?? ORDER BY count',[tableName]);
  assert.deepEqual(actual.map(row=>[row.name,row.count]),rows);
  console.log('PASS: built MySQL export executes on MariaDB and retains Unicode, quotes, apostrophes and numbers.');
 } finally {await connection.end();}
})().catch(()=>{console.error('SQL export verification failed (runtime details omitted).');process.exit(1);});
