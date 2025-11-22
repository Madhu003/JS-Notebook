// Export enums
export * from './enums';

// Export constants
export * from './constants';

// Export models
export * from './models';

// Export services
export * from './services';

// Export components
export * from './components';

// Re-export specific types for backward compatibility
export type { Cell } from './models/Cell';
export type { Notebook, CreateNotebookData, UpdateNotebookData } from './models/Notebook';
export type { Snippet, CreateSnippetData, UpdateSnippetData } from './models/Snippet';
export type { User } from './models/User';

// Type guards
import type { Cell, CodeCell } from './models/Cell';

export const isCodeCell = (cell: Cell): cell is CodeCell => {
  return cell.type === 'code';
};

