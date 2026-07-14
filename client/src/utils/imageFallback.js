export const cleanAmazonUrl = (url) => {
  if (!url) return url;
  // If it's a temporary Amazon webp URL, clean it up to the direct CDN format
  // Example: https://m.media-amazon.com/images/W/WEBP_402378-T1/images/I/41xwPQLxTML._SX300_SY300_QL70_FMwebp_.jpg
  // Target: https://m.media-amazon.com/images/I/41xwPQLxTML._SX300_SY300_QL70_FMwebp_.jpg
  return url.replace(/\/images\/W\/[^\/]+\/images\/I\//, '/images/I/');
};

export const getFallbackImage = (product) => {
  if (!product) return 'https://placehold.co/500x500/f8fafc/64748b?text=Product';
  
  const name = product.name || 'Product';
  // Truncate name if it's too long for the placeholder image
  const displayName = name.length > 25 ? name.substring(0, 22) + '...' : name;
  
  // Return a clean slate-colored placeholder containing the product's actual name
  return `https://placehold.co/500x500/f8fafc/64748b?text=${encodeURIComponent(displayName)}`;
};

export const getCategoryInfo = (product) => {
  if (!product) return { emoji: '📦', color: '#6b7280' };
  
  const categoryName = product.category?.name?.toLowerCase() || '';
  const productName = product.name?.toLowerCase() || '';

  // Electronics & Accessories
  if (
    categoryName.includes('electr') || 
    productName.includes('phone') || 
    productName.includes('laptop') || 
    productName.includes('usb') || 
    productName.includes('cable') || 
    productName.includes('charger') || 
    productName.includes('adapter') || 
    productName.includes('power') || 
    productName.includes('headphone') ||
    productName.includes('earphone')
  ) {
    return { emoji: '💻', color: '#6366f1' };
  }
  
  // Fashion, Footwear, Clothing
  if (
    categoryName.includes('fashion') || 
    productName.includes('shoe') || 
    productName.includes('shirt') || 
    productName.includes('pant') || 
    productName.includes('dress') || 
    productName.includes('sneaker') || 
    productName.includes('trainer') ||
    productName.includes('jacket') ||
    productName.includes('tshirt')
  ) {
    return { emoji: '👗', color: '#ec4899' };
  }
  
  // Home, Kitchen, Furniture, Plants
  if (
    categoryName.includes('home') || 
    categoryName.includes('kitchen') || 
    productName.includes('plant') || 
    productName.includes('bottle') || 
    productName.includes('cup') || 
    productName.includes('mug') || 
    productName.includes('chair') || 
    productName.includes('sofa') ||
    productName.includes('bed') ||
    productName.includes('table')
  ) {
    return { emoji: '🏠', color: '#f59e0b' };
  }
  
  // Books & Stationery
  if (
    categoryName.includes('book') || 
    productName.includes('novel') || 
    productName.includes('journal') ||
    productName.includes('pen') ||
    productName.includes('pencil')
  ) {
    return { emoji: '📚', color: '#10b981' };
  }
  
  // Sports, Fitness, Gym
  if (
    categoryName.includes('sport') || 
    categoryName.includes('fitness') || 
    productName.includes('fit') || 
    productName.includes('ball') || 
    productName.includes('gym') ||
    productName.includes('dumb') ||
    productName.includes('cycle')
  ) {
    return { emoji: '⚽', color: '#3b82f6' };
  }
  
  // Beauty, Personal Care, Cosmetics
  if (
    categoryName.includes('beauty') || 
    categoryName.includes('care') || 
    productName.includes('makeup') || 
    productName.includes('cream') || 
    productName.includes('perfume') || 
    productName.includes('shampoo') ||
    productName.includes('groom') ||
    productName.includes('lotion')
  ) {
    return { emoji: '💄', color: '#8b5cf6' };
  }
  
  // Toys & Games
  if (
    categoryName.includes('toy') || 
    categoryName.includes('game') || 
    productName.includes('board') || 
    productName.includes('puzzle') || 
    productName.includes('card') ||
    productName.includes('doll')
  ) {
    return { emoji: '🎮', color: '#ef4444' };
  }
  
  // Groceries, Food & Beverages
  if (
    categoryName.includes('grocer') || 
    productName.includes('food') || 
    productName.includes('drink') || 
    productName.includes('snack') || 
    productName.includes('chocolate') || 
    productName.includes('water') ||
    productName.includes('tea') ||
    productName.includes('coffee')
  ) {
    return { emoji: '🛒', color: '#84cc16' };
  }

  return { emoji: '📦', color: '#6b7280' };
};

