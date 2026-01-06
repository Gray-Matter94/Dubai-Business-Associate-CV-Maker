import React, { useState } from 'react';
import { CVData } from '../types';
import { Save, X, Plus, Trash2, ChevronDown, ChevronUp, Camera, Upload } from 'lucide-react';

interface CVEditFormProps {
  initialData: CVData;
  onSave: (data: CVData) => void;
  onCancel: () => void;
}

export const CVEditForm: React.FC<CVEditFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CVData>(JSON.parse(JSON.stringify(initialData)));
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  // --- Photo Upload ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File is too large. Please upload an image smaller than 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, photo: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
      setFormData(prev => ({ ...prev, photo: undefined }));
  };

  // --- Skills ---
  const handleSkillsChange = (value: string) => {
    // Simply split by comma to preserve user input while typing (including spaces)
    setFormData(prev => ({ ...prev, skills: value.split(',') }));
  };

  // --- Experience ---
  const updateExperience = (index: number, field: string, value: any) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const updateAchievement = (expIndex: number, text: string) => {
     // Allow editing achievements as a block of text
     // Split strictly by newline to allow creating new empty lines while typing
     const achievements = text.split('\n');
     const newExp = [...formData.experience];
     newExp[expIndex] = { ...newExp[expIndex], achievements };
     setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        { role: 'New Role', company: 'Company', location: 'Dubai, UAE', dates: '2023 - Present', achievements: ['Key achievement...'] },
        ...prev.experience
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // --- Education ---
  const updateEducation = (index: number, field: string, value: any) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEdu }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        { degree: 'Degree Name', institution: 'University', location: 'Location', year: 'Year' },
        ...prev.education
      ]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section: string) => {
      setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSave = () => {
      // Sanitize data before saving: remove empty strings, trim whitespace
      const cleanedData: CVData = {
          ...formData,
          skills: formData.skills.map(s => s.trim()).filter(Boolean),
          languages: formData.languages?.map(s => s.trim()).filter(Boolean) || [],
          experience: formData.experience.map(exp => ({
              ...exp,
              achievements: exp.achievements.map(a => a.trim()).filter(Boolean)
          })).filter(exp => exp.role || exp.company) // Filter out completely empty experience entries if any
      };
      onSave(cleanedData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 my-8">
      <div className="bg-dubai-dark px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-serif font-bold text-white">Edit Profile Details</h2>
        <div className="flex gap-2">
            <button 
                onClick={onCancel}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="flex items-center px-4 py-1.5 bg-dubai-gold text-white text-sm font-medium rounded hover:bg-yellow-600 transition-colors"
            >
                <Save className="w-4 h-4 mr-1.5" />
                Update CV
            </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        
        {/* Personal & Contact */}
        <div className="border rounded-lg p-4 bg-white">
             <button onClick={() => toggleSection('personal')} className="flex justify-between items-center w-full mb-2">
                <h3 className="font-bold text-dubai-dark">Personal Information</h3>
                {expandedSection === 'personal' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            
            {expandedSection === 'personal' && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                    {/* Photo Upload Section */}
                    <div className="flex items-center space-x-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="h-20 w-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden border border-gray-300">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <Camera className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Photo</label>
                            <p className="text-xs text-gray-500 mb-2">Recommended: Professional headshot, white background.</p>
                            <div className="flex space-x-2">
                                <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center">
                                    <Upload className="w-3 h-3 mr-1.5" />
                                    Upload
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                                {formData.photo && (
                                    <button 
                                        onClick={removePhoto}
                                        className="px-3 py-1.5 bg-white border border-red-200 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm flex items-center"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1.5" />
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={formData.fullName} 
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Professional Title</label>
                            <input 
                                type="text" 
                                value={formData.professionalTitle} 
                                onChange={(e) => handleChange('professionalTitle', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input 
                                type="text" 
                                value={formData.contact.email} 
                                onChange={(e) => handleContactChange('email', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                            <input 
                                type="text" 
                                value={formData.contact.phone} 
                                onChange={(e) => handleContactChange('phone', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                            <input 
                                type="text" 
                                value={formData.contact.location} 
                                onChange={(e) => handleContactChange('location', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">LinkedIn URL</label>
                            <input 
                                type="text" 
                                value={formData.contact.linkedin || ''} 
                                onChange={(e) => handleContactChange('linkedin', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Summary */}
        <div className="border rounded-lg p-4 bg-white">
            <button onClick={() => toggleSection('summary')} className="flex justify-between items-center w-full mb-2">
                <h3 className="font-bold text-dubai-dark">Professional Summary</h3>
                {expandedSection === 'summary' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            {expandedSection === 'summary' && (
                <textarea 
                    value={formData.summary} 
                    onChange={(e) => handleChange('summary', e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none mt-2 bg-white text-gray-900"
                />
            )}
        </div>

        {/* Experience */}
        <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => toggleSection('experience')} className="flex justify-between items-center w-full">
                     <h3 className="font-bold text-dubai-dark">Experience</h3>
                     {expandedSection === 'experience' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                {expandedSection === 'experience' && (
                    <button onClick={addExperience} className="ml-2 text-xs flex items-center bg-white border px-2 py-1 rounded hover:bg-gray-100">
                        <Plus className="w-3 h-3 mr-1"/> Add
                    </button>
                )}
            </div>

            {expandedSection === 'experience' && (
                <div className="space-y-4">
                {formData.experience.map((exp, idx) => (
                    <div key={idx} className="bg-white p-4 rounded shadow-sm border border-gray-200">
                        <div className="flex justify-between mb-2">
                             <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                             <button onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input 
                                placeholder="Role"
                                value={exp.role} 
                                onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Company"
                                value={exp.company} 
                                onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Dates"
                                value={exp.dates} 
                                onChange={(e) => updateExperience(idx, 'dates', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Location"
                                value={exp.location} 
                                onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Achievements (One per line)</label>
                            <textarea
                                value={exp.achievements.join('\n')}
                                onChange={(e) => updateAchievement(idx, e.target.value)}
                                rows={6}
                                className="w-full p-2 border rounded text-sm font-sans bg-white text-gray-900"
                            />
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>

        {/* Education */}
        <div className="border rounded-lg p-4 bg-white">
             <div className="flex justify-between items-center mb-4">
                 <button onClick={() => toggleSection('education')} className="flex justify-between items-center w-full">
                     <h3 className="font-bold text-dubai-dark">Education</h3>
                     {expandedSection === 'education' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                 {expandedSection === 'education' && (
                    <button onClick={addEducation} className="ml-2 text-xs flex items-center bg-gray-100 border px-2 py-1 rounded hover:bg-gray-200">
                        <Plus className="w-3 h-3 mr-1"/> Add
                    </button>
                 )}
            </div>

            {expandedSection === 'education' && (
                <div className="space-y-3">
                {formData.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                         <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input 
                                placeholder="Degree"
                                value={edu.degree} 
                                onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Institution"
                                value={edu.institution} 
                                onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Year"
                                value={edu.year} 
                                onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                            <input 
                                placeholder="Location"
                                value={edu.location} 
                                onChange={(e) => updateEducation(idx, 'location', e.target.value)}
                                className="w-full p-2 border rounded text-sm bg-white text-gray-900"
                            />
                         </div>
                         <button onClick={() => removeEducation(idx)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                ))}
                </div>
            )}
        </div>

        {/* Skills */}
        <div className="border rounded-lg p-4 bg-white">
            <button onClick={() => toggleSection('skills')} className="flex justify-between items-center w-full mb-2">
                <h3 className="font-bold text-dubai-dark">Skills & Languages</h3>
                {expandedSection === 'skills' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            {expandedSection === 'skills' && (
                <div className="space-y-4 mt-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Skills (Comma separated)</label>
                        <textarea 
                            value={formData.skills.join(',')} 
                            onChange={(e) => handleSkillsChange(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Languages (Comma separated)</label>
                         <input 
                            value={formData.languages?.join(',') || ''} 
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, languages: e.target.value.split(',') }));
                            }}
                            className="w-full p-2 border rounded focus:ring-1 focus:ring-dubai-gold outline-none bg-white text-gray-900"
                        />
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};