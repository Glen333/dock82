import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { 
  httpClient: Stripe.createFetchHttpClient() 
});

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
    const { amount, currency = 'usd', booking } = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Validate required booking data
    if (!booking?.slip_id || !booking?.guest_email) {
      return new Response(JSON.stringify({ error: 'Missing required booking data' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        slip_id: String(booking.slip_id),
        slip_name: String(booking.slip_name || ''),
        guest_email: booking.guest_email,
        guest_name: booking.guest_name || '',
        guest_phone: booking.guest_phone || '',
        check_in: booking.check_in || '',
        check_out: booking.check_out || '',
        boat_length: String(booking.boat_length || ''),
        boat_make_model: booking.boat_make_model || '',
        user_type: booking.user_type || '',
        nights: String(booking.nights || ''),
        rental_property: booking.rental_property || '',
        rental_start_date: booking.rental_start_date || '',
        rental_end_date: booking.rental_end_date || ''
      },
    });

    return new Response(JSON.stringify({ 
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id 
    }), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*'
      },
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create payment intent',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
});
