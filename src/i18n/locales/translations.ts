import { TranslationDictionary } from '../../types/i18n';
import { enTranslations } from './en';

type DeepPartial<T> = {
  [P in keyof T]?: Partial<T[P]>;
};

// ── 1. TAMIL (தமிழ்) ────────────────────────────────────────────────────────
export const taTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    search: 'தேடுக...',
    logout: 'வெளியேறு',
    continue: 'தொடரவும்',
    edit: 'திருத்து',
    view: 'பார்வையிடு',
    back: 'பின்செல்',
    status: 'நிலை',
    filter: 'வடிகட்டு',
    all: 'அனைத்தும்',
    loading: 'ஏற்றப்படுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    select: 'தேர்ந்தெடு',
    close: 'மூடு',
    refresh: 'புதுப்பி',
    confirm: 'உறுதி செய்',
    delete: 'நீக்கு',
    actions: 'செயல்கள்',
    date: 'தேதி',
    details: 'விவரங்கள்',
    verified: 'சரிபார்க்கப்பட்டது',
    pending: 'நிலுவையில்',
    completed: 'நிறைவடைந்தது',
    quantity: 'அளவு',
    price: 'விலை',
    total: 'மொத்தம்',
    grade: 'தரம்',
    location: 'இடம்',
    offline: 'ஆஃப்லைன் பயன்முறை',
    online: 'இணைக்கப்பட்டுள்ளது',
    syncing: 'ஒத்திசைக்கப்படுகிறது...'
  },
  nav: {
    dashboard: 'கட்டுப்பாட்டு மையம்',
    myProduce: 'என் விளைபொருட்கள்',
    demandSignals: 'சந்தை தேவைகள்',
    demandForecast: 'தேவை முன்னறிவிப்பு',
    findBuyers: 'நேரடி வாங்குவோர்',
    orders: 'ஆர்டர்கள்',
    logistics: 'போக்குவரத்து',
    traceability: 'கண்காணிப்பு & தரம்',
    settlement: 'வருவாய் & தீர்வு',
    profile: 'என் சுயவிவரம்',
    settings: 'அமைப்புகள்',
    language: 'மொழி',
    reports: 'அறிக்கைகள் & KPIs',
    procurement: 'கொள்முதல் மையம்',
    reverseAuction: 'தலைகீழ் ஏலம்',
    smartMatching: 'சப்ளையர் பொருத்தங்கள்',
    fleetTelematics: 'வாகன கண்காணிப்பு',
    support: 'உதவி & ஆதரவு',
    schemes: 'அரசு திட்டங்கள்'
  },
  farmer: {
    myCrops: 'என் அறுவடை பட்டியல்கள்',
    addCrop: 'புதிய அறுவடையைப் பதிவு செய்',
    cropName: 'பயிர் பெயர்',
    variety: 'ரகம்',
    expectedYield: 'கிடைக்கும் அளவு (கிலோ)',
    harvestDate: 'அறுவடை தேதி',
    expectedPrice: 'எதிர்பார்க்கும் விலை / கிலோ (₹)',
    marketDemand: 'சந்தை தேவை பொருத்தம்',
    matches: 'நேரடி ஒப்பந்தங்கள்',
    directRealization: 'நிகர உழவர் வரவு',
    totalListings: 'மொத்த விளைபொருட்கள்',
    completedOrders: 'நிறைவேறிய ஆர்டர்கள்',
    quantitySold: 'விற்பனை செய்த அளவு',
    aiMentor: 'AI வேளாண் ஆலோசகர்'
  },
  buyer: {
    createDemand: 'முன்னோக்கு தேவை பதிவு செய்',
    demandRequirement: 'கொள்முதல் விவரக்குறிப்பு',
    requiredQuantity: 'தேவைப்படும் அளவு (கிலோ)',
    maxBudgetPrice: 'இலக்கு விலை (₹/கிலோ)',
    targetDate: 'டெலிவரி தேவைப்படும் தேதி',
    activeDemands: 'செயலில் உள்ள தேவைகள்',
    directContracts: 'நேரடி சப்ளையர் சலுகைகள்',
    receivingHandover: 'டெலிவரி ஒப்புதல் & தணிக்கை'
  },
  settlement: {
    escrowDisbursement: 'தானியங்கி எஸ்க்ரோ பட்டுவாடா',
    directRealization: 'நேரடி உழவர் வரவு',
    farmerShare: 'உழவருக்கு நேரடி ரொக்கம்',
    traditionalComparison: 'மண்டி இடைத்தரகர்கள் vs நேரடி வரவு',
    zeroMiddlemen: 'இடைத்தரகர் கமிஷன் பூஜ்ஜியம் • 90-நாள் கடன் தாமதமில்லை',
    bankUtrReference: 'வங்கி UTR குறிப்பு எண்'
  },
  auth: {
    welcomeTitle: 'செயல்பாட்டு அணுகல் தளம்',
    signIn: 'உள்நுழைக',
    createAccount: 'புதிய கணக்கு உருவாக்கு',
    mobileOrEmail: 'மொபைல் எண் / மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    loginButton: 'உழவன் கனெக்டில் உள்நுழைக',
    completeRegistration: 'பதிவை முடிக்கவும்'
  },
  onboarding: {
    welcomeTitle: 'உழவன் கனெக்ட்டிற்கு நல்வரவு 🌱',
    welcomeSubtitle: 'வேளாண் பணிகளுக்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
    chooseLanguage: 'விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    changeAnytimeNote: 'அமைப்புகள் அல்லது மேல் பட்டையிலிருந்து எப்போது வேண்டுமானாலும் மொழியை மாற்றிக்கொள்ளலாம்.',
    searchPlaceholder: 'மொழியின் பெயர் அல்லது குறியீடு மூலம் தேடுக (எ.கா. தமிழ், ta)...',
    continueBtn: 'தளத்திற்குச் செல்லவும் →',
    currentSelection: 'தற்போதைய தேர்வு'
  },
  support: {
    pageTitle: 'உதவி & ஆதரவு',
    subtitle: 'உழவன் கனெக்ட் தொடர்பான உதவி தேவையா?',
    description: 'கேள்விகள் உள்ளதா, சிக்கலை எதிர்கொள்கிறீர்களா அல்லது தளத்தில் உதவி தேவையா? எங்கள் ஆதரவுக் குழு உதவத் தயாராக உள்ளது.',
    copyEmail: 'மின்னஞ்சல் முகவரியை நகலெடு',
    copiedToast: 'மின்னஞ்சல் நகலெடுக்கப்பட்டது',
    openEmailClient: 'மின்னஞ்சல் செயலியைத் திற',
    returnPreviousPage: 'முந்தைய பக்கத்திற்குத் திரும்பு',
    trustBadge: 'உழவன் கனெக்ட் உதவி மையம் • நேரடி உழவர் & வாங்குவோர் ஆதரவு'
  }
};

