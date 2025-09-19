import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const { payment_intent_id } = await req.json();

    if (!payment_intent_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Payment intent ID is required' 
      }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Find the booking by payment intent ID
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
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Booking not found for this payment intent' 
      }), { 
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
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
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to confirm payment in database' 
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('Payment confirmed for booking:', updatedBooking.id);
    
    return new Response(JSON.stringify({ 
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
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});
