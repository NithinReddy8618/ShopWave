import { useState, useEffect } from 'react';
import { ProductWithRating } from '@/shared/types';
import { Heart, Loader2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import Header from '@/react-app/components/Header';
import CartDrawer from '@/react-app/components/CartDrawer';
import CheckoutModal from '@/react-app/components/CheckoutModal';
import OrderSuccessModal from '@/react-app/components/OrderSuccessModal';
import StarRating from '@/react-app/components/StarRating';
import { useCart } from '@/react-app/hooks/useCart';
import { useAuth } from '@getmocha/users-service/react';

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<ProductWithRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ total: 0, method: '' });

  const { user, redirectToLogin } = useAuth();
  const {
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cart,
    cartTotal,
  } = useCart();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWishlistItems(items => items.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    const success = await addToCart(productId);
    if (success) {
      setCartOpen(true);
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h1>
            <p className="text-gray-600 mb-8">Save your favorite items and shop them later</p>
            <button
              onClick={redirectToLogin}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love!</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
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
                  </Link>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${product.price.toFixed(2)}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product.id);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
