import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SG5p53j9XCjmWOGSpK1ex75CbbmwN01r6RbOZ2QKgoWZ7Q6K1gEu12OgUhgSb2ur6LoBJSOA7V2K9zS0WhbPwJk00l16UUppK'
);

console.log('PaymentPage using Stripe key:', (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SG5p53j9XCjmWOGSpK1ex75CbbmwN01r6RbOZ2QKgoWZ7Q6K1gEu12OgUhgSb2ur6LoBJSOA7V2K9zS0WhbPwJk00l16UUppK').substring(0, 20));

// Inner component that uses Stripe hooks
const PaymentFormContent = ({ bookingData, onPaymentComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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
    } else if (paymentIntent?.status === 'succeeded') {
      onPaymentComplete({
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{paymentError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || paymentProcessing}
        className={`w-full py-4 px-6 rounded-lg font-bold text-xl transition-colors ${
          paymentProcessing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {paymentProcessing ? 'Processing...' : '💳 Complete Payment & Book Slip'}
      </button>
    </form>
  );
};

// Outer component that creates Elements with clientSecret
const PaymentPage = ({ bookingData, selectedSlip, onPaymentComplete, onBack }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const calculateTotal = () => {
    if (!bookingData.checkIn || !bookingData.checkOut || !selectedSlip) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const baseTotal = days * selectedSlip.price_per_night;
    return days === 30 ? baseTotal * 0.6 : baseTotal;
  };

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const totalAmount = calculateTotal();
        console.log('Creating payment intent for amount:', totalAmount);
        // Use REACT_APP_API_URL if set, otherwise default to localhost:5001
        const localApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        const fnUrl = `${localApiUrl}/api/create-payment-intent`;

         const resp = await fetch(fnUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             amount: totalAmount,
             currency: 'usd',
             booking: {
               slip_id: selectedSlip?.id,
               slip_name: selectedSlip?.name,
               guest_email: bookingData.guestEmail,
               guest_name: bookingData.guestName,
               guest_phone: bookingData.guestPhone,
               check_in: bookingData.checkIn,
               check_out: bookingData.checkOut,
               boat_length: bookingData.boatLength,
               boat_make_model: bookingData.boatMakeModel,
               user_type: bookingData.userType,
             }
           })
         });

         console.log('Payment intent response status:', resp.status);
         if (!resp.ok) {
           const errorText = await resp.text();
           console.error('Payment intent error:', errorText);
           throw new Error('Failed to create payment intent');
         }
         const result = await resp.json();
         console.log('Payment intent result:', result);
         const { clientSecret } = result;
         console.log('Setting clientSecret:', clientSecret);
         setClientSecret(clientSecret);
       } catch (error) {
         console.error('Payment intent creation error:', error);
         setPaymentError(error.message);
       }
     };

     createPaymentIntent();
   }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg">Initializing secure payment...</p>
            {paymentError && <p className="mt-2 text-red-600">{paymentError}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">💳 Secure Payment</h1>
            <button onClick={onBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              ← Back to Booking
            </button>
          </div>
          
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

         <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
           <PaymentFormContent bookingData={bookingData} onPaymentComplete={onPaymentComplete} />
         </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;

