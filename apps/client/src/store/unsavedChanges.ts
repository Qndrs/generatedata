import { getDataSetSavePackage } from './generator/generator.selectors';
export const hasUnsavedChanges = (state: any): boolean => {
  if (!state.generator) return false;
  const content = getDataSetSavePackage(state);
  if (state.generator.savedSnapshot) return JSON.stringify(content) !== state.generator.savedSnapshot;
  return Object.values(content.rows).some((row: any) => !!row.dataType || !!row.title);
};