// ── 2. HINDI (हिन्दी) ────────────────────────────────────────────────────────
export const hiTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'सहेजें',
    cancel: 'रद्द करें',
    search: 'खोजें...',
    logout: 'लॉग आउट',
    continue: 'आगे बढ़ें',
    edit: 'संपादित करें',
    view: 'देखें',
    back: 'वापस',
    status: 'स्थिति',
    filter: 'फ़िल्टर',
    all: 'सभी',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    select: 'चुनें',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    delete: 'हटाएं',
    actions: 'कार्रवाई',
    date: 'दिनांक',
    details: 'विवरण',
    verified: 'सत्यापित',
    pending: 'लंबित',
    completed: 'पूर्ण',
    quantity: 'मात्रा',
    price: 'मूल्य',
    total: 'कुल',
    grade: 'ग्रेड',
    offline: 'ऑफ़लाइन फ़ील्ड मोड',
    online: 'ऑनलाइन कनेक्टेड'
  },
  nav: {
    dashboard: 'डैशबोर्ड',
    myProduce: 'मेरी फसल व उपज',
    demandSignals: 'बाजार मांग संकेत',
    demandForecast: 'मांग पूर्वानुमान',
    findBuyers: 'सीधे खरीदार',
    orders: 'आदेश / ऑर्डर्स',
    logistics: 'कोल्ड चेन लॉजिस्टिक्स',
    traceability: 'ट्रेसेबिलिटी व गुणवत्ता',
    settlement: 'भुगतान व सीधा निपटान',
    profile: 'मेरी प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    reports: 'रिपोर्ट व आंकड़े',
    procurement: 'थोक खरीद कंसोल',
    reverseAuction: 'रिवर्स नीलामी',
    support: 'सहायता एवं समर्थन',
    schemes: 'सरकारी योजनाएं'
  },
  farmer: {
    myCrops: 'मेरी फसल सूची',
    addCrop: 'नई फसल जोड़ें',
    cropName: 'फसल का नाम',
    variety: 'किस्म',
    expectedYield: 'उपलब्ध मात्रा (किग्रा)',
    harvestDate: 'तैयार होने की तारीख',
    expectedPrice: 'अपेक्षित मूल्य प्रति किग्रा (₹)',
    marketDemand: 'बाजार मांग मिलान',
    matches: 'सीधे खरीदार अनुबंध',
    directRealization: 'सीधा किसान भुगतान',
    totalListings: 'कुल सूचीबद्ध फसलें',
    completedOrders: 'सफल आदेश',
    quantitySold: 'कुल बिक्री मात्रा',
    aiMentor: 'एआई कृषि सलाहकार'
  },
  buyer: {
    createDemand: 'खरीद मांग पोस्ट करें',
    demandRequirement: 'खरीद आवश्यकताएं',
    requiredQuantity: 'मात्रा (किग्रा)',
    maxBudgetPrice: 'लक्ष्य मूल्य (₹/किग्रा)',
    targetDate: 'डिलीवरी की तिथि',
    activeDemands: 'सक्रिय मांगें',
    directContracts: 'सीधे किसान प्रस्ताव'
  },
  settlement: {
    escrowDisbursement: 'स्वचालित एस्क्रो भुगतान',
    directRealization: 'सीधा किसान भुगतान (89% प्राप्ति)',
    farmerShare: 'किसान को नकद भुगतान',
    traditionalComparison: 'मंडी बिचौलिए बनाम सीधा भुगतान',
    zeroMiddlemen: 'शून्य बिचौलिया कटौती • शून्य 90-दिन का विलंब',
    bankUtrReference: 'बैंक यूटीआर संदर्भ'
  },
  auth: {
    welcomeTitle: 'कृषि परिचालन पहुंच पोर्टल',
    signIn: 'साइन इन करें',
    createAccount: 'खाता बनाएं',
    mobileOrEmail: 'मोबाइल नंबर / ईमेल',
    password: 'पासवर्ड',
    loginButton: 'उझवन कनेक्ट में प्रवेश करें',
    completeRegistration: 'पंजीकरण पूरा करें'
  },
  onboarding: {
    welcomeTitle: 'उझवन कनेक्ट में आपका स्वागत है 🌱',
    welcomeSubtitle: 'संपूर्ण कृषि मंच के लिए अपनी पसंदीदा भाषा चुनें',
    chooseLanguage: 'पसंदीदा भाषा चुनें',
    changeAnytimeNote: 'आप इसे कभी भी सेटिंग्स या ऊपरी पट्टी से बदल सकते हैं।',
    searchPlaceholder: 'भाषा नाम, लिपि या कोड से खोजें (उदा. हिन्दी, hi)...',
    continueBtn: 'मंच पर आगे बढ़ें →',
    currentSelection: 'वर्तमान चयन'
  },
  support: {
    pageTitle: 'सहायता एवं समर्थन',
    subtitle: 'क्या आपको उझवन कनेक्ट में सहायता चाहिए?',
    description: 'कोई प्रश्न है, समस्या आ रही है, या प्लेटफ़ॉर्म पर सहायता चाहिए? हमारी सहायता टीम मदद के लिए तत्पर है।',
    copyEmail: 'ईमेल पता कॉपी करें',
    copiedToast: 'ईमेल कॉपी हो गया',
    openEmailClient: 'ईमेल ऐप खोलें',
    returnPreviousPage: 'पिछले पृष्ठ पर वापस जाएं',
    trustBadge: 'उझवन कनेक्ट हेल्पडेस्क • सीधा किसान और खरीदार समर्थन'
  }
};

// ── 3. TELUGU (తెలుగు) ───────────────────────────────────────────────────────
export const teTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'భద్రపరుచు',
    cancel: 'రద్దు చేయి',
    search: 'వెతకండి...',
    logout: 'లాగ్ అవుట్',
    continue: 'కొనసాగించండి',
    edit: 'సవరించు',
    view: 'చూడండి',
    status: 'స్థితి',
    filter: 'ఫిల్టర్',
    all: 'అన్నీ',
    loading: 'లోడ్ అవుతోంది...',
    verified: 'ధృవీకరించబడింది',
    quantity: 'పరిమాణం',
    price: 'ధర'
  },
  nav: {
    dashboard: 'డ్యాష్‌బోర్డ్',
    myProduce: 'నా పంట ఉత్పత్తులు',
    demandSignals: 'మార్కెట్ డిమాండ్',
    demandForecast: 'డిమాండ్ అంచనా',
    findBuyers: 'నేరుగా కొనుగోలుదారులు',
    orders: 'ఆర్డర్లు',
    logistics: 'రవాణా',
    traceability: 'నాణ్యత & ట్రేస్',
    settlement: 'ఆదాయం & చెల్లింపులు',
    profile: 'నా ప్రొఫైల్',
    settings: 'సెట్టింగ్‌లు',
    language: 'భాష',
    support: 'సహాయం & మద్దతు',
    schemes: 'ప్రభుత్వ పథకాలు'
  },
  farmer: {
    myCrops: 'నా పంట జాబితా',
    addCrop: 'కొత్త పంట నమోదు చేయండి',
    cropName: 'పంట పేరు',
    expectedYield: 'లభ్యత పరిమాణం (కిలోలు)',
    expectedPrice: 'ఆశించిన ధర (₹/కిలో)',
    directRealization: 'రైతు నికర ఆదాయం',
    aiMentor: 'AI వ్యవసాయ సలహాదారు'
  },
  settlement: {
    escrowDisbursement: 'ఆటోమేటిక్ ఎస్క్రో చెల్లింపు',
    directRealization: 'రైతుకు నేరుగా 89% చెల్లింపు',
    bankUtrReference: 'బ్యాంక్ UTR నంబర్'
  },
  onboarding: {
    welcomeTitle: 'ఉళవన్ కనెక్ట్‌కు స్వాగతం 🌱',
    welcomeSubtitle: 'మీ వ్యవసాయ వేదిక కోసం ప్రాధాన్యత భాషను ఎంచుకోండి',
    chooseLanguage: 'ప్రాధాన్య భాషను ఎంచుకోండి',
    changeAnytimeNote: 'మీరు ఎప్పుడైనా సెట్టింగ్‌ల నుండి భాషను మార్చుకోవచ్చు.',
    searchPlaceholder: 'భాషను శోధించండి (ఉదా. తెలుగు, te)...',
    continueBtn: 'కొనసాగించండి →'
  },
  support: {
    pageTitle: 'సహాయం & మద్దతు',
    subtitle: 'ఉళవన్ కనెక్ట్‌తో సహాయం కావాలా?',
    description: 'సందేహాలు ఉన్నాయా, సమస్య ఎదురవుతోందా, లేదా ప్లాట్‌ఫారమ్‌లో సహాయం కావాలా? మా మద్దతు బృందం మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది.',
    copyEmail: 'ఇమెయిల్ చిరునామాను కాపీ చేయండి',
    copiedToast: 'ఇమెయిల్ కాపీ చేయబడింది',
    openEmailClient: 'ఇమెయిల్ యాప్ తెరవండి',
    returnPreviousPage: 'మునుపటి పేజీకి తిరిగి వెళ్లండి',
    trustBadge: 'ఉళవన్ కనెక్ట్ హెల్ప్‌డెస్క్ • ప్రత్యక్ష రైతు & కొనుగోలుదారుల మద్దతు'
  }
};

