const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const execute=(args,env)=>spawnSync(process.execPath,[path.join(root,'tools/quality.mjs'),...args],{encoding:'utf8',timeout:5000,env:{...process.env,...env}});
test('quality runner refuses the active instance before calling Docker',()=>{
 const result=execute(['--skip-build'],{DG_QUALITY_INSTANCE:'datagenerator-dev'});
 assert.equal(result.status,1);assert.match(result.stderr,/isolated/);assert.equal(result.stdout,'');
});
test('quality runner refuses another instance configuration without changing it or stopping containers',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gd-quality-guard-'));
 const file=path.join(dir,'runtime.env');const original='COMPOSE_PROJECT_NAME=datagenerator-dev\nDG_PORT=19091\n';
 fs.writeFileSync(file,original);
 try {
  const result=execute(['--skip-build'],{DG_QUALITY_INSTANCE:'datagenerator-quality',DG_QUALITY_CONFIG_DIR:dir});
  assert.equal(result.status,1);assert.match(result.stderr,/different instance/);assert.equal(result.stdout,'');
  assert.equal(fs.readFileSync(file,'utf8'),original);
 } finally {fs.unlinkSync(file);fs.rmdirSync(dir);}
});
test('unknown quality flags fail before setup or build',()=>{
 const result=execute(['--unknown'],{DG_QUALITY_INSTANCE:'datagenerator-quality'});
 assert.equal(result.status,1);assert.match(result.stderr,/Unknown quality option/);assert.equal(result.stdout,'');
});
