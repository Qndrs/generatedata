import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(Number(process.versions.node.split('.')[0])<24)throw Error('Quality checks require Node.js 24 or newer');
if(process.argv.slice(2).some(arg=>arg!=='--skip-build'))throw Error('Unknown quality option');
const instance=process.env.DG_QUALITY_INSTANCE || 'datagenerator-quality';
if(!/^datagenerator-(quality|ci)(-[a-z0-9]+)*$/.test(instance))throw Error('Quality checks require an isolated datagenerator-quality or datagenerator-ci instance');
const configRoot=path.resolve(process.env.DG_QUALITY_CONFIG_DIR || path.join(process.env.LOCALAPPDATA || process.env.XDG_CONFIG_HOME || path.join(os.homedir(),'.config'),'Qndrs','Datagenerator',instance));
const env={...process.env,DG_INSTANCE:instance,DG_CONFIG_DIR:configRoot,COMPOSE_PROJECT_NAME:instance,DG_DB_VOLUME:instance+'_database114',DG_PORT:process.env.DG_QUALITY_PORT || '19095',DG_BIND_HOST:'127.0.0.2'};
for(const key of ['MYSQL_PASSWORD','MYSQL_ROOT_PASSWORD','GD_JWT_SECRET','GD_JWT_REFRESH_TOKEN_SECRET','DG_ADMIN_PASSWORD'])delete env[key];
const runtimeFile=path.join(configRoot,'runtime.env');
function verifyConfiguration(){
 const content=fs.readFileSync(runtimeFile,'utf8');
 const project=content.match(/^COMPOSE_PROJECT_NAME=(.+)$/m)?.[1].trim();
 if(project!==instance)throw Error('Quality configuration belongs to a different instance; refusing reuse');
}
if(fs.existsSync(runtimeFile))verifyConfiguration();
function run(command,args,input){
 const result=spawnSync(command,args,{cwd:root,env,stdio:input===undefined?'inherit':['pipe','inherit','inherit'],input});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error('Quality command failed (exit '+result.status+')');
}
const local=command=>run(process.execPath,['tools/local.mjs',command]);
let failure;
let configured=false;
try {
 local('setup');
 verifyConfiguration();
 configured=true;
 if(!process.argv.includes('--skip-build'))local('build');
 else console.log('Reusing explicitly prebuilt quality images; this run does not verify a fresh build.');
 local('up');
 const base=['compose','--env-file',path.join(configRoot,'runtime.env'),'-f','compose.yaml','exec','-T','server'];
 run('docker',[...base,'node','/app/tools/check-quality.cjs']);
 local('test');
 run('docker',[...base,'node','--test','/app/tools/tests/generation-exports.test.cjs','/app/tools/tests/quality-runner.test.cjs']);
 run('docker',[...base,'node','/app/tools/generatedata-sql-export-test.cjs']);
 run('docker',[...base,'node','/app/tools/generatedata-account-flow-test.cjs'],fs.readFileSync(path.join(configRoot,'admin.json'),'utf8'));
 console.log('ALL QUALITY CHECKS PASSED');
} catch(error){failure=error;}
finally {
 if(configured){
  try {local('down');}catch(error){failure ||= error;}
 }
}
if(failure){console.error(failure.message);process.exitCode=1;}
