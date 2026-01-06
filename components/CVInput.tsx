import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertCircle, AlertTriangle, Wand2 } from 'lucide-react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import mammoth from 'mammoth';

interface CVInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MAX_CHARS = 25000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB to account for PDF/DOCX overhead

const SAMPLE_DATA = `John Smith
Senior Sales Manager
London, UK | +44 7700 900000 | john.smith@email.com

Summary
Experienced sales leader with 10 years in software sales. Managed a team of 5. Good at hitting targets and making friends with clients. Want to move to Dubai for new opportunities.

Experience
Sales Director - Cloud Corp (2018-Present)
- Increased sales by 20%
- Managed key accounts in Europe
- Hired 3 new sales reps

Sales Manager - Tech Solutions (2014-2018)
- Sold CRM software to small businesses
- Won "Salesman of the Year" twice

Education
BA Business, University of Manchester (2014)

Skills
Sales, CRM, Leadership, Microsoft Office, negotiation
`;

export const CVInput: React.FC<CVInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    // Initialize PDF.js worker
    if (typeof window !== 'undefined') {
        const lib = pdfjsLib as any;
        // Check for .default structure (common with CDN imports) or direct structure
        const workerOptions = lib.GlobalWorkerOptions || lib.default?.GlobalWorkerOptions;
        
        if (workerOptions) {
            workerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs';
        } else {
            console.warn("Could not initialize PDF.js worker: GlobalWorkerOptions not found");
        }
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      onChange(newText);
      setError(null);
    } else {
      setError(`Text limit reached (${MAX_CHARS} characters max).`);
    }
  };

  const handleLoadSample = () => {
      onChange(SAMPLE_DATA);
      setError(null);
      setFileName(null);
  };

  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
        const lib = pdfjsLib as any;
        // Safe access to getDocument
        const getDocument = lib.getDocument || lib.default?.getDocument;
        
        if (!getDocument) {
            throw new Error("PDF parser not initialized properly.");
        }

        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    } catch (e) {
        console.error("PDF Parse Error", e);
        throw new Error("Could not parse PDF file. Ensure it is a valid text-based PDF.");
    }
  };

  const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
      try {
          // Safe access to mammoth
          const lib = (mammoth as any).default || mammoth;
          if (!lib || !lib.extractRawText) {
              throw new Error("DOCX parser not initialized.");
          }
          
          const result = await lib.extractRawText({ arrayBuffer });
          return result.value;
      } catch (e) {
          console.error("DOCX Parse Error", e);
          throw new Error("Could not parse DOCX file.");
      }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setFileName(null);
    
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 5MB.`);
        return;
      }

      setFileName(file.name);
      setIsProcessingFile(true);

      try {
        let extractedText = '';

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            const arrayBuffer = await file.arrayBuffer();
            extractedText = await extractTextFromPdf(arrayBuffer);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            file.name.toLowerCase().endsWith('.docx')
        ) {
            const arrayBuffer = await file.arrayBuffer();
            extractedText = await extractTextFromDocx(arrayBuffer);
        } else {
            // Assume plain text
            extractedText = await file.text();
        }

        if (!extractedText.trim()) {
            throw new Error("No text could be extracted from this file. It might be scanned or empty.");
        }

        if (extractedText.length > MAX_CHARS) {
           setError(`File content exceeds character limit. Truncated to ${MAX_CHARS} characters.`);
           onChange(extractedText.slice(0, MAX_CHARS));
        } else {
           onChange(extractedText);
        }
      } catch (err: any) {
        setError(err.message || "Failed to read file.");
        setFileName(null);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !error && !isProcessingFile) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-dubai-sand rounded-lg">
            <FileText className="w-6 h-6 text-dubai-gold" />
            </div>
            <div>
            <h2 className="text-2xl font-serif font-bold text-dubai-dark">Input Your Details</h2>
            <p className="text-sm text-gray-500">Paste your CV or upload PDF/DOCX.</p>
            </div>
        </div>
        {!value && (
            <button 
                type="button"
                onClick={handleLoadSample}
                className="text-xs flex items-center text-dubai-gold hover:text-yellow-600 font-medium transition-colors"
                disabled={isLoading || isProcessingFile}
            >
                <Wand2 className="w-3 h-3 mr-1" />
                Load Sample
            </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Paste CV Text
            </label>
            <span className={`text-xs ${value.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
              {value.length}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            value={value}
            onChange={handleTextChange}
            className="w-full h-64 p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dubai-gold focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder="Paste the content of your resume here..."
            disabled={isLoading || isProcessingFile}
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
             <label htmlFor="file-upload" className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors group ${isLoading || isProcessingFile ? 'opacity-50 cursor-not-allowed' : 'hover:border-dubai-gold hover:bg-dubai-sand/50'}`}>
                {isProcessingFile ? (
                   <svg className="animate-spin h-5 w-5 text-dubai-gold mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                   <Upload className="w-5 h-5 text-gray-400 group-hover:text-dubai-gold mr-2" />
                )}
                <span className="text-sm text-gray-600 group-hover:text-dubai-dark truncate max-w-[200px]">
                  {isProcessingFile ? "Extracting text..." : (fileName || "Upload PDF, DOCX, TXT")}
                </span>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.pdf,.docx" 
                  onChange={handleFileChange} 
                  disabled={isLoading || isProcessingFile} 
                />
             </label>
          </div>
          
          <button
            type="submit"
            disabled={!value.trim() || isLoading || !!error || isProcessingFile}
            className={`
              flex items-center justify-center px-8 py-3 text-white font-medium rounded-lg transition-all
              ${!value.trim() || isLoading || !!error || isProcessingFile
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