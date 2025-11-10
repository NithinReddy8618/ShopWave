import { ProductWithRating } from '@/shared/types';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import StarRating from './StarRating';

interface ProductCardProps {
  product: ProductWithRating;
  onAddToCart: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.category && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-600">
              {product.category}
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.average_rating !== null && product.average_rating > 0 && (
            <div className="mb-2">
              <StarRating 
                rating={product.average_rating ?? 0} 
                size="sm" 
                reviewCount={product.review_count}
              />
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
            {product.description}
          </p>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {product.stock} in stock
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product.id);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
