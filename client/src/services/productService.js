import api from './api';


const productService = {
  getProducts: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return api.get(`/products?${queryStr}`);
  },
  getProductById: (id) => api.get(`/products/${id}`),
  getHeroProducts: () => api.get('/products/hero'),
  // Use dedicated backend routes that return { data: { products: [] } }
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getBestSellers: () => api.get('/products/best-sellers'),
  // Correct endpoint — served at /api/products/categories
  getCategories: () => api.get('/products/categories'),
  searchProducts: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  getRelated: (productId) => api.get(`/products/${productId}/related`),
};

export default productService;
