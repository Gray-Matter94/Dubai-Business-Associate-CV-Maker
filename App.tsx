import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { CVInput } from './components/CVInput';
import { CVPreview } from './components/CVPreview';
import { transformCV } from './services/geminiService';
import { CVData, AppState } from './types';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHero, setShowHero] = useState(true);
  
  // Lifted state to preserve input when navigating back from preview
  const [inputText, setInputText] = useState('');

  const handleStart = () => {
    setShowHero(false);
  };

  const handleCVSubmit = async () => {
    if (!inputText.trim()) return;
    
    setAppState(AppState.PROCESSING);
    setError(null);
    try {
      const data = await transformCV(inputText);
      setCvData(data);
      setAppState(AppState.PREVIEW);
    } catch (err: any) {
      setError("We encountered an issue transforming your CV. Please ensure the API Key is valid and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleRetry = () => {
    setAppState(AppState.INPUT);
    setError(null);
  };

  if (showHero) {
    return <Hero onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Navbar */}
        <nav className="no-print bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => setShowHero(true)}>
                        <Sparkles className="w-6 h-6 text-dubai-gold mr-2" />
                        <span className="font-serif font-bold text-xl text-dubai-dark">Dubai CV Architect</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                           Powered by Gemini 2.0
                        </span>
                    </div>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {appState === AppState.INPUT && (
                    <div className="flex flex-col items-center justify-center fade-in">
                        <CVInput 
                          value={inputText}
                          onChange={setInputText}
                          onSubmit={handleCVSubmit} 
                          isLoading={false} 
                        />
                    </div>
                )}

                {appState === AppState.PROCESSING && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <CVInput 
                          value={inputText}
                          onChange={setInputText}
                          onSubmit={() => {}} 
                          isLoading={true} 
                        />
                    </div>
                )}

                {appState === AppState.ERROR && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                        <div className="p-4 bg-red-50 rounded-full mb-4">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Transformation Failed</h3>
                        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                        <button 
                            onClick={handleRetry}
                            className="px-6 py-2 bg-dubai-dark text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {appState === AppState.PREVIEW && cvData && (
                    <div className="fade-in">
                        <CVPreview data={cvData} onEdit={() => setAppState(AppState.INPUT)} />
                    </div>
                )}
            </div>
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-gray-200 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p className="mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Dubai CV Architect. Built for the ambitious.
                    </p>
                    <div className="flex items-center space-x-6">
                         <div className="flex items-center text-gray-400">
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            <span>Data is processed securely via Google Gemini</span>
                         </div>
                    </div>
                </div>
                <div className="mt-4 text-xs text-gray-400 text-center md:text-left">
                    Disclaimer: This tool uses Artificial Intelligence to format and enhance your CV. While we strive for accuracy, please review all generated content carefully before applying. We are not responsible for any employment outcomes.
                </div>
            </div>
        </footer>
    </div>
  );
};

export default App;