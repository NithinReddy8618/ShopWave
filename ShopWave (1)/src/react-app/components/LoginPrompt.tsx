import { useAuth } from '@getmocha/users-service/react';
import { ShoppingBag } from 'lucide-react';

interface LoginPromptProps {
  onClose: () => void;
}

export default function LoginPrompt({ onClose }: LoginPromptProps) {
  const { redirectToLogin } = useAuth();

  const handleLogin = async () => {
    await redirectToLogin();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-purple-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to continue
          </h2>
          
          <p className="text-gray-600 mb-8">
            Create an account or sign in to add items to your cart and make purchases.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Continue with Google
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              Browse as guest
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
