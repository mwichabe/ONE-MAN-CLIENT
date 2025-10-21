import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiCreditCard, HiArrowLeft, HiXMark } from "react-icons/hi2";

// Helper Component for consistency
const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ea2e0e] mx-auto"></div>;

// Helper Component for data rows
const DetailRow = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between py-2 ${isTotal ? 'border-t-2 border-gray-800 pt-3' : 'border-b border-gray-100'}`}>
      <span className={`font-${isTotal ? 'bold' : 'medium'} text-${isTotal ? 'lg' : 'base'} text-gray-700`}>{label}</span>
      <span className={`font-${isTotal ? 'extrabold' : 'semibold'} text-${isTotal ? 'xl' : 'lg'} text-${isTotal ? 'red-600' : 'gray-900'}`}>
        Ksh {value.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </span>
    </div>
);

// Helper Component for item details (kept for completeness)
const ItemDetail = ({ title, value }) => (
    <div className="flex justify-between text-sm py-1">
        <span className="text-gray-500 font-medium">{title}:</span>
        <span className="text-gray-700 font-semibold">{value}</span>
    </div>
);


export const OrderReview = ({ formData, onPrev, placeOrder, cartItems, totalCartPrice, loading, refreshCart }) => {
  const navigate = useNavigate();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paystackAuthUrl, setPaystackAuthUrl] = useState(null); // 🔑 New State for Paystack URL
  const [paystackReference, setPaystackReference] = useState(null); // 🔑 New State for Paystack Reference
  const [paystackLoading, setPaystackLoading] = useState(false); // 🔑 Loading state for Paystack Init

  // --- Calculations ---
  const shippingCost = formData.shippingCost || 0;
  const subtotal = totalCartPrice;
  const taxRate = 0.16;
  const tax = subtotal * taxRate;
  const orderTotal = subtotal + shippingCost + tax;

  // --- Handlers ---
  const initializePayment = async (id) => {
    setPaystackLoading(true);
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`https://one-man-server.onrender.com/api/orders/${id}/paystack-init`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
        });

        const data = await response.json();

        if (response.ok && data.authorization_url) {
            setPaystackAuthUrl(data.authorization_url);
            setPaystackReference(data.reference);
            setShowPaymentModal(true); // Open the new modal
        } else {
            // Handle Paystack initialization failure (e.g., show an error)
            const errorMessage = data.message || 'Server did not return a valid payment URL.';
            alert(`Payment initialization failed: ${errorMessage}`);
            setShowPaymentModal(false);
            setOrderId(null);
        }
    } catch (error) {
        console.error('Paystack Initialization Network Error:', error);
        alert('Failed to connect to payment gateway. Please try again.');
        setShowPaymentModal(false);
        setOrderId(null);
    } finally {
        setPaystackLoading(false);
    }
  }

  // 🔑 Combined Place Order and Init Paystack function
  const handlePlaceOrderAndPay = async () => {
      setPaystackLoading(true); // Use this loading state for the whole process
      
      // 1. Place Order
      const data = await placeOrder(orderTotal, subtotal, tax);
      
      if (data && data.order && data.order._id) {
          const newOrderId = data.order._id;
          setOrderId(newOrderId);

          // 2. Initialize Paystack Payment
          await initializePayment(newOrderId);
      }
      // Note: Loading state is handled inside initializePayment's finally block
  };


  // Function to navigate and clear cart (after payment attempt)
  const handleProceedToPaystack = () => {
      // 🔑 User is redirected to Paystack, we clear the cart for a fresh start
      refreshCart();
      window.location.href = paystackAuthUrl;
  };

  const handleModalDismiss = () => {
      // 🔑 User cancels payment, they can still view order status later
      refreshCart();
      setShowPaymentModal(false);
      navigate('/app');
  };

  // --- Payment Modal Component (Local to OrderReview) ---
  const PaystackRedirectModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h4 className="text-2xl font-bold text-gray-800 flex items-center">
            <HiCreditCard className="w-6 h-6 mr-2 text-blue-600" />
            Proceed to Secure Payment
          </h4>
          <button onClick={handleModalDismiss} className="text-gray-400 hover:text-gray-600">
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Order Summary & Status */}
        <div className="text-center bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-lg text-gray-800">Order ID: <strong className="text-blue-600">{orderId.slice(-6).toUpperCase()}</strong></p>
            <p className="text-3xl font-extrabold text-red-600 mt-1">Ksh {orderTotal.toLocaleString()}</p>
            <p className="text-sm text-blue-800 mt-2">Your payment is being handled securely by Paystack.</p>
        </div>

        {/* Paystack Details */}
        <div className="space-y-4">
            <h5 className="text-xl font-semibold text-gray-700">Payment Options:</h5>
            <p className="text-gray-700">On the next screen, you can choose to pay with **Card, Bank Transfer, or Mobile Money (M-Pesa)**.</p>
            
            <div className='flex justify-between items-center p-3 bg-gray-100 rounded-lg'>
                 <span className='font-medium text-gray-600'>Paystack Reference:</span>
                 <span className='font-bold text-gray-800'>{paystackReference}</span>
            </div>
        </div>
        
        {/* Footer Button - Redirects to Paystack */}
        <button 
            onClick={handleProceedToPaystack} 
            disabled={!paystackAuthUrl}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center justify-center"
        >
            <HiCreditCard className='w-6 h-6 mr-2' />
            Pay Now with Paystack
        </button>

        <button 
            onClick={handleModalDismiss} 
            className="w-full py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-200"
        >
            Cancel and Return Home
        </button>
      </div>
    </div>
  );

  // --- MAIN RENDER FUNCTION ---
  return (
    <div className="relative">
      {/* 1. Main Order Review Content */}
      <div className="space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center"><HiCheckCircle className="w-6 h-6 mr-2 text-[#ea2e0e]"/>Review & Place Order</h3>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping and Payment Info */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <p className="text-lg font-semibold text-gray-800 mb-2">Delivery & Payment</p>
              <ItemDetail title="Recipient" value={formData.name} />
              <ItemDetail title="Shipping To" value={`${formData.address}, ${formData.city}`} />
              <ItemDetail title="Shipping Method" value={formData.shippingMethod === 'standard' ? 'Standard (3-5 Days)' : 'Express (1-2 Days)'} />
              <ItemDetail title="Payment Method" value={formData.paymentMethod.toUpperCase()} />
            </div>

            {/* Item List */}
            <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-lg font-semibold text-gray-800 mb-4">Items ({cartItems.length})</p>
                {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700 line-clamp-1 w-2/3">{item.name} ({item.size})</span>
                        <span className="font-semibold">Ksh {item.price.toLocaleString()} x {item.quantity}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="md:col-span-1 border border-gray-200 rounded-lg p-6 bg-white shadow-md h-fit">
            <p className="text-xl font-bold text-gray-800 mb-4">Order Summary</p>
            <DetailRow label="Subtotal" value={subtotal} />
            <DetailRow label={`Tax (VAT ${taxRate*100}%)`} value={tax} />
            <DetailRow label="Shipping" value={shippingCost} />
            <DetailRow label="Order Total" value={orderTotal} isTotal={true} />
            <p className="text-xs text-gray-500 mt-2 text-right">All prices in Kenya Shillings (Ksh)</p>
          </div>
        </div>
      
        <div className="flex justify-between pt-4">
          <button onClick={onPrev} className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center transition duration-150">
            <HiArrowLeft className="w-5 h-5 mr-1" /> Edit Details
          </button>
          <button 
            onClick={handlePlaceOrderAndPay} 
            disabled={loading || paystackLoading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading || paystackLoading ? <Spinner /> : 'PLACE ORDER & PAY'}
          </button>
        </div>
      </div>
      
      {/* 2. Payment Modal Overlay */}
      {showPaymentModal && <PaystackRedirectModal />}
    </div>
  );
};