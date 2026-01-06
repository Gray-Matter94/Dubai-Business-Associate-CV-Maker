import React from 'react';
import { ArrowRight, Building2, Briefcase, Award } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-8 p-4 bg-dubai-gold/10 rounded-full">
        <Building2 className="w-12 h-12 text-dubai-gold" />
      </div>
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-dubai-dark mb-6">
        Dubai Business Associate <br />
        <span className="text-dubai-gold">CV Architect</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
        Transform your standard resume into a prestigious, high-impact profile tailored specifically for the UAE's competitive business market.
      </p>
      
      <button 
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 bg-dubai-dark hover:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dubai-gold shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        <span>Craft Your CV</span>
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl w-full">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <Briefcase className="w-8 h-8 text-dubai-gold mb-4" />
          <h3 className="font-serif font-bold text-lg mb-2">Corporate Tone</h3>
          <p className="text-sm text-gray-500">Refined British English suitable for top-tier MNCs in Dubai.</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <Award className="w-8 h-8 text-dubai-gold mb-4" />
          <h3 className="font-serif font-bold text-lg mb-2">Achievement Focused</h3>
          <p className="text-sm text-gray-500">Highlighting ROI, strategic partnerships, and leadership.</p>
        </div>
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <Building2 className="w-8 h-8 text-dubai-gold mb-4" />
          <h3 className="font-serif font-bold text-lg mb-2">MENA Market Ready</h3>
          <p className="text-sm text-gray-500">Optimized for Free Zone, Government, and Private sectors.</p>
        </div>
      </div>
    </div>
  );
};