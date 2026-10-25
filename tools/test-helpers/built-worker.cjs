const assert=require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const workers = path.resolve(__dirname, '../../apps/client/dist/workers');
const find = prefix => {
 const matches = fs.readdirSync(workers).filter(name => name.startsWith(prefix) && name.endsWith('.js'));
 assert.equal(matches.length,1,'Expected exactly one current built worker for '+prefix);
 return matches[0];
};
function worker(prefix) {
 const scope = {};
 let result;
 scope.self = scope;
 scope.postMessage = value => {result=value;};
 scope.importScripts = filename => vm.runInContext(fs.readFileSync(path.join(workers,path.basename(filename)),'utf8'),context);
 const context = vm.createContext(scope);
 vm.runInContext(fs.readFileSync(path.join(workers,find(prefix)),'utf8'),context);
 return data => {
  result=undefined;
  scope.onmessage({data:{...data,workerUtilsUrl:find('workerUtils-')}});
  assert.notEqual(result,undefined,'Worker returned no result');
  return JSON.parse(JSON.stringify(result));
 };
}

module.exports={worker};