// ── 4. KANNADA (ಕನ್ನಡ) ──────────────────────────────────────────────────────
export const knTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'ಉಳಿಸು',
    cancel: 'ರದ್ದುಮಾಡು',
    search: 'ಹುಡುಕಿ...',
    logout: 'ಲಾಗ್ ಔಟ್',
    continue: 'ಮುಂದುವರಿಸಿ',
    status: 'ಸ್ಥಿತಿ',
    verified: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    quantity: 'ಪ್ರಮಾಣ',
    price: 'ಬೆಲೆ'
  },
  nav: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    myProduce: 'ನನ್ನ ಬೆಳೆಗಳು',
    demandSignals: 'ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆ',
    demandForecast: 'ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ',
    findBuyers: 'ನೇರ ಖರೀದಿದಾರರು',
    orders: 'ಆರ್ಡರ್‌ಗಳು',
    logistics: 'ಸಾರಿಗೆ',
    traceability: 'ಗುಣಮಟ್ಟ ಮತ್ತು ಟ್ರೇಸ್',
    settlement: 'ಪಾವತಿ ಮತ್ತು ಆದಾಯ',
    profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    language: 'ಭಾಷೆ'
  },
  farmer: {
    myCrops: 'ನನ್ನ ಬೆಳೆ ಪಟ್ಟಿ',
    addCrop: 'ಹೊಸ ಬೆಳೆ ಸೇರಿಸಿ',
    cropName: 'ಬೆಳೆ ಹೆಸರು',
    expectedYield: 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆಜಿ)',
    expectedPrice: 'ನಿರೀಕ್ಷಿತ ದರ (₹/ಕೆಜಿ)',
    directRealization: 'ರೈತರ ನೇರ ಆದಾಯ',
    aiMentor: 'AI ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ'
  },
  onboarding: {
    welcomeTitle: 'ಉಳವನ್ ಕನೆಕ್ಟ್‌ಗೆ ಸುಸ್ವಾಗತ 🌱',
    welcomeSubtitle: 'ನಿಮ್ಮ ಕೃಷಿ ವೇದಿಕೆಗಾಗಿ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    chooseLanguage: 'ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    changeAnytimeNote: 'ನೀವು ಇದನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಂದ ಬದಲಾಯಿಸಬಹುದು.',
    searchPlaceholder: 'ಭಾಷೆಯನ್ನು ಹುಡುಕಿ (ಉದಾ. ಕನ್ನಡ, kn)...',
    continueBtn: 'ಮುಂದುವರಿಸಿ →'
  }
};

// ── 5. MALAYALAM (മലയാളം) ──────────────────────────────────────────────────
export const mlTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'സൂക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    search: 'തിരയുക...',
    logout: 'ലോഗ് ഔട്ട്',
    continue: 'തുടരുക',
    status: 'നില',
    verified: 'സ്ഥിരീകരിച്ചു',
    quantity: 'അളവ്',
    price: 'വില'
  },
  nav: {
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    myProduce: 'എന്റെ വിളകൾ',
    demandSignals: 'വിപണി ആവശ്യങ്ങൾ',
    demandForecast: 'ഡിമാൻഡ് പ്രവചനം',
    findBuyers: 'നേരിട്ടുള്ള വാങ്ങലുകാർ',
    orders: 'ഓർഡറുകൾ',
    logistics: 'ഗതാഗതം',
    traceability: 'ഗുണനിലവാരം',
    settlement: 'വരുമാനവും സെറ്റിൽമെന്റും',
    profile: 'പ്രൊഫൈൽ',
    settings: 'ക്രമീകരണങ്ങൾ',
    language: 'ഭാഷ'
  },
  farmer: {
    myCrops: 'എന്റെ വിളകളുടെ പട്ടിക',
    addCrop: 'പുതിയ വിള ചേർക്കുക',
    cropName: 'വിളയുടെ പേര്',
    expectedYield: 'ലഭ്യമായ അളവ് (കിലോ)',
    expectedPrice: 'പ്രതീക്ഷിക്കുന്ന വില (₹/കിലോ)',
    directRealization: 'കർഷകന്റെ നേരിട്ടുള്ള വരുമാനം',
    aiMentor: 'AI കാർഷിക ഉപദേശകൻ'
  },
  onboarding: {
    welcomeTitle: 'ഉഴവൻ കണക്റ്റിലേക്ക് സ്വാഗതം 🌱',
    welcomeSubtitle: 'നിങ്ങളുടെ കാർഷിക പ്ലാറ്റ്‌ഫോമിനായി ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക',
    chooseLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    changeAnytimeNote: 'ക്രമീകരണങ്ങളിൽ നിന്ന് നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും ഇത് മാറ്റാം.',
    searchPlaceholder: 'ഭാഷ തിരയുക (ഉദാ. മലയാളം, ml)...',
    continueBtn: 'തുടരുക →'
  }
};

// ── 6. BENGALI (বাংলা) ──────────────────────────────────────────────────────
export const bnTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    search: 'অনুসন্ধান...',
    logout: 'লগ আউট',
    continue: 'চালিয়ে যান',
    status: 'অবস্থা',
    verified: 'যাচাইকৃত',
    quantity: 'পরিমাণ',
    price: 'দাম'
  },
  nav: {
    dashboard: 'ড্যাশবোর্ড',
    myProduce: 'আমার ফসল',
    demandSignals: 'বাজারের চাহিদা',
    demandForecast: 'চাহিদার পূর্বাভাস',
    findBuyers: 'সরাসরি ক্রেতা',
    orders: 'অর্ডার',
    logistics: 'পরিবহন',
    traceability: 'মান ও সনাক্তকরণ',
    settlement: 'আয় ও নিষ্পত্তি',
    profile: 'আমার প্রোফাইল',
    settings: 'সেটিংস',
    language: 'ভাষা'
  },
  farmer: {
    myCrops: 'আমার ফসলের তালিকা',
    addCrop: 'নতুন ফসল যোগ করুন',
    cropName: 'ফসলের নাম',
    expectedYield: 'উপলব্ধ পরিমাণ (কেজি)',
    expectedPrice: 'প্রত্যাশিত মূল্য (₹/কেজি)',
    directRealization: 'কৃষকের সরাসরি আয়',
    aiMentor: 'এআই কৃষি পরামর্শদাতা'
  },
  onboarding: {
    welcomeTitle: 'উজহাভান কানেক্টে স্বাগতম 🌱',
    welcomeSubtitle: 'আপনার কৃষি প্ল্যাটফর্মের জন্য পছন্দের ভাষা বেছে নিন',
    chooseLanguage: 'পছন্দের ভাষা বেছে নিন',
    changeAnytimeNote: 'আপনি সেটিংস থেকে যেকোনো সময় ভাষা পরিবর্তন করতে পারেন।',
    searchPlaceholder: 'ভাষা খুঁজুন (যেমন বাংলা, bn)...',
    continueBtn: 'চালিয়ে যান →'
  }
};

