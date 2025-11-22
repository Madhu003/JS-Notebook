// Package type definitions for NPM package manager
export interface PackageInfo {
    name: string;
    version: string;
    installedAt: number;
    cdnUrl: string;
    status: 'installed' | 'loading' | 'error';
    error?: string;
}

export interface InstallPackageOptions {
    version?: string;
    loadTypes?: boolean; // Load @types if available
}

export interface PackageStorage {
    packages: PackageInfo[];
}
