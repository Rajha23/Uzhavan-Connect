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
  },
  {
    id: 'CROP-WHEAT',
    name: 'Wheat',
    tamilName: 'கோதுமை (Godhumai)',
    category: 'Cereals',
    aliases: ['wheat', 'godhumai', 'gehun', 'gothumai'],
    varieties: [
      { id: 'VAR-WHT-01', name: 'Sharbati' },
      { id: 'VAR-WHT-02', name: 'HD 2967' },
      { id: 'VAR-WHT-03', name: 'Lokwan' },
      { id: 'VAR-WHT-04', name: 'DBW 187 (Karan Vandana)' },
      { id: 'VAR-WHT-05', name: 'Local / Traditional Wheat' },
      { id: 'VAR-WHT-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-COTTON',
    name: 'Cotton',
    tamilName: 'பருத்தி (Paruthi)',
    category: 'Cash Crops',
    aliases: ['cotton', 'paruthi', 'kapas'],
    varieties: [
      { id: 'VAR-COT-01', name: 'Suvin Extra Long Staple' },
      { id: 'VAR-COT-02', name: 'MCU-5' },
      { id: 'VAR-COT-03', name: 'Bt Cotton Hybrid' },
      { id: 'VAR-COT-04', name: 'Surabhi' },
      { id: 'VAR-COT-05', name: 'Local / Desi Cotton' },
      { id: 'VAR-COT-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-SUGARCANE',
    name: 'Sugarcane',
    tamilName: 'கரும்பு (Karumbu)',
    category: 'Cash Crops',
    aliases: ['sugarcane', 'karumbu', 'ganna'],
    varieties: [
      { id: 'VAR-SUG-01', name: 'Co 86032 (Nayana)' },
      { id: 'VAR-SUG-02', name: 'Co 0238' },
      { id: 'VAR-SUG-03', name: 'CoC 671' },
      { id: 'VAR-SUG-04', name: 'Co 11015' },
      { id: 'VAR-SUG-05', name: 'Local / Traditional Sugarcane' },
      { id: 'VAR-SUG-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-RAGI',
    name: 'Finger Millet (Ragi)',
    tamilName: 'கேழ்வரகு / ராகி (Kelvaragu / Ragi)',
    category: 'Cereals',
    aliases: ['ragi', 'finger millet', 'kelvaragu', 'mandua'],
    varieties: [
      { id: 'VAR-RAG-01', name: 'GPU 28' },
      { id: 'VAR-RAG-02', name: 'Paiyur 2' },
      { id: 'VAR-RAG-03', name: 'CO 15' },
      { id: 'VAR-RAG-04', name: 'ML 365' },
      { id: 'VAR-RAG-05', name: 'Country / Heirloom Ragi' },
      { id: 'VAR-RAG-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-BAJRA',
    name: 'Pearl Millet (Bajra)',
    tamilName: 'கம்பு (Kambu)',
    category: 'Cereals',
    aliases: ['bajra', 'pearl millet', 'kambu'],
    varieties: [
      { id: 'VAR-BAJ-01', name: 'CO 10' },
      { id: 'VAR-BAJ-02', name: 'ICMH 356' },
      { id: 'VAR-BAJ-03', name: 'HHB 67 Improved' },
      { id: 'VAR-BAJ-04', name: 'Local Traditional Kambu' },
      { id: 'VAR-BAJ-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-BLACK-GRAM',
    name: 'Black Gram (Urad Dal)',
    tamilName: 'உளுந்து (Ulundhu)',
    category: 'Pulses',
    aliases: ['black gram', 'urad', 'ulundhu', 'urad dal'],
    varieties: [
      { id: 'VAR-BGR-01', name: 'VBN 8' },
      { id: 'VAR-BGR-02', name: 'ADT 5' },
      { id: 'VAR-BGR-03', name: 'VBN 6' },
      { id: 'VAR-BGR-04', name: 'Mash 114' },
      { id: 'VAR-BGR-05', name: 'Local Ulundhu' },
      { id: 'VAR-BGR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-GREEN-GRAM',
    name: 'Green Gram (Moong Dal)',
    tamilName: 'பாசிப்பயறு (Paasi Payaru)',
    category: 'Pulses',
    aliases: ['green gram', 'moong', 'paasi payaru', 'mung bean'],
    varieties: [
      { id: 'VAR-GGR-01', name: 'VRM 1' },
      { id: 'VAR-GGR-02', name: 'CO 8' },
      { id: 'VAR-GGR-03', name: 'Pusa Vishal' },
      { id: 'VAR-GGR-04', name: 'Local Paasi Payaru' },
      { id: 'VAR-GGR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-RED-GRAM',
    name: 'Red Gram (Toor Dal)',
    tamilName: 'துவரை (Thuvarai)',
    category: 'Pulses',
    aliases: ['red gram', 'toor', 'tur dal', 'thuvarai', 'pigeon pea'],
    varieties: [
      { id: 'VAR-RGR-01', name: 'CO 7' },
      { id: 'VAR-RGR-02', name: 'BSR 1' },
      { id: 'VAR-RGR-03', name: 'ICPL 87' },
      { id: 'VAR-RGR-04', name: 'Local Country Thuvarai' },
      { id: 'VAR-RGR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-GARLIC',
    name: 'Garlic',
    tamilName: 'பூண்டு (Poondu)',
    category: 'Spices',
    aliases: ['garlic', 'poondu', 'lehsun'],
    varieties: [
      { id: 'VAR-GAR-01', name: 'Ooty 1 (Hill Garlic)' },
      { id: 'VAR-GAR-02', name: 'Yamuna Safed (G-1)' },
      { id: 'VAR-GAR-03', name: 'G-282' },
      { id: 'VAR-GAR-04', name: 'Kodaikanal Malai Poondu (GI)' },
      { id: 'VAR-GAR-05', name: 'Country / Local Garlic' },
      { id: 'VAR-GAR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-GINGER',
    name: 'Ginger',
    tamilName: 'இஞ்சி (Inji)',
    category: 'Spices',
    aliases: ['ginger', 'inji', 'adrak'],
    varieties: [
      { id: 'VAR-GIN-01', name: 'Maran' },
      { id: 'VAR-GIN-02', name: 'Rio-de-Janeiro' },
      { id: 'VAR-GIN-03', name: 'IISR Varada' },
      { id: 'VAR-GIN-04', name: 'Local Country Ginger' },
      { id: 'VAR-GIN-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-DRUMSTICK',
    name: 'Drumstick (Moringa)',
    tamilName: 'முருங்கைக்காய் (Murungaikkai)',
    category: 'Vegetables',
    aliases: ['drumstick', 'moringa', 'murungaikkai', 'murungai'],
    varieties: [
      { id: 'VAR-DRU-01', name: 'PKM 1 Annual Moringa' },
      { id: 'VAR-DRU-02', name: 'PKM 2' },
      { id: 'VAR-DRU-03', name: 'ODC 3' },
      { id: 'VAR-DRU-04', name: 'Jaffna Moringa' },
      { id: 'VAR-DRU-05', name: 'Local Country Drumstick' },
      { id: 'VAR-DRU-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-OKRA',
    name: 'Ladies Finger (Okra / Bhendi)',
    tamilName: 'வெண்டைக்காய் (Vendaikkai)',
    category: 'Vegetables',
    aliases: ['ladies finger', 'okra', 'bhendi', 'bhindi', 'vendaikkai'],
    varieties: [
      { id: 'VAR-OKR-01', name: 'Arka Anamika' },
      { id: 'VAR-OKR-02', name: 'Parbhani Kranti' },
      { id: 'VAR-OKR-03', name: 'Mahyco 10 Hybrid' },
      { id: 'VAR-OKR-04', name: 'Syngenta 152' },
      { id: 'VAR-OKR-05', name: 'Local Country Vendaikkai' },
      { id: 'VAR-OKR-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-WATERMELON',
    name: 'Watermelon',
    tamilName: 'தர்பூசணி (Tharpusani)',
    category: 'Fruits',
    aliases: ['watermelon', 'tharpusani', 'tarbuj'],
    varieties: [
      { id: 'VAR-WAT-01', name: 'Kiran (Icebox Hybrid)' },
      { id: 'VAR-WAT-02', name: 'Sugar Baby' },
      { id: 'VAR-WAT-03', name: 'Namdhari NS 295' },
      { id: 'VAR-WAT-04', name: 'Maxx Black Hybrid' },
      { id: 'VAR-WAT-05', name: 'Local Watermelon' },
      { id: 'VAR-WAT-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-PAPAYA',
    name: 'Papaya',
    tamilName: 'பப்பாளி (Pappali)',
    category: 'Fruits',
    aliases: ['papaya', 'pappali', 'papita'],
    varieties: [
      { id: 'VAR-PAP-01', name: 'Red Lady 786' },
      { id: 'VAR-PAP-02', name: 'Coorg Honey Dew' },
      { id: 'VAR-PAP-03', name: 'CO 8 Hybrid' },
      { id: 'VAR-PAP-04', name: 'Taiwan 786' },
      { id: 'VAR-PAP-05', name: 'Local Country Papaya' },
      { id: 'VAR-PAP-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-TAPIOCA',
    name: 'Tapioca / Cassava',
    tamilName: 'மரவள்ளிக்கிழங்கு (Maravallikizhangu)',
    category: 'Vegetables',
    aliases: ['tapioca', 'cassava', 'maravallikizhangu', 'kappakizhangu'],
    varieties: [
      { id: 'VAR-TAP-01', name: 'Kunguma Rose' },
      { id: 'VAR-TAP-02', name: 'CO 2' },
      { id: 'VAR-TAP-03', name: 'Mulluvadi (Sago Grade)' },
      { id: 'VAR-TAP-04', name: 'H-226' },
      { id: 'VAR-TAP-05', name: 'Local Country Tapioca' },
      { id: 'VAR-TAP-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-CAULIFLOWER',
    name: 'Cauliflower',
    tamilName: 'காலிஃபிளவர் (Cauliflower)',
    category: 'Vegetables',
    aliases: ['cauliflower', 'gobhi', 'phool gobhi'],
    varieties: [
      { id: 'VAR-CAU-01', name: 'Pusa Snowball K-1' },
      { id: 'VAR-CAU-02', name: 'Pusa Deepali' },
      { id: 'VAR-CAU-03', name: 'Syngenta White Flash' },
      { id: 'VAR-CAU-04', name: 'Local Cauliflower' },
      { id: 'VAR-CAU-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-BEETROOT',
    name: 'Beetroot',
    tamilName: 'பீட்ரூட் (Beetroot)',
    category: 'Vegetables',
    aliases: ['beetroot', 'chukandar', 'beet'],
    varieties: [
      { id: 'VAR-BEE-01', name: 'Detroit Dark Red' },
      { id: 'VAR-BEE-02', name: 'Crimson Globe' },
      { id: 'VAR-BEE-03', name: 'Ruby Queen' },
      { id: 'VAR-BEE-04', name: 'Ooty Local Beetroot' },
      { id: 'VAR-BEE-OTHER', name: 'Other', isOther: true }
    ]
  },
  {
    id: 'CROP-JASMINE',
    name: 'Jasmine (Malligai)',
    tamilName: 'மல்லிகைப்பூ (Malligai)',
    category: 'Cash Crops',
    aliases: ['jasmine', 'malli', 'malligai', 'madurai malli', 'mogra'],
    varieties: [
      { id: 'VAR-JAS-01', name: 'Madurai Malli (GI Tag)' },
      { id: 'VAR-JAS-02', name: 'Gundumalli' },
      { id: 'VAR-JAS-03', name: 'Ramanathapuram Local' },
      { id: 'VAR-JAS-04', name: 'Pitchi (Jathimalli)' },
      { id: 'VAR-JAS-OTHER', name: 'Other', isOther: true }
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

export const createCustomCropItem = (name: string): CropMasterItem => {
  const cleanName = name.trim();
  const slug = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 16);
  return {
    id: `CROP-${slug || 'CUSTOM'}`,
    name: cleanName,
    tamilName: cleanName,
    category: 'Vegetables',
    aliases: [cleanName.toLowerCase()],
    varieties: [
      { id: `VAR-${slug || 'CUST'}-01`, name: 'Standard / Regional Variety' },
      { id: `VAR-${slug || 'CUST'}-02`, name: 'Certified Hybrid Seed' },
      { id: `VAR-${slug || 'CUST'}-03`, name: 'Local / Traditional Heirloom' },
      { id: `VAR-${slug || 'CUST'}-OTHER`, name: 'Other', isOther: true }
    ]
  };
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