// ── 7. MARATHI (मराठी) ──────────────────────────────────────────────────────
export const mrTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'जतन करा',
    cancel: 'रद्द करा',
    search: 'शोधा...',
    logout: 'बाहेर पडा',
    continue: 'पुढे जा',
    status: 'स्थिती',
    verified: 'प्रमाणित',
    quantity: 'प्रमाण',
    price: 'दर'
  },
  nav: {
    dashboard: 'डॅशबोर्ड',
    myProduce: 'माझी शेतमाल उत्पादने',
    demandSignals: 'बाजारपेठ मागणी',
    demandForecast: 'मागणीचा अंदाज',
    findBuyers: 'थेट खरेदीदार',
    orders: 'ऑर्डर्स',
    logistics: 'वाहतूक व पुरवठा',
    traceability: 'गुणवत्ता व मागोवा',
    settlement: 'थेट उत्पन्न व परतावा',
    profile: 'माझी प्रोफाइल',
    settings: 'सेटिंग्ज',
    language: 'भाषा'
  },
  farmer: {
    myCrops: 'माझी पीक नोंदणी',
    addCrop: 'नवीन पीक जोडा',
    cropName: 'पिकाचे नाव',
    expectedYield: 'उपलब्ध प्रमाण (किलो)',
    expectedPrice: 'अपेक्षित भाव (₹/किलो)',
    directRealization: 'शेतकऱ्याला थेट उत्पन्न',
    aiMentor: 'एआय कृषी सल्लागार'
  },
  onboarding: {
    welcomeTitle: 'उझवन कनेक्टमध्ये आपले स्वागत आहे 🌱',
    welcomeSubtitle: 'आपल्या शेती प्लॅटफॉर्मसाठी प्राधान्य भाषा निवडा',
    chooseLanguage: 'भाषा निवडा',
    changeAnytimeNote: 'तुम्ही हे सेटिंग्जमधून कधीही बदलू शकता.',
    searchPlaceholder: 'भाषा शोधा (उदा. मराठी, mr)...',
    continueBtn: 'पुढे जा →'
  }
};

// ── 8. GUJARATI (ગુજરાતી) ──────────────────────────────────────────────────
export const guTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'સાચવો',
    cancel: 'રદ કરો',
    search: 'શોધો...',
    logout: 'લૉગ આઉટ',
    continue: 'આગળ વધો',
    status: 'સ્થિતિ',
    verified: 'પ્રમાણિત',
    quantity: 'જથ્થો',
    price: 'ભાવ'
  },
  nav: {
    dashboard: 'ડૅશબોર્ડ',
    myProduce: 'મારી ઉપજ',
    demandSignals: 'બજારની માંગ',
    demandForecast: 'માંગ આગાહી',
    findBuyers: 'સીધા ખરીદદારો',
    orders: 'ઑર્ડર',
    logistics: 'પરિવહન',
    traceability: 'ગુણવત્તા અને ટ્રેસ',
    settlement: 'ચુકવણી અને પતાવટ',
    profile: 'પ્રોફાઇલ',
    settings: 'સેટિંગ્સ',
    language: 'ભાષા'
  },
  farmer: {
    myCrops: 'મારા પાકની યાદી',
    addCrop: 'નવો પાક ઉમેરો',
    cropName: 'પાકનું નામ',
    expectedYield: 'ઉપલબ્ધ જથ્થો (કિલો)',
    expectedPrice: 'અપેક્ષિત કિંમત (₹/કિલો)',
    directRealization: 'ખેડૂતને સીધી આવક',
    aiMentor: 'AI કૃષિ સલાહકાર'
  },
  onboarding: {
    welcomeTitle: 'ઉઝવન કનેક્ટમાં આપનું સ્વાગત છે 🌱',
    welcomeSubtitle: 'કૃષિ પ્લેટફોર્મ માટે તમારી પસંદગીની ભાષા પસંદ કરો',
    chooseLanguage: 'ભાષા પસંદ કરો',
    changeAnytimeNote: 'તમે સેટિંગ્સમાંથી ગમે ત્યારે ભાષા બદલી શકો છો.',
    searchPlaceholder: 'ભાષા શોધો (દા.ત. ગુજરાતી, gu)...',
    continueBtn: 'આગળ વધો →'
  }
};

// ── 9. PUNJABI (ਪੰਜਾਬੀ) ────────────────────────────────────────────────────
export const paTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'ਸੰਭਾਲੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    search: 'ਖੋਜੋ...',
    logout: 'ਲਾਗ ਆਉਟ',
    continue: 'ਜਾਰੀ ਰੱਖੋ',
    status: 'ਸਥਿਤੀ',
    verified: 'ਪ੍ਰਮਾਣਿਤ',
    quantity: 'ਮਾਤਰਾ',
    price: 'ਕੀਮਤ'
  },
  nav: {
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    myProduce: 'ਮੇਰੀ ਫਸਲ',
    demandSignals: 'ਮੰਡੀ ਮੰਗ ਸੰਕੇਤ',
    demandForecast: 'ਮੰਗ ਦਾ ਅੰਦਾਜ਼ਾ',
    findBuyers: 'ਸਿੱਧੇ ਖਰੀਦਦਾਰ',
    orders: 'ਆਰਡਰ',
    logistics: 'ਆਵਾਜਾਈ',
    traceability: 'ਗੁਣਵੱਤਾ ਅਤੇ ਟ੍ਰੇਸ',
    settlement: 'ਸਿੱਧੀ ਅਦਾਇਗੀ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    language: 'ਭਾਸ਼ਾ'
  },
  farmer: {
    myCrops: 'ਮੇਰੀ ਫਸਲ ਸੂਚੀ',
    addCrop: 'ਨਵੀਂ ਫਸਲ ਦਰਜ ਕਰੋ',
    cropName: 'ਫਸਲ ਦਾ ਨਾਮ',
    expectedYield: 'ਉਪਲਬਧ ਮਾਤਰਾ (ਕਿਲੋ)',
    expectedPrice: 'ਲੋੜੀਂਦੀ ਕੀਮਤ (₹/ਕਿਲੋ)',
    directRealization: 'ਕਿਸਾਨ ਨੂੰ ਸਿੱਧੀ ਕਮਾਈ',
    aiMentor: 'ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ'
  },
  onboarding: {
    welcomeTitle: 'ਉਜ਼ਵਨ ਕਨੈਕਟ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ 🌱',
    welcomeSubtitle: 'ਆਪਣੇ ਖੇਤੀਬਾੜੀ ਪਲੇਟਫਾਰਮ ਲਈ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    changeAnytimeNote: 'ਤੁਸੀਂ ਸੈਟਿੰਗਾਂ ਤੋਂ ਕਦੇ ਵੀ ਭਾਸ਼ਾ ਬਦਲ ਸਕਦੇ ਹੋ।',
    searchPlaceholder: 'ਭਾਸ਼ਾ ਖੋਜੋ (ਉਦਾਹਰਨ ਪੰਜਾਬੀ, pa)...',
    continueBtn: 'ਜਾਰੀ ਰੱਖੋ →'
  }
};

// ── 10. ODIA (ଓଡ଼ିଆ) ────────────────────────────────────────────────────────
export const orTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'ସଂରକ୍ଷଣ',
    cancel: 'ବାତିଲ',
    search: 'ଖୋଜନ୍ତୁ...',
    logout: 'ଲଗ ଆଉଟ',
    continue: 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
    status: 'ସ୍ଥିତି',
    verified: 'ଯାଞ୍ଚ ହୋଇଛି',
    quantity: 'ପରିମାଣ',
    price: 'ମୂଲ୍ୟ'
  },
  nav: {
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    myProduce: 'ମୋର ଫସଲ',
    demandSignals: 'ବଜାର ଚାହିଦା',
    demandForecast: 'ଚାହିଦା ପୂର୍ବାନୁମାନ',
    findBuyers: 'ସିଧାସଳଖ କ୍ରେତା',
    orders: 'ଅର୍ଡର',
    logistics: 'ପରିବହନ',
    traceability: 'ଗୁଣବତ୍ତା ଓ ଯାଞ୍ଚ',
    settlement: 'ସିଧାସଳଖ ପୈଠ',
    profile: 'ପ୍ରୋଫାଇଲ',
    settings: 'ସେଟିଂସ',
    language: 'ଭାଷା'
  },
  farmer: {
    myCrops: 'ମୋର ଫସଲ ତାଲିକା',
    addCrop: 'ନୂଆ ଫସଲ ଯୋଡନ୍ତୁ',
    cropName: 'ଫସଲ ନାମ',
    expectedYield: 'ଉପଲବ୍ଧ ପରିମାଣ (କେଜି)',
    expectedPrice: 'ଆଶାୟୀ ମୂଲ୍ୟ (₹/କେଜି)',
    directRealization: 'ଚାଷୀଙ୍କ ସିଧାସଳଖ ଆୟ',
    aiMentor: 'AI କୃଷି ପରାମର୍ଶଦାତା'
  },
  onboarding: {
    welcomeTitle: 'ଉଝାଭାନ କନେକ୍ଟକୁ ସ୍ୱାଗତ 🌱',
    welcomeSubtitle: 'ଆପଣଙ୍କ କୃଷି ମଞ୍ଚ ପାଇଁ ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ',
    chooseLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    changeAnytimeNote: 'ଆପଣ ଯେକୌଣସି ସମୟରେ ସେଟିଂସରୁ ଭାଷା ବଦଳାଇ ପାରିବେ।',
    searchPlaceholder: 'ଭାଷା ଖୋଜନ୍ତୁ (ଯଥା ଓଡ଼ିଆ, or)...',
    continueBtn: 'ଆଗକୁ ବଢ଼ନ୍ତୁ →'
  }
};

