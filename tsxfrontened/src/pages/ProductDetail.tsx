import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Share2, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { api, type Product, type ProductImage } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Ensure price and stock are numbers for calculations
  const price = product ? (typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0) : 0;
  const stock = product ? (typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0) : 0;

  const loadProduct = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      console.log('Loading product with ID:', productId);
      const response = await api.getProduct(productId);
      console.log('API Response:', response);

      if (response.success) {
        console.log('Product data:', response.data);
        console.log('Product images:', response.data?.images);
        setProduct(response.data);
      } else {
        throw new Error(response.error || 'Product not found');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id, loadProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(stock || 1, prev + delta)));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Product not found</h1>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = stock === 0;
  const isLowStock = stock <= 5;

  // Combine main imageUrl with images array
  const allImages: ProductImage[] = [];
  if (product?.imageUrl) {
    allImages.push({
      id: 'main',
      productId: product.id,
      imageUrl: product.imageUrl,
      altText: product.name,
      sortOrder: 0,
      createdAt: product.createdAt
    });
  }
  if (product?.images) {
    allImages.push(...product.images.sort((a, b) => a.sortOrder - b.sortOrder));
  }

  console.log('Combined allImages:', allImages);
  console.log('Product imageUrl:', product?.imageUrl);
  console.log('Product images array:', product?.images);

  const currentImage = allImages[currentImageIndex];
  const hasMultipleImages = allImages.length > 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div
            className="relative aspect-square overflow-hidden rounded-lg bg-gradient-card border cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => {
              setSelectedImageIndex(currentImageIndex);
              setIsImageModalOpen(true);
            }}
          >
                {currentImage ? (
                  <img
                    src={currentImage.imageUrl}
                    alt={currentImage.altText || product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full bg-gradient-card flex items-center justify-center">
                            <div class="text-muted-foreground text-8xl font-light">
                              ${product.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-muted-foreground text-8xl font-light">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Image Navigation */}
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {allImages.map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors cursor-pointer",
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((image, i) => (
              <div
                key={image.id}
                className={cn(
                  "aspect-square border rounded cursor-pointer hover:border-primary transition-colors",
                  i === currentImageIndex ? "border-primary" : "border-muted"
                )}
                onClick={() => {
                  setCurrentImageIndex(i);
                  setSelectedImageIndex(i);
                  setIsImageModalOpen(true);
                }}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || product.name}
                  className="w-full h-full object-cover rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-card flex items-center justify-center rounded">
                          <div class="text-muted-foreground text-lg font-light">
                            ${product.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            ))}
            {allImages.length === 0 && (
              <div className="aspect-square bg-gradient-card border rounded">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-muted-foreground text-lg font-light">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="mb-2">
                {product.brand}
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                </Button>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {/* Category */}
            {product.category && (
              <p className="text-muted-foreground mt-1">{product.category.name}</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.0) • 127 reviews</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold price-tag">
                ${price.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-success border-success">
                Free Shipping
              </Badge>
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="outline" className="text-warning border-warning">
                  Only {stock} left!
                </Badge>
              ) : (
                <Badge variant="outline" className="text-success border-success">
                  In Stock ({stock} available)
                </Badge>
              )}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-r-none"
                >
                  -
                </Button>
                <div className="flex items-center justify-center w-16 h-10 border-x">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 rounded-l-none"
                >
                  +
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-semibold price-tag">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="lg" className="px-6">
                Buy Now
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Truck className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Free Shipping</span>
                <span className="text-xs text-muted-foreground">On orders over $50</span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <RotateCcw className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">30-Day Returns</span>
                <span className="text-xs text-muted-foreground">Easy returns</span>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center p-4 text-center">
                <Shield className="h-6 w-6 mb-2 text-primary" />
                <span className="text-sm font-medium">Warranty</span>
                <span className="text-xs text-muted-foreground">1 year coverage</span>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Info */}
          {product.vendor && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sold by</p>
                    <p className="font-medium">{product.vendor.name}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews (127)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p>
                    This is a high-quality {product.name} from {product.brand}. 
                    Perfect for everyday use with excellent build quality and modern design.
                  </p>
                  <p>
                    Features include premium materials, attention to detail, and 
                    exceptional performance that you can rely on.
                  </p>
                  <h4>Key Features:</h4>
                  <ul>
                    <li>Premium construction and materials</li>
                    <li>Modern and stylish design</li>
                    <li>Long-lasting durability</li>
                    <li>Excellent value for money</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Brand</dt>
                    <dd className="text-sm">{product.brand}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                    <dd className="text-sm">{product.category?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
                    <dd className="text-sm">{product.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                    <dd className="text-sm">1.2 kg</dd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-3xl font-bold">4.0</div>
                    <div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Based on 127 reviews</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Reviews will be loaded from the backend API</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <img
              src={allImages[selectedImageIndex !== null ? selectedImageIndex : currentImageIndex]?.imageUrl}
              alt={allImages[selectedImageIndex !== null ? selectedImageIndex : currentImageIndex]?.altText || product.name}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-card flex items-center justify-center">
                      <div class="text-muted-foreground text-6xl font-light">
                        ${product.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  `;
                }
              }}
            />
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev - 1 + allImages.length) % allImages.length : currentImageIndex))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex((prev) => (prev !== null ? (prev + 1) % allImages.length : currentImageIndex))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;