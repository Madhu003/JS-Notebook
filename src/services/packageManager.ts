// NPM Package Manager Service
// Allows dynamic installation of packages from unpkg.com CDN

import type { PackageInfo, InstallPackageOptions, PackageStorage } from '../types/models/Package';

const STORAGE_KEY = 'js-notebook-packages';
const CDN_BASE = 'https://unpkg.com';

class PackageManagerService {
    private packages: Map<string, PackageInfo> = new Map();
    private loadingPackages: Set<string> = new Set();

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Install a package from unpkg.com CDN
     */
    async installPackage(
        packageName: string,
        options: InstallPackageOptions = {}
    ): Promise<PackageInfo> {
        // Sanitize package name
        const sanitizedName = this.sanitizePackageName(packageName);

        if (!sanitizedName) {
            throw new Error('Invalid package name');
        }

        // Check if already installed
        if (this.packages.has(sanitizedName)) {
            const existing = this.packages.get(sanitizedName)!;
            if (existing.status === 'installed') {
                console.log(`Package ${sanitizedName} is already installed`);
                return existing;
            }
        }

        // Check if currently loading
        if (this.loadingPackages.has(sanitizedName)) {
            throw new Error(`Package ${sanitizedName} is currently being installed`);
        }

        this.loadingPackages.add(sanitizedName);

        const version = options.version || 'latest';
        const cdnUrl = `${CDN_BASE}/${sanitizedName}${version !== 'latest' ? `@${version}` : ''}`;

        // Create package info with loading status
        const packageInfo: PackageInfo = {
            name: sanitizedName,
            version: version,
            installedAt: Date.now(),
            cdnUrl,
            status: 'loading',
        };

        this.packages.set(sanitizedName, packageInfo);
        this.saveToStorage();

        try {
            await this.loadScript(cdnUrl);

            // Update status to installed
            packageInfo.status = 'installed';
            this.packages.set(sanitizedName, packageInfo);
            this.saveToStorage();

            console.log(`✅ Successfully installed ${sanitizedName}@${version}`);
            return packageInfo;
        } catch (error) {
            // Update status to error
            const errorMessage = error instanceof Error ? error.message : 'Failed to load package';
            packageInfo.status = 'error';
            packageInfo.error = errorMessage;
            this.packages.set(sanitizedName, packageInfo);
            this.saveToStorage();

            throw new Error(`Failed to install ${sanitizedName}: ${errorMessage}`);
        } finally {
            this.loadingPackages.delete(sanitizedName);
        }
    }

    /**
     * Uninstall a package
     */
    uninstallPackage(packageName: string): boolean {
        const sanitizedName = this.sanitizePackageName(packageName);

        if (!sanitizedName || !this.packages.has(sanitizedName)) {
            return false;
        }

        this.packages.delete(sanitizedName);
        this.saveToStorage();

        console.log(`🗑️ Uninstalled ${sanitizedName}`);
        return true;
    }

    /**
     * Get list of all installed packages
     */
    listInstalledPackages(): PackageInfo[] {
        return Array.from(this.packages.values())
            .filter(pkg => pkg.status === 'installed')
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get all packages including loading and errored ones
     */
    getAllPackages(): PackageInfo[] {
        return Array.from(this.packages.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Check if a package is installed
     */
    isPackageInstalled(packageName: string): boolean {
        const sanitizedName = this.sanitizePackageName(packageName);
        const pkg = this.packages.get(sanitizedName);
        return pkg?.status === 'installed' || false;
    }

    /**
     * Get package info
     */
    getPackageInfo(packageName: string): PackageInfo | undefined {
        const sanitizedName = this.sanitizePackageName(packageName);
        return this.packages.get(sanitizedName);
    }

    /**
     * Clear all packages
     */
    clearAllPackages(): void {
        this.packages.clear();
        this.saveToStorage();
        console.log('🗑️ Cleared all packages');
    }

    /**
     * Get package context for code execution
     */
    getPackageContext(): Record<string, any> {
        const context: Record<string, any> = {};

        this.listInstalledPackages().forEach(pkg => {
            // Try to find the package in window object
            // Common patterns: window.packageName, window.PackageName, window._
            const possibleNames = [
                pkg.name,
                pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1),
                pkg.name.replace(/-/g, ''),
            ];

            for (const name of possibleNames) {
                if ((window as any)[name]) {
                    context[pkg.name] = (window as any)[name];
                    break;
                }
            }
        });

        return context;
    }

    // Private methods

    private sanitizePackageName(name: string): string {
        // Remove any potentially dangerous characters
        // Allow: letters, numbers, hyphens, underscores, @, /
        const sanitized = name.replace(/[^a-zA-Z0-9\-_@\/]/g, '');
        return sanitized;
    }

    private loadScript(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            script.onload = () => {
                console.log(`Loaded script: ${url}`);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.appendChild(script);
        });
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data: PackageStorage = JSON.parse(stored);
                data.packages.forEach(pkg => {
                    // Only load packages that were previously installed successfully
                    if (pkg.status === 'installed') {
                        this.packages.set(pkg.name, pkg);
                        // Reload the script on page load
                        this.loadScript(pkg.cdnUrl).catch(err => {
                            console.error(`Failed to reload package ${pkg.name}:`, err);
                            pkg.status = 'error';
                            pkg.error = 'Failed to reload on startup';
                            this.packages.set(pkg.name, pkg);
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load packages from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            const data: PackageStorage = {
                packages: Array.from(this.packages.values()),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save packages to storage:', error);
        }
    }
}

// Export singleton instance
export const packageManager = new PackageManagerService();