// ── 11. ASSAMESE (অসমীয়া) ──────────────────────────────────────────────────
export const asTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'সংৰক্ষণ কৰক',
    cancel: 'বাতিল কৰক',
    search: 'সন্ধান কৰক...',
    logout: 'লগ আউট',
    continue: 'আগবাঢ়ক',
    status: 'স্থিতি',
    verified: 'প্ৰমাণিত',
    quantity: 'পৰিমাণ',
    price: 'মূল্য'
  },
  nav: {
    dashboard: 'ডেচবৰ্ড',
    myProduce: 'মোৰ শস্য',
    demandSignals: 'বজাৰৰ চাহিদা',
    demandForecast: 'চাহিদাৰ পূৰ্বানুমান',
    findBuyers: 'প্ৰত্যক্ষ ক্ৰেতা',
    orders: 'অৰ্ডাৰ',
    logistics: 'পৰিবহণ',
    traceability: 'গুণাগুণ আৰু সন্ধান',
    settlement: 'পোনপটীয়া ধন পৰিশোধ',
    profile: 'মোৰ প্ৰফাইল',
    settings: 'ছেটিংছ',
    language: 'ভাষা'
  },
  farmer: {
    myCrops: 'মোৰ শস্যৰ তালিকা',
    addCrop: 'নতুন শস্য যোগ কৰক',
    cropName: 'শস্যৰ নাম',
    expectedYield: 'উপলব্ধ পৰিমাণ (কেজি)',
    expectedPrice: 'প্ৰত্যাশিত মূল্য (₹/কেজি)',
    directRealization: 'কৃষকৰ প্ৰত্যক্ষ উপাৰ্জন',
    aiMentor: 'AI কৃষি পৰামৰ্শদাতা'
  },
  onboarding: {
    welcomeTitle: 'উঝাভান কানেক্টলৈ স্বাগতম 🌱',
    welcomeSubtitle: 'আপোনাৰ কৃষি মঞ্চৰ বাবে পছন্দৰ ভাষা বাছক',
    chooseLanguage: 'ভাষা বাছক',
    changeAnytimeNote: 'আপুনি যিকোনো সময়তে ছেটিংছৰ পৰা ভাষা সলনি কৰিব পাৰে।',
    searchPlaceholder: 'ভাষা সন্ধান কৰক (যেনে অসমীয়া, as)...',
    continueBtn: 'আগবাঢ়ক →'
  }
};

// ── 12. URDU (اردو - RTL) ───────────────────────────────────────────────────
export const urTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    search: 'تلاش کریں...',
    logout: 'لاگ آؤٹ',
    continue: 'آگے بڑھیں',
    status: 'حیثیت',
    verified: 'تصدیق شدہ',
    quantity: 'مقدار',
    price: 'قیمت'
  },
  nav: {
    dashboard: 'ڈیش بورڈ',
    myProduce: 'میری فصلیں',
    demandSignals: 'مارکیٹ طلب کے اشارے',
    demandForecast: 'طلب کی پیش گوئی',
    findBuyers: 'براہ راست خریدار',
    orders: 'آرڈرز',
    logistics: 'کولڈ چین ٹرانسپورٹ',
    traceability: 'کوالٹی اور ٹریسنگ',
    settlement: 'براہ راست ادائیگی',
    profile: 'پروفائل',
    settings: 'سیٹنگز',
    language: 'زبان'
  },
  farmer: {
    myCrops: 'میری فصلوں کی فہرست',
    addCrop: 'نئی فصل درج کریں',
    cropName: 'فصل کا نام',
    expectedYield: 'دستیاب مقدار (کلو)',
    expectedPrice: 'متوقع قیمت (روپے/کلو)',
    directRealization: 'کسان کی براہ راست آمدنی',
    aiMentor: 'اے آئی زرعی مشیر'
  },
  settlement: {
    escrowDisbursement: 'خودکار ایسکرو ادائیگی',
    directRealization: 'کسان کو 89 فیصد براہ راست رقم',
    bankUtrReference: 'بینک یو ٹی آر حوالہ'
  },
  onboarding: {
    welcomeTitle: 'اُجھاون کنیکٹ میں خوش آمدید 🌱',
    welcomeSubtitle: 'اپنے زرعی پلیٹ فارم کے لیے اپنی پسندیدہ زبان منتخب کریں',
    chooseLanguage: 'پسندیدہ زبان منتخب کریں',
    changeAnytimeNote: 'آپ سیٹنگز سے کسی بھی وقت زبان تبدیل کر سکتے ہیں۔',
    searchPlaceholder: 'زبان تلاش کریں (مثلاً اردو، ur)...',
    continueBtn: 'آگے بڑھیں ←'
  }
};

// ── 13. SANSKRIT (संस्कृतम्) ────────────────────────────────────────────────
export const saTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'संरक्षतु',
    cancel: 'निरस्यतु',
    search: 'अन्विष्यतु...',
    logout: 'निर्गच्छतु',
    continue: 'अग्रेसरतु',
    status: 'स्थितिः',
    verified: 'प्रमाणीकृतम्',
    quantity: 'मात्रा',
    price: 'मूल्यम्'
  },
  nav: {
    dashboard: 'कार्यपट्टिका',
    myProduce: 'मम सस्यानि',
    demandSignals: 'विपणि-माङ्गल्यानि',
    demandForecast: 'माङ्गल्यानुमानम्',
    findBuyers: 'क्रेतारः',
    orders: 'आदेशाः',
    logistics: 'यातायातम्',
    traceability: 'गुणवत्ता-प्रमाणनम्',
    settlement: 'प्रत्यक्ष-धनवितरणम्',
    profile: 'व्यक्तिविवरणम्',
    settings: 'विन्यासाः',
    language: 'भाषा'
  },
  farmer: {
    myCrops: 'मम सस्यसूची',
    addCrop: 'नूतनसस्यं योजयतु',
    cropName: 'सस्यनाम',
    expectedYield: 'उपलब्धमात्रा (किलो)',
    expectedPrice: 'अपेक्षितमूल्यम् (₹/किलो)',
    directRealization: 'कृषकस्य प्रत्यक्षार्जनम्'
  },
  onboarding: {
    welcomeTitle: 'उझावन्-संयोजने स्वागतम् 🌱',
    welcomeSubtitle: 'कृषिमञ्चार्थं स्वप्रियाम् भाषां वृणोतु',
    chooseLanguage: 'प्रियां भाषां चिनोतु',
    changeAnytimeNote: 'भवन्तः विन्यासेभ्यः कदापि भाषां परिवर्तयितुं शक्नुवन्ति।',
    searchPlaceholder: 'भाषां अन्विष्यतु (यथा संस्कृतम्, sa)...',
    continueBtn: 'अग्रेसरतु →'
  }
};

