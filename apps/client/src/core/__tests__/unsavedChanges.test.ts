import { hasUnsavedChanges } from '../../store/unsavedChanges';
jest.mock('~store/generator/generator.selectors', () => ({getDataSetSavePackage:(state:any)=>state.content}));
const content={exportType:'JSON',exportTypeSettings:{},rows:{one:{dataType:'Names',title:'name'}},sortedRows:['one']};
test('loaded or successfully saved configuration has no pending changes',()=>{
 expect(hasUnsavedChanges({generator:{savedSnapshot:JSON.stringify(content)},content})).toBe(false);
});
test('edits after a save started remain unsaved when its response arrives',()=>{
 const edited={...content,rows:{one:{dataType:'Names',title:'changed'}}};
 expect(hasUnsavedChanges({generator:{savedSnapshot:JSON.stringify(content)},content:edited})).toBe(true);
});
test('a recovered draft without a checkpoint remains protected',()=>{
 expect(hasUnsavedChanges({generator:{},content})).toBe(true);
});
test('blank initial rows do not trigger a discard warning',()=>{
 expect(hasUnsavedChanges({generator:{},content:{...content,rows:{one:{dataType:null,title:''}}}})).toBe(false);
});
