// One-time script to seed popular packages to Firebase
// Run this once to populate the Firestore collection

import { popularPackagesService } from './services/popularPackagesService';

export async function seedPopularPackages() {
    try {
        console.log('🌱 Seeding popular packages to Firebase...');
        await popularPackagesService.seedDefaultPackages();
        console.log('✅ Successfully seeded popular packages!');
        console.log('You can now delete this script or comment out the call.');
    } catch (error) {
        console.error('❌ Failed to seed popular packages:', error);
    }
}

// Uncomment the line below and run this file once to seed the database
// seedPopularPackages();