// ── 14. SANTALI (ᱥᱟᱱᱛᱟᱲᱤ) ──────────────────────────────────────────────────
export const satTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'ᱥᱟᱧᱪᱟᱣ',
    cancel: 'ᱵᱟᱹᱛᱤᱞ',
    search: 'ᱥᱮᱸᱫᱽᱨᱟ...',
    logout: 'ᱚᱰᱚᱠᱚᱜ',
    continue: 'ᱞᱟᱦᱟᱜ',
    status: 'ᱴᱷᱟᱶ/ᱦᱟᱞᱚᱛ',
    verified: 'ᱯᱚᱨᱚᱠ',
    quantity: 'ᱞᱮᱠᱷᱟ',
    price: 'ᱫᱟᱢ'
  },
  nav: {
    dashboard: 'ᱰᱮᱥᱵᱚᱨᱰ',
    myProduce: 'ᱤᱧᱟᱜ ᱪᱟᱥ',
    demandSignals: 'ᱦᱟᱴ ᱨᱮᱱᱟᱜ ᱠᱷᱚᱡᱽ',
    demandForecast: 'ᱠᱷᱚᱡᱽ ᱟᱱᱫᱟᱡᱽ',
    findBuyers: 'ᱠᱤᱨᱤᱧᱤᱭᱟᱹ',
    orders: 'ᱚᱨᱰᱚᱨ',
    logistics: 'ᱥᱮᱱᱚᱜ ᱦᱚᱨ',
    traceability: 'ᱜᱩᱱ ᱯᱟᱨᱠᱷᱟᱣ',
    settlement: 'ᱥᱚᱡᱷᱮ ᱴᱟᱠᱟ',
    profile: 'ᱤᱧᱟᱜ ᱩᱯᱨᱩᱢ',
    settings: 'ᱥᱟᱡᱟᱣ',
    language: 'ᱯᱟᱹᱨᱥᱤ'
  },
  farmer: {
    myCrops: 'ᱤᱧᱟᱜ ᱪᱟᱥ ᱛᱟᱹᱞᱠᱟᱹ',
    addCrop: 'ᱱᱟᱣᱟ ᱪᱟᱥ ᱥᱮᱞᱮᱫ',
    cropName: 'ᱪᱟᱥ ᱧᱩᱛᱩᱢ',
    expectedYield: 'ᱢᱮᱱᱟᱜ ᱦᱟᱹᱴᱤᱧ (ᱠᱤᱞᱚ)',
    expectedPrice: 'ᱟᱸᱥ ᱫᱟᱢ (₹/ᱠᱤᱞᱚ)',
    directRealization: 'ᱪᱟᱹᱥᱤ ᱴᱷᱮᱱ ᱥᱚᱡᱷᱮ ᱟᱨᱡᱟᱣ'
  },
  onboarding: {
    welcomeTitle: 'ᱩᱡᱷᱟᱵᱟᱱ ᱠᱚᱱᱮᱠᱴ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ 🌱',
    welcomeSubtitle: 'ᱟᱢᱟᱜ ᱪᱟᱥ ᱢᱚᱧᱪᱚ ᱞᱟᱹᱜᱤᱫ ᱠᱩᱥᱤᱭᱟᱱ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ',
    chooseLanguage: 'ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ',
    changeAnytimeNote: 'ᱥᱟᱡᱟᱣ ᱠᱷᱚᱱ ᱡᱟᱦᱟᱸ ᱛᱤᱨᱮᱜᱮ ᱯᱟᱹᱨᱥᱤ ᱵᱚᱫᱚᱞ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾',
    searchPlaceholder: 'ᱯᱟᱹᱨᱥᱤ ᱥᱮᱸᱫᱽᱨᱟ (ᱡᱮᱞᱮᱠᱟ ᱥᱟᱱᱛᱟᱲᱤ, sat)...',
    continueBtn: 'ᱞᱟᱦᱟᱜ ᱢᱮ →'
  }
};

// ── 15. NEPALI (नेपाली) ─────────────────────────────────────────────────────
export const neTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'बचत गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    search: 'खोज्नुहोस्...',
    logout: 'लग आउट',
    continue: 'अगाडि बढ्नुहोस्',
    status: 'स्थिति',
    verified: 'प्रमाणित',
    quantity: 'मात्रा',
    price: 'मूल्य'
  },
  nav: {
    dashboard: 'ड्यासबोर्ड',
    myProduce: 'मेरो बाली र उत्पादन',
    demandSignals: 'बजार माग संकेत',
    demandForecast: 'माग पूर्वानुमान',
    findBuyers: 'प्रत्यक्ष खरिदकर्ता',
    orders: 'अर्डरहरू',
    logistics: 'यातायात तथा ढुवानी',
    traceability: 'गुणस्तर र ट्र्याकिङ',
    settlement: 'प्रत्यक्ष भुक्तानी',
    profile: 'मेरो प्रोफाइल',
    settings: 'सेटिङहरू',
    language: 'भाषा'
  },
  farmer: {
    myCrops: 'मेरो बाली सूची',
    addCrop: 'नयाँ बाली थप्नुहोस्',
    cropName: 'बालीको नाम',
    expectedYield: 'उपलब्ध मात्रा (केजी)',
    expectedPrice: 'अपेक्षित मूल्य (₹/केजी)',
    directRealization: 'किसानको प्रत्यक्ष आम्दानी'
  },
  onboarding: {
    welcomeTitle: 'उझावन कनेक्टमा स्वागत छ 🌱',
    welcomeSubtitle: 'आफ्नो कृषि मञ्चको लागि मनपर्ने भाषा रोज्नुहोस्',
    chooseLanguage: 'मनपर्ने भाषा रोज्नुहोस्',
    changeAnytimeNote: 'तपाईंले सेटिङ्सबाट जुनसुकै बेला भाषा परिवर्तन गर्न सक्नुहुन्छ।',
    searchPlaceholder: 'भाषा खोज्नुहोस् (जस्तै नेपाली, ne)...',
    continueBtn: 'अगाडि बढ्नुहोस् →'
  }
};

// ── 16. MAITHILI (मैथिली) ──────────────────────────────────────────────────
export const maiTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'सहेजू',
    cancel: 'रद्द करू',
    search: 'खोजू...',
    logout: 'लॉग आउट',
    continue: 'आगू बढ़ू',
    status: 'स्थिति',
    verified: 'प्रमाणित',
    quantity: 'मात्रा',
    price: 'दाम'
  },
  nav: {
    dashboard: 'डैशबोर्ड',
    myProduce: 'हमर उपजल फसल',
    demandSignals: 'बाजार माँग संकेत',
    demandForecast: 'माँगक पूर्वानुमान',
    findBuyers: 'सोझे खरीदार',
    orders: 'आदेश',
    logistics: 'ढुलाई व यातायात',
    traceability: 'गुणवत्ता परीक्षण',
    settlement: 'सीधा भुगतान',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्स',
    language: 'भाषा'
  },
  farmer: {
    myCrops: 'हमर फसल सूची',
    addCrop: 'नबका फसल जोड़ू',
    cropName: 'फसलक नाम',
    expectedYield: 'मात्रा (किलो)',
    expectedPrice: 'भाव (₹/किलो)',
    directRealization: 'किसानक सीधा आमदनी'
  },
  onboarding: {
    welcomeTitle: 'उझावन कनेक्टमे अहाँक स्वागत अछि 🌱',
    welcomeSubtitle: 'अपन कृषि मञ्चक लेल मनपसंद भाषा चुनू',
    chooseLanguage: 'पसंदीदा भाषा चुनू',
    changeAnytimeNote: 'अहाँ सेटिंग्ससँ कखनो भाषा बदलि सकैत छी।',
    searchPlaceholder: 'भाषा खोजू (उदा. मैथिली, mai)...',
    continueBtn: 'आगू बढ़ू →'
  }
};

