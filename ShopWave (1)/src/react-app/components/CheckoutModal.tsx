import { X, CreditCard, Smartphone, Wallet, ArrowRight, MapPin, User, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  onCheckout: (paymentMethod: string, deliveryAddress: DeliveryAddress) => void;
}

interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    description: 'Fast and secure payment',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: Smartphone,
    description: 'One-click checkout',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: Smartphone,
    description: 'Quick and easy payment',
  },
];

export default function CheckoutModal({
  isOpen,
  onClose,
  cartTotal,
  onCheckout,
}: CheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const handleAddressSubmit = () => {
    const isValid = deliveryAddress.fullName &&
                   deliveryAddress.email &&
                   deliveryAddress.phone &&
                   deliveryAddress.address &&
                   deliveryAddress.city &&
                   deliveryAddress.state &&
                   deliveryAddress.zipCode;
    
    if (isValid) {
      setCurrentStep('payment');
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onCheckout(selectedMethod, deliveryAddress);
      setProcessing(false);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setCurrentStep('address');
    setDeliveryAddress({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Checkout
              </h2>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'address' ? 'bg-purple-600 text-white' : 'bg-green-100 text-green-600'
                }`}>
                  1
                </div>
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStep === 'address' ? (
              <>
                {/* Delivery Address Form */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Delivery Address</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline w-4 h-4 mr-1" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.fullName}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-1" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={deliveryAddress.email}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={deliveryAddress.phone}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.address}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="123 Main Street, Apt 4B"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="NY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        value={deliveryAddress.country}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleAddressSubmit}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                {/* Order Summary */}
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span>${(cartTotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-purple-200 flex justify-between items-baseline">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${(cartTotal * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Summary */}
                <div className="mb-8 p-6 border border-gray-200 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{deliveryAddress.fullName}</p>
                        <p>{deliveryAddress.address}</p>
                        <p>{deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zipCode}</p>
                        <p>{deliveryAddress.country}</p>
                        <p>{deliveryAddress.email}</p>
                        <p>{deliveryAddress.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep('address')}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedMethod === method.id
                              ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                selectedMethod === method.id
                                  ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                                  : 'bg-gray-100'
                              }`}
                            >
                              <Icon
                                className={`w-6 h-6 ${
                                  selectedMethod === method.id ? 'text-white' : 'text-gray-600'
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{method.name}</h4>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedMethod === method.id
                                  ? 'border-purple-600 bg-purple-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedMethod === method.id && (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Payment
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Your payment information is secure and encrypted
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
