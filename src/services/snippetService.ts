import {
  db,
  COLLECTIONS,
} from './firebase';
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
import type { Snippet, CreateSnippetData, UpdateSnippetData } from '../types';

class SnippetService {
  // Create a new snippet
  async createSnippet(data: CreateSnippetData, userId: string): Promise<string> {
    try {
      const snippetData = {
        ...data,
        userId: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.SNIPPETS), snippetData);
      console.log('✅ Snippet created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating snippet:', error);
      throw error;
    }
  }

  // Get all snippets for the user
  async getAllSnippets(userId: string): Promise<Snippet[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SNIPPETS),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const snippets: Snippet[] = [];
      
      querySnapshot.forEach((doc) => {
        snippets.push({
          id: doc.id,
          ...doc.data(),
        } as Snippet);
      });
      
      // Sort by updatedAt in descending order (most recent first)
      snippets.sort((a, b) => {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      
      console.log('✅ Snippets fetched:', snippets.length);
      return snippets;
    } catch (error) {
      console.error('❌ Error fetching snippets:', error);
      throw error;
    }
  }

  // Get snippets by language
  async getSnippetsByLanguage(userId: string, language: string): Promise<Snippet[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.SNIPPETS),
        where('userId', '==', userId),
        where('language', '==', language)
      );
      
      const querySnapshot = await getDocs(q);
      const snippets: Snippet[] = [];
      
      querySnapshot.forEach((doc) => {
        snippets.push({
          id: doc.id,
          ...doc.data(),
        } as Snippet);
      });
      
      console.log(`✅ Snippets fetched for ${language}:`, snippets.length);
      return snippets;
    } catch (error) {
      console.error('❌ Error fetching snippets by language:', error);
      throw error;
    }
  }

  // Get a single snippet
  async getSnippet(id: string): Promise<Snippet | null> {
    try {
      const docRef = doc(db, COLLECTIONS.SNIPPETS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const snippet = { id: docSnap.id, ...docSnap.data() } as Snippet;
        console.log('✅ Snippet fetched:', snippet.name);
        return snippet;
      }
      
      console.warn('⚠️ Snippet not found');
      return null;
    } catch (error) {
      console.error('❌ Error fetching snippet:', error);
      throw error;
    }
  }

  // Update a snippet
  async updateSnippet(id: string, data: UpdateSnippetData): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SNIPPETS, id);
      
      // Filter out undefined values to prevent Firebase errors
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      );
      
      const updateData = {
        ...filteredData,
        updatedAt: Date.now(),
      };
      
      await updateDoc(docRef, updateData);
      console.log('✅ Snippet updated:', id);
    } catch (error) {
      console.error('❌ Error updating snippet:', error);
      throw error;
    }
  }

  // Delete a snippet
  async deleteSnippet(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.SNIPPETS, id);
      await deleteDoc(docRef);
      console.log('✅ Snippet deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting snippet:', error);
      throw error;
    }
  }

  // Create default snippets for new users
  async createDefaultSnippets(userId: string): Promise<void> {
    const defaultSnippets: CreateSnippetData[] = [
      {
        name: 'Console Log',
        description: 'Quick console.log statement',
        language: 'javascript',
        code: 'console.log($1);',
        prefix: 'clog',
      },
      {
        name: 'Function Declaration',
        description: 'Basic function declaration',
        language: 'javascript',
        code: 'function $1($2) {\n  $3\n}',
        prefix: 'func',
      },
      {
        name: 'Arrow Function',
        description: 'Arrow function declaration',
        language: 'javascript',
        code: 'const $1 = ($2) => {\n  $3\n};',
        prefix: 'arrow',
      },
      {
        name: 'React Component',
        description: 'Basic React functional component',
        language: 'react',
        code: 'const $1 = () => {\n  return (\n    <div>\n      $2\n    </div>\n  );\n};',
        prefix: 'rcomp',
      },
      {
        name: 'useState Hook',
        description: 'React useState hook',
        language: 'react',
        code: 'const [$1, set$2] = useState($3);',
        prefix: 'useState',
      },
      {
        name: 'useEffect Hook',
        description: 'React useEffect hook',
        language: 'react',
        code: 'useEffect(() => {\n  $1\n}, [$2]);',
        prefix: 'useEffect',
      },
    ];

    try {
      for (const snippet of defaultSnippets) {
        await this.createSnippet(snippet, userId);
      }
      console.log('✅ Default snippets created for user:', userId);
    } catch (error) {
      console.error('❌ Error creating default snippets:', error);
      throw error;
    }
  }

  // Export snippets to JSON
  exportSnippets(snippets: Snippet[]): string {
    const exportData = snippets.map(snippet => ({
      name: snippet.name,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
      prefix: snippet.prefix,
    }));
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import snippets from JSON
  async importSnippets(jsonData: string, userId: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonData);
      let importedCount = 0;

      for (const snippetData of importData) {
        if (snippetData.name && snippetData.code && snippetData.prefix && snippetData.language) {
          await this.createSnippet(snippetData, userId);
          importedCount++;
        }
      }

      console.log(`✅ Imported ${importedCount} snippets`);
      return importedCount;
    } catch (error) {
      console.error('❌ Error importing snippets:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const snippetService = new SnippetService();
export default snippetService;