// ── 17. KONKANI (कोंकणी) ───────────────────────────────────────────────────
export const kokTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'सांबाळात',
    cancel: 'रद्द करात',
    search: 'सोधात...',
    logout: 'भायर सरात',
    continue: 'फुडें वचात',
    status: 'स्थिती',
    verified: 'तपासिल्लें',
    quantity: 'प्रमाण',
    price: 'दर'
  },
  nav: {
    dashboard: 'डॅशबोर्ड',
    myProduce: 'म्हाजो शेतमाल',
    demandSignals: 'बाजाराची मागणी',
    demandForecast: 'मागणी अदमास',
    findBuyers: 'थेट खरेदीदार',
    orders: 'ऑर्डर्स',
    logistics: 'येरादारी',
    traceability: 'दर्जो आनी ट्रॅकिंग',
    settlement: 'थेट फारीकपण',
    profile: 'म्हाजी प्रोफाईल',
    settings: 'मांडणी',
    language: 'भास'
  },
  farmer: {
    myCrops: 'म्हाजी पीक वळेरी',
    addCrop: 'नवें पीक नोंद करात',
    cropName: 'पिकाचें नांव',
    expectedYield: 'उपलब्ध प्रमाण (किलो)',
    expectedPrice: 'अपेक्षित दर (₹/किलो)',
    directRealization: 'शेतकाराची थेट येणावळ'
  },
  onboarding: {
    welcomeTitle: 'उझावन कनेक्टांत येवकार 🌱',
    welcomeSubtitle: 'तुमच्या शेतकी मंचा खातीर आवडटी भास विंचात',
    chooseLanguage: 'भास विंचात',
    changeAnytimeNote: 'तुम्ही मांडणींतल्यान केन्नाय भास बदलूंक शकतात.',
    searchPlaceholder: 'भास सोधात (उदा. कोंकणी, kok)...',
    continueBtn: 'फुडें वचात →'
  }
};

// ── 18. DOGRI (डोगरी) ───────────────────────────────────────────────────────
export const doiTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'संभालो',
    cancel: 'रद्द करो',
    search: 'तुप्पो...',
    logout: 'बाहर निकलो',
    continue: 'अग्गे बधो',
    status: 'हालत',
    verified: 'तसदीक कीता',
    quantity: 'मात्रा',
    price: 'मुल्ल'
  },
  nav: {
    dashboard: 'डैशबोर्ड',
    myProduce: 'मेरी फसल',
    demandSignals: 'मंडी दी मंग',
    demandForecast: 'मंग दा अंदाजा',
    findBuyers: 'सिद्दे खरीदार',
    orders: 'आर्डर',
    logistics: 'ढुआई-पुआई',
    traceability: 'गुणवत्ता ते पड़ताल',
    settlement: 'सिद्दा भुगतान',
    profile: 'प्रोफाइल',
    settings: 'सैटिंग',
    language: 'बोली / भाशा'
  },
  farmer: {
    myCrops: 'मेरी फसल सूची',
    addCrop: 'नमीं फसल जोड़ो',
    cropName: 'फसल दा नां',
    expectedYield: 'मात्रा (किलो)',
    expectedPrice: 'अपेक्षित मुल्ल (₹/किलो)',
    directRealization: 'किसाने गी सिद्दी कमाई'
  },
  onboarding: {
    welcomeTitle: 'उझावन कनेक्ट च स्वागत ऐ 🌱',
    welcomeSubtitle: 'अपने खेतीबाड़ी मञ्च लेई पसंद दी बोली चुनो',
    chooseLanguage: 'बोली चुनो',
    changeAnytimeNote: 'तुस सैटिंग्स च जाई कदे वी बोली बदलोई सकदे ओ।',
    searchPlaceholder: 'बोली तुप्पो (जियां डोगरी, doi)...',
    continueBtn: 'अग्गे बधो →'
  }
};

// ── 19. BODO (बड़ो) ────────────────────────────────────────────────────────
export const brTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'थुमनाय',
    cancel: 'नेवसिनाय',
    search: 'नायगिर...',
    logout: 'ओंखारलांनाय',
    continue: 'थांगासिनो थानाय',
    status: 'थासारि',
    verified: 'आनजाद खांनाय',
    quantity: 'बिबां',
    price: 'बेसेन'
  },
  nav: {
    dashboard: 'डेशबर्ड',
    myProduce: 'आंनि आबाद',
    demandSignals: 'हाटनि दाबी',
    demandForecast: 'दाबी सिगां फोरमायनाय',
    findBuyers: 'थिं बायग्राफोर',
    orders: 'अर्डारसफोर',
    logistics: 'रोगाथाय',
    traceability: 'गुण आनजाद',
    settlement: 'थोंजों रां होनाय',
    profile: 'आंनि महर',
    settings: 'फज\'नाय',
    language: 'राव'
  },
  farmer: {
    myCrops: 'आंनि आबाद फारिलाइ',
    addCrop: 'गोदान आबाद सोदेर',
    cropName: 'आबादनि मुं',
    expectedYield: 'बिबां (किल\'ग्रा)',
    expectedPrice: 'बेसेन (₹/किल\'ग्रा)',
    directRealization: 'आबादारिनो थोंजों रां'
  },
  onboarding: {
    welcomeTitle: 'उझाभान कानेक्ट आव बरायबाय 🌱',
    welcomeSubtitle: 'नोंथांनि आबाद मञ्चनि थाखाय गावनि मोजां मोननाय रावखौ सायख\'',
    chooseLanguage: 'राव सायख\'',
    changeAnytimeNote: 'नोंथाङा फज\'नायनिफ्राय जेब्लाबो रावखौ सोलायनो हागोन।',
    searchPlaceholder: 'राव नायगिर (जेरै बड़ो, br)...',
    continueBtn: 'थांगासिनो था →'
  }
};

// ── 20. MANIPURI / MEITEI (মৈতৈলোন) ─────────────────────────────────────────
export const mniTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'থম্বীযু',
    cancel: 'তৌদবা',
    search: 'থীবীযু...',
    logout: 'থোকপা',
    continue: 'মাংলোমদা চংশিনবা',
    status: 'ফিভম',
    verified: 'য়েংশিনখ্রবা',
    quantity: 'চাং',
    price: 'মমল'
  },
  nav: {
    dashboard: 'ড্যাশবোর্ড',
    myProduce: 'ঐগী লৌউ-শিংউ পোত্থোক',
    demandSignals: 'কৈথেলগী অপাম্বা',
    demandForecast: 'অপাম্বা মাংজৌননা খঙদোকপা',
    findBuyers: 'লৈবীরোইশিং',
    orders: 'অর্ডারশিং',
    logistics: 'পোৎথোক পুথোক-পুশিন',
    traceability: 'গুণ য়েংশিনবা',
    settlement: 'শেনফম হকথেংননা পীবা',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    language: 'লোল'
  },
  farmer: {
    myCrops: 'ঐগী মহৈ-মরোং পরেং',
    addCrop: 'অনৌবা মহৈ-মরোং হাপচিনবা',
    cropName: 'মহৈ-মরোংগী মমিং',
    expectedYield: 'চাং (কেজি)',
    expectedPrice: 'মমল (₹/কেজি)',
    directRealization: 'লৌমীগী হকথেংনবা কান্নবা'
  },
  onboarding: {
    welcomeTitle: 'উজহাভান কনেক্টতা তরাম্না ওকচরি 🌱',
    welcomeSubtitle: 'নহাক্কী লৌউ-শিংউগী প্লেটফোর্মগীদমক পামজবা লোল খনবীযু',
    chooseLanguage: 'লোল খনবীযু',
    changeAnytimeNote: 'নহাক্না সেটিংসতগী মতম অমহেক্তদা লোল হোংদোকপা য়াগনি।',
    searchPlaceholder: 'লোল থীবীযু (মৈতৈলোন, mni)...',
    continueBtn: 'মাংলোমদা চংশিনবা →'
  }
};

