// ─── Crop & Variety Master Database ─────────────────────────────────────────
// Comprehensive taxonomy of crops and registered agricultural varieties for Uzhavan Connect

export interface CropVariety {
  id: string;
  name: string;
  isOther?: boolean;
}

export interface CropMasterItem {
  id: string;
  name: string;
  tamilName?: string;
  category: 'Vegetables' | 'Cereals' | 'Pulses' | 'Fruits' | 'Spices' | 'Oilseeds' | 'Cash Crops';
  aliases: string[];
  varieties: CropVariety[];
}

export const CROP_MASTER_DATABASE: CropMasterItem[] = [
  {
    id: 'CROP-TOMATO',
    name: 'Tomato',
    tamilName: 'தக்காளி (Thakkali)',
    category: 'Vegetables',
    aliases: ['tomato', 'thakkali', 'tamatar', 'tomatoes'],
    varieties: [
      { id: 'VAR-TOM-01', name: 'Arka Rakshak' },
      { id: 'VAR-TOM-02', name: 'Arka Vikas' },
      { id: 'VAR-TOM-03', name: 'Pusa Ruby' },
      { id: 'VAR-TOM-04', name: 'Hybrid Tomato' },
      { id: 'VAR-TOM-05', name: 'Cherry Tomato' },
      { id: 'VAR-TOM-06', name: 'Local/Traditional Tomato' },
      { id: 'VAR-TOM-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-RICE',
    name: 'Rice',
    tamilName: 'அரிசி / நெல் (Arisi / Nel)',
    category: 'Cereals',
    aliases: ['rice', 'paddy', 'nel', 'arisi', 'chawal'],
    varieties: [
      { id: 'VAR-RICE-01', name: 'Ponni' },
      { id: 'VAR-RICE-02', name: 'Basmati' },
      { id: 'VAR-RICE-03', name: 'Sona Masuri' },
      { id: 'VAR-RICE-04', name: 'BPT 5204 (Samba Mahsuri)' },
      { id: 'VAR-RICE-05', name: 'IR 20' },
      { id: 'VAR-RICE-06', name: 'Seeraga Samba' },
      { id: 'VAR-RICE-07', name: 'CR 1009 Sub 1' },
      { id: 'VAR-RICE-08', name: 'Local/Traditional Rice' },
      { id: 'VAR-RICE-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-ONION',
    name: 'Onion',
    tamilName: 'வெங்காயம் (Vengayam)',
    category: 'Vegetables',
    aliases: ['onion', 'vengayam', 'pyaz', 'shallots', 'small onion'],
    varieties: [
      { id: 'VAR-ONI-01', name: 'Bellary Onion' },
      { id: 'VAR-ONI-02', name: 'Small Onion / Shallots (Sambar Vengayam)' },
      { id: 'VAR-ONI-03', name: 'Nasik Red' },
      { id: 'VAR-ONI-04', name: 'Bhima Super' },
      { id: 'VAR-ONI-05', name: 'Local/Traditional Onion' },
      { id: 'VAR-ONI-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-GREEN-CHILLI',
    name: 'Green Chilli',
    tamilName: 'பச்சை மிளகாய் (Pachai Milagai)',
    category: 'Vegetables',
    aliases: ['green chilli', 'chilli', 'chili', 'milagai', 'mirchi', 'pepper'],
    varieties: [
      { id: 'VAR-CHIL-01', name: 'Guntur Sannam' },
      { id: 'VAR-CHIL-02', name: 'Byadagi' },
      { id: 'VAR-CHIL-03', name: 'Kanthari / Bird\'s Eye' },
      { id: 'VAR-CHIL-04', name: 'Samba Chilli' },
      { id: 'VAR-CHIL-05', name: 'Hybrid Green Chilli' },
      { id: 'VAR-CHIL-06', name: 'Local/Traditional Chilli' },
      { id: 'VAR-CHIL-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-BANANA',
    name: 'Banana',
    tamilName: 'வாழைப்பழம் (Vazhaipazham)',
    category: 'Fruits',
    aliases: ['banana', 'vazhai', 'kela', 'plantain'],
    varieties: [
      { id: 'VAR-BAN-01', name: 'Grand Naine (G9)' },
      { id: 'VAR-BAN-02', name: 'Robusta' },
      { id: 'VAR-BAN-03', name: 'Poovan' },
      { id: 'VAR-BAN-04', name: 'Rasthali' },
      { id: 'VAR-BAN-05', name: 'Nendran' },
      { id: 'VAR-BAN-06', name: 'Red Banana (Sevvazhai)' },
      { id: 'VAR-BAN-07', name: 'Local/Traditional Banana' },
      { id: 'VAR-BAN-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-TURMERIC',
    name: 'Turmeric',
    tamilName: 'மஞ்சள் (Manjal)',
    category: 'Spices',
    aliases: ['turmeric', 'manjal', 'haldi'],
    varieties: [
      { id: 'VAR-TUR-01', name: 'Erode Local (Manjal)' },
      { id: 'VAR-TUR-02', name: 'Salem Turmeric' },
      { id: 'VAR-TUR-03', name: 'Prathibha' },
      { id: 'VAR-TUR-04', name: 'IISR Alleppey Supreme' },
      { id: 'VAR-TUR-05', name: 'Local/Traditional Turmeric' },
      { id: 'VAR-TUR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-GROUNDNUT',
    name: 'Groundnut',
    tamilName: 'வேர்க்கடலை / மணிலா (Verkadalai)',
    category: 'Oilseeds',
    aliases: ['groundnut', 'peanut', 'verkadalai', 'mungfali'],
    varieties: [
      { id: 'VAR-GND-01', name: 'TMV 7' },
      { id: 'VAR-GND-02', name: 'TMV 13' },
      { id: 'VAR-GND-03', name: 'VRI 2' },
      { id: 'VAR-GND-04', name: 'Kadiri 6' },
      { id: 'VAR-GND-05', name: 'Bold Spanish' },
      { id: 'VAR-GND-06', name: 'Local/Traditional Groundnut' },
      { id: 'VAR-GND-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-MAIZE',
    name: 'Maize',
    tamilName: 'மக்காச்சோளம் (Makkacholam)',
    category: 'Cereals',
    aliases: ['maize', 'corn', 'makkacholam', 'makka'],
    varieties: [
      { id: 'VAR-MAI-01', name: 'Hybrid Yellow Dent' },
      { id: 'VAR-MAI-02', name: 'African Tall' },
      { id: 'VAR-MAI-03', name: 'Sweet Corn (Sugar 75)' },
      { id: 'VAR-MAI-04', name: 'Baby Corn' },
      { id: 'VAR-MAI-05', name: 'Local/Traditional Maize' },
      { id: 'VAR-MAI-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-CARROT',
    name: 'Carrot',
    tamilName: 'கேரட் (Carrot)',
    category: 'Vegetables',
    aliases: ['carrot', 'gajar'],
    varieties: [
      { id: 'VAR-CAR-01', name: 'Pusa Rudhira' },
      { id: 'VAR-CAR-02', name: 'Nantes Half Long' },
      { id: 'VAR-CAR-03', name: 'Kuroda Hybrid' },
      { id: 'VAR-CAR-04', name: 'Ooty Local' },
      { id: 'VAR-CAR-05', name: 'Local/Traditional Carrot' },
      { id: 'VAR-CAR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-CAPSICUM',
    name: 'Capsicum',
    tamilName: 'குடைமிளகாய் (Kudaimilagai)',
    category: 'Vegetables',
    aliases: ['capsicum', 'bell pepper', 'shimla mirch', 'kudaimilagai'],
    varieties: [
      { id: 'VAR-CAP-01', name: 'Indra Green Hybrid' },
      { id: 'VAR-CAP-02', name: 'Yellow Bell Pepper' },
      { id: 'VAR-CAP-03', name: 'Red Bell Pepper' },
      { id: 'VAR-CAP-04', name: 'Local/Traditional Capsicum' },
      { id: 'VAR-CAP-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-POTATO',
    name: 'Potato',
    tamilName: 'உருளைக்கிழங்கு (Urulaikizhangu)',
    category: 'Vegetables',
    aliases: ['potato', 'urulaikizhangu', 'aloo'],
    varieties: [
      { id: 'VAR-POT-01', name: 'Kufri Jyoti' },
      { id: 'VAR-POT-02', name: 'Kufri Pukhraj' },
      { id: 'VAR-POT-03', name: 'Kufri Chipsona' },
      { id: 'VAR-POT-04', name: 'Local/Traditional Potato' },
      { id: 'VAR-POT-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-MANGO',
    name: 'Mango',
    tamilName: 'மாம்பழம் (Maambazham)',
    category: 'Fruits',
    aliases: ['mango', 'mambazham', 'aam'],
    varieties: [
      { id: 'VAR-MAN-01', name: 'Alphonso' },
      { id: 'VAR-MAN-02', name: 'Banganapalli' },
      { id: 'VAR-MAN-03', name: 'Imam Pasand (Himayat)' },
      { id: 'VAR-MAN-04', name: 'Neelam' },
      { id: 'VAR-MAN-05', name: 'Totapuri' },
      { id: 'VAR-MAN-06', name: 'Sendhura' },
      { id: 'VAR-MAN-07', name: 'Local/Traditional Mango' },
      { id: 'VAR-MAN-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-CABBAGE',
    name: 'Cabbage',
    tamilName: 'முட்டைக்கோஸ் (Muttaikose)',
    category: 'Vegetables',
    aliases: ['cabbage', 'muttaikose', 'patta gobhi'],
    varieties: [
      { id: 'VAR-CAB-01', name: 'Golden Acre' },
      { id: 'VAR-CAB-02', name: 'Pusa Drumhead' },
      { id: 'VAR-CAB-03', name: 'Green Express Hybrid' },
      { id: 'VAR-CAB-04', name: 'Red Cabbage' },
      { id: 'VAR-CAB-05', name: 'Local/Traditional Cabbage' },
      { id: 'VAR-CAB-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-COCONUT',
    name: 'Coconut',
    tamilName: 'தேங்காய் / இளநீர் (Thengai)',
    category: 'Cash Crops',
    aliases: ['coconut', 'thengai', 'nariyal', 'elaneer', 'tender coconut'],
    varieties: [
      { id: 'VAR-COC-01', name: 'West Coast Tall' },
      { id: 'VAR-COC-02', name: 'East Coast Tall' },
      { id: 'VAR-COC-03', name: 'Chowghat Orange Dwarf (Tender Coconut)' },
      { id: 'VAR-COC-04', name: 'Malayan Yellow Dwarf' },
      { id: 'VAR-COC-05', name: 'D x T Hybrid' },
      { id: 'VAR-COC-06', name: 'Local/Traditional Coconut' },
      { id: 'VAR-COC-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-BRINJAL',
    name: 'Brinjal',
    tamilName: 'கத்தரிக்காய் (Katharikkai)',
    category: 'Vegetables',
    aliases: ['brinjal', 'eggplant', 'katharikkai', 'baingan', 'aubergine'],
    varieties: [
      { id: 'VAR-BRI-01', name: 'Annamalai' },
      { id: 'VAR-BRI-02', name: 'PKM 1' },
      { id: 'VAR-BRI-03', name: 'Udupi Gulla' },
      { id: 'VAR-BRI-04', name: 'Bhavani Local' },
      { id: 'VAR-BRI-05', name: 'Local/Traditional Brinjal' },
      { id: 'VAR-BRI-OTHER', name: 'Other', isOther: true }
    ]
  }
];

// Helper methods for querying crop master data
export const getCropById = (cropId: string): CropMasterItem | undefined => {
  return CROP_MASTER_DATABASE.find(c => c.id.toLowerCase() === cropId.toLowerCase());
};

export const findCropByName = (name: string): CropMasterItem | undefined => {
  if (!name) return undefined;
  const q = name.trim().toLowerCase();
  return CROP_MASTER_DATABASE.find(c =>
    c.name.toLowerCase() === q ||
    c.id.toLowerCase() === q ||
    c.aliases.some(a => a.toLowerCase() === q)
  );
};

export const searchCrops = (query: string): CropMasterItem[] => {
  if (!query || !query.trim()) return CROP_MASTER_DATABASE;
  const q = query.trim().toLowerCase();
  return CROP_MASTER_DATABASE.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.aliases.some(a => a.toLowerCase().includes(q)) ||
    (c.tamilName && c.tamilName.toLowerCase().includes(q)) ||
    c.varieties.some(v => v.name.toLowerCase().includes(q))
  );
};
