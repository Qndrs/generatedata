import { ETMessageData } from '../../';

export const generate = (data: ETMessageData): string => {
  const { columns, rows, isFirstBatch, settings } = data;
  const { delimiter, lineEndings } = settings;

  const map: any = {
    Windows: '\r\n',
    Unix: '\n',
    Mac: '\r'
  };
  const eol = map[lineEndings];

  const encode = (value: unknown): string => {
    const text = String(value ?? '');
    return text.includes(delimiter) || /["\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
  };

  let content = '';
  if (isFirstBatch) {
    const titleRow = columns.map(({ title }) => encode(title)).join(delimiter);
    content += `${titleRow}${eol}`;
  }

  const numCols = columns.length;
  rows.forEach((row) => {
    const cleanRow = [];
    for (let i = 0; i < numCols; i++) {
      cleanRow.push(encode(row[i]));
    }
    content += cleanRow.join(delimiter) + eol;
  });

  return content;
};
