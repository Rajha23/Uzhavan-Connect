import React from 'react';

interface QuickTagSelectorProps {
  tags: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelect?: number;
}

export const QuickTagSelector: React.FC<QuickTagSelectorProps> = ({
  tags,
  selected,
  onChange,
  maxSelect,
}) => {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (!maxSelect || selected.length < maxSelect) {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border select-none ${
              isSelected
                ? 'bg-[#01472e] text-white border-[#01472e] shadow-sm scale-105'
                : 'bg-white text-[#4a6350] border-[#ccd5ae] hover:border-[#01472e]/50 hover:bg-[#eaf4ec]'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};
