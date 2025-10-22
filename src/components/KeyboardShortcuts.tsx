import React, { useState } from 'react';
import { useTheme, Theme } from '../hooks/useTheme';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  category: string;
  shortcuts: {
    keys: string;
    description: string;
    platform?: 'mac' | 'windows' | 'both';
  }[];
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('general');

  const shortcuts: Shortcut[] = [
    {
      category: 'general',
      shortcuts: [
        { keys: 'Cmd+Enter', description: 'Run current cell', platform: 'mac' },
        { keys: 'Ctrl+Enter', description: 'Run current cell', platform: 'windows' },
        { keys: 'Cmd+Shift+F', description: 'Format current cell', platform: 'mac' },
        { keys: 'Ctrl+Shift+F', description: 'Format current cell', platform: 'windows' },
        { keys: 'Cmd+S', description: 'Save notebook', platform: 'mac' },
        { keys: 'Ctrl+S', description: 'Save notebook', platform: 'windows' },
        { keys: 'Cmd+Z', description: 'Undo', platform: 'mac' },
        { keys: 'Ctrl+Z', description: 'Undo', platform: 'windows' },
        { keys: 'Cmd+Y', description: 'Redo', platform: 'mac' },
        { keys: 'Ctrl+Y', description: 'Redo', platform: 'windows' },
      ]
    },
    {
      category: 'editor',
      shortcuts: [
        { keys: 'Cmd+F', description: 'Find in editor', platform: 'mac' },
        { keys: 'Ctrl+F', description: 'Find in editor', platform: 'windows' },
        { keys: 'Cmd+H', description: 'Find and replace', platform: 'mac' },
        { keys: 'Ctrl+H', description: 'Find and replace', platform: 'windows' },
        { keys: 'Cmd+G', description: 'Find next', platform: 'mac' },
        { keys: 'Ctrl+G', description: 'Find next', platform: 'windows' },
        { keys: 'Cmd+Shift+G', description: 'Find previous', platform: 'mac' },
        { keys: 'Ctrl+Shift+G', description: 'Find previous', platform: 'windows' },
        { keys: 'Cmd+D', description: 'Select next occurrence', platform: 'mac' },
        { keys: 'Ctrl+D', description: 'Select next occurrence', platform: 'windows' },
        { keys: 'Cmd+Shift+L', description: 'Select all occurrences', platform: 'mac' },
        { keys: 'Ctrl+Shift+L', description: 'Select all occurrences', platform: 'windows' },
        { keys: 'Cmd+/', description: 'Toggle line comment', platform: 'mac' },
        { keys: 'Ctrl+/', description: 'Toggle line comment', platform: 'windows' },
        { keys: 'Cmd+Shift+A', description: 'Toggle block comment', platform: 'mac' },
        { keys: 'Ctrl+Shift+A', description: 'Toggle block comment', platform: 'windows' },
      ]
    },
    {
      category: 'navigation',
      shortcuts: [
        { keys: 'Cmd+Up', description: 'Move line up', platform: 'mac' },
        { keys: 'Alt+Up', description: 'Move line up', platform: 'windows' },
        { keys: 'Cmd+Down', description: 'Move line down', platform: 'mac' },
        { keys: 'Alt+Down', description: 'Move line down', platform: 'windows' },
        { keys: 'Cmd+Shift+K', description: 'Delete line', platform: 'mac' },
        { keys: 'Ctrl+Shift+K', description: 'Delete line', platform: 'windows' },
        { keys: 'Cmd+Shift+Enter', description: 'Insert line above', platform: 'mac' },
        { keys: 'Ctrl+Shift+Enter', description: 'Insert line above', platform: 'windows' },
        { keys: 'Cmd+Enter', description: 'Insert line below', platform: 'mac' },
        { keys: 'Ctrl+Enter', description: 'Insert line below', platform: 'windows' },
        { keys: 'Cmd+]', description: 'Indent line', platform: 'mac' },
        { keys: 'Ctrl+]', description: 'Indent line', platform: 'windows' },
        { keys: 'Cmd+[', description: 'Outdent line', platform: 'mac' },
        { keys: 'Ctrl+[', description: 'Outdent line', platform: 'windows' },
      ]
    },
    {
      category: 'multi-cursor',
      shortcuts: [
        { keys: 'Cmd+Click', description: 'Add cursor', platform: 'mac' },
        { keys: 'Ctrl+Click', description: 'Add cursor', platform: 'windows' },
        { keys: 'Cmd+Alt+Up', description: 'Add cursor above', platform: 'mac' },
        { keys: 'Ctrl+Alt+Up', description: 'Add cursor above', platform: 'windows' },
        { keys: 'Cmd+Alt+Down', description: 'Add cursor below', platform: 'mac' },
        { keys: 'Ctrl+Alt+Down', description: 'Add cursor below', platform: 'windows' },
        { keys: 'Cmd+Shift+L', description: 'Add cursor to all occurrences', platform: 'mac' },
        { keys: 'Ctrl+Shift+L', description: 'Add cursor to all occurrences', platform: 'windows' },
        { keys: 'Escape', description: 'Exit multi-cursor mode', platform: 'both' },
      ]
    },
    {
      category: 'folding',
      shortcuts: [
        { keys: 'Cmd+Option+[', description: 'Fold region', platform: 'mac' },
        { keys: 'Ctrl+Shift+[', description: 'Fold region', platform: 'windows' },
        { keys: 'Cmd+Option+]', description: 'Unfold region', platform: 'mac' },
        { keys: 'Ctrl+Shift+]', description: 'Unfold region', platform: 'windows' },
        { keys: 'Cmd+K Cmd+0', description: 'Fold all regions', platform: 'mac' },
        { keys: 'Ctrl+K Ctrl+0', description: 'Fold all regions', platform: 'windows' },
        { keys: 'Cmd+K Cmd+J', description: 'Unfold all regions', platform: 'mac' },
        { keys: 'Ctrl+K Ctrl+J', description: 'Unfold all regions', platform: 'windows' },
      ]
    },
    {
      category: 'snippets',
      shortcuts: [
        { keys: 'Tab', description: 'Accept snippet suggestion', platform: 'both' },
        { keys: 'Escape', description: 'Dismiss snippet suggestions', platform: 'both' },
        { keys: 'Cmd+Space', description: 'Trigger suggestions', platform: 'mac' },
        { keys: 'Ctrl+Space', description: 'Trigger suggestions', platform: 'windows' },
      ]
    }
  ];

  const categories = [
    { id: 'general', name: 'General', icon: '⌨️' },
    { id: 'editor', name: 'Editor', icon: '✏️' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'multi-cursor', name: 'Multi-cursor', icon: '👆' },
    { id: 'folding', name: 'Code Folding', icon: '📁' },
    { id: 'snippets', name: 'Snippets', icon: '📝' },
  ];

  const currentShortcuts = shortcuts.find(s => s.category === activeCategory)?.shortcuts || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-4xl max-h-[90vh] ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-4 border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors`}
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className={`w-64 ${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-50'} border-r overflow-y-auto`}>
            <div className="p-4">
              <h3 className={`text-sm font-medium mb-3 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeCategory === category.id
                        ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800 shadow-sm'
                        : theme === Theme.Dark ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className={`text-lg font-medium ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                {categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.name}
              </h3>
              <p className={`text-sm ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Keyboard shortcuts for {categories.find(c => c.id === activeCategory)?.name.toLowerCase()}
              </p>
            </div>

            <div className="space-y-3">
              {currentShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex-1">
                    <p className={`text-sm ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shortcut.description}
                    </p>
                    {shortcut.platform && (
                      <p className={`text-xs mt-1 ${theme === Theme.Dark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {shortcut.platform === 'mac' ? 'macOS' : shortcut.platform === 'windows' ? 'Windows/Linux' : 'All platforms'}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <kbd className={`px-2 py-1 text-xs font-mono rounded ${theme === Theme.Dark ? 'bg-gray-600 text-gray-200 border border-gray-500' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                      {shortcut.keys}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className={`mt-8 p-4 rounded-lg ${theme === Theme.Dark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <h4 className={`text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-blue-200' : 'text-blue-800'}`}>
                💡 Tips
              </h4>
              <ul className={`text-sm space-y-1 ${theme === Theme.Dark ? 'text-blue-300' : 'text-blue-700'}`}>
                <li>• Most shortcuts work in both JavaScript and React editors</li>
                <li>• You can customize many shortcuts in Editor Settings</li>
                <li>• Hold Shift while using navigation shortcuts to select text</li>
                <li>• Use Cmd/Ctrl+K followed by another key for advanced commands</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
