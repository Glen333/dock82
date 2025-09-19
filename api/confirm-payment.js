import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { payment_intent_id } = req.body;

      if (!payment_intent_id) {
        return res.status(400).json({ 
          success: false,
          error: 'Payment intent ID is required' 
        });
      }

      // Find the booking by payment intent ID and update it
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          slips(name)
        `)
        .eq('payment_intent_id', payment_intent_id)
        .single();

      if (fetchError || !booking) {
        console.error('Booking not found for payment intent:', payment_intent_id, fetchError);
        return res.status(404).json({ 
          success: false,
          error: 'Booking not found for this payment intent' 
        });
      }

      // Update the booking with payment confirmation
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        })
        .eq('payment_intent_id', payment_intent_id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update booking:', updateError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to confirm payment in database' 
        });
      }

      console.log('Payment confirmed for booking:', updatedBooking.id);
      
      res.status(200).json({ 
        success: true, 
        message: 'Payment confirmed successfully',
        booking: {
          id: updatedBooking.id,
          slipName: updatedBooking.slips?.name,
          guestName: updatedBooking.guest_name,
          guestEmail: updatedBooking.guest_email,
          checkIn: updatedBooking.check_in,
          checkOut: updatedBooking.check_out,
          totalCost: updatedBooking.total_cost,
          status: updatedBooking.status,
          paymentStatus: updatedBooking.payment_status,
          paymentDate: updatedBooking.payment_date
        }
      });
    } else {
      res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    });
  }
}
