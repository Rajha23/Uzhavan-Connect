export const getCropImageUrl = (cropName: string): string => {
  const normalized = cropName.toLowerCase().trim();

  if (normalized.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80';
  }
  if (normalized.includes('onion')) {
    return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80';
  }
  if (normalized.includes('turmeric')) {
    return 'https://images.unsplash.com/photo-1615486511484-92e172f2e519?w=800&q=80';
  }
  if (normalized.includes('banana')) {
    return 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=800&q=80';
  }
  if (normalized.includes('chilli') || normalized.includes('chili') || normalized.includes('pepper')) {
    return 'https://images.unsplash.com/photo-1588012674997-6a1ea8a56285?w=800&q=80';
  }
  if (normalized.includes('groundnut') || normalized.includes('peanut')) {
    return 'https://images.unsplash.com/photo-1560002931-d85f818b2606?w=800&q=80';
  }
  if (normalized.includes('maize') || normalized.includes('corn')) {
    return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80';
  }
  if (normalized.includes('paddy') || normalized.includes('rice') || normalized.includes('wheat')) {
    return 'https://images.unsplash.com/photo-1626084050818-472bd1611d88?w=800&q=80';
  }
  if (normalized.includes('brinjal') || normalized.includes('eggplant')) {
    return 'https://images.unsplash.com/photo-1605634563821-4f36c56754bc?w=800&q=80';
  }
  if (normalized.includes('coconut')) {
    return 'https://images.unsplash.com/photo-1599818815152-0545beff22f4?w=800&q=80';
  }

  if (normalized.includes('potato') || normalized.includes('aloo')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80';
  }
  if (normalized.includes('carrot') || normalized.includes('gajar')) {
    return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80';
  }
  if (normalized.includes('mango') || normalized.includes('aam')) {
    return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80';
  }
  if (normalized.includes('wheat') || normalized.includes('gehun')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80';
  }
  if (normalized.includes('cotton') || normalized.includes('paruthi') || normalized.includes('kapas')) {
    return 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80';
  }
  if (normalized.includes('sugarcane') || normalized.includes('karumbu')) {
    return 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80';
  }
  if (normalized.includes('garlic') || normalized.includes('poondu')) {
    return 'https://images.unsplash.com/photo-1588615419957-c0373e35a1a1?w=800&q=80';
  }
  if (normalized.includes('ginger') || normalized.includes('inji')) {
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80';
  }
  if (normalized.includes('drumstick') || normalized.includes('moringa')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80';
  }
  if (normalized.includes('okra') || normalized.includes('bhendi') || normalized.includes('ladies finger')) {
    return 'https://images.unsplash.com/photo-1627916607164-7b20241db935?w=800&q=80';
  }
  if (normalized.includes('watermelon') || normalized.includes('tharpusani')) {
    return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80';
  }
  if (normalized.includes('papaya') || normalized.includes('pappali')) {
    return 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&q=80';
  }
  if (normalized.includes('jasmine') || normalized.includes('malli')) {
    return 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&q=80';
  }

  // Fallback generic fresh produce/agriculture image
  return 'https://images.unsplash.com/photo-1595856728084-5f5c88b901a5?w=800&q=80';
};
