import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Copy, Download, Wand2, Sparkles, Save, Trash2, Highlighter, Upload, FileDown } from 'lucide-react';
import { convertTextToTemplate, enhanceTemplate } from './lib/gemini';

interface SavedTemplate {
  id: string;
  name: string;
  content: string;
}

export default function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Converter State
  const [rawInput, setRawInput] = useState("Berlin Branch Office\nAddress: xkqjrt Street, Building 482\nTEL: 91-4827-1934\nFAX: 73-9281-6652");
  const [generatedTemplate, setGeneratedTemplate] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Templates State
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    const saved = localStorage.getItem('smart-templates-v2');
    if (saved) {
      try {
        setSavedTemplates(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved templates", e);
      }
    }
  }, []);

  const saveTemplatesToStorage = (templates: SavedTemplate[]) => {
    setSavedTemplates(templates);
    localStorage.setItem('smart-templates-v2', JSON.stringify(templates));
  };

  // --- Actions ---

  const handleConvert = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter some text to convert.");
      return;
    }
    setIsConverting(true);
    try {
      const result = await convertTextToTemplate(rawInput);
      setGeneratedTemplate(result);
      toast.success("Template generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to convert text.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleEnhance = async () => {
    if (!generatedTemplate.trim()) {
      toast.error("Please generate or provide a template first.");
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceTemplate(generatedTemplate);
      setGeneratedTemplate(result);
      toast.success("Template enhanced successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to enhance template.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = () => {
    if (!generatedTemplate.trim()) return;
    const name = prompt("Enter a name for this template:", `Template ${savedTemplates.length + 1}`);
    if (name) {
      const newTemplates = [...savedTemplates, { id: Date.now().toString(), name, content: generatedTemplate }];
      saveTemplatesToStorage(newTemplates);
      toast.success("Template saved!");
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const newTemplates = savedTemplates.filter(t => t.id !== id);
    saveTemplatesToStorage(newTemplates);
    toast.success("Template deleted.");
  };

  const handleUseTemplate = (content: string) => {
    setGeneratedTemplate(content);
    toast.success("Template loaded!");
  };

  const handleExportTemplates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedTemplates));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "smart_templates_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportTemplates = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...savedTemplates, ...imported];
          // Deduplicate by ID just in case
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          saveTemplatesToStorage(unique);
          toast.success("Templates imported successfully!");
        }
      } catch (err) {
        toast.error("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  // --- Render Helpers ---

  const renderHighlightedText = (text: string) => {
    // Simple regex for demo highlighting
    // Numbers: green, Capitalized words (Cities/Names): purple, Other words: blue
    const parts = text.split(/(\b\d+\b|\b[A-Z][a-z]+\b|\b[a-z]+\b)/g);
    
    return parts.map((part, i) => {
      if (/\b\d+\b/.test(part)) {
        return <span key={i} className="bg-emerald-500/20 text-emerald-400 rounded px-0.5">{part}</span>;
      } else if (/\b[A-Z][a-z]+\b/.test(part)) {
        return <span key={i} className="bg-purple-500/20 text-purple-400 rounded px-0.5">{part}</span>;
      } else if (/\b[a-z]+\b/.test(part)) {
        return <span key={i} className="bg-blue-500/20 text-blue-400 rounded px-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
      
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-lg hidden sm:block">Smart Template AI</span>
          </div>
          
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            <button 
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              Converter
            </button>
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${showSidebar ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:text-white'}`}
            >
              Templates
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Upgrade
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel */}
        <div className="flex-1 flex flex-col p-6 border-r border-white/10 relative">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Paste Your Raw Contact Data
            </h2>
            <button 
              onClick={() => setShowHighlights(!showHighlights)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${showHighlights ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <Highlighter className="w-3 h-3" /> 
              {showHighlights ? 'Hide Highlights' : 'Show Highlights'}
            </button>
          </div>
          
          <div className="flex-1 relative rounded-xl border border-white/10 bg-[#111] overflow-hidden group focus-within:border-blue-500/50 transition-all shadow-inner">
            {showHighlights ? (
              <div className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap overflow-auto text-zinc-300 leading-relaxed">
                {renderHighlightedText(rawInput)}
              </div>
            ) : (
              <textarea 
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 bg-transparent resize-none outline-none font-mono text-sm text-zinc-300 leading-relaxed placeholder:text-zinc-700"
                placeholder="Paste raw text here..."
              />
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col p-6 bg-[#0f0f0f]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Generated Template
            </h2>
          </div>
          
          <div className="flex-1 relative rounded-xl border border-white/10 bg-[#111] overflow-hidden shadow-inner">
            <textarea 
              value={generatedTemplate}
              onChange={(e) => setGeneratedTemplate(e.target.value)}
              className="absolute inset-0 w-full h-full p-4 bg-transparent resize-none outline-none font-mono text-sm text-zinc-300 leading-relaxed placeholder:text-zinc-700"
              placeholder="Template will appear here..."
            />
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
          <button 
            onClick={handleConvert}
            disabled={isConverting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isConverting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Convert
          </button>
          
          <button 
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isEnhancing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Enhance
          </button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <button 
            onClick={() => handleCopy(generatedTemplate)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-medium transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy</span>
          </button>
          
          <button 
            onClick={() => handleDownload(generatedTemplate, 'smart_template_output.txt')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#333] text-white font-medium transition-colors border border-white/5"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 border-l border-white/10 bg-[#0a0a0a] flex flex-col z-40 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">Saved Templates</h3>
              <button onClick={handleSaveTemplate} className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <Save className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {savedTemplates.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-sm">
                  No templates saved yet.
                </div>
              ) : (
                savedTemplates.map(template => (
                  <div key={template.id} className="bg-white/5 border border-white/10 rounded-lg p-3 group">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-zinc-200 truncate pr-2">{template.name}</h4>
                      <button onClick={() => handleDeleteTemplate(template.id)} className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono line-clamp-2 mb-3">{template.content}</p>
                    <button 
                      onClick={() => handleUseTemplate(template.content)}
                      className="w-full py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                    >
                      Load Template
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-2">
              <button 
                onClick={handleExportTemplates}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors text-zinc-300"
              >
                <FileDown className="w-3.5 h-3.5" /> Export
              </button>
              <label className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors text-zinc-300 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Import
                <input type="file" accept=".json" className="hidden" onChange={handleImportTemplates} />
              </label>
            </div>
          </aside>
        )}

      </main>
      
      <Toaster theme="dark" />
    </div>
  );
}
