import React, { useState, useEffect } from 'react';
import PreWeddingGen from './components/PreWeddingGen';
import { Toaster } from 'sonner';
import { Heart } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else {
        // Fallback for environments without the wrapper, or assume key is set if wrapper is missing
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after dialog interaction to avoid race conditions
      setHasApiKey(true);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <div className="flex justify-center mb-4">
             <div className="bg-slate-700 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-rose-500 fill-current" />
             </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100">Welcome to MoonVeilStudio</h1>
          <p className="text-slate-400">
            To use our premium photo generation features (powered by Gemini 3 Pro), please select a paid API key from your Google Cloud project.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-lg shadow-rose-900/20"
          >
            Select API Key
          </button>
          <div className="pt-2">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-rose-400 underline transition-colors"
            >
              Read Billing Documentation
            </a>
          </div>
        </div>
    <Toaster richColors position="top-center" />
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
              </div>
              <span className="text-xl font-serif font-bold text-slate-100 tracking-wide">
                MoonVeil<span className="text-rose-500">Studio</span>
              </span>
            </div>
            
            {/* Single Page - No Navigation Needed */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
         <PreWeddingGen />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm bg-slate-900">
        <p>&copy; {new Date().getFullYear()} MoonVeilStudio. Powered by MoonVeilStudio IT.</p>
      </footer>
      <Toaster richColors position="top-center" />
    </div>
  );
};

export default App;