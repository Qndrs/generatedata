import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const instance=process.env.DG_INSTANCE || 'datagenerator-dev';
if(!/^[a-z][a-z0-9-]{2,48}$/.test(instance)) throw Error('Invalid DG_INSTANCE');
const configRoot=path.resolve(process.env.DG_CONFIG_DIR || path.join(process.env.LOCALAPPDATA || process.env.XDG_CONFIG_HOME || path.join(os.homedir(),'.config'),'Qndrs','Datagenerator',instance));
const relative=path.relative(root,configRoot);
if(relative==='' || (!relative.startsWith('..'+path.sep) && relative!=='..' && !path.isAbsolute(relative))) throw Error('DG_CONFIG_DIR must be outside the repository');
const envFile=path.join(configRoot,'runtime.env');
const adminFile=path.join(configRoot,'admin.json');
const command=process.argv[2] || 'status';
function readEnv(){return Object.fromEntries(fs.readFileSync(envFile,'utf8').trim().split(/\r?\n/).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));}
function setup(){
  const bindHost=process.env.DG_BIND_HOST || '127.0.0.1';
  if(!['127.0.0.1','127.0.0.2'].includes(bindHost)) throw Error('DG_BIND_HOST must be loopback 127.0.0.1 or 127.0.0.2');
  fs.mkdirSync(configRoot,{recursive:true,mode:0o700});
  if(!fs.existsSync(envFile)){
    const port=Number(process.env.DG_PORT || 19091);
    if(!Number.isInteger(port)||port<1024||port>65535) throw Error('DG_PORT must be 1024..65535');
    const random=()=>crypto.randomBytes(32).toString('hex');
    const values={COMPOSE_PROJECT_NAME:instance,DG_BIND_HOST:bindHost,DG_PORT:port,MYSQL_ROOT_PASSWORD:random(),MYSQL_PASSWORD:random(),GD_JWT_SECRET:random(),GD_JWT_REFRESH_TOKEN_SECRET:random(),DG_ADMIN_PASSWORD:random()};
    fs.writeFileSync(envFile,Object.entries(values).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600,flag:'wx'});
    fs.writeFileSync(adminFile,JSON.stringify({email:'beheerder@example.invalid',password:values.DG_ADMIN_PASSWORD},null,2)+'\n',{mode:0o600,flag:'wx'});
  }
  console.log(`Configuration: ${configRoot}\nURL: http://${readEnv().DG_BIND_HOST || '127.0.0.1'}:${readEnv().DG_PORT}/nl/\nExisting configuration is never regenerated.`);
}
function docker(args,input){
  const result=spawnSync('docker',args,{cwd:root,stdio:input===undefined?'inherit':['pipe','inherit','inherit'],input});
  if(result.error) throw result.error;
  if(result.status!==0) throw Error(`Docker command failed (exit ${result.status})`);
}
function compose(args){docker(['compose','--env-file',envFile,'-f',path.join(root,'compose.yaml'),...args]);}
if(command==='quality') {
  const result=spawnSync(process.execPath,[path.join(root,'tools/quality.mjs'),...process.argv.slice(3)],{stdio:'inherit'});
  if(result.status!==0) process.exitCode=result.status || 1;
}
else if(command==='setup') setup();
else {
  if(!fs.existsSync(envFile)) throw Error('Run node tools/local.mjs setup first. Never regenerate secrets for an existing database.');
  switch(command){
    case 'build': compose(['build',...(process.argv.includes('--no-cache')?['--no-cache']:[]),'server','web']);break;
    case 'up': compose(['up','-d','--no-build','--wait','--wait-timeout','240']);break;
    case 'stop': compose(['stop']);break;
    case 'down': compose(['down']);break;
    case 'status': compose(['ps','-a']);break;
    case 'backup': case 'restore': case 'snapshot': {
      const result=spawnSync(process.execPath,[path.join(root,'tools/database.mjs'),command,...process.argv.slice(3)],{stdio:'inherit',env:{...process.env,DG_CONFIG_DIR:configRoot}});
      if(result.status!==0)throw Error('Database operation failed');
      break;
    }
    case 'test': {
      const file=path.join(configRoot,'test-users.json');
      if(!fs.existsSync(file)) fs.writeFileSync(file,JSON.stringify({email:'controle-a@example.invalid',password:crypto.randomBytes(24).toString('hex'),otherEmail:'controle-b@example.invalid',otherPassword:crypto.randomBytes(24).toString('hex')}),{mode:0o600,flag:'wx'});
      const input=fs.readFileSync(file,'utf8');
      const base=['compose','--env-file',envFile,'-f',path.join(root,'compose.yaml'),'exec','-T','server'];
      docker([...base,'node','/app/tools/generatedata-provision-local-user.cjs'],input);
      docker([...base,'node','/app/tools/generatedata-login-storage-test.cjs'],input);
      docker([...base,'node','--test','/app/apps/server/tests/auth-security.test.cjs']);
      break;
    }
    default: throw Error('Commands: quality, setup, build [--no-cache], up, stop, down, status, test, backup, restore, snapshot');
  }
}


