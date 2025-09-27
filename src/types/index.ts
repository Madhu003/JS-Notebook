export * from './enums';
export * from './interfaces';
export * from './constants';

// Type guards
export const isCodeCell = (cell: import('./interfaces').Cell): cell is import('./interfaces').CodeCell => {
  return cell.type === 'code';
};
