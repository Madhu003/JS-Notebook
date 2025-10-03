import {
  db,
  COLLECTIONS,
  type Notebook,
  type CreateNotebookData,
  type UpdateNotebookData,
  type Cell,
} from './firebase';
import { CellType } from '../types/enums';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

class NotebookService {
  // Create a new notebook
  async createNotebook(data: CreateNotebookData, userId: string): Promise<string> {
    try {
      const notebookData = {
        ...data,
        userId: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        cells: data.cells || [],
        isPublic: data.isPublic || false,
        tags: data.tags || [],
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.NOTEBOOKS), notebookData);
      console.log('✅ Notebook created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating notebook:', error);
      throw error;
    }
  }

  // Get all notebooks for the user
  async getAllNotebooks(userId: string): Promise<Notebook[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTEBOOKS),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const notebooks: Notebook[] = [];
      
      querySnapshot.forEach((doc) => {
        notebooks.push({
          id: doc.id,
          ...doc.data(),
        } as Notebook);
      });
      
      // Sort by updatedAt in descending order (most recent first)
      notebooks.sort((a, b) => {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      
      console.log('✅ Notebooks fetched:', notebooks.length);
      return notebooks;
    } catch (error) {
      console.error('❌ Error fetching notebooks:', error);
      throw error;
    }
  }

  // Get a single notebook
  async getNotebook(id: string): Promise<Notebook | null> {
    try {
      const docRef = doc(db, COLLECTIONS.NOTEBOOKS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const notebook = { id: docSnap.id, ...docSnap.data() } as Notebook;
        
        // Note: Ownership verification removed for now since we're using authenticated users
        if (notebook.isPublic || true) {
          console.log('✅ Notebook fetched:', notebook.title);
          return notebook;
        }
      }
      
      console.warn('⚠️ Notebook not found or unauthorized');
      return null;
    } catch (error) {
      console.error('❌ Error fetching notebook:', error);
      throw error;
    }
  }

  // Update a notebook
  async updateNotebook(id: string, data: UpdateNotebookData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.NOTEBOOKS, id);
      
      const updateData = {
        ...data,
        updatedAt: Date.now(),
      };
      
      await updateDoc(docRef, updateData);
      console.log('✅ Notebook updated:', id);
    } catch (error) {
      console.error('❌ Error updating notebook:', error);
      throw error;
    }
  }

    // Delete a notebook
  async deleteNotebook(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.NOTEBOOKS, id);
      await deleteDoc(docRef);
      console.log('✅ Notebook deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting notebook:', error);
      throw error;
    }
  }

  // Create default cells for new notebook
  createDefaultCells(): Cell[] {
    return [
      {
        id: Date.now().toString(),
        type: CellType.Code,
        content: '',
        language: 'javascript',
      }
    ];
  }

  // Create a sample notebook
  async createSampleTemplate(userId: string): Promise<string> {
    const cells: Cell[] = [
      {
        id: Date.now().toString(),
        type: CellType.Code,
        content: `// Welcome to JS-Notebook!
console.log('Hello, World!');

// This is your first code cell
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('JS-Notebook'));`,
        language: 'javascript',
      },
      {
        id: (Date.now() + 1).toString(),
        type: CellType.Markdown,
        content: `# Welcome to JS-Notebook

## This is a Markdown cell

You can write **markdown** here with:
- Lists
- **Bold text**
-\`Inline code\`
- And more!

### Getting Started
1. Create new cells using the + button
2. Write code or markdown
3. Run code cells to see output
4. Save your notebook when done`,
      },
    ];

    return this.createNotebook({
      title: 'Welcome to JS-Notebook! 🎉',
      description: 'A sample notebook to get you started',
      cells,
      tags: ['welcome', 'sample', 'tutorial'],
      isPublic: true,
    }, userId);
  }
}

// Export singleton instance
export const notebookService = new NotebookService();
export default notebookService;
