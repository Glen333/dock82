import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, Mail, Phone, Calendar, MapPin } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking details from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    
    if (paymentIntentId) {
      // Fetch booking details from the payment intent
      fetchBookingDetails(paymentIntentId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookingDetails = async (paymentIntentId) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBookingDetails(data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPermit = () => {
    // Generate and download permit
    const permitData = {
      guestName: bookingDetails?.guestName,
      slipName: bookingDetails?.slipName,
      checkIn: bookingDetails?.checkIn,
      checkOut: bookingDetails?.checkOut,
      boatLength: bookingDetails?.boatLength,
      boatMakeModel: bookingDetails?.boatMakeModel,
      permitNumber: `PERMIT-${Date.now()}`
    };

    const permitText = `
DOCK RENTAL PERMIT
==================

Permit Number: ${permitData.permitNumber}
Date: ${new Date().toLocaleDateString()}

GUEST INFORMATION:
Name: ${permitData.guestName}
Email: ${bookingDetails?.guestEmail}
Phone: ${bookingDetails?.guestPhone}

SLIP INFORMATION:
Slip: ${permitData.slipName}
Check-in: ${permitData.checkIn}
Check-out: ${permitData.checkOut}

BOAT INFORMATION:
Length: ${permitData.boatLength}ft
Make/Model: ${permitData.boatMakeModel}

TERMS & CONDITIONS:
- This permit must be displayed on your vessel
- Follow all marina rules and regulations
- Contact marina office for emergencies
- Check-out time is 11:00 AM on departure date

Emergency Contact: (555) 123-4567
Marina Office: (555) 987-6543
    `;

    const blob = new Blob([permitText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dock-permit-${permitData.permitNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg">Loading booking details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Your dock rental has been confirmed. Welcome to our marina!
          </p>
        </div>

        {/* Booking Details */}
        {bookingDetails && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-semibold">Slip Location</p>
                    <p className="text-gray-600">{bookingDetails.slipName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold">Stay Duration</p>
                    <p className="text-gray-600">
                      {bookingDetails.checkIn} to {bookingDetails.checkOut}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="font-semibold">Contact</p>
                    <p className="text-gray-600">{bookingDetails.guestPhone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Guest Name</p>
                  <p className="text-gray-600">{bookingDetails.guestName}</p>
                </div>
                <div>
                  <p className="font-semibold">Boat Information</p>
                  <p className="text-gray-600">
                    {bookingDetails.boatLength}ft {bookingDetails.boatMakeModel}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Total Amount</p>
                  <p className="text-green-600 font-bold text-lg">
                    ${bookingDetails.totalCost}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={downloadPermit}
              className="flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Permit
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Check-in time: 3:00 PM on arrival date</li>
            <li>• Check-out time: 11:00 AM on departure date</li>
            <li>• Display your permit on your vessel at all times</li>
            <li>• Follow all marina rules and safety guidelines</li>
            <li>• Contact marina office for any questions or emergencies</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold">Marina Office</p>
              <p className="text-gray-600">(555) 987-6543</p>
            </div>
            <div>
              <p className="font-semibold">Emergency</p>
              <p className="text-gray-600">(555) 123-4567</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">info@dockrental.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
