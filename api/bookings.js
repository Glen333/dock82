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
    if (req.method === 'GET') {
      // Get all bookings from Supabase
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            slips(name),
            users(name, email)
          `)
          .order('booking_date', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch bookings' });
        }

        // Transform data to match frontend expectations
        const transformedBookings = bookings.map(booking => ({
          id: booking.id,
          slipId: booking.slip_id,
          userId: booking.user_id,
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          guestPhone: booking.guest_phone,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          boatLength: booking.boat_length,
          boatMakeModel: booking.boat_make_model,
          userType: booking.user_type,
          nights: booking.nights,
          totalCost: parseFloat(booking.total_cost),
          status: booking.status,
          bookingDate: booking.booking_date,
          paymentStatus: booking.payment_status,
          paymentMethod: booking.payment_method,
          paymentDate: booking.payment_date,
          rentalAgreementName: booking.rental_agreement_name,
          insuranceProofName: booking.insurance_proof_name,
          rentalProperty: booking.rental_property,
          rentalStartDate: booking.rental_start_date,
          rentalEndDate: booking.rental_end_date,
          slipName: booking.slips?.name,
          userName: booking.users?.name,
          userEmail: booking.users?.email
        }));

        res.status(200).json({ bookings: transformedBookings });
      } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'create-booking') {
        // Create new booking
        try {
          const bookingData = data.bookingData || data; // Handle both formats
          const newBooking = {
            slip_id: bookingData.slipId,
            user_id: bookingData.userId || null,
            guest_name: bookingData.guestName,
            guest_email: bookingData.guestEmail,
            guest_phone: bookingData.guestPhone,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            boat_length: bookingData.boatLength,
            boat_make_model: bookingData.boatMakeModel,
            user_type: bookingData.userType,
            nights: bookingData.nights,
            total_cost: bookingData.totalCost,
            status: bookingData.status || 'pending',
            payment_status: bookingData.paymentStatus || 'pending',
            payment_method: bookingData.paymentMethod || 'stripe',
            rental_agreement_name: bookingData.rentalAgreementName,
            insurance_proof_name: bookingData.insuranceProofName,
            rental_property: bookingData.rentalProperty,
            rental_start_date: bookingData.rentalStartDate,
            rental_end_date: bookingData.rentalEndDate
          };

          const { data: createdBooking, error } = await supabase
            .from('bookings')
            .insert(newBooking)
            .select()
            .single();

          if (error) {
            console.error('Create booking error:', error);
            return res.status(500).json({ 
              success: false,
              error: 'Failed to create booking: ' + error.message 
            });
          }

          res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: createdBooking
          });
        } catch (error) {
          console.error('Error creating booking:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else if (action === 'update-booking') {
        // Update booking
        try {
          const { bookingId, bookingData } = data;
          
          const { data: updatedBooking, error } = await supabase
            .from('bookings')
            .update(bookingData)
            .eq('id', bookingId)
            .select()
            .single();

          if (error) {
            console.error('Update booking error:', error);
            return res.status(400).json({ error: 'Failed to update booking' });
          }

          res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking: updatedBooking
          });
        } catch (error) {
          console.error('Error updating booking:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
