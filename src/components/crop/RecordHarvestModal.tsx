import React, { useState } from 'react';
import { X, Save, CalendarDays, Scale } from 'lucide-react';
import { ProduceListing, HarvestRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

interface RecordHarvestModalProps {
  listing: ProduceListing;
  onClose: () => void;
}

export const RecordHarvestModal: React.FC<RecordHarvestModalProps> = ({ listing, onClose }) => {
  const { addHarvestRecord, currentUser } = useApp();
  const { t } = useLanguage();

  const [actualDate, setActualDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestedKg, setHarvestedKg] = useState(listing.quantityKg || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: HarvestRecord = {
      id: `hr_${Date.now()}`,
      farmerId: currentUser.id,
      crop: listing.crop,
      variety: listing.variety,
      sowingDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0], // Mock sowing date for now
      expectedHarvestDate: listing.harvestDate,
      actualHarvestDate: actualDate,
      harvestedQuantityKg: harvestedKg,
      remainingQuantityKg: harvestedKg, // Initially remaining is equal to harvested
      status: 'Completed',
    };

    addHarvestRecord(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#faf9f5] w-full max-w-md rounded-[28px] shadow-2xl border border-[#ccd5ae]/40 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 sm:p-6 border-b border-[#ccd5ae]/30 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-[#01472e]">
              Record Harvest
            </h2>
            <p className="text-xs text-[#5c7065] mt-1">
              Log actual harvest data for {listing.crop} {listing.variety ? `(${listing.variety})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#01472e] mb-1.5 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#5c7065]" />
                Actual Harvest Date
              </label>
              <input
                type="date"
                value={actualDate}
                onChange={(e) => setActualDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
              />
              <p className="text-[10px] text-[#5c7065] mt-1">
                Expected date was: <strong className="text-[#01472e]">{listing.harvestDate}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#01472e] mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#5c7065]" />
                Total Harvested Quantity (kg)
              </label>
              <input
                type="number"
                value={harvestedKg}
                onChange={(e) => setHarvestedKg(Number(e.target.value))}
                min={1}
                required
                className="w-full text-xs bg-white border border-[#ccd5ae] rounded-xl px-3.5 py-2.5 text-[#01472e] focus:outline-none focus:ring-2 focus:ring-[#01472e]/20"
              />
              <p className="text-[10px] text-[#5c7065] mt-1">
                Amount originally estimated: <strong className="text-[#01472e]">{listing.quantityKg} kg</strong>
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-medium bg-[#01472e] text-[#fefae0] hover:bg-[#025235] transition shadow-soft flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
