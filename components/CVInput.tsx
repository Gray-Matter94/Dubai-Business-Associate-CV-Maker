import React, { useState, useCallback } from 'react';
import { FileText, Upload, AlertCircle } from 'lucide-react';

interface CVInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export const CVInput: React.FC<CVInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-dubai-sand rounded-lg">
          <FileText className="w-6 h-6 text-dubai-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-dubai-dark">Input Your Details</h2>
          <p className="text-sm text-gray-500">Paste your current CV text or upload a plain text file.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste CV Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dubai-gold focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder="Paste the content of your resume here..."
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
             <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-dubai-gold hover:bg-dubai-sand/50 transition-colors group">
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-dubai-gold mr-2" />
                <span className="text-sm text-gray-600 group-hover:text-dubai-dark truncate max-w-[200px]">
                  {fileName || "Or upload .txt file"}
                </span>
                <input id="file-upload" type="file" className="hidden" accept=".txt,.md" onChange={handleFileChange} disabled={isLoading} />
             </label>
          </div>
          
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`
              flex items-center justify-center px-8 py-3 text-white font-medium rounded-lg transition-all
              ${!text.trim() || isLoading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-dubai-gold hover:bg-yellow-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Polishing...
              </>
            ) : (
              'Generate Dubai CV'
            )}
          </button>
        </div>
        
        <div className="flex items-start space-x-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
           <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
           <p>For best results, ensure your input includes dates, job titles, and specific achievements. Our AI will handle the formatting and "Dubai-fication" of the language.</p>
        </div>
      </form>
    </div>
  );
};