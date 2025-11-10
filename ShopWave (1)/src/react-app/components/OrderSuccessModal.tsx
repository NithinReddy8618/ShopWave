import { CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number;
  paymentMethod: string;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderTotal,
  paymentMethod,
}: OrderSuccessModalProps) {
  if (!isOpen) return null;

  const formatPaymentMethod = (method: string) => {
    return method
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>

          <p className="text-gray-600 mb-6">
            Your payment of ${orderTotal.toFixed(2)} via {formatPaymentMethod(paymentMethod)} has
            been processed successfully.
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold text-gray-900">
              #{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            A confirmation email has been sent to your registered email address.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              onClick={onClose}
              className="block w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Continue Shopping
            </Link>
            <button
              onClick={onClose}
              className="block w-full py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