// ── 21. SINDHI (सिन्धी / سنڌي) ──────────────────────────────────────────────
export const sdTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'محفوظ ڪريو / सहेजियो',
    cancel: 'رد ڪريو / रद्द करियो',
    search: 'ڳولھيو... / खोजियो...',
    logout: 'لاگ آئوٽ / लॉग आउट',
    continue: 'اڳتي وڌو / अगते वधो',
    status: 'حالت / हालत',
    verified: 'تصديق ٿيل / तस्दीक थियिल',
    quantity: 'مقدار / मात्र',
    price: 'قيمت / मूल्य'
  },
  nav: {
    dashboard: 'ڊيش بورڊ / डैशबोर्ड',
    myProduce: 'منهنجو فصل / मंहिंजो फ़सल',
    demandSignals: 'مارڪيٽ جي طلب / मार्केट जी तलब',
    demandForecast: 'طلب جو اندازو / तलब जो अंदाजो',
    findBuyers: 'سڌا خريدار / सिद्धा खरीदार',
    orders: 'آرڊر / ऑर्डर्स',
    logistics: 'ٽرانسپورٽ / ट्रांसपोर्ट',
    traceability: 'معيار جي جانچ / मयार जी जांच',
    settlement: 'سڌੀ ادائيگي / सिद्दी अदायगी',
    profile: 'پروفائل / प्रोफ़ाइल',
    settings: 'سيٽنگون / सेटिंग्स',
    language: 'ٻولي / भाषा'
  },
  farmer: {
    myCrops: 'منهنجي فصلن جي فهرست / मंहिंजी फसल सूची',
    addCrop: 'نئون فصل شامل ڪريو / नओं फ़सल शामिल करियो',
    cropName: 'فصل جو نالو / फ़सल जो नालो',
    expectedYield: 'مقدار (ڪلو) / मात्र (किलो)',
    expectedPrice: 'قيمت (روپيا/ڪلو) / क़ीमत (₹/किलो)',
    directRealization: 'هاريءَ کي سڌી آمدني / हारीअ खे सिद्दी आमदनी'
  },
  onboarding: {
    welcomeTitle: 'اُجھاون ڪنيڪٽ ۾ ڀلي ڪري آيا 🌱 / उझावन कनेक्ट में भली करे आया',
    welcomeSubtitle: 'پنهنجي زرعي پليٽ فارم لاءِ ٻولي چونڊيو / पंहिंजी ज़राअती प्लैटफ़ॉर्म लाए बोली चूंडियो',
    chooseLanguage: 'ٻولي چونڊيو / भाषा चूंडियो',
    changeAnytimeNote: 'توهان سيٽنگ مان ڪنهن به وقت ٻولي تبديل ڪري سگهو ٿا.',
    searchPlaceholder: 'ٻولي ڳولھيو (سنڌي, sd, सिन्धी)...',
    continueBtn: 'اڳتي وڌو →'
  }
};

// ── 22. KASHMIRI (कॉशुर / کٲشُر) ───────────────────────────────────────────
export const ksTranslations: DeepPartial<TranslationDictionary> = {
  common: {
    save: 'محفوظ تٔھ تھاوِو / महफ़ूज़ थाविव',
    cancel: 'منسوخ / मंसूख़',
    search: 'ژھانڈِو... / छान्डिव...',
    logout: 'نیبر نؠروُن / नेबर नेरुन',
    continue: 'بروُنٛہہ پکو / ब्रोंह पक्व',
    status: 'حالت / हालत',
    verified: 'تصدِیق شُدٕہ / तस्दीक़ शुदा',
    quantity: 'مقدار / मिक़दार',
    price: 'قیمت / क़ीमत'
  },
  nav: {
    dashboard: 'ڈیش بورڈ / डैशबोर्ड',
    myProduce: 'میون فصٕل / म्योन फ़सल',
    demandSignals: 'بازارُک طلب / बाज़ारुक तलब',
    demandForecast: 'طلبُک اندازٕ / तलबुक अंदाज़ा',
    findBuyers: 'سیدھی خریدار / सीधे ख़रीदार',
    orders: 'آرڈر / ऑर्डर',
    logistics: 'ٹرانسپورٹ / ट्रांसपोर्ट',
    traceability: 'معیار پَرکھ / मयार परख',
    settlement: 'سیدھی ادایئگی / सीधी अदायगी',
    profile: 'پروفائل / प्रोफ़ाइल',
    settings: 'سیٹنگز / सेटिंग्स',
    language: 'زبانہٕ / ज़बान'
  },
  farmer: {
    myCrops: 'میٲنؠ فصٕل لِسٹ / म्योन फ़सल लिस्ट',
    addCrop: 'نٔو فصٕل رَلاوِو / नौ फ़सल रलाविव',
    cropName: 'فصلُک ناو / फ़सलुक नाव',
    expectedYield: 'مقدار (کلو) / मिक़दार (किलो)',
    expectedPrice: 'قیمت (روپیہِ/کلو) / क़ीमत (₹/किलो)',
    directRealization: 'زمیندارَس سیدھی کَمٲیی / ज़मीनदारस सीधी कमाई'
  },
  onboarding: {
    welcomeTitle: 'اُجھاون کنیکٹَس منٛز خوش آمدید 🌱 / उझावन कनेक्टस मंज़ खुशामदीद',
    welcomeSubtitle: 'پَننہِ زَرعی مَنچَس خٲطرٕ ژارِو پَنٕنؠ زَبان / पन्निस ज़रई मन्चस ख़ातिर चारिव पनन्य ज़बान',
    chooseLanguage: 'زَبان ژارِو / ज़बान चारिव',
    changeAnytimeNote: 'تۄہی ہؠکِو سؠٹِنگز مَنٛز کُنہِ تہِ وقتہٕ زَبان بَدلٲوِتھ۔',
    searchPlaceholder: 'زَبان ژھانڈِو (کٲشُر, ks, कॉशुर)...',
    continueBtn: 'بروُنٛہہ پکو →'
  }
};

/**
 * Complete translations master registry mapping language codes to dictionaries.
 */
export const TRANSLATIONS_REGISTRY: Record<string, DeepPartial<TranslationDictionary>> = {
  en: enTranslations,
  ta: taTranslations,
  hi: hiTranslations,
  te: teTranslations,
  kn: knTranslations,
  ml: mlTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
  gu: guTranslations,
  pa: paTranslations,
  or: orTranslations,
  as: asTranslations,
  ur: urTranslations,
  sa: saTranslations,
  sat: satTranslations,
  ne: neTranslations,
  mai: maiTranslations,
  kok: kokTranslations,
  doi: doiTranslations,
  br: brTranslations,
  mni: mniTranslations,
  sd: sdTranslations,
  ks: ksTranslations
};

/**
 * Resolves a translation key with deep fallback:
 * Selected Language -> English Dictionary -> Fallback Text -> Raw Key
 */
export const getTranslation = (
  langCode: string,
  key: string,
  arg2?: Record<string, string | number> | string | any,
  arg3?: Record<string, string | number> | string | any
): string => {
  let params: Record<string, string | number> | undefined;
  let defaultText: string | undefined;

  // Smart resolution of arguments because of mixed usage in the codebase
  // Some call t(key, defaultText, params)
  // Some call t(key, params, defaultText)
  // Some call t(key, undefined, defaultText)
  if (typeof arg2 === 'string') {
    defaultText = arg2;
    if (typeof arg3 === 'object' && arg3 !== null) {
      params = arg3 as Record<string, string | number>;
    }
  } else if (typeof arg2 === 'object' && arg2 !== null) {
    params = arg2 as Record<string, string | number>;
    if (typeof arg3 === 'string') {
      defaultText = arg3;
    }
  } else if (typeof arg3 === 'string') {
    defaultText = arg3;
  }

  if (!key) return defaultText || '';

  const targetDict = TRANSLATIONS_REGISTRY[langCode] || TRANSLATIONS_REGISTRY.en;

  const resolve = (dict: any, path: string[]): string | undefined => {
    let curr = dict;
    for (const seg of path) {
      if (!curr || typeof curr !== 'object') return undefined;
      curr = curr[seg];
    }
    return typeof curr === 'string' ? curr : undefined;
  };

  const parts = key.split('.');
  let translated: string | undefined;

  if (parts.length >= 2) {
    translated = resolve(targetDict, parts);
    if (!translated && langCode !== 'en') {
      translated = resolve(enTranslations, parts);
    }
  } else {
    // Check common section or root
    translated = targetDict?.common?.[key] || (targetDict as any)?.[key];
    if (!translated && langCode !== 'en') {
      translated = enTranslations?.common?.[key] || (enTranslations as any)?.[key];
    }
  }

  let result = translated || defaultText || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
    });
  }

  return result;
};
