import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Sprout, Sparkles, Plus, Tag } from 'lucide-react';
import {
  CROP_MASTER_DATABASE,
  CropMasterItem,
  CropVariety,
  searchCrops,
  findCropByName,
  createCustomCropItem
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

const POPULAR_CROPS = [
  'Tomato',
  'Rice',
  'Onion',
  'Green Chilli',
  'Wheat',
  'Cotton',
  'Banana',
  'Turmeric',
  'Sugarcane',
  'Groundnut',
  'Potato',
  'Drumstick',
  'Brinjal'
];

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

  // Sync internal state whenever selectedCrop or selectedCropId changes externally
  useEffect(() => {
    if (selectedCrop) {
      setSearchQuery(selectedCrop);
      const match = findCropByName(selectedCrop);
      if (match) {
        setActiveCropId(match.id);
      } else if (selectedCropId) {
        setActiveCropId(selectedCropId);
      }
    }
  }, [selectedCrop, selectedCropId]);

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
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed) {
      // 1. Direct match
      const directMatch = matchingCrops.find(
        (c) =>
          c.name.toLowerCase() === trimmed ||
          c.aliases.some((a) => a.toLowerCase() === trimmed)
      );
      if (directMatch) return directMatch;
    }

    // 2. Active crop ID match
    const byActiveId = matchingCrops.find((c) => c.id === activeCropId);
    if (byActiveId) return byActiveId;

    // 3. First matching crop
    if (matchingCrops.length > 0) return matchingCrops[0];

    // 4. Custom crop fallback from typed text
    if (trimmed) {
      return createCustomCropItem(searchQuery.trim());
    }

    // 5. Default first crop
    return CROP_MASTER_DATABASE[0];
  }, [matchingCrops, searchQuery, activeCropId]);

  // Handle selecting an existing master variety
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

  // Handle quick crop selection (sets default variety)
  const handleQuickSelectCrop = (cropName: string) => {
    const matched = findCropByName(cropName) || createCustomCropItem(cropName);
    const defaultVariety = matched.varieties[0] || {
      id: `${matched.id}-VAR-01`,
      name: 'Standard / Regional Variety'
    };
    onSelect({
      crop: matched.name,
      cropId: matched.id,
      variety: defaultVariety.name,
      varietyId: defaultVariety.id,
      isOther: defaultVariety.isOther
    });
    setSearchQuery(matched.name);
    setActiveCropId(matched.id);
    setIsOpen(false);
  };

  // Handle selecting/creating a brand new custom crop
  const handleSelectCustomCrop = (customCropName: string) => {
    const cleanName = customCropName.trim();
    if (!cleanName) return;

    // Check if it actually matches an existing crop first
    const existing = findCropByName(cleanName);
    if (existing) {
      handleQuickSelectCrop(existing.name);
      return;
    }

    const customItem = createCustomCropItem(cleanName);
    const defaultVar = customItem.varieties[0];
    onSelect({
      crop: customItem.name,
      cropId: customItem.id,
      variety: defaultVar.name,
      varietyId: defaultVar.id,
      isOther: true
    });
    setSearchQuery(customItem.name);
    setActiveCropId(customItem.id);
    setIsOpen(false);
  };

  // Commit on input blur or Enter key so typed crop names are never ignored
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent accidental form submission
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const direct = matchingCrops.find(
        (c) =>
          c.name.toLowerCase() === trimmed.toLowerCase() ||
          c.aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())
      );

      if (direct) {
        handleQuickSelectCrop(direct.name);
      } else if (matchingCrops.length > 0) {
        handleQuickSelectCrop(matchingCrops[0].name);
      } else {
        handleSelectCustomCrop(trimmed);
      }
    }
  };

  const handleInputBlur = () => {
    // If user typed something and blurred without selecting, commit it if valid
    const trimmed = searchQuery.trim();
    if (trimmed && trimmed.toLowerCase() !== selectedCrop.toLowerCase()) {
      const direct = findCropByName(trimmed);
      if (direct) {
        onSelect({
          crop: direct.name,
          cropId: direct.id,
          variety: direct.varieties[0]?.name || 'Standard Variety',
          varietyId: direct.varieties[0]?.id || 'VAR-01',
          isOther: false
        });
        setActiveCropId(direct.id);
      } else {
        // Adopt as custom crop
        const custom = createCustomCropItem(trimmed);
        onSelect({
          crop: custom.name,
          cropId: custom.id,
          variety: custom.varieties[0]?.name || 'Standard Variety',
          varietyId: custom.varieties[0]?.id || 'VAR-01',
          isOther: true
        });
        setActiveCropId(custom.id);
      }
    }
  };

  const isOtherSelected =
    selectedVariety === 'Other' ||
    selectedVarietyId?.includes('OTHER') ||
    selectedCropId?.includes('CUSTOM');

  const trimmedQuery = searchQuery.trim();
  const hasDirectMatch = matchingCrops.some(
    (c) => c.name.toLowerCase() === trimmedQuery.toLowerCase()
  );

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
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder="Search crop or enter new crop name (e.g. Wheat, Tomato, Onion...)"
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
              title="Clear crop input"
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
      {!isOpen && selectedCrop && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#eaf4ec] border border-[#a3b18a]/40 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#01472e]">{selectedCrop}</span>
            <span className="text-[#5c7065]">•</span>
            <span className="text-[#01472e] font-medium">
              {isOtherSelected && customVariety
                ? `${customVariety} (Custom Variety)`
                : selectedVariety || 'Standard Variety'}
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

      {/* Custom Variety Input Field (when 'Other' or Custom Crop is selected) */}
      {isOtherSelected && onCustomVarietyChange && (
        <div className="mt-1 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Specify Variety / Seed Line for {selectedCrop}
            </label>
            <span className="text-[10px] text-amber-700 font-medium">Enter farmer / heirloom / hybrid name</span>
          </div>
          <input
            type="text"
            value={customVariety}
            onChange={(e) => onCustomVarietyChange(e.target.value)}
            placeholder={`e.g. ${selectedCrop} Heirloom / Local Seed Variety`}
            className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-amber-950 placeholder-amber-400/80 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600"
            autoFocus
          />
        </div>
      )}

      {/* Autocomplete Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#ccd5ae] rounded-2xl shadow-xl z-50 overflow-hidden text-xs max-h-84 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Select Popular Crop Pills (when search is empty or short) */}
          {(!trimmedQuery || trimmedQuery.length < 2) && (
            <div className="p-2.5 bg-[#faf9f5] border-b border-[#ccd5ae]/40">
              <span className="text-[10px] uppercase font-bold text-[#788c80] block mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-700" />
                Popular Agricultural Crops:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CROPS.map((pCrop) => (
                  <button
                    key={pCrop}
                    type="button"
                    onClick={() => handleQuickSelectCrop(pCrop)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-[#01472e] border border-[#ccd5ae]/60 hover:bg-[#01472e] hover:text-white transition cursor-pointer"
                  >
                    {pCrop}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Option to Add Custom Crop if user typed something not matching exactly */}
          {trimmedQuery && !hasDirectMatch && (
            <div className="p-2.5 bg-amber-50 border-b border-amber-200 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectCustomCrop(trimmedQuery)}
                className="w-full text-left p-2 bg-white rounded-xl border border-amber-300 hover:bg-amber-100/60 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-[#01472e] text-xs">
                      List &ldquo;{trimmedQuery}&rdquo; as New Crop
                    </span>
                    <span className="text-[10px] text-amber-800 block">
                      Custom crop not in catalog &bull; Click to add with custom variety
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  New Crop
                </span>
              </button>
            </div>
          )}

          {matchingCrops.length > 0 ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Other Matching Crops Tabs */}
              {matchingCrops.length > 1 && (
                <div className="px-3 py-2 bg-[#f8faf7] border-b border-[#ccd5ae]/40 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  <span className="text-[10px] uppercase font-bold text-[#788c80] mr-1 shrink-0">
                    Matches:
                  </span>
                  {matchingCrops.slice(0, 8).map((c) => (
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
                  <button
                    type="button"
                    onClick={() => handleQuickSelectCrop(activeCrop.name)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#01472e] text-white font-medium hover:bg-[#025235] transition cursor-pointer"
                  >
                    Quick Select
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-[#5c7065] mt-1.5 uppercase tracking-wide">
                  Available Varieties:
                </p>
              </div>

              {/* Varieties List */}
              <div className="overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100 max-h-48">
                {activeCrop.varieties.map((v) => {
                  const isSelected =
                    selectedCrop.toLowerCase() === activeCrop.name.toLowerCase() &&
                    (selectedVariety === v.name || selectedVarietyId === v.id);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariety(activeCrop, v)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer group ${
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
                            &mdash; {activeCrop.name}
                          </span>
                        )}
                        {v.isOther && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 font-medium'
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
            <div className="p-6 text-center text-slate-500 space-y-2">
              <p className="text-xs font-semibold text-[#01472e]">
                No predefined catalog match for &ldquo;{trimmedQuery}&rdquo;
              </p>
              <p className="text-[11px] text-[#788c80]">
                You can still list this crop immediately by clicking the button above!
              </p>
              <button
                type="button"
                onClick={() => handleSelectCustomCrop(trimmedQuery)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#01472e] text-white rounded-xl text-xs font-semibold hover:bg-[#025235] transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List &ldquo;{trimmedQuery}&rdquo; as Crop</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
