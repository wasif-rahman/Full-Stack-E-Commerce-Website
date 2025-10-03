// API Client for E-commerce Backend
const BASE_URL = import.meta.env.VITE_API_URL;


interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  createdAt: string;
}

interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  sortOrder: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  brand: string;
  imageUrl?: string;
  images?: ProductImage[];
  vendorId: string;
  createdAt: string;
  updatedAt: string;
  vendor?: User;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  userId: string;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// API Client class
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error instanceof Error ? error : new Error('Unknown API error');
    }
  }

  // Authentication
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'customer' | 'vendor' | 'admin';
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ role: 'customer', ...userData }),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/users/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/users/profile');
  }

  // Products
  async getProducts(params?: {
    search?: string;
    categoryId?: string;
    brand?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[] | PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  async getProductRecommendations(searchQuery: string, limit?: number): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({ search: searchQuery });
    if (limit) params.append('limit', limit.toString());
    return this.request(`/products/recommendations/search?${params.toString()}`);
  }

  async createProduct(productData: {
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    brand: string;
    imageUrl?: string;
  }): Promise<ApiResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData: {
    name: string;
    description: string;
  }): Promise<ApiResponse<Category>> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(
    id: string,
    categoryData: Partial<Category>
  ): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.request('/carts/');
  }

  async addToCart(item: {
    productId: string;
    quantity: number;
  }): Promise<ApiResponse<CartItem>> {
    return this.request('/carts/add', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateCartItem(
    productId: string,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    return this.request('/carts/update', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId: string): Promise<ApiResponse<void>> {
    return this.request('/carts/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  }

  // Orders
  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request('/orders');
  }

  async createOrder(): Promise<ApiResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
    });
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(
    id: string,
    status: string
  ): Promise<ApiResponse<Order>> {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const api = new ApiClient();
export type { User, Product, ProductImage, Category, CartItem, Order, ApiResponse, PaginatedResponse };