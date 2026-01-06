import React, { useRef } from 'react';
import { CVData } from '../types';
import { MapPin, Mail, Phone, Linkedin, Printer } from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
  onEdit?: () => void;
}

// Ensure external links are safe and have a protocol
const sanitizeUrl = (url: string) => {
  if (!url) return '#';
  try {
    // If it lacks a protocol, assume https
    const urlWithProtocol = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    // Only allow http and https protocols to prevent javascript: vectors
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '#';
  } catch (e) {
    return '#';
  }
};

export const CVPreview: React.FC<CVPreviewProps> = ({ data, onEdit }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center my-8">
      <div className="no-print w-full max-w-4xl flex justify-between items-center mb-6 px-4">
        <h2 className="text-xl font-bold text-dubai-dark">Your Generated Profile</h2>
        <div className="flex space-x-3">
            {onEdit && (
                <button onClick={onEdit} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Back to Edit
                </button>
            )}
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 text-sm text-white bg-dubai-dark rounded-md hover:bg-gray-800 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* A4 Paper Container */}
      <div 
        ref={componentRef}
        className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-[15mm] md:p-[20mm] text-dubai-slate"
      >
        {/* Header */}
        <header className="border-b-2 border-dubai-gold pb-6 mb-8 break-inside-avoid">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-serif font-bold text-dubai-dark uppercase tracking-wide mb-2">
                {data.fullName}
              </h1>
              <p className="text-lg text-dubai-gold font-medium tracking-widest uppercase">
                {data.professionalTitle}
              </p>
            </div>
            <div className="text-right text-sm space-y-1">
               {data.contact.location && (
                <div className="flex items-center justify-end text-gray-600">
                  <span>{data.contact.location}</span>
                  <MapPin className="w-3 h-3 ml-2 text-dubai-gold" />
                </div>
               )}
               {data.contact.email && (
                <div className="flex items-center justify-end text-gray-600">
                  <a href={`mailto:${data.contact.email}`} className="hover:text-dubai-gold transition-colors">{data.contact.email}</a>
                  <Mail className="w-3 h-3 ml-2 text-dubai-gold" />
                </div>
               )}
               {data.contact.phone && (
                <div className="flex items-center justify-end text-gray-600">
                  <span>{data.contact.phone}</span>
                  <Phone className="w-3 h-3 ml-2 text-dubai-gold" />
                </div>
               )}
               {data.contact.linkedin && (
                <div className="flex items-center justify-end text-gray-600">
                   <a href={sanitizeUrl(data.contact.linkedin)} target="_blank" rel="noreferrer" className="hover:text-dubai-gold transition-colors">LinkedIn Profile</a>
                  <Linkedin className="w-3 h-3 ml-2 text-dubai-gold" />
                </div>
               )}
            </div>
          </div>
        </header>

        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Main Column */}
          <div className="col-span-8 space-y-8">
            
            {/* Summary */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                Professional Profile
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 text-justify">
                {data.summary}
              </p>
            </section>

            {/* Experience */}
            <section>
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">
                Professional Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative pl-4 border-l-2 border-dubai-sand break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-gray-900">{exp.role}</h4>
                      <span className="text-xs font-medium text-dubai-gold whitespace-nowrap">{exp.dates}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                        <span className="text-xs text-gray-500 italic">{exp.location}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="text-xs md:text-sm text-gray-600 leading-snug pl-1">
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-8">
            
            {/* Skills */}
            <section className="bg-gray-50 p-4 rounded-lg break-inside-avoid print:bg-gray-50 print:border print:border-gray-100">
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                Education
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="break-inside-avoid">
                    <h4 className="text-sm font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-xs text-gray-600">{edu.institution}</p>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{edu.location}</span>
                        <span>{edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
                <section className="break-inside-avoid">
                <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                    Languages
                </h3>
                <ul className="space-y-1">
                    {data.languages.map((lang, index) => (
                    <li key={index} className="text-sm text-gray-700 border-b border-dashed border-gray-200 pb-1 last:border-0">
                        {lang}
                    </li>
                    ))}
                </ul>
                </section>
            )}

          </div>
        </div>
        
        {/* Footer Decoration */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-center break-inside-avoid">
             <div className="w-16 h-1 bg-dubai-gold rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
};