import React, { useState, useEffect } from 'react';
import { usePackageManager } from '../../hooks/usePackageManager';
import { useTheme, Theme } from '../../hooks/useTheme';
import { popularPackagesService, PopularPackage } from '../../services/popularPackagesService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

interface PackageManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PackageManager: React.FC<PackageManagerProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const {
    packages,
    install,
    uninstall,
    clearAll,
    isInstalling,
    error,
    isInstalled,
    getInstalledPackages,
  } = usePackageManager();

  const [activeTab, setActiveTab] = useState<'install' | 'installed' | 'popular'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [packageVersion, setPackageVersion] = useState('');
  const [popularPackages, setPopularPackages] = useState<PopularPackage[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Load popular packages from Firebase on mount
  useEffect(() => {
    const loadPopularPackages = async () => {
      setLoadingPopular(true);
      try {
        const packages = await popularPackagesService.getPopularPackages();
        setPopularPackages(packages);
      } catch (error) {
        console.error('Failed to load popular packages:', error);
      } finally {
        setLoadingPopular(false);
      }
    };

    if (isOpen) {
      loadPopularPackages();
    }
  }, [isOpen]);

  const handleInstall = async (packageName: string, version?: string) => {
    const success = await install(packageName, { version });
    if (success) {
      setSearchQuery('');
      setPackageVersion('');
      setActiveTab('installed');
    }
  };

  const handleUninstall = (packageName: string) => {
    if (window.confirm(`Are you sure you want to uninstall ${packageName}?`)) {
      uninstall(packageName);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to uninstall all packages?')) {
      clearAll();
    }
  };

  const installedPackages = getInstalledPackages();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-3xl max-h-[90vh] ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-4 border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
            NPM Package Manager
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors`}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-2 border-b`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'popular'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'install'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Install
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'installed'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Installed ({installedPackages.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error Display */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${theme === Theme.Dark ? 'bg-red-900/20 border border-red-700 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Popular Tab */}
          {activeTab === 'popular' && (
            <div className="space-y-3">
              <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                Popular Packages
              </h3>
              
              {loadingPopular ? (
                <div className="flex justify-center items-center py-12">
                  <CircularProgress size={40} className={theme === Theme.Dark ? 'text-blue-400' : 'text-blue-600'} />
                  <span className={`ml-3 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-600'}`}>Loading packages...</span>
                </div>
              ) : popularPackages.length === 0 ? (
                <div className={`text-center py-12 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>No popular packages available.</p>
                  <p className="text-sm mt-2">Check your connection or try again later.</p>
                </div>
              ) : (
                popularPackages.map((pkg) => {
                const installed = isInstalled(pkg.name);
                return (
                  <div
                    key={pkg.name}
                    className={`p-4 rounded-lg border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                            {pkg.name}
                          </h4>
                          {installed && (
                            <span className="flex items-center gap-1 text-green-500 text-sm">
                              <CheckCircleIcon fontSize="small" />
                              Installed
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {pkg.description}
                        </p>
                        <p className={`text-xs mt-1 ${theme === Theme.Dark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Global: <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">window.{pkg.globalName}</code>
                        </p>
                      </div>
                      <div className="ml-4">
                        {installed ? (
                          <button
                            onClick={() => handleUninstall(pkg.name)}
                            disabled={isInstalling}
                            className={`px-4 py-2 text-sm rounded-md ${theme === Theme.Dark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} disabled:opacity-50 transition-colors`}
                          >
                            Uninstall
                          </button>
                        ) : (
                          <button
                            onClick={() => handleInstall(pkg.name)}
                            disabled={isInstalling}
                            className={`px-4 py-2 text-sm rounded-md ${theme === Theme.Dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-50 transition-colors flex items-center gap-2`}
                          >
                            {isInstalling ? <CircularProgress size={16} className="text-white" /> : null}
                            Install
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          )}

          {/* Install Tab */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                Install Package
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Package Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., lodash, axios, uuid"
                      className={`w-full pl-10 pr-4 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                    />
                    <SearchIcon className={`absolute left-3 top-2.5 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Version (Optional)
                  </label>
                  <input
                    type="text"
                    value={packageVersion}
                    onChange={(e) => setPackageVersion(e.target.value)}
                    placeholder="e.g., 4.17.21 or leave empty for latest"
                    className={`w-full px-4 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                  />
                </div>

                <button
                  onClick={() => searchQuery && handleInstall(searchQuery, packageVersion || undefined)}
                  disabled={!searchQuery || isInstalling}
                  className={`w-full px-4 py-2 rounded-md ${theme === Theme.Dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
                >
                  {isInstalling ? <CircularProgress size={20} className="text-white" /> : null}
                  Install Package
                </button>
              </div>

              <div className={`mt-6 p-4 rounded-lg ${theme === Theme.Dark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                <h4 className={`text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-blue-200' : 'text-blue-800'}`}>
                  How to use installed packages:
                </h4>
                <ul className={`text-sm space-y-1 ${theme === Theme.Dark ? 'text-blue-300' : 'text-blue-700'}`}>
                  <li>• Packages are loaded from unpkg.com CDN</li>
                  <li>• Access via <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">window.packageName</code></li>
                  <li>• Example: <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded">const _ = window._</code> for lodash</li>
                  <li>• Packages persist across sessions</li>
                </ul>
              </div>
            </div>
          )}

          {/* Installed Tab */}
          {activeTab === 'installed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                  Installed Packages ({installedPackages.length})
                </h3>
                {installedPackages.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className={`px-3 py-1 text-sm rounded-md ${theme === Theme.Dark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} transition-colors flex items-center gap-1`}
                  >
                    <DeleteIcon fontSize="small" />
                    Clear All
                  </button>
                )}
              </div>

              {installedPackages.length === 0 ? (
                <div className={`text-center py-12 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>No packages installed yet.</p>
                  <p className="text-sm mt-2">Install some packages to get started!</p>
                </div>
              ) : (
                installedPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className={`p-4 rounded-lg border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                            {pkg.name}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${theme === Theme.Dark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                            {pkg.version}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(pkg.installedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUninstall(pkg.name)}
                        className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} transition-colors`}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageManager;
