const test = require('node:test');
const assert = require('node:assert/strict');
const {worker}=require('../test-helpers/built-worker.cjs');
const columns=[{title:'name',dataType:'Names',metadata:{general:{dataType:'string'}}},{title:'count',dataType:'AutoIncrement',metadata:{general:{dataType:'number'}}}];
const payload = (rows,extra={}) => ({columns,rows,isFirstBatch:true,isLastBatch:true,currentBatch:1,batchSize:2,numResults:rows.length,stripWhitespace:false,...extra});

test('built Names worker replaces placeholders and produces complete demonstration names',()=>{
 const send=worker('DT-Names.worker-');
 for(let i=0;i<50;i++){
  const name=send({rowState:{source:'any',options:['Name Surname']}});
  assert.equal(typeof name.display,'string');
  assert.match(name.display,/^\S+\s+\S+/);
  assert.doesNotMatch(name.display,/MaleName|FemaleName|Surname/);
 }
});

test('generated names survive batched JSON export without loss or duplication',()=>{
 const names=worker('DT-Names.worker-');
 const rows=Array.from({length:5},(_,i)=>[names({rowState:{source:'any',options:['Name Surname']}}).display,i+1]);
 const send=worker('ET-JSON.worker-');let output='';
 for(let offset=0;offset<rows.length;offset+=2)output+=send(payload(rows.slice(offset,offset+2),{isFirstBatch:offset===0,isLastBatch:offset+2>=rows.length,settings:{dataStructureFormat:'simple'}}));
 assert.deepEqual(JSON.parse(output),rows.map(([name,count])=>({name,count})));
});

test('JSON preserves quotes, backslashes, newlines, Unicode and column names',()=>{
 const value='Zoë "Demo" \\ pad\nvolgende regel';
 const title='naam "voorbeeld"';
 const send=worker('ET-JSON.worker-');
 const output=send(payload([[value,1]],{columns:[{...columns[0],title},columns[1]],settings:{dataStructureFormat:'simple'}}));
 assert.deepEqual(JSON.parse(output),[{[title]:value,count:1}]);
});

test('compact complex JSON remains valid across batch boundaries',()=>{
 const send=worker('ET-JSON.worker-');const settings={dataStructureFormat:'complex'};
 const output=send(payload([['Eerste',1]],{settings,stripWhitespace:true,isLastBatch:false}))+send(payload([['Tweede',2]],{settings,stripWhitespace:true,isFirstBatch:false,currentBatch:2}));
 assert.deepEqual(JSON.parse(output),{cols:['name','count'],data:[['Eerste',1],['Tweede',2]]});
});

test('CSV emits one header across batches and respects delimiter and CRLF',()=>{
 const send=worker('ET-CSV.worker-');const settings={delimiter:';',lineEndings:'Windows'};
 const result=send(payload([['Van Dijk',1]],{settings,isLastBatch:false}))+send(payload([['De Vries',2]],{settings,isFirstBatch:false,currentBatch:2}));
 assert.equal(result,'name;count\r\nVan Dijk;1\r\nDe Vries;2\r\n');
});

test('CSV escapes quotes, delimiters, multiline cells and headers',()=>{
 const send=worker('ET-CSV.worker-');
 const result=send(payload([['Demo "Noor", regel\ntwee',2]],{columns:[{...columns[0],title:'name, demo'},columns[1]],settings:{delimiter:',',lineEndings:'Unix'}}));
 assert.equal(result,'"name, demo",count\n"Demo ""Noor"", regel\ntwee",2\n');
});

test('SQL MySQL export retains numeric types and escapes embedded quotes',()=>{
 const send=worker('ET-SQL.worker-');
 const output=send(payload([['Demo "Noor"',7]],{settings:{databaseType:'MySQL',tableName:'quality_demo',createTable:true,dropTable:true,addPrimaryKey:true,encloseInBackQuotes:true,statementType:'insert',insertBatchSize:10}}));
 assert.match(output,/CREATE TABLE .quality_demo./);assert.match(output,/INSERT INTO .quality_demo./);
 assert.ok(output.includes('"Demo ""Noor""",7'));
 assert.doesNotMatch(output,/,"7"/);
});
