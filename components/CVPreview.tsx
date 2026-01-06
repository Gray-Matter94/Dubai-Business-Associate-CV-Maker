import React, { useRef, useState } from 'react';
import { CVData } from '../types';
import { MapPin, Mail, Phone, Linkedin, FileDown, FileText, Printer, Pencil, LayoutTemplate, FileCheck } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition } from "docx";
// @ts-ignore
import FileSaver from "file-saver";

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
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'modern' | 'ats'>('modern');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
      if (!componentRef.current) return;
      setIsGeneratingPdf(true);
      
      const element = componentRef.current;
      const opt = {
        margin: 0,
        filename: `${(data.fullName || 'Dubai_CV').replace(/\s+/g, "_")}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
        const html2pdf = (window as any).html2pdf;
        if (typeof html2pdf !== 'function') {
            throw new Error("html2pdf library not loaded correctly.");
        }
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF Generation failed:", err);
        alert("Could not generate PDF directly. Trying print dialog instead.");
        window.print();
      } finally {
        setIsGeneratingPdf(false);
      }
  };

  const handleDownloadDocx = async () => {
    setIsGeneratingDocx(true);
    try {
        // The DOCX generation logic remains the same (Linear structure is inherently ATS friendly)
        const doc = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: "Normal",
                        name: "Normal",
                        run: {
                            font: "Calibri",
                            size: 22, // 11pt
                            color: "1A1A1A",
                        },
                        paragraph: {
                            spacing: { line: 276, before: 0, after: 0 },
                        },
                    },
                    {
                        id: "Heading1",
                        name: "Heading 1",
                        run: {
                            font: "Times New Roman",
                            size: 48, // 24pt
                            bold: true,
                            color: "1A1A1A",
                            allCaps: true,
                        },
                        paragraph: {
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 100 },
                        },
                    },
                    {
                        id: "Heading2",
                        name: "Heading 2",
                        run: {
                            font: "Times New Roman",
                            size: 28, // 14pt
                            bold: true,
                            color: "C5A059",
                            allCaps: true,
                        },
                        paragraph: {
                            spacing: { before: 240, after: 120 },
                            border: {
                                bottom: {
                                    color: "E5E7EB",
                                    space: 1,
                                    style: BorderStyle.SINGLE,
                                    size: 6,
                                },
                            },
                        },
                    },
                ],
            },
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: data.fullName.toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.LEFT,
                    }),
                    new Paragraph({
                        text: data.professionalTitle.toUpperCase(),
                        run: { color: "C5A059", bold: true, size: 28, font: "Times New Roman" },
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({ text: `${data.contact.location || ''} | ${data.contact.email || ''} | ${data.contact.phone || ''}` }),
                            data.contact.linkedin ? new TextRun({ text: ` | LinkedIn` }) : new TextRun(""),
                        ],
                        spacing: { after: 400 },
                    }),
                    new Paragraph({ text: "PROFESSIONAL PROFILE", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: data.summary }),
                    
                    new Paragraph({ text: "CORE COMPETENCIES", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: data.skills.join(" • ") }),

                    new Paragraph({ text: "PROFESSIONAL EXPERIENCE", heading: HeadingLevel.HEADING_2 }),
                    ...data.experience.flatMap(exp => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.role, bold: true, size: 24 }),
                                new TextRun({ text: `\t${exp.dates}`, bold: true, color: "C5A059", size: 20 }),
                            ],
                            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.company, italics: true }),
                                new TextRun({ text: `\t${exp.location}`, italics: true, color: "666666", size: 20 }),
                            ],
                             tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                            spacing: { after: 100 },
                        }),
                        ...exp.achievements.map(achievement => 
                            new Paragraph({ text: achievement, bullet: { level: 0 } })
                        )
                    ]),
                    new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2 }),
                    ...data.education.flatMap(edu => [
                        new Paragraph({ children: [ new TextRun({ text: edu.degree, bold: true }) ], spacing: { before: 100 } }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `${edu.institution}` }),
                                new TextRun({ text: `\t${edu.year}`, italics: true, size: 20 }),
                            ],
                             tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                        }),
                    ]),
                    ...(data.languages && data.languages.length > 0 ? [
                         new Paragraph({ text: "LANGUAGES", heading: HeadingLevel.HEADING_2 }),
                         new Paragraph({ text: data.languages.join(", ") })
                    ] : []),
                ],
            }],
        });
        const blob = await Packer.toBlob(doc);
        const saveAs = FileSaver.saveAs || FileSaver;
        saveAs(blob, `${(data.fullName || 'Dubai_CV').replace(/\s+/g, "_")}.docx`);
    } catch (err) {
        console.error("Failed to generate DOCX", err);
        alert("Could not generate Word document.");
    } finally {
        setIsGeneratingDocx(false);
    }
  };

  return (
    <div className="flex flex-col items-center my-8">
      <div className="no-print w-full max-w-4xl flex flex-col justify-between items-center mb-6 px-4 gap-4">
        
        {/* Controls Bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setLayoutMode('modern')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${layoutMode === 'modern' ? 'bg-white shadow-sm text-dubai-dark' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    Modern
                </button>
                <button 
                    onClick={() => setLayoutMode('ats')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${layoutMode === 'ats' ? 'bg-white shadow-sm text-dubai-dark' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FileCheck className="w-4 h-4 mr-2" />
                    ATS Friendly
                </button>
             </div>

             <div className="flex flex-wrap gap-2 justify-center">
                {onEdit && (
                    <button onClick={onEdit} className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </button>
                )}
                <button onClick={handleDownloadDocx} disabled={isGeneratingDocx || isGeneratingPdf} className="flex items-center px-3 py-2 text-sm text-dubai-dark bg-white border border-dubai-dark rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
                    {isGeneratingDocx ? <span>Generating...</span> : <><FileText className="w-4 h-4 mr-2" /> Word (Best for ATS)</>}
                </button>
                <button onClick={handleDownloadPdf} disabled={isGeneratingDocx || isGeneratingPdf} className="flex items-center px-3 py-2 text-sm text-white bg-dubai-dark rounded-md hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50">
                    {isGeneratingPdf ? <span>Generating...</span> : <><FileDown className="w-4 h-4 mr-2" /> PDF</>}
                </button>
                <button onClick={handlePrint} disabled={isGeneratingDocx || isGeneratingPdf} className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50" title="Print">
                    <Printer className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
      
      {/* Paper Container */}
      <div 
        ref={componentRef}
        className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl mx-auto p-[15mm] md:p-[20mm] text-dubai-slate"
      >
        {/* Header - Always Clean */}
        <header className={`${layoutMode === 'modern' ? 'border-b-2 border-dubai-gold pb-6 mb-8' : 'border-b border-gray-300 pb-4 mb-6'} break-inside-avoid`}>
          <div className="flex items-center gap-6">
            
            {/* Optional Photo - Only in Modern Layout */}
            {layoutMode === 'modern' && data.photo && (
                <div className="flex-shrink-0">
                    <img 
                        src={data.photo} 
                        alt={data.fullName} 
                        className="w-32 h-40 object-cover rounded-md shadow-md border-2 border-white ring-1 ring-gray-200"
                    />
                </div>
            )}

            <div className="flex-grow">
              <h1 className={`${layoutMode === 'modern' ? 'text-4xl' : 'text-3xl'} font-serif font-bold text-dubai-dark uppercase tracking-wide mb-2`}>
                {data.fullName}
              </h1>
              <p className={`${layoutMode === 'modern' ? 'text-lg text-dubai-gold' : 'text-md text-gray-700'} font-medium tracking-widest uppercase`}>
                {data.professionalTitle}
              </p>
            </div>
            
            {/* Contact Info - Right Aligned */}
            <div className="text-right text-sm space-y-1 min-w-[180px]">
               {[data.contact.location, data.contact.email, data.contact.phone].filter(Boolean).map((item, i) => (
                    <div key={i} className="text-gray-600">{item}</div>
               ))}
               {data.contact.linkedin && (
                <div className="text-gray-600">
                   <a href={sanitizeUrl(data.contact.linkedin)} target="_blank" rel="noreferrer" className="hover:text-dubai-gold">LinkedIn</a>
                </div>
               )}
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className={layoutMode === 'modern' ? "grid grid-cols-12 gap-8" : "flex flex-col gap-6"}>
          
          {/* Main Content Area */}
          <div className={layoutMode === 'modern' ? "col-span-8 space-y-8" : "space-y-6"}>
            
            {/* Summary */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                Professional Profile
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 text-justify">
                {data.summary}
              </p>
            </section>
            
            {/* ATS Mode: Skills appear here (Top for ATS) */}
            {layoutMode === 'ats' && (
                <section className="break-inside-avoid">
                    <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                        Core Competencies
                    </h3>
                    <div className="text-sm text-gray-700">
                        {data.skills.join(" • ")}
                    </div>
                </section>
            )}

            {/* Experience */}
            <section>
              <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-4">
                Professional Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className={`relative ${layoutMode === 'modern' ? 'pl-4 border-l-2 border-dubai-sand' : ''} break-inside-avoid`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-gray-900">{exp.role}</h4>
                      <span className="text-xs font-medium text-dubai-gold whitespace-nowrap">{exp.dates}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                        <span className="text-xs text-gray-500 italic">{exp.location}</span>
                    </div>
                    <ul className={`list-disc list-outside ${layoutMode === 'modern' ? 'ml-4' : 'ml-5'} space-y-1`}>
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
             
             {/* ATS Mode: Education & Languages at bottom of single column */}
             {layoutMode === 'ats' && (
                 <>
                    <section className="break-inside-avoid">
                    <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                        Education
                    </h3>
                    <div className="space-y-4">
                        {data.education.map((edu, index) => (
                        <div key={index}>
                            <h4 className="text-sm font-bold text-gray-900">{edu.degree}</h4>
                            <div className="flex justify-between mt-1 text-xs text-gray-600">
                                <span>{edu.institution}, {edu.location}</span>
                                <span>{edu.year}</span>
                            </div>
                        </div>
                        ))}
                    </div>
                    </section>
                    {data.languages && data.languages.length > 0 && (
                        <section className="break-inside-avoid">
                        <h3 className="text-sm font-bold text-dubai-dark uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">
                            Languages
                        </h3>
                        <p className="text-sm text-gray-700">{data.languages.join(", ")}</p>
                        </section>
                    )}
                 </>
             )}

          </div>

          {/* Right Sidebar (Only for Modern Layout) */}
          {layoutMode === 'modern' && (
            <div className="col-span-4 space-y-8">
                {/* Skills */}
                <section className="bg-gray-50 p-4 rounded-lg break-inside-avoid">
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
          )}
        </div>
        
        {/* Footer Decoration */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex justify-center break-inside-avoid">
             <div className="w-16 h-1 bg-dubai-gold rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
};