import React, { useState } from 'react';
import { useEditorSettingsContext } from '../../hooks/useEditorSettings';
import { useTheme, Theme, MonacoTheme } from '../../hooks/useTheme';

interface EditorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditorSettings: React.FC<EditorSettingsProps> = ({ isOpen, onClose }) => {
  const { theme, monacoTheme, setMonacoTheme } = useTheme();
  const { settings, updateSetting, resetToDefaults } = useEditorSettingsContext();
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'advanced' | 'themes'>('appearance');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl max-h-[90vh] ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-4 border-b flex items-center justify-between`}>
          <h2 className={`text-xl font-semibold ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
            Editor Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${theme === Theme.Dark ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'} transition-colors`}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className={`${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-100'} px-6 py-2 border-b`}>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'appearance'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
                            Appearance
            </button>
            <button
              onClick={() => setActiveTab('behavior')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'behavior'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Behavior
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'advanced'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Advanced
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'themes'
                  ? theme === Theme.Dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  : theme === Theme.Dark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Themes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                  Visual Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Font Size: {settings.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show Line Numbers
                    </label>
                    <button
                      onClick={() => updateSetting('lineNumbers', !settings.lineNumbers)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.lineNumbers
                          ? theme === Theme.Dark ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === Theme.Dark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.lineNumbers ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Show Minimap
                    </label>
                    <button
                      onClick={() => updateSetting('minimap', !settings.minimap)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.minimap
                          ? theme === Theme.Dark ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === Theme.Dark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.minimap ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Word Wrap
                    </label>
                    <button
                      onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.wordWrap
                          ? theme === Theme.Dark ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === Theme.Dark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.wordWrap ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                  Editor Behavior
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tab Size: {settings.tabSize} spaces
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={settings.tabSize}
                      onChange={(e) => updateSetting('tabSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Multi-cursor Modifier
                    </label>
                    <select
                      value={settings.multiCursorModifier}
                      onChange={(e) => updateSetting('multiCursorModifier', e.target.value as 'ctrlCmd' | 'alt')}
                      className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="ctrlCmd">Ctrl/Cmd + Click</option>
                      <option value="alt">Alt + Click</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Multi-cursor Paste Behavior
                    </label>
                    <select
                      value={settings.multiCursorPaste}
                      onChange={(e) => updateSetting('multiCursorPaste', e.target.value as 'spread' | 'full')}
                      className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="spread">Spread to each cursor</option>
                      <option value="full">Paste full content</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                  Advanced Features
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Code Folding Controls
                    </label>
                    <select
                      value={settings.showFoldingControls}
                      onChange={(e) => updateSetting('showFoldingControls', e.target.value as 'always' | 'mouseover')}
                      className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="always">Always show</option>
                      <option value="mouseover">Show on hover</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Folding Strategy
                    </label>
                    <select
                      value={settings.foldingStrategy}
                      onChange={(e) => updateSetting('foldingStrategy', e.target.value as 'auto' | 'indentation')}
                      className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="auto">Auto (language-based)</option>
                      <option value="indentation">Indentation-based</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Folding Highlight
                    </label>
                    <button
                      onClick={() => updateSetting('foldingHighlight', !settings.foldingHighlight)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.foldingHighlight
                          ? theme === Theme.Dark ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === Theme.Dark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.foldingHighlight ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Find: Add Extra Space
                    </label>
                    <button
                      onClick={() => updateSetting('findAddExtraSpaceOnTop', !settings.findAddExtraSpaceOnTop)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings.findAddExtraSpaceOnTop
                          ? theme === Theme.Dark ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === Theme.Dark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.findAddExtraSpaceOnTop ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Find: Auto Find in Selection
                    </label>
                    <select
                      value={settings.findAutoFindInSelection}
                      onChange={(e) => updateSetting('findAutoFindInSelection', e.target.value as 'never' | 'always' | 'multiline')}
                      className={`w-full px-3 py-2 rounded-md border ${theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="never">Never</option>
                      <option value="always">Always</option>
                      <option value="multiline">Multiline only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${theme === Theme.Dark ? 'text-white' : 'text-gray-800'}`}>
                  Editor Themes
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Monaco Editor Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(MonacoTheme).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => setMonacoTheme(value)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            monacoTheme === value
                              ? theme === Theme.Dark ? 'bg-blue-600 border-blue-500 text-white' : 'bg-blue-500 border-blue-400 text-white'
                              : theme === Theme.Dark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {key === 'Light' ? 'VS Light' : 
                             key === 'Dark' ? 'VS Dark' :
                             key === 'Monokai' ? 'Monokai' :
                             key === 'Dracula' ? 'Dracula' :
                             key === 'Solarized' ? 'Solarized Dark' :
                             key === 'GitHub' ? 'GitHub Dark' :
                             key === 'OneDark' ? 'One Dark Pro' : key}
                          </div>
                          <div className={`text-xs mt-1 ${
                            monacoTheme === value ? 'text-blue-100' : theme === Theme.Dark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {value}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${theme === Theme.Dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-medium mb-2 ${theme === Theme.Dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Theme Preview
                    </h4>
                    <div className={`p-3 rounded border font-mono text-sm ${theme === Theme.Dark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="text-gray-500">// Theme preview</div>
                      <div className="text-blue-400">function</div> <div className="text-green-400">hello</div><div className="text-white">() {`{`}</div>
                      <div className="text-yellow-400 ml-4">console.log</div><div className="text-white">(</div><div className="text-orange-400">'Hello, World!'</div><div className="text-white">);</div>
                      <div className="text-white">{`}`}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between items-center">
              <div className={`text-sm ${theme === Theme.Dark ? 'text-gray-400' : 'text-gray-600'}`}>
                Settings are automatically saved
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
                    resetToDefaults();
                  }
                }}
                className={`px-4 py-2 text-sm rounded-md ${theme === Theme.Dark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'} transition-colors`}
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorSettings;
