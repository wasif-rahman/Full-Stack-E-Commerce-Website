import { useState } from 'react';
import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Product, type ProductImage } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  // Combine main imageUrl with images array
  const allImages: ProductImage[] = [];
  if (product.imageUrl) {
    allImages.push({
      id: 'main',
      productId: product.id,
      imageUrl: product.imageUrl,
      altText: product.name,
      sortOrder: 0,
      createdAt: product.createdAt
    });
  }
  if (product.images) {
    allImages.push(...product.images.sort((a, b) => a.sortOrder - b.sortOrder));
  }

  const currentImage = allImages[currentImageIndex];
  const hasMultipleImages = allImages.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      await addToCart(product);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Ensure price and stock are numbers and handle potential API inconsistencies
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock) || 0;
  
  const isOnSale = false; // TODO: Add sale logic
  const isLowStock = stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <Link to={`/products/${product.id}`}>
      <Card className={cn("group card-hover overflow-hidden", className)}>
        <div className="relative aspect-square overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage.imageUrl}
              alt={currentImage.altText || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-card flex items-center justify-center">
                      <div class="text-muted-foreground text-4xl font-light">
                        ${product.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-card flex items-center justify-center">
              <div className="text-muted-foreground text-4xl font-light">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && (
              <Badge className="sale-badge">
                SALE
              </Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="outline" className="bg-warning text-warning-foreground">
                Low Stock
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
            onClick={handleWishlist}
          >
            <Heart 
              className={cn("h-4 w-4", isWishlisted ? "fill-red-500 text-red-500" : "")} 
            />
          </Button>

          {/* Add to Cart Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Brand */}
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {product.brand}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-muted-foreground">
              {product.category.name}
            </p>
          )}

          {/* Rating placeholder */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="price-tag text-lg">
                ${price.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-muted-foreground line-through">
                  ${(price * 1.2).toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock indicator */}
            <div className="text-xs text-muted-foreground">
              {stock} left
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}