import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sprout, Sparkles } from 'lucide-react';
import {
  CROP_MASTER_DATABASE,
  CropMasterItem,
  CropVariety,
  searchCrops,
  findCropByName
} from '../../data/cropMasterData';

export interface CropVarietySelection {
  crop: string;
  cropId: string;
  variety: string;
  varietyId: string;
  isOther?: boolean;
}

interface CropVarietySearchDropdownProps {
  selectedCrop: string;
  selectedCropId?: string;
  selectedVariety: string;
  selectedVarietyId?: string;
  customVariety?: string;
  onSelect: (selection: CropVarietySelection) => void;
  onCustomVarietyChange?: (customVariety: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const CropVarietySearchDropdown: React.FC<CropVarietySearchDropdownProps> = ({
  selectedCrop,
  selectedCropId,
  selectedVariety,
  selectedVarietyId,
  customVariety = '',
  onSelect,
  onCustomVarietyChange,
  label = 'Crop & Variety Search',
  required = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(selectedCrop || '');
  const [activeCropId, setActiveCropId] = useState<string>(selectedCropId || 'CROP-TOMATO');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search query if selectedCrop changes externally
  useEffect(() => {
    if (selectedCrop) {
      const match = findCropByName(selectedCrop);
      if (match) {
        setActiveCropId(match.id);
      }
    }
  }, [selectedCrop]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter crops based on search query
  const matchingCrops = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return CROP_MASTER_DATABASE;
    return searchCrops(trimmed);
  }, [searchQuery]);

  // Determine current active crop to display varieties for
  const activeCrop: CropMasterItem = useMemo(() => {
    // 1. If query directly matches a crop name, make that active
    const directMatch = matchingCrops.find(
      c => c.name.toLowerCase() === searchQuery.trim().toLowerCase() ||
           c.aliases.some(a => a.toLowerCase() === searchQuery.trim().toLowerCase())
    );
    if (directMatch) return directMatch;

    // 2. Otherwise if activeCropId is in matching crops, use it
    const byActiveId = matchingCrops.find(c => c.id === activeCropId);
    if (byActiveId) return byActiveId;

    // 3. Otherwise use first matching crop
    if (matchingCrops.length > 0) return matchingCrops[0];

    // 4. Fallback to default first crop (Tomato)
    return CROP_MASTER_DATABASE[0];
  }, [matchingCrops, searchQuery, activeCropId]);

  // Handle selecting a variety
  const handleSelectVariety = (cropItem: CropMasterItem, varietyItem: CropVariety) => {
    onSelect({
      crop: cropItem.name,
      cropId: cropItem.id,
      variety: varietyItem.name,
      varietyId: varietyItem.id,
      isOther: varietyItem.isOther
    });
    setSearchQuery(cropItem.name);
    setActiveCropId(cropItem.id);
    setIsOpen(false);
  };

  const isOtherSelected = selectedVariety === 'Other' || selectedVarietyId?.includes('OTHER');

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-medium text-[#01472e] text-xs flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-[#01472e]" />
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedCrop && selectedVariety && (
            <span className="text-[10px] text-[#5c7065] font-mono font-medium">
              ID: {selectedCropId || 'CROP'} / {selectedVarietyId || 'VAR'}
            </span>
          )}
        </div>
      )}

      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#01472e]">
          <Search className="w-4 h-4 text-[#5c7065]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search crop (e.g. Tomato, Rice, Chilli, Onion...)"
          className="w-full pl-9 pr-16 py-2.5 bg-white border border-[#ccd5ae] rounded-xl text-xs text-[#01472e] placeholder-[#a3b18a] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20 focus:border-[#01472e] shadow-2xs font-medium"
          required={required}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selected Indicator Badge when closed */}
      {!isOpen && selectedCrop && selectedVariety && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#01472e]">{selectedCrop}</span>
            <span className="text-[#5c7065]">•</span>
            <span className="text-[#01472e] font-medium">
              {isOtherSelected && customVariety ? `${customVariety} (Custom Variety)` : selectedVariety}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="text-[11px] text-[#01472e] underline font-semibold hover:opacity-80 cursor-pointer"
          >
            Change
          </button>
        </div>
      )}

      {/* Custom Variety Input Field (when 'Other' is selected) */}
      {isOtherSelected && onCustomVarietyChange && (
        <div className="mt-1 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Custom Variety for {selectedCrop}
            </label>
            <span className="text-[10px] text-amber-700 font-medium">Enter farmer/heirloom name</span>
          </div>
          <input
            type="text"
            value={customVariety}
            onChange={(e) => onCustomVarietyChange(e.target.value)}
            placeholder={`e.g. ${selectedCrop} Heirloom / Local Hybrid Seed`}
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-amber-950 placeholder-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
            required={required}
            autoFocus
          />
        </div>
      )}

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#ccd5ae] rounded-2xl shadow-xl z-50 overflow-hidden text-xs max-h-80 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {matchingCrops.length > 0 ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Other Matching Crops Tabs (if query matches multiple crops) */}
              {matchingCrops.length > 1 && (
                <div className="px-3 py-2 bg-[#f8faf7] border-b border-[#ccd5ae]/40 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  <span className="text-[10px] uppercase font-bold text-[#788c80] mr-1 shrink-0">
                    Matching:
                  </span>
                  {matchingCrops.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCropId(c.id);
                        setSearchQuery(c.name);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                        activeCrop.id === c.id
                          ? 'bg-[#01472e] text-white shadow-2xs'
                          : 'bg-white text-[#5c7065] border border-[#ccd5ae]/60 hover:bg-[#eaf4ec]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Crop Header Section */}
              <div className="px-4 py-3 bg-[#eaf4ec]/70 border-b border-[#a3b18a]/30 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#01472e]">
                      Crop: <span className="underline underline-offset-2 decoration-[#01472e]/40">{activeCrop.name}</span>
                    </span>
                    {activeCrop.tamilName && (
                      <span className="text-[10px] text-[#5c7065] font-normal">
                        ({activeCrop.tamilName})
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#01472e] font-mono border border-[#a3b18a]/40">
                    {activeCrop.id}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[#5c7065] mt-1.5 uppercase tracking-wide">
                  Available Varieties:
                </p>
              </div>

              {/* Varieties List */}
              <div className="overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100">
                {activeCrop.varieties.map((v) => {
                  const isSelected =
                    selectedCrop === activeCrop.name &&
                    (selectedVariety === v.name || selectedVarietyId === v.id);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariety(activeCrop, v)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition cursor-pointer group ${
                        isSelected
                          ? 'bg-[#01472e] text-white font-bold'
                          : 'hover:bg-[#eaf4ec]/60 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs ${isSelected ? 'text-white' : 'text-[#01472e] font-medium'}`}>
                          {v.name}
                        </span>
                        {!v.isOther && (
                          <span className={`text-[11px] ${isSelected ? 'text-emerald-200' : 'text-[#788c80]'}`}>
                            — {activeCrop.name}
                          </span>
                        )}
                        {v.isOther && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Custom Entry
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {v.id}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 space-y-1">
              <p className="text-xs font-semibold text-[#01472e]">No matching crop found</p>
              <p className="text-[11px] text-[#788c80]">
                Try searching for "Tomato", "Rice", "Onion", "Chilli", etc.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
