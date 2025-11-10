import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { ProductWithRating, Review } from '@/shared/types';
import { ArrowLeft, ShoppingCart, Package, Loader2, Heart } from 'lucide-react';
import Header from '@/react-app/components/Header';
import CartDrawer from '@/react-app/components/CartDrawer';
import LoginPrompt from '@/react-app/components/LoginPrompt';
import CheckoutModal from '@/react-app/components/CheckoutModal';
import OrderSuccessModal from '@/react-app/components/OrderSuccessModal';
import StarRating from '@/react-app/components/StarRating';
import ReviewSection from '@/react-app/components/ReviewSection';
import { useCart } from '@/react-app/hooks/useCart';
import { useAuth } from '@getmocha/users-service/react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ total: 0, method: '' });

  const { user } = useAuth();
  const {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (user) {
      checkWishlist();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInWishlist(data.inWishlist);
      }
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (product) {
      const success = await addToCart(product.id, quantity);
      if (success) {
        setCartOpen(true);
      }
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (inWishlist) {
        const response = await fetch(`/api/wishlist/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setInWishlist(false);
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: id }),
        });
        if (response.ok) {
          setInWishlist(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleReviewSubmit = () => {
    fetchProduct();
    fetchReviews();
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setShowCheckout(true);
  };

  const handleCompleteCheckout = async (paymentMethod: string, _deliveryAddress: any) => {
    const total = cartTotal * 1.1; // Including tax
    setOrderDetails({ total, method: paymentMethod });
    await clearCart();
    setShowCheckout(false);
    setShowOrderSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Link
              to="/"
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative">
            {user && (
              <button
                onClick={toggleWishlist}
                className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
              >
                <Heart
                  className={`w-6 h-6 ${
                    inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`}
                />
              </button>
            )}
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 p-8">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            {product.category && (
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {product.average_rating !== null && product.average_rating > 0 && (
              <div className="mb-6">
                <StarRating
                  rating={product.average_rating ?? 0}
                  size="lg"
                  reviewCount={product.review_count}
                />
              </div>
            )}
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium">
                {product.stock} items in stock
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <label className="text-gray-700 font-medium">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              {user && (
                <button
                  onClick={toggleWishlist}
                  className="px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-600 transition-all duration-200 hover:scale-105"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection
          productId={parseInt(id!)}
          reviews={reviews}
          onReviewSubmit={handleReviewSubmit}
        />
      </main>

      {user && (
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          cartTotal={cartTotal}
          onUpdateQuantity={updateCartItem}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
        />
      )}

      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cartTotal={cartTotal}
        onCheckout={handleCompleteCheckout}
      />

      <OrderSuccessModal
        isOpen={showOrderSuccess}
        onClose={() => setShowOrderSuccess(false)}
        orderTotal={orderDetails.total}
        paymentMethod={orderDetails.method}
      />
    </div>
  );
}
