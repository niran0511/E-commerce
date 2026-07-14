export const getFallbackImage = (product) => {
  if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
  
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
    return 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop';
  }
  
  // Books & Stationery
  if (
    categoryName.includes('book') || 
    productName.includes('novel') || 
    productName.includes('journal') ||
    productName.includes('pen') ||
    productName.includes('pencil')
  ) {
    return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=400&fit=crop';
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
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';
  }

  // Default clean neutral watch/gadget product photo
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
};
