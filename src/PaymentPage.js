import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentPage = ({ bookingData, selectedSlip, onPaymentComplete, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const totalAmount = calculateTotal();
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            slipId: selectedSlip?.id,
            slipName: selectedSlip?.name,
            guestName: bookingData.guestName,
            guestEmail: bookingData.guestEmail,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            boatLength: bookingData.boatLength,
            boatMakeModel: bookingData.boatMakeModel
          }
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setPaymentError(data.error);
        return;
      }

      setClientSecret(data.client_secret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not ready. Please refresh and try again.');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message);
      setPaymentProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful - call the parent's onPaymentComplete
      onPaymentComplete({
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status,
        paymentMethod: 'stripe',
        bookingData: bookingData,
        selectedSlip: selectedSlip
      });
    } else {
      setPaymentError('Payment failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedSlip) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const baseTotal = days * selectedSlip.pricePerDay;
    
    // Apply 40% discount for 30-day bookings
    if (days === 30) {
      return baseTotal * 0.6; // 40% discount
    }
    
    return baseTotal;
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg">Initializing payment...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">💳 Secure Payment</h1>
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              ← Back to Booking
            </button>
          </div>
          
          {/* Booking Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">Booking Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Slip:</strong> {selectedSlip?.name}</p>
                <p><strong>Dates:</strong> {bookingData.checkIn} to {bookingData.checkOut}</p>
                <p><strong>Guest:</strong> {bookingData.guestName}</p>
              </div>
              <div>
                <p><strong>Boat Length:</strong> {bookingData.boatLength}ft</p>
                <p><strong>Nights:</strong> {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</p>
                <p className="text-lg font-bold text-green-600">Total: ${calculateTotal()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stripe Payment Element */}
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment Information</h3>
              <div className="bg-white p-4 rounded border">
                <PaymentElement 
                  options={{
                    layout: 'tabs',
                    defaultValues: {
                      billingDetails: {
                        name: bookingData.guestName,
                        email: bookingData.guestEmail,
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Security Note */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    <strong>🔒 Secure Payment:</strong> Your payment is processed securely by Stripe. 
                    We never store your payment information on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {paymentError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{paymentError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripe || paymentProcessing}
              className={`w-full py-4 px-6 rounded-lg font-bold text-xl transition-colors ${
                paymentProcessing || !stripe
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {paymentProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                '💳 Complete Payment & Book Slip'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 