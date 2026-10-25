import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const instance=process.env.DG_INSTANCE||'datagenerator-dev';
if(!/^[a-z][a-z0-9-]{2,48}$/.test(instance)) throw Error('Invalid DG_INSTANCE');
const configRoot=path.resolve(process.env.DG_CONFIG_DIR||path.join(process.env.LOCALAPPDATA||process.env.XDG_CONFIG_HOME||path.join(os.homedir(),'.config'),'Qndrs','Datagenerator',instance));
const envFile=path.join(configRoot,'runtime.env');
function outside(p){const r=path.relative(root,p);if(r===''||(!r.startsWith('..'+path.sep)&&r!=='..'&&!path.isAbsolute(r)))throw Error('Backup/configuration must be outside the repository');}
outside(configRoot);
function envRead(file=envFile){return Object.fromEntries(fs.readFileSync(file,'utf8').trim().split(/\r?\n/).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1)];}));}
function run(args,{input,outputFd,inputFd,capture=false}={}){
 const result=spawnSync('docker',args,{cwd:root,env:{...process.env,...envRead()},input,encoding:outputFd===undefined?'utf8':undefined,maxBuffer:16*1024*1024,stdio:[inputFd??(input===undefined?'ignore':'pipe'),outputFd??(capture?'pipe':'inherit'),'pipe']});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error('Docker operation failed: '+String(result.stderr||'').slice(-1200));
 return result.stdout||'';
}
function compose(args,options){return run(['compose','--env-file',envFile,'-f',path.join(root,'compose.yaml'),...args],options);}
const snapshotCode=String.raw`
const mysql=require('/app/apps/server/node_modules/mysql2/promise'),crypto=require('node:crypto');
(async()=>{const c=await mysql.createConnection({host:'db',user:'gdapp',password:process.env.MYSQL_PASSWORD,database:'generatedata',dateStrings:true,supportBigNumbers:true,bigNumberStrings:true});try{
 const tables={}; const order={accounts:'account_id',datasets:'dataset_id',dataset_history:'history_id',settings:'setting_name'};
 for(const [name,key]of Object.entries(order)){const [rows]=await c.query('SELECT * FROM '+name+' ORDER BY '+key);const normalized=rows.map(r=>Object.fromEntries(Object.keys(r).sort().map(k=>[k,r[k]])));tables[name]={count:rows.length,digest:crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex')};}
 const [[v]]=await c.query('SELECT VERSION() AS version');console.log(JSON.stringify({version:v.version,tables,digest:crypto.createHash('sha256').update(JSON.stringify(tables)).digest('hex')}));
}finally{await c.end();}})().catch(e=>{console.error(e.code||e.name);process.exit(1)});`;
function snapshot(){return JSON.parse(compose(['run','--rm','-T','--no-deps','server','node','-'],{input:snapshotCode,capture:true}).trim());}
async function hashFile(file){const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return h.digest('hex');}
const cmd=process.argv[2];
if(cmd==='snapshot')console.log(JSON.stringify(snapshot(),null,2));
else if(cmd==='backup'){
 const folder=path.resolve(process.argv[3]||path.join(configRoot,'backups',new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex')));outside(folder);
 if(fs.existsSync(folder))throw Error('Backup directory already exists; refusing overwrite');
 fs.mkdirSync(folder,{recursive:true,mode:0o700});
 let stopped=false;
 try{
  stopped=true;compose(['stop','web','server']);
  const state=snapshot();
  const temporary=path.join(folder,'database.partial.sql');const fd=fs.openSync(temporary,'wx',0o600);
  try{compose(['exec','-T','db','sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mariadb-dump -u root --single-transaction --quick --routines --events --triggers --hex-blob --default-character-set=utf8mb4 --databases generatedata'],{outputFd:fd});}finally{fs.closeSync(fd);}
  const sql=path.join(folder,'database.sql');fs.renameSync(temporary,sql);
  const files={};for(const name of ['runtime.env','admin.json','test-users.json']){const source=path.join(configRoot,name);if(fs.existsSync(source)){const target=path.join(folder,name);fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);fs.chmodSync(target,0o600);files[name]=await hashFile(target);}}
  const manifest={format:1,createdAt:new Date().toISOString(),sourceInstance:instance,snapshot:state,sqlSha256:await hashFile(sql),configurationFiles:files};
  fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600,flag:'wx'});
  console.log('BACKUP='+folder);console.log('Verified dump written; contents and credentials are not printed.');
 }finally{if(stopped&&process.env.DG_KEEP_STOPPED!=='1')compose(['up','-d','--no-deps','--wait','--wait-timeout','180','server','web']);}
}else if(cmd==='restore'){
 const folder=path.resolve(process.argv[3]||'');outside(folder);
 const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
 if(manifest.format!==1)throw Error('Unsupported backup format');
 if(await hashFile(path.join(folder,'database.sql'))!==manifest.sqlSha256)throw Error('Dump checksum mismatch');
 for(const[name,hash]of Object.entries(manifest.configurationFiles)){if(path.basename(name)!==name)throw Error('Invalid manifest path');if(await hashFile(path.join(folder,name))!==hash)throw Error('Configuration checksum mismatch');}
 const countTables=()=>compose(['exec','-T','db','sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mariadb -u root -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=\'generatedata\'"'],{capture:true}).trim();
 // Never boot an existing stopped volume or an existing volume with a different engine.
 const targetEnv=envRead();
 const expectedVolume=targetEnv.DG_DB_VOLUME||targetEnv.COMPOSE_PROJECT_NAME+'_database114';
 const expectedImage=targetEnv.DG_DB_IMAGE||'mariadb:11.4.13@sha256:250e1609e93c0e6aecf64bfbab2d84d5e89d2481540fe77447ff6c855c3b1873';
 const volumeCheck=spawnSync('docker',['volume','inspect',expectedVolume],{encoding:'utf8'});
 if(volumeCheck.status===0){
  const id=compose(['ps','-q','db'],{capture:true}).trim();
  if(!id)throw Error('Restore refused: existing volume is not running; use a new volume.');
  const image=run(['inspect','--format','{{.Config.Image}}',id],{capture:true}).trim();
  const mounts=JSON.parse(run(['inspect','--format','{{json .Mounts}}',id],{capture:true}));
  if(image!==expectedImage||!mounts.some(m=>m.Destination==='/var/lib/mysql'&&m.Name===expectedVolume))throw Error('Restore refused: existing database engine/volume differs from target profile.');
  if(countTables()!=='0')throw Error('Restore refused: target database is not empty. Use a new instance/volume; existing data is never overwritten.');
 }else if(!String(volumeCheck.stderr).toLowerCase().includes('no such volume'))throw Error('Cannot verify target volume; restore refused.');
 compose(['up','-d','--no-build','--wait','--wait-timeout','240','db']);
 const count=countTables();
 if(count!=='0')throw Error('Restore refused: target database is not empty. Use a new instance/volume; existing data is never overwritten.');
 const fd=fs.openSync(path.join(folder,'database.sql'),'r');try{compose(['exec','-T','db','sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mariadb -u root --default-character-set=utf8mb4'],{inputFd:fd});}finally{fs.closeSync(fd);}
 const restored=snapshot();if(restored.digest!==manifest.snapshot.digest)throw Error('Restored accounts/data/history/settings do not match backup');
 const original=envRead(path.join(folder,'runtime.env'));const target=envRead();target.DG_ADMIN_PASSWORD=original.DG_ADMIN_PASSWORD;
 fs.writeFileSync(envFile,Object.entries(target).map(([k,v])=>k+'='+v).join('\n')+'\n',{mode:0o600});
 for(const name of ['admin.json','test-users.json'])if(manifest.configurationFiles[name]){fs.copyFileSync(path.join(folder,name),path.join(configRoot,name));fs.chmodSync(path.join(configRoot,name),0o600);}
 console.log('PASS: restored accounts (including hashes), datasets, history and settings match backup');console.log(JSON.stringify({version:restored.version,counts:Object.fromEntries(Object.entries(restored.tables).map(([k,v])=>[k,v.count]))}));
}else throw Error('Commands: backup [external-directory], restore external-directory, snapshot');
