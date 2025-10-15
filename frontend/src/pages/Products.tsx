import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { api, Product, Category, PaginatedResponse, ApiResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  });
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = {
        search: searchParams.get('search') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        brand: searchParams.get('brand') || undefined,
        sort: searchParams.get('sort') || 'name',
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        inStock: searchParams.get('inStock') === 'true' ? true : undefined,
        page: currentPage,
        limit: 6, // Show 6 products per page to test pagination
      };

      console.log('Loading products with params:', params);
      console.log('Current page:', currentPage, 'Total pages:', totalPages, 'Total products:', totalProducts);

      const searchQuery = searchParams.get('search') || '';
      const wordCount = searchQuery.trim().split(/\s+/).length;

      // Check if we should show recommendations (3-4 words)
      const shouldShowRecommendations = wordCount >= 3 && wordCount <= 4 && searchQuery.trim().length > 0;

      const promises = [
        api.getProducts(params),
        api.getCategories(),
      ];

      // Add recommendations request if needed
      if (shouldShowRecommendations) {
        promises.push(api.getProductRecommendations(searchQuery, 8));
      }

      const responses = await Promise.all(promises);
      const productsResponse = responses[0] as Awaited<ReturnType<typeof api.getProducts>>;
      const categoriesResponse = responses[1] as Awaited<ReturnType<typeof api.getCategories>>;
      const recommendationsResponse = shouldShowRecommendations ? responses[2] as Awaited<ReturnType<typeof api.getProductRecommendations>> : null;

      if (productsResponse.success && productsResponse.data) {
        // Handle both Product[] and PaginatedResponse<Product> types
        if (Array.isArray(productsResponse.data)) {
          // Response is Product[]
          console.log('Products loaded:', productsResponse.data.length);
          setProducts(productsResponse.data);
          setTotalProducts(productsResponse.data.length);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          // Response is PaginatedResponse<Product>
          console.log('Products loaded:', productsResponse.data.data.length, 'of', productsResponse.data.total);
          console.log('Pagination info:', {
            page: productsResponse.data.page,
            totalPages: productsResponse.data.totalPages,
            total: productsResponse.data.total
          });
          setProducts(productsResponse.data.data);
          setTotalProducts(productsResponse.data.total);
          setTotalPages(productsResponse.data.totalPages);
          setCurrentPage(productsResponse.data.page);
        }
      } else {
        console.error('Failed to load products:', productsResponse.error);
      }

      if (categoriesResponse.success) {
        console.log('Categories loaded:', categoriesResponse.data.length);
        setCategories(categoriesResponse.data);
      } else {
        console.error('Failed to load categories:', categoriesResponse.error);
      }

      // Handle recommendations
      if (shouldShowRecommendations && recommendationsResponse) {
        if (recommendationsResponse.success) {
          console.log('Recommendations loaded:', recommendationsResponse.data.length);
          setRecommendations(recommendationsResponse.data);
          setShowRecommendations(true);
        } else {
          console.error('Failed to load recommendations:', recommendationsResponse.error);
          setShowRecommendations(false);
        }
      } else {
        setShowRecommendations(false);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, toast, currentPage]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchQuery || null });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSortBy('name');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setRecommendations([]);
    setShowRecommendations(false);
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page: page.toString() });
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceRange.min,
    priceRange.max,
    inStockOnly && 'inStock',
  ].filter(Boolean).length;

  const brands = [...new Set(products.map(p => (typeof p.brand === 'string' ? p.brand : String(p.brand))))]
    .filter(b => typeof b === 'string' && b.trim().length > 0)
    .sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) => {
                    const categoryValue = value === "all" ? "" : value;
                    setSelectedCategory(categoryValue);
                    updateSearchParams({ categoryId: categoryValue || null });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories
                      .filter((category) => category && category.id !== null && category.id !== undefined)
                      .map((category) => {
                        const id = String(category.id);
                        if (!id || id.trim().length === 0) return null;
                        return (
                          <SelectItem key={id} value={id}>
                            {category.name || `Category ${id}`}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Brand</Label>
                <Select
                  value={selectedBrand || "all"}
                  onValueChange={(value) => {
                    const brandValue = value === "all" ? "" : value;
                    setSelectedBrand(brandValue);
                    updateSearchParams({ brand: brandValue || null });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => {
                      const b = typeof brand === 'string' ? brand : String(brand);
                      const trimmed = b.trim();
                      if (!trimmed) return null;
                      return (
                        <SelectItem key={trimmed} value={trimmed}>
                          {trimmed}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    onBlur={() => updateSearchParams({ minPrice: priceRange.min || null })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    onBlur={() => updateSearchParams({ maxPrice: priceRange.max || null })}
                  />
                </div>
              </div>

              {/* In Stock Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => {
                    setInStockOnly(checked as boolean);
                    updateSearchParams({ inStock: checked ? 'true' : null });
                  }}
                />
                <Label htmlFor="inStock" className="text-sm font-medium">
                  In Stock Only
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <div className="flex-1">
          {/* Search and Sort Bar */}
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalProducts} products found
              </p>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    updateSearchParams({ sort: value });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="-name">Name Z-A</SelectItem>
                    <SelectItem value="price">Price Low-High</SelectItem>
                    <SelectItem value="-price">Price High-Low</SelectItem>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          {showRecommendations && recommendations.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Recommended Products</h2>
                <Badge variant="secondary" className="text-xs">
                  Similar to "{searchParams.get('search')}"
                </Badge>
              </div>
              <div className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {recommendations.map((product) => (
                  <ProductCard
                    key={`rec-${product.id}`}
                    product={product}
                    className={viewMode === 'list' ? 'md:flex md:flex-row' : ''}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No products found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className={viewMode === 'list' ? 'md:flex md:flex-row' : ''}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    const maxPages = Math.min(5, totalPages);

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else {
                      // Calculate start page to center current page
                      let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                      // Adjust if we're near the end
                      if (startPage + maxPages - 1 > totalPages) {
                        startPage = totalPages - maxPages + 1;
                      }
                      pageNum = startPage + i;
                    }

                    // Ensure pageNum is valid
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }).filter(Boolean)}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Products;