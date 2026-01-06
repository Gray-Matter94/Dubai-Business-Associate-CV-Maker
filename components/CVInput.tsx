import React, { useState, useCallback } from 'react';
import { FileText, Upload, AlertCircle, AlertTriangle } from 'lucide-react';

interface CVInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const MAX_CHARS = 25000;
const MAX_FILE_SIZE = 50 * 1024; // 50KB

export const CVInput: React.FC<CVInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
      setError(null);
    } else {
      setError(`Text limit reached (${MAX_CHARS} characters max).`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large (${(file.size / 1024).toFixed(1)}KB). Max size is 50KB.`);
        setFileName(null);
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content.length > MAX_CHARS) {
           setError(`File content exceeds character limit (${MAX_CHARS}).`);
           setText(content.slice(0, MAX_CHARS));
        } else {
           setText(content);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !error) {
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Paste CV Text
            </label>
            <span className={`text-xs ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
              {text.length}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full h-64 p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dubai-gold focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder="Paste the content of your resume here..."
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

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
            disabled={!text.trim() || isLoading || !!error}
            className={`
              flex items-center justify-center px-8 py-3 text-white font-medium rounded-lg transition-all
              ${!text.trim() || isLoading || !!error
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