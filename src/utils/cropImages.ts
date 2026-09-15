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

  // Fallback generic fresh produce/agriculture image
  return 'https://images.unsplash.com/photo-1595856728084-5f5c88b901a5?w=800&q=80';
};
