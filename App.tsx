
import React, { useState, useCallback } from 'react';
import { generateQuotes } from './services/geminiService';
import { QuoteData, QuoteStyle, VisualSettings, FontFamily, BackgroundType } from './types';
import QuoteCanvas from './components/QuoteCanvas';

const PRESET_COLORS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#f43f5e', '#f59e0b', 
  '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#000000'
];

const PRESET_BG_COLORS = [
  '#0f172a', '#1e293b', '#312e81', '#4c1d95', '#be123c',
  '#111827', '#064e3b', '#451a03', '#1e1b4b', '#000000'
];

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [signature, setSignature] = useState('');
  const [details, setDetails] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<QuoteStyle>(QuoteStyle.MODERN);
  const [exportedImages, setExportedImages] = useState<string[]>([]);

  // Enhanced visual settings state
  const [settings, setSettings] = useState<VisualSettings>({
    fontFamily: FontFamily.SANS,
    fontColor: '#ffffff',
    bgColor: '#1e293b',
    bgType: BackgroundType.GRADIENT
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!topic || !signature) {
      alert("Please enter a topic and a signature name.");
      return;
    }

    setLoading(true);
    setQuotes([]);
    setExportedImages([]);
    
    try {
      const result = await generateQuotes({
        topic,
        details,
        signature,
        count: 5
      });
      setQuotes(result);
    } catch (err) {
      alert("Failed to generate quotes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = useCallback((dataUrl: string, index: number) => {
    setExportedImages(prev => {
      const newImages = [...prev];
      newImages[index] = dataUrl;
      return newImages;
    });
  }, []);

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `BigSteel_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearForm = () => {
    setTopic('');
    setSignature('');
    setDetails('');
    setImage(null);
    setQuotes([]);
    setExportedImages([]);
    setSettings({
      fontFamily: FontFamily.SANS,
      fontColor: '#ffffff',
      bgColor: '#1e293b',
      bgType: BackgroundType.GRADIENT
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fas fa-quote-right text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Big Steel Studio</h1>
          </div>
          <button 
            onClick={clearForm}
            className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            Reset All
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <i className="fas fa-pen-to-square text-indigo-500"></i>
                1. Content
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Theme</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Resilience, Leadership, Success"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Signature Name</label>
                  <input 
                    type="text" 
                    placeholder="Your Name or Brand"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specific Details (Optional)</label>
                  <textarea 
                    rows={2}
                    placeholder="Tone or specific audience details..."
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <i className="fas fa-palette text-indigo-500"></i>
                2. Fine-tune Style
              </h2>
              
              <div className="space-y-5">
                {/* Background Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background Basis</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.values(BackgroundType).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSettings(s => ({ ...s, bgType: type }))}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                          settings.bgType === type 
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {PRESET_BG_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(s => ({ ...s, bgColor: color }))}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${settings.bgColor === color ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-white'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  <div className="relative mt-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Or Photo</label>
                    <input 
                      type="file" 
                      id="bg-upload"
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <label 
                      htmlFor="bg-upload"
                      className="w-full flex items-center justify-center gap-2 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 text-sm font-medium text-slate-600"
                    >
                      {image ? <><i className="fas fa-check-circle text-green-500"></i> Image Loaded</> : <><i className="fas fa-camera"></i> Upload Personal Photo</>}
                    </label>
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Typography & Color</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.keys(FontFamily).map((key) => (
                      <button
                        key={key}
                        onClick={() => setSettings(s => ({ ...s, fontFamily: (FontFamily as any)[key] }))}
                        className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                          settings.fontFamily === (FontFamily as any)[key] 
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                        style={{ fontFamily: (FontFamily as any)[key] }}
                      >
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSettings(s => ({ ...s, fontColor: color }))}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${settings.fontColor === color ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300'}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Layout Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[QuoteStyle.MODERN, QuoteStyle.ELEGANT, QuoteStyle.BOLD, QuoteStyle.HANDWRITTEN, QuoteStyle.MINIMAL].map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-2 py-1.5 text-[10px] uppercase tracking-wider rounded border transition-all ${
                          selectedStyle === style 
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full mt-8 bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Designing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sparkles"></i>
                    Generate Collection
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8">
            {!quotes.length && !loading && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl text-slate-400 p-12 text-center shadow-sm">
                <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-shapes text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Create Your Visual Legacy</h3>
                <p className="max-w-xs mx-auto text-slate-500">Input your topic and signature to see 5 professional quote designs instantly.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-quote-left text-indigo-600 animate-pulse"></i>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-slate-800 font-bold text-lg">AI is composing your set...</p>
                  <p className="text-slate-400 text-sm">Drafting quotes and applying your unique style signature.</p>
                </div>
              </div>
            )}

            {quotes.length > 0 && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Review Collection</h2>
                    <p className="text-xs text-slate-500">5 High-quality visuals generated for: <span className="text-indigo-600 font-semibold">{topic}</span></p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {quotes.map((q, idx) => (
                    <div key={idx} className="group relative flex flex-col">
                      <QuoteCanvas 
                        quote={q} 
                        style={selectedStyle} 
                        image={image} 
                        settings={settings}
                        index={idx}
                        onExport={(url) => handleExport(url, idx)} 
                      />
                      
                      {exportedImages[idx] ? (
                        <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-200 transition-all group-hover:shadow-2xl group-hover:-translate-y-1 duration-300">
                          <img 
                            src={exportedImages[idx]} 
                            alt={`Quote ${idx + 1}`} 
                            className="w-full h-auto aspect-square object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => downloadImage(exportedImages[idx], idx)}
                              className="bg-white text-indigo-600 px-6 py-3 rounded-xl flex items-center gap-2 font-bold transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl"
                            >
                              <i className="fas fa-download"></i>
                              Download PNG
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin text-indigo-200 text-2xl"></i>
                        </div>
                      )}
                      
                      <div className="mt-3 px-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Card #{idx+1}</span>
                          <button 
                             onClick={() => exportedImages[idx] && downloadImage(exportedImages[idx], idx)}
                             className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <i className="fas fa-save"></i>
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">"{q.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="bg-slate-800 p-1.5 rounded-md text-white">
              <i className="fas fa-quote-right text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">Big Steel Studio</span>
          </div>
          <p className="text-slate-400 text-xs text-center max-w-sm">
            Professional AI-driven quote studio for influencers, authors, and visionaries. Transform wisdom into visual impact.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
