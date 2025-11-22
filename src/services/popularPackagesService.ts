// Popular Packages Service
// Manages popular NPM packages stored in Firebase

import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export interface PopularPackage {
    id?: string;
    name: string;
    description: string;
    globalName: string;
    order?: number;
}

const COLLECTION_NAME = 'popularPackages';

class PopularPackagesService {
    /**
     * Get all popular packages
     */
    async getPopularPackages(): Promise<PopularPackage[]> {
        try {
            const packagesRef = collection(db, COLLECTION_NAME);
            const q = query(packagesRef, orderBy('order', 'asc'));
            const snapshot = await getDocs(q);

            const packages: PopularPackage[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PopularPackage));

            return packages;
        } catch (error) {
            console.error('Error fetching popular packages:', error);
            // Return default packages as fallback
            return this.getDefaultPackages();
        }
    }

    /**
     * Add a popular package
     */
    async addPopularPackage(pkg: Omit<PopularPackage, 'id'>): Promise<string> {
        try {
            const packagesRef = collection(db, COLLECTION_NAME);
            const docRef = await addDoc(packagesRef, pkg);
            return docRef.id;
        } catch (error) {
            console.error('Error adding popular package:', error);
            throw error;
        }
    }

    /**
     * Remove a popular package
     */
    async removePopularPackage(id: string): Promise<void> {
        try {
            const packageRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(packageRef);
        } catch (error) {
            console.error('Error removing popular package:', error);
            throw error;
        }
    }

    /**
     * Seed initial popular packages (call this once to populate Firestore)
     */
    async seedDefaultPackages(): Promise<void> {
        try {
            const defaultPackages = this.getDefaultPackages();

            for (const pkg of defaultPackages) {
                await this.addPopularPackage(pkg);
            }

            console.log('✅ Successfully seeded popular packages to Firebase');
        } catch (error) {
            console.error('Error seeding popular packages:', error);
            throw error;
        }
    }

    /**
     * Get default packages (fallback)
     */
    private getDefaultPackages(): PopularPackage[] {
        return [
            { name: 'lodash', description: 'Utility library for JavaScript', globalName: '_', order: 1 },
            { name: 'axios', description: 'Promise based HTTP client', globalName: 'axios', order: 2 },
            { name: 'date-fns', description: 'Modern date utility library', globalName: 'dateFns', order: 3 },
            { name: 'uuid', description: 'Generate RFC-compliant UUIDs', globalName: 'uuid', order: 4 },
            { name: 'dayjs', description: 'Fast 2kB alternative to Moment.js', globalName: 'dayjs', order: 5 },
            { name: 'ramda', description: 'Practical functional library', globalName: 'R', order: 6 },
        ];
    }
}

// Export singleton instance
export const popularPackagesService = new PopularPackagesService();
