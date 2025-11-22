// React hook for NPM package management
import { useState, useEffect, useCallback } from 'react';
import { packageManager } from '../services/packageManager';
import type { PackageInfo, InstallPackageOptions } from '../types/models/Package';

export const usePackageManager = () => {
    const [packages, setPackages] = useState<PackageInfo[]>([]);
    const [isInstalling, setIsInstalling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load packages on mount
    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = useCallback(() => {
        const allPackages = packageManager.getAllPackages();
        setPackages(allPackages);
    }, []);

    const install = useCallback(async (packageName: string, options?: InstallPackageOptions) => {
        setIsInstalling(true);
        setError(null);

        try {
            await packageManager.installPackage(packageName, options);
            loadPackages();
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to install package';
            setError(errorMessage);
            console.error('Package installation error:', err);
            return false;
        } finally {
            setIsInstalling(false);
        }
    }, [loadPackages]);

    const uninstall = useCallback((packageName: string) => {
        const success = packageManager.uninstallPackage(packageName);
        if (success) {
            loadPackages();
        }
        return success;
    }, [loadPackages]);

    const clearAll = useCallback(() => {
        packageManager.clearAllPackages();
        loadPackages();
    }, [loadPackages]);

    const isInstalled = useCallback((packageName: string) => {
        return packageManager.isPackageInstalled(packageName);
    }, []);

    const getInstalledPackages = useCallback(() => {
        return packageManager.listInstalledPackages();
    }, []);

    return {
        packages,
        install,
        uninstall,
        clearAll,
        isInstalling,
        error,
        isInstalled,
        getInstalledPackages,
        refresh: loadPackages,
    };
};
