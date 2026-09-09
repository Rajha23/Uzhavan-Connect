import React from 'react';
import { ShieldCheck, Camera, FileText } from 'lucide-react';

export const QualityAssessmentPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mt-12">
        <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quality Assessment Studio</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-8">
          Upload images of bulk produce shipments to run AI-powered computer vision quality checks, grading, and spoilage detection.
        </p>
        
        <div className="flex justify-center gap-4">
          <button className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition">
            <Camera className="w-5 h-5" />
            Launch AI Scanner
          </button>
          <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition">
            <FileText className="w-5 h-5" />
            View Past Reports
          </button>
        </div>
      </div>
    </div>
  );
};
