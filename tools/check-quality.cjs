const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function run(label,cwd,args){
 console.log('\nCHECK: '+label);
 const result=spawnSync('pnpm',args,{cwd:path.join(root,cwd),stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status || 1);
}
run('client lint (maintained changes)','apps/client',['exec','eslint',...["src/core/apolloClient.ts","src/core/requestUtils.ts","src/utils/authUtils.ts","src/store/main/main.actions.ts","src/store/account/account.actions.ts","src/store/draftStorage.ts","src/store/unsavedChanges.ts","src/store/persistor.ts","src/store/index.ts","src/store/generator/generator.actions.ts","src/store/generator/generator.reducer.ts","src/core/dialogs/saveDataSet/SaveDataSet.component.tsx","src/core/dialogs/deleteDataSet/DeleteDataSetDialog.component.tsx","src/core/dialogs/login/Login.component.tsx","src/core/header/GeneratorControls.component.tsx","src/core/account/dataSets/DataSets.component.tsx"]]);
run('export generator lint','packages/plugins',['exec','eslint','src/exportTypes/JSON/JSON.generate.ts','src/exportTypes/CSV/CSV.generate.ts']);
if(!fs.existsSync(path.join(root,'apps/client/src/_generationWorker.ts')))run('generator type stub','apps/client',['run','create-worker-stub']);
run('client TypeScript','apps/client',['exec','tsc','--noEmit']);
run('complete client test suite','apps/client',['test','--runInBand']);
console.log('QUALITY SOURCE CHECKS PASSED');
