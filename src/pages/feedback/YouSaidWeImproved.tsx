import React from 'react';
import { ImprovementStory } from '../../types/feedback';
import { IMPROVEMENT_STORIES } from '../../data/feedbackMockData';
import { ArrowDown, TrendingUp, Users, Sparkles } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  delivery: 'bg-blue-50 border-blue-200 text-blue-700',
  packaging: 'bg-amber-50 border-amber-200 text-amber-700',
  farmer_reliability: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  app_experience: 'bg-purple-50 border-purple-200 text-purple-700',
  pricing: 'bg-teal-50 border-teal-200 text-teal-700',
  other: 'bg-slate-50 border-slate-200 text-slate-700',
};

const StoryCard: React.FC<{ story: ImprovementStory; index: number }> = ({ story, index }) => {
  const colorClass = CATEGORY_COLORS[story.category] || CATEGORY_COLORS.other;
  return (
    <div className="bg-white rounded-3xl border border-[#ccd5ae]/60 shadow-sm overflow-hidden">
      {/* Story index badge */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#788c80] uppercase tracking-wider">Story #{index + 1}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${colorClass}`}>
            {story.category.replace(/_/g, ' ')}
          </span>
          <span className="text-2xl">{story.icon}</span>
        </div>
      </div>

      {/* Three-column flow */}
      <div className="p-5 space-y-4">
        {/* YOU SAID */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">1</div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">You Said</p>
          </div>
          <div className="ml-8 p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
            <p className="text-sm text-rose-800 italic leading-relaxed">{story.userFeedback}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-[#01472e]" />
        </div>

        {/* WE DID */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">2</div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">We Did</p>
          </div>
          <div className="ml-8 p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
            <p className="text-sm text-amber-800 leading-relaxed">{story.actionTaken}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDown className="w-5 h-5 text-[#01472e]" />
        </div>

        {/* RESULT */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">3</div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Result</p>
          </div>
          <div className="ml-8 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <p className="text-sm text-emerald-800 leading-relaxed">{story.result}</p>
          </div>
        </div>

        {/* Impact metric */}
        <div className="ml-8 flex items-center gap-4 pt-1">
          {story.impactMetric && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#01472e]" />
              <span className="text-lg font-bold text-[#01472e]">
                {story.impactMetric}{story.impactUnit}
              </span>
              <span className="text-xs text-[#788c80]">impact</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#788c80]" />
            <span className="text-xs text-[#5c7065]">{story.affectedUsers.toLocaleString()} users benefited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const YouSaidWeImproved: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#eaf4ec] rounded-full border border-[#a3b18a]/40">
          <Sparkles className="w-4 h-4 text-[#01472e]" />
          <span className="text-xs font-semibold text-[#01472e]">Continuous Improvement</span>
        </div>
        <h1 className="text-2xl font-bold text-[#01472e]">You Said, We Improved</h1>
        <p className="text-sm text-[#5c7065] max-w-md mx-auto leading-relaxed">
          At Uzhavan Connect, we don't just collect feedback — we act on it.
          Here's how your voices have shaped our platform.
        </p>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: '5,400+', label: 'Users Heard', emoji: '👂' },
          { value: '12', label: 'Improvements Made', emoji: '✅' },
          { value: '4.4★', label: 'Avg Rating Now', emoji: '⭐' },
        ].map(({ value, label, emoji }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#ccd5ae]/60 p-3 text-center shadow-sm">
            <div className="text-xl mb-1">{emoji}</div>
            <div className="font-bold text-[#01472e] text-sm">{value}</div>
            <div className="text-[10px] text-[#788c80]">{label}</div>
          </div>
        ))}
      </div>

      {/* Stories */}
      <div className="space-y-5">
        {IMPROVEMENT_STORIES.map((story, i) => (
          <StoryCard key={story.storyId} story={story} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#01472e] rounded-3xl p-6 text-center text-white">
        <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#ccd5ae]" />
        <h3 className="font-bold text-lg mb-2">Your Feedback Matters</h3>
        <p className="text-sm text-[#ccd5ae] mb-4">
          Every rating, every suggestion, every complaint helps us build a better agricultural marketplace for farmers and buyers.
        </p>
        <p className="text-xs text-[#a3b18a]">
          "Uzhavan Connect does not simply collect feedback. It converts user experiences into actionable intelligence."
        </p>
      </div>
    </div>
  );
};
