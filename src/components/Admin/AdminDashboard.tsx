import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Trash2, Plus, Type, Key, Save, Palette, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { ICON_KEYS } from '../../utils/constants';

export const AdminDashboard: React.FC = () => {
  const { templates, deleteTemplate, fonts, addFont, removeFont, apiConfig, updateApiConfig, uiConfig, updateUiConfig } = useEditor();
  const [newFontName, setNewFontName] = useState('');
  const [newFontFamily, setNewFontFamily] = useState('');
  
  const [kieKeyInput, setKieKeyInput] = useState(apiConfig.kieAiKey);
  const [imgbbKeyInput, setImgbbKeyInput] = useState(apiConfig.imgbbKey);
  
  const [iconColorInput, setIconColorInput] = useState(uiConfig.iconColor);
  const [customIconsInput, setCustomIconsInput] = useState<Record<string, string>>({ ...uiConfig.customIcons });
  const [iconColorsInput, setIconColorsInput] = useState<Record<string, string>>({ ...uiConfig.iconColors });
  
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('');

  const handleAddFont = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFontName && newFontFamily) {
      addFont({ name: newFontName, family: newFontFamily });
      setNewFontName('');
      setNewFontFamily('');
    }
  };

  const handleIconUrlChange = (key: string, url: string) => {
    setCustomIconsInput(prev => ({
      ...prev,
      [key]: url
    }));
  };

  const handleSaveConfig = () => {
    updateApiConfig({ 
        kieAiKey: kieKeyInput,
        imgbbKey: imgbbKeyInput
    });
    updateUiConfig({
        iconColor: iconColorInput,
        customIcons: customIconsInput,
        iconColors: iconColorsInput
    });
    setSaveStatus('Saved!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const formatKeyName = (key: string) => {
    return key
        .replace('SIDEBAR_', 'Sidebar: ')
        .replace('TOOLBAR_', 'Toolbar: ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8 touch-manipulation">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500">Manage your design templates, fonts, and API keys</p>
          </div>
          <Link to="/" className="px-4 sm:px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shadow-md transition-all touch-manipulation active:scale-95">
            <Plus size={18} className="sm:w-5 sm:h-5" /> Open Editor
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* System Configuration */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h2 className="font-semibold text-sm sm:text-base text-gray-700 flex items-center gap-2">
                        <Key size={16} className="sm:w-4 sm:h-4" /> System Configuration
                    </h2>
                    {saveStatus && <span className="text-xs sm:text-sm text-green-600 font-medium animate-fade-in">{saveStatus}</span>}
                </div>

                <div className="p-4 sm:p-6 grid grid-cols-1 gap-6 sm:gap-8">
                    {/* API Keys Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KIE.ai API Key</label>
                            <input 
                                type="password" 
                                value={kieKeyInput}
                                onChange={(e) => setKieKeyInput(e.target.value)}
                                placeholder="Enter KIE.ai Key"
                                className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Required for AI Generation & Editing.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ImgBB API Key</label>
                            <input 
                                type="password" 
                                value={imgbbKeyInput}
                                onChange={(e) => setImgbbKeyInput(e.target.value)}
                                placeholder="Enter ImgBB Key"
                                className="w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Required to upload images for AI editing. <a href="https://api.imgbb.com/" target="_blank" className="text-indigo-600 underline">Get free key</a>
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 sm:pt-6">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <Palette size={14} className="sm:w-4 sm:h-4" /> Theme & Icons
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                            {/* Global Color Picker */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Global Default Icon Color</label>
                                <HexColorPicker color={iconColorInput} onChange={setIconColorInput} />
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: iconColorInput }}></div>
                                    <span className="text-xs sm:text-sm text-gray-600">{iconColorInput}</span>
                                </div>
                            </div>

                            {/* Icon Management List */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Individual Icon Customization</label>
                                <p className="text-xs text-gray-500 mb-3">Customize colors or upload custom icons for specific tools.</p>

                                <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 pb-2">
                                    {Object.entries(ICON_KEYS).map(([keyName, keyValue]) => (
                                        <div key={keyValue} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-200 transition-colors">
                                            <span className="text-xs font-semibold text-gray-600 w-full sm:w-32 truncate" title={keyName}>
                                                {formatKeyName(keyName)}
                                            </span>
                                            
                                            {/* Color Picker Trigger */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveColorPicker(activeColorPicker === keyValue ? null : keyValue)}
                                                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                                                    style={{ backgroundColor: iconColorsInput[keyValue] || iconColorInput }}
                                                    title="Change Color"
                                                >
                                                    {!iconColorsInput[keyValue] && <div className="w-full h-px bg-white/50 rotate-45 absolute" />}
                                                </button>
                                                
                                                {activeColorPicker === keyValue && (
                                                    <div className="absolute top-full left-0 mt-2 z-50">
                                                        <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                                        <div className="relative bg-white p-3 rounded-lg shadow-xl border border-gray-100 z-50">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-bold text-gray-500">Pick Color</span>
                                                                <button onClick={() => setActiveColorPicker(null)}><X size={14} className="text-gray-400 hover:text-gray-600"/></button>
                                                            </div>
                                                            <HexColorPicker 
                                                                color={iconColorsInput[keyValue] || iconColorInput} 
                                                                onChange={(c) => setIconColorsInput(prev => ({ ...prev, [keyValue]: c }))} 
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    const newColors = { ...iconColorsInput };
                                                                    delete newColors[keyValue];
                                                                    setIconColorsInput(newColors);
                                                                    setActiveColorPicker(null);
                                                                }}
                                                                className="mt-3 w-full py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-100 font-medium"
                                                            >
                                                                Reset to Global
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* URL Input */}
                                            <input
                                                type="text"
                                                value={customIconsInput[keyValue] || ''}
                                                onChange={(e) => handleIconUrlChange(keyValue, e.target.value)}
                                                className="flex-1 w-full sm:w-auto text-xs border-gray-300 rounded-md shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Custom Icon URL (Optional)"
                                            />

                                            {/* Preview */}
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded border border-gray-200 shrink-0">
                                                {customIconsInput[keyValue] ? (
                                                    <img src={customIconsInput[keyValue]} className="w-5 h-5 object-contain" alt="preview" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: iconColorsInput[keyValue] || iconColorInput }} />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-gray-50 border-t border-gray-200 pt-4">
                    <button
                        onClick={handleSaveConfig}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 ml-auto text-sm sm:text-base"
                    >
                        <Save size={14} className="sm:w-4 sm:h-4" /> Save All Changes
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Templates Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-sm sm:text-base text-gray-700 flex items-center gap-2">
                        <Type size={16} className="sm:w-4 sm:h-4" /> Templates
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {templates.map((template) => (
                            <tr key={template.id}>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <img src={template.thumbnail} alt="" className="h-10 w-16 sm:h-12 sm:w-20 object-cover rounded border" />
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium text-gray-900">{template.name}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                <button
                                onClick={() => deleteTemplate(template.id)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1 justify-end ml-auto"
                                >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Delete</span>
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fonts Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-sm sm:text-base text-gray-700 flex items-center gap-2">
                        <Type size={16} className="sm:w-4 sm:h-4" /> Font Management
                    </h2>
                </div>

                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50/50">
                    <form onSubmit={handleAddFont} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Pacifico"
                                value={newFontName}
                                onChange={e => setNewFontName(e.target.value)}
                                className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Google Font Family</label>
                            <input
                                type="text"
                                placeholder="e.g. Pacifico"
                                value={newFontFamily}
                                onChange={e => setNewFontFamily(e.target.value)}
                                className="w-full text-xs sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-indigo-700"
                        >
                            Add
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family Param</th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {fonts.map((font) => (
                            <tr key={font.name}>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium text-gray-900" style={{ fontFamily: font.name }}>{font.name}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {font.family}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                <button
                                onClick={() => removeFont(font.name)}
                                className="text-red-600 hover:text-red-900 flex items-center gap-1 justify-end ml-auto"
                                >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
