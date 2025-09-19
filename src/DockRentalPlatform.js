import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Anchor, Clock, DollarSign, User, Settings, Plus, Edit, Trash2, Check, X, Filter, Search, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PaymentPage from './PaymentPage';
import { supabase } from './supabase';

// Stripe configuration - Use React environment variables
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_51Rp9wh2zul6IUZC2Bi1RPfczb4RfYtTVcjp764dVLKx4XHoWbbegWCTTmJ9wPJ6DjNQzBxwbITzXeTcocCi9RNO500X6Z9yZER'
);

const DockRentalPlatform = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [currentView, setCurrentView] = useState('browse');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [bookings, setBookings] = useState([
    {
      id: 1001,
      slipId: 2,
      slipName: "Slip 2",
      guestName: "Captain Maria Rodriguez",
      guestEmail: "maria.rodriguez@email.com",
      guestPhone: "(305) 555-0123",
      checkIn: "2025-06-22",
      checkOut: "2025-06-24",
      boatLength: "24",
      boatMakeModel: "Boston Whaler Outrage 240",
      userType: "renter",
      nights: 2,
      totalCost: 120,
      status: "confirmed",
      bookingDate: "2025-06-20",
      rentalAgreementName: "Vacation_Rental_Agreement_2025.pdf",
      insuranceProofName: "Progressive_Marine_Insurance.pdf",
      paymentStatus: "scheduled",
      paymentDate: "2025-06-22",
      paymentMethod: "stripe",
      rentalProperty: "9580 Almirate Court LGI",
      rentalStartDate: "2025-06-20",
      rentalEndDate: "2025-06-30",
      cancellationDate: null,
      cancellationReason: null,
      refundAmount: null
    }
  ]);
  const [adminMode, setAdminMode] = useState(false);
  const [superAdminMode, setSuperAdminMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'admin',
    permissions: {
      manage_slips: true,
      manage_bookings: true,
      view_analytics: true,
      manage_users: false,
      manage_admins: false,
      system_settings: false
    }
  });
  const [showPermit, setShowPermit] = useState(null);
  const [showCancellationModal, setShowCancellationModal] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [editingSlip, setEditingSlip] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [showBookingManagement, setShowBookingManagement] = useState(false);
  const [showFinancialReport, setShowFinancialReport] = useState(false);
  const [adminView, setAdminView] = useState('overview'); // overview, bookings, financials, settings
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    phone: '',
    userType: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    userType: 'renter'
  });
  const [userBookings, setUserBookings] = useState([]);
  const [editingImage, setEditingImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [slipsLoading, setSlipsLoading] = useState(true);
  const [cancellationPolicy] = useState({
    homeowner: { fee: 0, description: "Free cancellation anytime" },
    renter: {
      "7+": { fee: 0, description: "Free cancellation 7+ days before check-in" },
      "3-6": { fee: 0.5, description: "50% refund 3-6 days before check-in" },
      "1-2": { fee: 0.75, description: "25% refund 1-2 days before check-in" },
      "0": { fee: 1, description: "No refund within 24 hours of check-in" }
    }
  });
  
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    boatLength: '',
    boatMakeModel: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    rentalAgreement: null,
    insuranceProof: null,
    boatPicture: null,
    paymentMethod: 'stripe',
    userType: 'renter',
    selectedOwner: '',
    rentalProperty: '',
    rentalStartDate: '',
    rentalEndDate: ''
  });

  // New simplified authentication states
  const [authStep, setAuthStep] = useState('email'); // 'email', 'password', 'register', 'verify-contact', 'forgot-password', 'reset-password'
  const [tempEmail, setTempEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [searchFilters, setSearchFilters] = useState({
    maxLength: '',
    priceRange: '',
    amenities: []
  });

  // Property owners data from the spreadsheet
  const propertyOwners = [
    { name: "Jaime Puerto & Carolina Sendon", address: "9486 Alborado Road LGI", parcel: "422022326010", email: "asalvador@sunshinewindows.com" },
    { name: "Don & Kathleen Eves", address: "9488 Aborado Road LGI", parcel: "422022328008", email: "" },
    { name: "Tillis & Sons, Inc.", address: "9490 Alborado Road LGI", parcel: "442022326011", email: "jtillis3@tampabay.rr.com" },
    { name: "David Groom", address: "9492 Alborado Road LGI", parcel: "422022328009", email: "groom2@comcast.net" },
    { name: "Michael & Ann Simon", address: "9494 Alborado Road LGI", parcel: "442022326012", email: "mjsimon412@gmail.com" },
    { name: "Paul & Barbara Holmes", address: "9496 Alborado Road LGI", parcel: "422022328010", email: "paulholmes@ewol.com" },
    { name: "Richard Novak", address: "9498 Alborado Road LGI", parcel: "442022376001", email: "rmnovak@uic.edu" },
    { name: "Randall & Stormy Jackson", address: "9502 Alborado Road LGI", parcel: "442022376002", email: "" },
    { name: "Bruce & Roxanne McVay", address: "9506 Don Jose Court LGI", parcel: "422022328020", email: "rnmcvay@aol.com" },
    { name: "Richard & Patricia Walldov", address: "9508 Don Jose Court LGI", parcel: "422022402005", email: "" },
    { name: "Alan Granburg and Melissa Thompson", address: "9510 Don Jose Court LGI", parcel: "422022328019", email: "mthompson03255@gmail.com" },
    { name: "Donald & Jacqueline Scattergood", address: "9512 Don Jose Court LGI", parcel: "422022329009", email: "dscattergood@gmail.com" },
    { name: "Linda Plumlee & P M Parrish", address: "9514 Don Jose Court LGI", parcel: "422022328018", email: "" },
    { name: "Jack Cleghorn", address: "9516 Don Jose Court LGI", parcel: "422022329008", email: "jtclecghorn@comcast.net" },
    { name: "Ron & Gena Moore", address: "9576 Almirate Court LGI", parcel: "422022402002", email: "moorecars@gmail.com" },
    { name: "Tom & Vivian McFarland", address: "9580 Almirate Court LGI", parcel: "422022402003", email: "tomandvivian@gmail.com" },
    { name: "Bronest & Judith York", address: "9582 Almirate Court LGI", parcel: "422022403009", email: "" },
    { name: "Glen & Heather Taylor", address: "9584 & 9586 Almirate Court LGI", parcel: "422022402004", email: "glen@centriclearning.net" },
    { name: "George & Jennifer Schaffer", address: "9585 Almirate Court LGI", parcel: "", email: "" },
    { name: "Dorothy T Cleghorn W.W. Coyner", address: "9650 Don Jose Court LGI", parcel: "422022403020", email: "jtclecghorn@comcast.net" },
    { name: "Little Gasparilla Water Utility, Inc.", address: "9652 Privateer Road LGI", parcel: "422022403018", email: "" },
    { name: "Eric & Mary Ellen Gonzales", address: "9654 Privateer Road LGI", parcel: "422022403021", email: "marygonzales058@gmail.com" },
    { name: "Chris & Heather Mariscal", address: "9656 Privateer Road LGI", parcel: "422022403022", email: "heathergmariscal@gmail.com" },
    { name: "Robert W. Brown & Rosemary B Eure", address: "9660 Privateer Road LGI", parcel: "422022406001", email: "rosemarye@lancasterlawyers.com" },
    { name: "James & Shelly Connell", address: "9662 Privateer Road LGI", parcel: "422022406002", email: "" },
    { name: "Barry and Kaye Hurt", address: "9666 Privateer Road LGI", parcel: "422022406004", email: "bhurt@tampabay.rr.com" },
    { name: "John & Cindy Tillis", address: "9668 Privateer Road LGI", parcel: "422022406005", email: "jtillis3@tampabay.rr.com" },
    { name: "Robert & Lilliam Hoerr", address: "9672 Privateer Road LGI", parcel: "422022406007", email: "bobhoerr@comcast.net" },
    { name: "George & Sue Paskert", address: "9674 Privateer Road LGI", parcel: "422022406008", email: "gpaskert@aol.com" },
    { name: "Roy & Claudia Tillett", address: "9678 Privateer Road LGI", parcel: "422022406010", email: "" },
    { name: "Donald & Mary Lee Kennefick", address: "9682 Privateer Road LGI", parcel: "422022406020", email: "kennefick6@comcast.net" },
    { name: "Don Reynolds", address: "9684 Privateer Road LGI", parcel: "422022330004", email: "apexmortgagrebrokers@gmail.com" },
    { name: "Faris and Penny Jahna", address: "9686 Privateer Road LGI", parcel: "422022330003", email: "faris1@hotmail.com" }
  ];

  // Slips data loaded from Supabase only
  const [slips, setSlips] = useState([]);


  // Helper function to validate dates
  const validateDates = (checkIn, checkOut) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate < today) {
      return { valid: false, message: 'Check-in date cannot be in the past.' };
    }
    
    if (checkOutDate <= checkInDate) {
      return { valid: false, message: 'Check-out date must be after check-in date.' };
    }
    
    // Calculate number of days
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Check 30-day limit for renters
    if (currentUser && currentUser.user_type === 'renter' && days > 30) {
      return { valid: false, message: 'Renters can only book up to 30 days at a time.' };
    }
    
    return { valid: true, days: days };
  };

  // Helper function to calculate booking total with discount
  const calculateBookingTotal = (checkIn, checkOut, price_per_night) => {
    if (!checkIn || !checkOut) return 0;
    
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const baseTotal = days * price_per_night;
    
    // Apply 40% discount for 30-day bookings by renters
    if (currentUser && currentUser.user_type === 'renter' && days === 30) {
      const discount = baseTotal * 0.4;
      return {
        baseTotal: baseTotal,
        discount: discount,
        finalTotal: baseTotal - discount,
        days: days,
        hasDiscount: true
      };
    }
    
    return {
      baseTotal: baseTotal,
      discount: 0,
      finalTotal: baseTotal,
      days: days,
      hasDiscount: false
    };
  };

  // Helper function to check slip availability for date range
  const isSlipAvailableForDates = (slipId, checkIn, checkOut) => {
    const conflictingBookings = bookings.filter(booking => 
      booking.slipId === slipId && 
      booking.status === 'confirmed' &&
      new Date(booking.checkIn) < new Date(checkOut) &&
      new Date(booking.checkOut) > new Date(checkIn)
    );
    return conflictingBookings.length === 0;
  };

  // Update slip availability based on bookings
  useEffect(() => {
    const updatedSlips = slips.map(slip => {
      const confirmedBookings = bookings.filter(booking => 
        booking.slipId === slip.id && 
        booking.status === 'confirmed'
      );
      
      // Check if slip has any current/future confirmed bookings
      const hasActiveBookings = confirmedBookings.some(booking => {
        const checkOutDate = new Date(booking.checkOut);
        const today = new Date();
        return checkOutDate >= today;
      });
      
      return {
        ...slip,
        available: !hasActiveBookings
      };
    });
    
    setSlips(updatedSlips);
  }, [bookings]);

  // AUTH STATE LISTENER
  // Initialize session restoration on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AUTH DEBUG - Error getting session:', error);
          return;
        }

        if (session?.user) {
          console.log('AUTH DEBUG - Restoring session for:', session.user.email);
          
          // Restore user profile from database
          const userProfile = await ensureUserProfile(session.user);
          setCurrentUser(userProfile);
          
          // Set admin mode if superadmin
          if (userProfile.user_type === 'superadmin') {
            setAdminMode(true);
            setSuperAdminMode(true);
          }
          
          // Load user's bookings
          const userBookings = bookings.filter(booking => 
            booking.guestEmail === userProfile.email
          );
          setUserBookings(userBookings);
          
          console.log('AUTH DEBUG - Session restored successfully');
        } else {
          console.log('AUTH DEBUG - No active session found');
        }
      } catch (error) {
        console.error('AUTH DEBUG - Error initializing auth:', error);
      } finally {
        // Always set loading to false after initialization
        setSessionLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AUTH DEBUG - Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await ensureUserProfile(session.user);
          setCurrentUser(userProfile);
          
          // Set admin mode if superadmin
          if (userProfile.user_type === 'superadmin') {
            setAdminMode(true);
            setSuperAdminMode(true);
          }
          
          // Load user's bookings
          const userBookings = bookings.filter(booking => 
            booking.guestEmail === userProfile.email
          );
          setUserBookings(userBookings);
        } else if (event === 'SIGNED_OUT') {
          // Clear user state on sign out
          setCurrentUser(null);
          setAdminMode(false);
          setSuperAdminMode(false);
          setUserBookings([]);
          setAuthStep('login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle cancellation
  const handleCancellation = (booking) => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation.');
      return;
    }

    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    
    let refundAmount = 0;
    let cancellationFee = 0;
    
    if (booking.userType === 'homeowner') {
      refundAmount = 0; // No money was charged
    } else {
      if (daysUntilCheckIn >= 7) {
        refundAmount = booking.totalCost;
      } else if (daysUntilCheckIn >= 3) {
        refundAmount = booking.totalCost * 0.5;
        cancellationFee = booking.totalCost * 0.5;
      } else if (daysUntilCheckIn >= 1) {
        refundAmount = booking.totalCost * 0.25;
        cancellationFee = booking.totalCost * 0.75;
      } else {
        refundAmount = 0;
        cancellationFee = booking.totalCost;
      }
    }

    const updatedBooking = {
      ...booking,
      status: 'cancelled',
      cancellationDate: new Date().toISOString().split('T')[0],
      cancellationReason: cancellationReason,
      refundAmount: refundAmount,
      paymentStatus: booking.userType === 'homeowner' ? 'exempt' : 
                     refundAmount === booking.totalCost ? 'refunded' : 
                     refundAmount > 0 ? 'partially_refunded' : 'non_refundable'
    };

    setBookings(bookings.map(b => b.id === booking.id ? updatedBooking : b));
    
    // Add notification
    setNotifications([...notifications, {
      id: Date.now(),
      type: 'cancellation',
      recipient: 'Admin',
      subject: `Booking Cancelled - ${booking.slipName}`,
      message: `${booking.guestName} has cancelled their booking for ${booking.checkIn} to ${booking.checkOut}. Reason: ${cancellationReason}. Refund: $${refundAmount.toFixed(2)}`,
      timestamp: new Date().toLocaleString()
    }]);

    setShowCancellationModal(null);
    setCancellationReason('');
    
    if (booking.userType === 'homeowner') {
      alert('Booking cancelled successfully. No charges were applied.');
    } else {
      alert(`Booking cancelled. Refund amount: $${refundAmount.toFixed(2)}${cancellationFee > 0 ? ` (Cancellation fee: $${cancellationFee.toFixed(2)})` : ''}`);
    }
  };

  const generatePermit = (booking) => {
    return {
      permitNumber: `NSP-${booking.id}-${new Date().getFullYear()}`,
      slipName: booking.slipName,
      guestName: booking.guestName,
      boatLength: booking.boatLength,
      boatMakeModel: booking.boatMakeModel,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      validUntil: booking.checkOut,
      issueDate: new Date().toLocaleDateString(),
    };
  };

  const handleEditDescription = (slip) => {
    setEditingSlip(slip);
    setEditingDescription(slip.description || '');
  };

  const handleSaveDescription = async () => {
    if (editingSlip) {
      try {
        // Save to database
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/slips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-slip',
            slipId: editingSlip.id,
            slipData: {
              name: editingSlip.name,
              description: editingDescription,
              price_per_night: editingSlip.price_per_night,
              images: editingSlip.images
            }
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state
            const updatedSlips = slips.map(slip => 
              slip.id === editingSlip.id 
                ? { ...slip, description: editingDescription }
                : slip
            );
            setSlips(updatedSlips);
            setEditingSlip(null);
            setEditingDescription('');
            alert('✅ Slip description updated successfully!');
          } else {
            alert('❌ Failed to update slip: ' + result.error);
          }
        } else {
          throw new Error('Failed to update slip');
        }
      } catch (error) {
        console.error('Error updating slip:', error);
        alert('❌ Failed to update slip. Please try again.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSlip(null);
    setEditingDescription('');
    setEditingImage('');
    setImageFile(null);
  };

  const handleEditPrice = (slip) => {
    setEditingSlip(slip);
    setEditingPrice(slip.price_per_night.toString());
  };

  const handleSavePrice = async () => {
    if (editingSlip && editingPrice) {
      try {
        // Save to database
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/slips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-slip',
            slipId: editingSlip.id,
            slipData: {
              name: editingSlip.name,
              description: editingSlip.description,
              price_per_night: parseFloat(editingPrice),
              images: editingSlip.images
            }
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state
            const updatedSlips = slips.map(slip => 
              slip.id === editingSlip.id 
                ? { ...slip, price_per_night: parseFloat(editingPrice) }
                : slip
            );
            setSlips(updatedSlips);
            setEditingSlip(null);
            setEditingPrice('');
            alert('✅ Slip price updated successfully!');
          } else {
            alert('❌ Failed to update slip: ' + result.error);
          }
        } else {
          throw new Error('Failed to update slip');
        }
      } catch (error) {
        console.error('Error updating slip:', error);
        alert('❌ Failed to update slip. Please try again.');
      }
    }
  };




  const handleApproveBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    const slip = slips.find(s => s.name === booking.slipName);
    
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
    );
    setBookings(updatedBookings);
    
    // Send dock etiquette email when booking is confirmed
    if (booking && slip) {
      await sendDockEtiquetteEmail(
        booking.guestEmail,
        booking.slipName,
        slip.dockEtiquette || "• Respect quiet hours (10 PM - 7 AM)\n• Keep slip area clean and organized\n• Follow all safety protocols\n• Notify management of any issues\n• No loud music or parties\n• Proper waste disposal required"
      );
    }
  };

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
    );
    setBookings(updatedBookings);
  };

  const calculateRevenue = () => {
    return bookings
      .filter(booking => booking.status === 'confirmed' && booking.userType === 'renter')
      .reduce((total, booking) => {
        const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
        const slip = slips.find(s => s.name === booking.slipName);
        return total + (nights * (slip?.price_per_night || 0));
      }, 0);
  };

  const getMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.checkIn);
        return booking.status === 'confirmed' && 
               booking.userType === 'renter' &&
               bookingDate.getMonth() === currentMonth &&
               bookingDate.getFullYear() === currentYear;
      })
      .reduce((total, booking) => {
        const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
        const slip = slips.find(s => s.name === booking.slipName);
        return total + (nights * (slip?.price_per_night || 0));
      }, 0);
  };

  // Payment processing functions
  const processPayment = async (bookingData, totalCost) => {
    setPaymentProcessing(true);
    setPaymentError(null);
    
    if (!stripe || !elements) {
      setPaymentError('Stripe Elements failed to load. Payment will not work.');
      setPaymentProcessing(false);
      return { success: false, error: 'Stripe not loaded' };
    }
    
    try {
      // Create payment intent on backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCost,
          currency: 'usd',
          bookingData: bookingData
        }),
      });
      
      const { clientSecret } = await response.json();
      
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData.guestName,
            email: bookingData.guestEmail,
          },
        },
      });
      
      if (error) {
        setPaymentError(error.message);
        return { success: false, error: error.message };
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const confirmResponse = await fetch(`${apiUrl}/api/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingData: bookingData,
            totalCost: totalCost
          }),
        });
        
        const confirmResult = await confirmResponse.json();
        
        if (confirmResult.success) {
          // Send email notifications
          await sendEmailNotification('paymentReceipt', bookingData.guestEmail, {
            guestName: bookingData.guestName,
            slipName: selectedSlip.name,
            paymentIntentId: paymentIntent.id,
            amount: totalCost,
            paymentMethod: 'stripe'
          });
          
          await sendEmailNotification('bookingConfirmation', bookingData.guestEmail, {
            guestName: bookingData.guestName,
            slipName: selectedSlip.name,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            boatMakeModel: bookingData.boatMakeModel,
            boatLength: bookingData.boatLength,
            totalAmount: totalCost
          });
        }
        
        return { success: true, paymentIntentId: paymentIntent.id };
      }
      
      return { success: false, error: 'Payment failed' };
      
    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Payment method is now fixed to Stripe
  const handlePaymentMethodChange = (method) => {
    // No longer needed - only Stripe is supported
    console.log('Payment method change requested:', method);
    // Could be used for future payment method support if needed
  };

  const handlePaymentComplete = async (paymentResult) => {
    try {
      // Get current user data for the booking
      const { data: userData } = await supabase.auth.getUser();
      
      // Calculate totals
      const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
      const baseTotal = nights * selectedSlip.price_per_night;
      const discount = nights === 30 ? baseTotal * 0.4 : 0; // 40% discount for 30-day bookings
      const finalTotal = baseTotal - discount;

      // Insert booking directly into database
      const { data: newBookingData, error: insertErr } = await supabase.from('bookings').insert({
        slip_id: selectedSlip.id,
        renter_auth_id: userData?.user?.id || null,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        user_type: bookingData.userType,            // 'renter' or 'homeowner'
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        boat_length: bookingData.boatLength,
        boat_make_model: bookingData.boatMakeModel,
        base_total: baseTotal,
        discount: discount,
        total_cost: finalTotal,
        status: 'confirmed',
        payment_status: 'paid',
        payment_date: new Date().toISOString().slice(0,10),
        payment_method: 'stripe',
        payment_intent_id: paymentResult.paymentIntentId,
        rental_property: bookingData.rentalProperty || null,
        rental_start_date: bookingData.rentalStartDate || null,
        rental_end_date: bookingData.rentalEndDate || null,
      }).select().single();

      if (insertErr) {
        console.error('Database insert error:', insertErr);
        alert('Saved payment, but failed to record booking. We will fix this manually.');
        return;
      }

      // Update local bookings state with confirmed booking
      const newBooking = {
        id: newBookingData.id,
        slipId: selectedSlip.id,
        slipName: selectedSlip.name,
        ...bookingData,
        nights,
        totalCost: finalTotal,
        status: 'confirmed',
        bookingDate: new Date().toISOString().split('T')[0],
        rentalAgreementName: bookingData.rentalAgreement?.name,
        insuranceProofName: bookingData.insuranceProof?.name,
        paymentStatus: 'paid',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'stripe',
        paymentIntentId: paymentResult.paymentIntentId,
        selectedOwner: bookingData.selectedOwner || null
      };

      setBookings([...bookings, newBooking]);
      setShowPaymentPage(false);
      setCurrentView('browse');
      
      // Send confirmation emails
      await sendEmailNotification('paymentReceipt', bookingData.guestEmail, {
        guestName: bookingData.guestName,
        slipName: selectedSlip.name,
        paymentIntentId: paymentResult.paymentIntentId,
        amount: finalTotal,
        paymentMethod: 'stripe'
      });
      
      await sendEmailNotification('bookingConfirmation', bookingData.guestEmail, {
        guestName: bookingData.guestName,
        slipName: selectedSlip.name,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        boatMakeModel: bookingData.boatMakeModel,
        boatLength: bookingData.boatLength,
        totalAmount: finalTotal
      });

      alert('Payment successful! Your booking has been confirmed. You will receive a confirmation email shortly.');
    } catch (error) {
      console.error('Payment completion error:', error);
      alert('Payment processed but there was an error completing the booking. Please contact support.');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedSlip || !bookingData.checkIn || !bookingData.checkOut || 
        !bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone ||
        !bookingData.boatLength || !bookingData.boatMakeModel) {
      alert('Please fill in all required fields.');
      return;
    }

    // Date validation
    const dateValidation = validateDates(bookingData.checkIn, bookingData.checkOut);
    if (!dateValidation.valid) {
      alert(dateValidation.message);
      return;
    }

    // Check if slip is still available for the selected dates
    if (!isSlipAvailableForDates(selectedSlip.id, bookingData.checkIn, bookingData.checkOut)) {
      alert('This slip is no longer available for the selected dates. Please choose different dates or another slip.');
      return;
    }

    // Homeowners must agree to terms
    if (bookingData.userType === 'homeowner' && !bookingData.agreedToTerms) {
      alert('Please read and agree to the dock etiquette guidelines before proceeding.');
      return;
    }

    // Only renters need to upload rental agreement and provide rental details
    if (bookingData.userType === 'renter' && (!bookingData.rentalAgreement || !bookingData.insuranceProof || !bookingData.rentalProperty || !bookingData.rentalStartDate || !bookingData.rentalEndDate)) {
      alert('Please fill in all rental property details and upload both your rental agreement and boat insurance proof.');
      return;
    }

    // Validate renter dock booking timing - can only book within 7 days prior to rental arrival
    if (bookingData.userType === 'renter') {
      const rentalStartDate = new Date(bookingData.rentalStartDate);
      const dockCheckInDate = new Date(bookingData.checkIn);
      const sevenDaysPrior = new Date(rentalStartDate);
      sevenDaysPrior.setDate(sevenDaysPrior.getDate() - 7);

      if (dockCheckInDate < sevenDaysPrior) {
        alert(`Dock slips can only be reserved within 7 days prior to your rental arrival date (${bookingData.rentalStartDate}). Earliest dock check-in allowed: ${sevenDaysPrior.toISOString().split('T')[0]}`);
        return;
      }

      if (dockCheckInDate < rentalStartDate && new Date(bookingData.checkOut) > new Date(bookingData.rentalEndDate)) {
        alert('Your dock reservation cannot extend beyond your home rental period.');
        return;
      }
    }

    if (parseInt(bookingData.boatLength) > selectedSlip.max_length) {
      alert(`Boat length cannot exceed ${selectedSlip.max_length} feet for this dock slip.`);
      return;
    }

    const totalInfo = calculateBookingTotal(bookingData.checkIn, bookingData.checkOut, selectedSlip.price_per_night);
    const totalCost = bookingData.userType === 'homeowner' ? 0 : totalInfo.finalTotal;

    // For renters, show payment page instead of processing payment directly
    if (bookingData.userType === 'renter') {
      setShowPaymentPage(true);
      return;
    }

    const newBooking = {
      slipId: selectedSlip.id,
      slipName: selectedSlip.name,
      ...bookingData,
      nights: totalInfo.days,
      totalCost,
      baseTotal: totalInfo.baseTotal,
      discount: totalInfo.discount,
      hasDiscount: totalInfo.hasDiscount,
      status: bookingData.userType === 'homeowner' ? 'confirmed' : 'pending',
      bookingDate: new Date().toISOString().split('T')[0],
      rentalAgreementName: bookingData.rentalAgreement?.name,
      insuranceProofName: bookingData.insuranceProof?.name,
      paymentStatus: bookingData.userType === 'homeowner' ? 'exempt' : 'scheduled',
      paymentDate: bookingData.checkIn,
      selectedOwner: bookingData.selectedOwner || null
    };

    try {
      // Create booking with backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBooking),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          // Add the booking to local state
          setBookings([...bookings, result.booking]);
        } else {
          alert(result.error || 'Booking creation failed');
          return;
        }
      } else {
        throw new Error('Booking creation failed');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('❌ Booking submission failed. Please try again or contact support.');
      return;
    }
    
    // Send dock etiquette email for confirmed bookings (homeowners)
    if (bookingData.userType === 'homeowner') {
      await sendDockEtiquetteEmail(
        bookingData.guestEmail,
        selectedSlip.name,
        selectedSlip.dockEtiquette || "Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We're all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon't tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don't leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number."
      );
    }
    
    // Add notification for admin about potential bumping situations
    if (bookingData.userType === 'homeowner') {
      const conflictingBookings = bookings.filter(b => 
        b.slipId === selectedSlip.id && 
        b.userType === 'renter' &&
        b.status === 'confirmed' &&
        ((new Date(b.checkIn) <= new Date(bookingData.checkOut)) && 
         (new Date(b.checkOut) >= new Date(bookingData.checkIn)))
      );
      
      if (conflictingBookings.length > 0) {
        setNotifications([...notifications, {
          id: Date.now(),
          type: 'admin',
          recipient: 'Admin',
          subject: 'Homeowner Priority Booking - Renter May Need to be Bumped',
          message: `Homeowner ${bookingData.guestName} has booked ${selectedSlip.name} which conflicts with ${conflictingBookings.length} renter booking(s). Review and reassign renters if needed.`,
          timestamp: new Date().toLocaleString()
        }]);
      }
    }
    
    setSelectedSlip(null);
    setBookingData({
      checkIn: '', checkOut: '', boatLength: '', boatMakeModel: '', 
      guestName: '', guestEmail: '', guestPhone: '', rentalAgreement: null, 
      insuranceProof: null, paymentMethod: 'stripe', userType: 'renter', 
      selectedOwner: '', rentalProperty: '', rentalStartDate: '', rentalEndDate: '',
      agreedToTerms: false
    });
    setCurrentView('bookings');
    
    // Show appropriate success message based on user type and payment status
    if (bookingData.userType === 'homeowner') {
      alert('Homeowner booking confirmed! No payment required. Your dock permit will be emailed for self check-in.');
    } else {
      // For renters, check if payment was processed
      if (paymentSuccessful) {
        alert(`Payment successful! Amount: $${totalCost.toFixed(2)}. Your dock permit will be emailed for self check-in.`);
      } else {
        alert('Booking request submitted! Payment will be processed on check-in date. Your dock permit will be emailed for self check-in.');
      }
    }
  };

  const filteredSlips = slips.filter(slip => {
    if (searchFilters.maxLength && parseInt(searchFilters.maxLength) > slip.max_length) return false;
    if (searchFilters.priceRange) {
      const [min, max] = searchFilters.priceRange.split('-').map(Number);
      if (slip.price_per_night < min || slip.price_per_night > max) return false;
    }
    return true;
  });

  const SlipCard = ({ slip }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {slip.image_url && (
        <img 
          src={`${slip.image_url}?t=${Date.now()}`} 
          alt={slip.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{slip.name}</h3>
          <span className={`px-2 py-1 rounded text-sm ${slip.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {slip.available ? 'Available' : 'Occupied'}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Anchor className="w-4 h-4 mr-2" />
            Max Length: {slip.max_length}ft | Width: {slip.width}ft | Depth: {slip.depth}ft
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="w-4 h-4 mr-2" />
            ${slip.price_per_night}/night
          </div>
        </div>
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {slip.amenities.map((amenity, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
          </div>
        </div>
        {slip.available && (
          <button
            onClick={() => {
              setSelectedSlip(slip);
              setCurrentView('booking');
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Book This Slip
          </button>
        )}
      </div>
    </div>
  );

  // User authentication functions
  // FIXED DOCK82 AUTHENTICATION FLOW
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    console.log('AUTH DEBUG - handleEmailSubmit called with email:', tempEmail);
    
    if (!tempEmail) {
      alert('Please enter your email address.');
      return;
    }

    // SIMPLIFIED: Just proceed to password step
    // Let Supabase Auth handle user existence checking
    console.log('AUTH DEBUG - Proceeding directly to password step');
    setAuthStep('password');
    setLoginData({ ...loginData, email: tempEmail });
  };

  // FIXED PASSWORD LOGIN LOGIC
  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log('AUTH DEBUG - handleLogin called');
    console.log('AUTH DEBUG - Email:', loginData.email);
    
    if (!loginData.email || !loginData.password) {
      alert('Please enter both email and password.');
      return;
    }

    // QUICK ADMIN LOGIN FOR GLEN (temporary)
    if (loginData.email === 'Glen@centriclearning.net' && loginData.password === 'Dock82Admin2024!') {
      console.log('AUTH DEBUG - Quick admin login successful');
      
      const userProfile = {
        id: 'admin-1',
        name: 'Glen Taylor',
        email: 'Glen@centriclearning.net',
        user_type: 'superadmin',
        phone: '555-0123',
        permissions: {
          manage_users: true,
          manage_admins: true,
          manage_slips: true,
          manage_bookings: true,
          view_analytics: true,
          system_settings: true
        }
      };
      
      setCurrentUser(userProfile);
      setShowLoginModal(false);
      setLoginData({ email: '', password: '' });
      setAdminMode(true);
      setSuperAdminMode(true);
      setAuthStep('login');
      
      alert('Welcome, Superadmin! You have full access to the system.');
      return;
    }

    try {
      console.log('AUTH DEBUG - Attempting Supabase Auth login');
      
      // Use Supabase Auth directly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      console.log('AUTH DEBUG - Supabase auth response:', authData);
      
      if (authError) {
        console.error('AUTH DEBUG - Supabase auth error:', authError);
        
        // Handle specific auth errors
        if (authError.message.includes('Invalid login credentials')) {
          alert('Invalid email or password. Please try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          console.log('AUTH DEBUG - Email not confirmed');
          alert('📧 Email verification required!\n\nPlease check your email and click the verification link to activate your account.\n\nIf you didn\'t receive the email, check your spam folder or contact support.');
          
          // Show resend verification option
          setAuthStep('resend-verification');
          return;
        } else {
          alert(`Login failed: ${authError.message}`);
        }
        return;
      }

      if (authData.user) {
        console.log('AUTH DEBUG - Login successful, user:', authData.user);
        
        // Now get or create the user profile in your users table
        const userProfile = await ensureUserProfile(authData.user);
        
        // Set user state
        setCurrentUser(userProfile);
        setShowLoginModal(false);
        setLoginData({ email: '', password: '' });
        
        // Set admin mode if superadmin
        if (userProfile.user_type === 'superadmin') {
          setAdminMode(true);
          setSuperAdminMode(true);
        }
        
        setAuthStep('login');
        
        // Load user's bookings
        const userBookings = bookings.filter(booking => 
          booking.guestEmail === userProfile.email
        );
        setUserBookings(userBookings);
        
        alert(`Welcome, ${userProfile.name}! You have ${userProfile.user_type} access.`);
      }
      
    } catch (error) {
      console.error('AUTH DEBUG - Unexpected error during login:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // ENSURE USER PROFILE EXISTS IN USERS TABLE
  const ensureUserProfile = async (authUser) => {
    console.log('AUTH DEBUG - Ensuring user profile exists for:', authUser.email);
    
    try {
      // First, try to get existing profile by email
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (existingProfile) {
        console.log('AUTH DEBUG - User profile found:', existingProfile);
        return existingProfile;
      }

      // If user doesn't exist in users table, create them
      console.log('AUTH DEBUG - Creating new user profile');
      
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          password_hash: 'auth_managed', // Supabase Auth manages the password
          user_type: authUser.user_metadata?.userType || (authUser.email === 'Glen@centriclearning.net' ? 'superadmin' : 'renter'),
          phone: authUser.user_metadata?.phone || '',
          property_address: authUser.user_metadata?.propertyAddress || '',
          emergency_contact: authUser.user_metadata?.emergencyContact || '',
          permissions: authUser.email === 'Glen@centriclearning.net' 
            ? {
                manage_users: true,
                manage_admins: true,
                manage_slips: true,
                manage_bookings: true,
                view_analytics: true,
                system_settings: true
              }
            : {},
          email_verified: authUser.email_confirmed_at !== null
        })
        .select()
        .single();

      if (createError) {
        console.error('AUTH DEBUG - Error creating user profile:', createError);
        throw createError;
      }

      console.log('AUTH DEBUG - New user profile created:', newProfile);
      return newProfile;
      
    } catch (error) {
      console.error('AUTH DEBUG - Error in ensureUserProfile:', error);
      throw error;
    }
  };

  // Resend email verification
  const handleResendVerification = async () => {
    console.log('AUTH DEBUG - Resending verification email');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: loginData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('AUTH DEBUG - Resend error:', error);
        alert(`Failed to resend verification email: ${error.message}`);
      } else {
        alert('📧 Verification email sent!\n\nPlease check your email and click the verification link.\n\nIf you don\'t see it, check your spam folder.');
        setAuthStep('password');
      }
    } catch (error) {
      console.error('AUTH DEBUG - Unexpected error resending verification:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  // FIXED REGISTRATION FOR ALL USERS
  const handleRegister = async (e) => {
    e.preventDefault();
    
    console.log('AUTH DEBUG - handleRegister called');
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    // Proceed to contact verification step
    setAuthStep('verify-contact');
  };

  // Final registration after contact verification
  const handleFinalRegistration = async () => {
    console.log('AUTH DEBUG - handleFinalRegistration called');
    
    try {
      console.log('AUTH DEBUG - Attempting Supabase Auth signup');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            phone: registerData.phone,
            userType: registerData.userType,
            propertyAddress: registerData.propertyAddress,
            emergencyContact: registerData.emergencyContact
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('AUTH DEBUG - Signup error:', authError);
        
        if (authError.message.includes('already registered')) {
          alert('This email is already registered. Please try logging in instead.');
          setAuthStep('password');
          setLoginData({ ...loginData, email: registerData.email });
        } else {
          alert(`Registration failed: ${authError.message}`);
        }
        return;
      }

      console.log('AUTH DEBUG - Signup successful:', authData);
      
      if (authData.user && !authData.user.email_confirmed_at) {
        // Email verification required
        setShowLoginModal(false);
        setRegisterData({ 
          name: '', 
          email: '', 
          password: '', 
          confirmPassword: '',
          phone: '',
          userType: 'renter',
          propertyAddress: '',
          emergencyContact: ''
        });
        setAuthStep('email');
        
        alert('✅ Registration successful!\n\n📧 Please check your email and click the verification link to activate your account.\n\nOnce verified, you can log in with your email and password.');
      } else if (authData.user && authData.user.email_confirmed_at) {
        // Email already confirmed (rare case)
        const userProfile = await ensureUserProfile(authData.user);
        setCurrentUser(userProfile);
        setShowLoginModal(false);
        setRegisterData({ 
          name: '', 
          email: '', 
          password: '', 
          confirmPassword: '',
          phone: '',
          userType: 'renter',
          propertyAddress: '',
          emergencyContact: ''
        });
        setAuthStep('login');
        
        alert('Welcome to Dock82! 🚢\n\nYour account has been created and you are now logged in.');
        setCurrentView('browse');
      } else {
        alert('Registration successful! Please check your email to confirm your account.');
        setAuthStep('email');
      }
      
    } catch (error) {
      console.error('AUTH DEBUG - Unexpected error during registration:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase (this will trigger the auth state change listener)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AUTH DEBUG - Error signing out:', error);
        alert('Error signing out. Please try again.');
        return;
      }
      
      // Clear local state (this will also be handled by the auth state change listener)
      setCurrentUser(null);
      setAdminMode(false);
      setSuperAdminMode(false);
      setUserBookings([]);
      setCurrentView('browse');
      setAuthStep('login');
      setTempEmail('');
      setLoginData({ email: '', password: '' });
      setRegisterData({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        phone: '',
        userType: 'renter'
      });
      setShowProfileModal(false);
      
      console.log('AUTH DEBUG - Logout successful');
    } catch (error) {
      console.error('AUTH DEBUG - Unexpected error during logout:', error);
      alert('An unexpected error occurred during logout.');
    }
  };

  // Handle opening profile edit modal
  const handleEditProfile = () => {
    if (currentUser) {
      setEditingProfile({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        userType: currentUser.user_type || 'renter',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setShowProfileModal(true);
    }
  };

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      // Check if user wants to change password
      const isChangingPassword = editingProfile.currentPassword || editingProfile.newPassword || editingProfile.confirmNewPassword;
      
      if (isChangingPassword) {
        // Validate password change fields
        if (!editingProfile.currentPassword) {
          alert('Please enter your current password to change it.');
          return;
        }
        if (!editingProfile.newPassword) {
          alert('Please enter a new password.');
          return;
        }
        if (editingProfile.newPassword.length < 6) {
          alert('New password must be at least 6 characters long.');
          return;
        }
        if (editingProfile.newPassword !== editingProfile.confirmNewPassword) {
          alert('New password and confirmation do not match.');
          return;
        }

        // Update password using Supabase Auth
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editingProfile.newPassword
        });

        if (passwordError) {
          console.error('Password update error:', passwordError);
          alert(`Failed to update password: ${passwordError.message}`);
          return;
        }
      }

      // Update user profile data in database
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          name: editingProfile.name,
          phone: editingProfile.phone,
          user_type: editingProfile.userType,
          updated_at: new Date().toISOString()
        })
        .eq('email', currentUser.email)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update error:', updateError);
        alert(`Failed to update profile: ${updateError.message}`);
        return;
      }

      // Update current user state
      setCurrentUser({
        ...currentUser,
        name: editingProfile.name,
        phone: editingProfile.phone,
        user_type: editingProfile.userType
      });
      
      setShowProfileModal(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin?action=users`);
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAllAdmins = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin?action=admins`);
      if (response.ok) {
        const data = await response.json();
        setAllAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-admin',
          ...newAdminData
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Admin created successfully!');
          setNewAdminData({
            name: '',
            email: '',
            password: '',
            phone: '',
            userType: 'admin',
            permissions: {
              manage_slips: true,
              manage_bookings: true,
              view_analytics: true,
              manage_users: false,
              manage_admins: false,
              system_settings: false
            }
          });
          loadAllAdmins();
        } else {
          alert(result.error || 'Failed to create admin');
        }
      } else {
        throw new Error('Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('❌ Failed to create admin. Please try again.');
    }
  };

  const promotePropertyOwnerToAdmin = async (propertyOwner) => {
    if (!propertyOwner.email) {
      alert('Cannot promote property owner without email address.');
      return;
    }
    
    const confirmPromotion = window.confirm(
      `Promote "${propertyOwner.name}" to admin?\n\n` +
      `Email: ${propertyOwner.email}\n` +
      `Default Password: admin\n\n` +
      `This will create an admin account with basic permissions.`
    );
    
    if (!confirmPromotion) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-admin',
          name: propertyOwner.name,
          email: propertyOwner.email,
          password: 'admin',
          phone: '',
          userType: 'admin',
          permissions: {
            manage_slips: true,
            manage_bookings: true,
            view_analytics: true,
            manage_users: false,
            manage_admins: false,
            system_settings: false
          }
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`✅ "${propertyOwner.name}" promoted to admin successfully!\n\n` +
                `Login Credentials:\n` +
                `Email: ${propertyOwner.email}\n` +
                `Password: admin\n\n` +
                `They can now login and manage dock slips and bookings.`);
          loadAllAdmins();
        } else {
          alert(result.error || 'Failed to promote property owner to admin');
        }
      } else {
        throw new Error('Failed to promote property owner to admin');
      }
    } catch (error) {
      console.error('Error promoting property owner to admin:', error);
      alert('❌ Failed to promote property owner to admin. Please try again.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!tempEmail) {
      alert('Please enter your email address.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgot-password',
          email: tempEmail
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`Password reset token generated!\n\nFor testing purposes, your reset token is: ${result.resetToken}\n\nIn production, this would be sent to your email.`);
          setResetToken(result.resetToken);
          setAuthStep('reset-password');
        } else {
          alert(result.error || 'Failed to generate reset token');
        }
      } else {
        throw new Error('Failed to generate reset token');
      }
    } catch (error) {
      console.error('Error generating reset token:', error);
      alert('❌ Failed to generate reset token. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetToken || !newPassword || !confirmNewPassword) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset-password',
          resetToken: resetToken,
          newPassword: newPassword
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ Password reset successfully! You can now login with your new password.');
          setAuthStep('login');
          setResetToken('');
          setNewPassword('');
          setConfirmNewPassword('');
          setTempEmail('');
        } else {
          alert(result.error || 'Failed to reset password');
        }
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('❌ Failed to reset password. Please try again.');
    }
  };



  const resetAuthFlow = () => {
    setAuthStep('email');
    setTempEmail('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      phone: '',
      userType: 'renter'
    });
  };

  const sendEmailNotification = async (type, email, data) => {
    try {
      const fnUrl = `${supabase.functions.url}/send-notification`;
      
      const response = await fetch(fnUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
        body: JSON.stringify({ type, email, data }),
      });
      
      if (response.ok) {
        console.log('Email notification sent successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to send email notification:', errorData);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const sendDockEtiquetteEmail = async (email, slipName, dockEtiquette) => {
    try {
      const fnUrl = `${supabase.functions.url}/send-notification`;
      
      const response = await fetch(fnUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
        },
        body: JSON.stringify({
          type: 'dockEtiquette',
          email,
          data: {
            slipName,
            dockEtiquette
          }
        }),
      });
      
      if (response.ok) {
        console.log('Dock etiquette email sent successfully');
      } else {
        console.error('Failed to send dock etiquette email');
      }
    } catch (error) {
      console.error('Error sending dock etiquette email:', error);
    }
  };

  const handleBoatPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookingData(prev => ({
        ...prev,
        boatPicture: file
      }));
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setBookingData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleEditEtiquette = (slip) => {
    setEditingSlip({...slip, editingType: 'etiquette'});
    setEditingEtiquette(slip.dockEtiquette || '');
  };

  const handleSaveEtiquette = async () => {
    if (editingSlip && editingEtiquette) {
      try {
        // Save to database
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/slips`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-slip',
            slipId: editingSlip.id,
            slipData: {
              name: editingSlip.name,
              description: editingSlip.description,
              price_per_night: editingSlip.price_per_night,
              dock_etiquette: editingEtiquette,
              images: editingSlip.images
            }
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state
            const updatedSlips = slips.map(slip => 
              slip.id === editingSlip.id 
                ? { ...slip, dockEtiquette: editingEtiquette }
                : slip
            );
            setSlips(updatedSlips);
            setEditingSlip(null);
            setEditingEtiquette('');
            alert('✅ Dock etiquette updated successfully!');
          } else {
            alert('❌ Failed to update dock etiquette: ' + result.error);
          }
        } else {
          throw new Error('Failed to update dock etiquette');
        }
      } catch (error) {
        console.error('Error updating dock etiquette:', error);
        alert('❌ Failed to update dock etiquette. Please try again.');
      }
    }
  };

  // Function to toggle slip availability
  const handleToggleSlipAvailability = async (slip) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/slips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-slip',
          slipId: slip.id,
          slipData: {
            name: slip.name,
            description: slip.description,
            price_per_night: slip.price_per_night,
            dock_etiquette: slip.dockEtiquette,
            images: slip.images,
            available: !slip.available
          }
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          const updatedSlips = slips.map(s => 
            s.id === slip.id 
              ? { ...s, available: !s.available }
              : s
          );
          setSlips(updatedSlips);
          alert(`✅ ${slip.name} ${!slip.available ? 'activated' : 'deactivated'} successfully!`);
        } else {
          alert('❌ Failed to update slip availability: ' + result.error);
        }
      } else {
        throw new Error('Failed to update slip availability');
      }
    } catch (error) {
      console.error('Error updating slip availability:', error);
      alert('❌ Failed to update slip availability. Please try again.');
    }
  };

  // Function to add new slips to database
  const handleAddNewSlips = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/add-new-slips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload slips from database
          const slipsResponse = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/slips`);
          if (slipsResponse.ok) {
            const slipsData = await slipsResponse.json();
            setSlips(slipsData.slips || []);
          }
          alert(`✅ ${result.message}`);
        } else {
          alert('❌ Failed to add new slips: ' + result.error);
        }
      } else {
        throw new Error('Failed to add new slips');
      }
    } catch (error) {
      console.error('Error adding new slips:', error);
      alert('❌ Failed to add new slips. Please try again.');
    }
  };

  const handleShowEtiquetteModal = () => {
    setShowEtiquetteModal(true);
  };

  const handleEditUser = (userEmail) => {
    const userBookings = bookings.filter(b => b.guestEmail === userEmail);
    const latestBooking = userBookings[userBookings.length - 1];
    setEditingUser({
      email: userEmail,
      name: latestBooking.guestName,
      phone: latestBooking.guestPhone || '',
      userType: latestBooking.userType
    });
    setShowUserEditModal(true);
  };

  const handleSaveUser = async () => {
    if (editingUser) {
      try {
        // Save to database
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-user',
            userId: editingUser.id,
            userData: {
              name: editingUser.name,
              phone: editingUser.phone,
              userType: editingUser.userType
            }
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state
            const updatedBookings = bookings.map(booking => {
              if (booking.guestEmail === editingUser.email) {
                return {
                  ...booking,
                  guestName: editingUser.name,
                  guestPhone: editingUser.phone,
                  userType: editingUser.userType
                };
              }
              return booking;
            });
            setBookings(updatedBookings);
            setEditingUser(null);
            setShowUserEditModal(false);
            alert('✅ User updated successfully!');
          } else {
            alert('❌ Failed to update user: ' + result.error);
          }
        } else {
          throw new Error('Failed to update user');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        alert('❌ Failed to update user. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete all their bookings.')) {
      try {
        // Delete from database
        const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'delete-user',
            userEmail: userEmail
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state
            const updatedBookings = bookings.filter(booking => booking.guestEmail !== userEmail);
            setBookings(updatedBookings);
            alert('✅ User deleted successfully!');
          } else {
            alert('❌ Failed to delete user: ' + result.error);
          }
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('❌ Failed to delete user. Please try again.');
      }
    }
  };

  // Property Owner Edit Functions
  const handleEditPropertyOwnerInfo = (booking) => {
    setEditingBooking({
      ...booking,
      editingType: 'propertyOwnerInfo'
    });
    setEditingPropertyOwnerInfo({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      boatMakeModel: booking.boatMakeModel,
      boatLength: booking.boatLength
    });
  };

  const handleSavePropertyOwnerInfo = () => {
    if (editingBooking && editingPropertyOwnerInfo) {
      const updatedBookings = bookings.map(booking => 
        booking.id === editingBooking.id 
          ? { 
              ...booking, 
              guestName: editingPropertyOwnerInfo.guestName,
              guestEmail: editingPropertyOwnerInfo.guestEmail,
              guestPhone: editingPropertyOwnerInfo.guestPhone,
              boatMakeModel: editingPropertyOwnerInfo.boatMakeModel,
              boatLength: editingPropertyOwnerInfo.boatLength
            }
          : booking
      );
      setBookings(updatedBookings);
      setEditingBooking(null);
      setEditingPropertyOwnerInfo(null);
    }
  };

  const handleEditPropertyOwnerDates = (booking) => {
    setEditingBooking({
      ...booking,
      editingType: 'propertyOwnerDates'
    });
    setEditingPropertyOwnerDates({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    });
  };

  const handleSavePropertyOwnerDates = () => {
    if (editingBooking && editingPropertyOwnerDates) {
      const updatedBookings = bookings.map(booking => 
        booking.id === editingBooking.id 
          ? { 
              ...booking, 
              checkIn: editingPropertyOwnerDates.checkIn,
              checkOut: editingPropertyOwnerDates.checkOut
            }
          : booking
      );
      setBookings(updatedBookings);
      setEditingBooking(null);
      setEditingPropertyOwnerDates(null);
    }
  };

  // First Login Onboarding Functions
  const handleFirstLogin = (user) => {
    // Simple welcome for returning users - no onboarding
    const existingBookings = bookings.filter(booking => booking.guestEmail === user.email);
    
    if (existingBookings.length === 0) {
      alert('Welcome back to Dock82! 🚢\n\nReady to book your next dock slip?');
    } else {
      alert(`Welcome back, ${user.name}! 🚢\n\nYou have ${existingBookings.length} booking(s) in your account.`);
    }
  };



  const [editingEtiquette, setEditingEtiquette] = useState('');
  const [showEtiquetteModal, setShowEtiquetteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editingPropertyOwnerInfo, setEditingPropertyOwnerInfo] = useState(null);
  const [editingPropertyOwnerDates, setEditingPropertyOwnerDates] = useState(null);

  // Load data from API on component mount
  useEffect(() => {
    // Clear old localStorage to prevent conflicts
    localStorage.removeItem('dockSlipsData');
    localStorage.removeItem('dockSlipImages');
    
    const loadData = async () => {
      try {
        setSlipsLoading(true);
        
        // Load slips from Supabase
        const { data: slipsData, error: slipsError } = await supabase
          .from('slips')
          .select('*')
          .order('id');

        if (slipsError) {
          console.error('Error loading slips from Supabase:', slipsError);
        } else {
          setSlips(slipsData || []);
        }

        // Load bookings from Supabase
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error('Error loading bookings from Supabase:', bookingsError);
        } else {
          setBookings(bookingsData || []);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setSlipsLoading(false);
      }
    };
    loadData();
  }, []);




  // Show loading screen while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Show loading screen while loading slips data
  if (slipsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dock slips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 text-blue-600 mr-3 text-2xl">🌊🐢</div>
              <h1 className="text-2xl font-bold text-gray-900">Jose's Hideaway Dock Association - DOCK 82</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentView('browse')}
                className={`px-3 py-2 rounded-md ${currentView === 'browse' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Browse Slips
              </button>
              {currentUser && (
                <button
                  onClick={() => setCurrentView('bookings')}
                  className={`px-3 py-2 rounded-md ${currentView === 'bookings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  My Bookings
                </button>
              )}
              <button
                onClick={() => setCurrentView('notifications')}
                className={`px-3 py-2 rounded-md ${currentView === 'notifications' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
              >
                📧 Notifications {notifications.length > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs ml-1">
                    {notifications.length}
                  </span>
                )}
              </button>
              {adminMode && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 py-2 rounded-md ${currentView === 'admin' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Admin Panel
                </button>
              )}
              
              {/* User Authentication */}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">Welcome, {currentUser.name}</span>
                  <button
                    onClick={handleEditProfile}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    <User className="w-4 h-4 inline mr-1" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      resetAuthFlow();
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showPaymentPage ? (
          <PaymentPage
            bookingData={bookingData}
            selectedSlip={selectedSlip}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setShowPaymentPage(false)}
          />
        ) : currentView === 'browse' && (
          <>
            {/* Search and Filters */}
            <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Select an Available Slip</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Self Check-In:</strong> Once your booking is confirmed, you'll receive a dock permit via email. 
                  Simply print it and display on your boat dashboard upon arrival.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Where Your Payment Goes:</strong> All dock proceeds support annual maintenance and month-to-month operational costs 
                  of Jose's Hideaway Dock Association - DOCK 82. Homeowners enjoy complimentary access as part of their dock association benefits.
                </p>
              </div>
            </div>

            {/* Slips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlips.map(slip => (
                <SlipCard key={slip.id} slip={slip} />
              ))}
            </div>
          </>
        )}

        {currentView === 'booking' && selectedSlip && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Book {selectedSlip.name}</h2>
              <button
                onClick={() => {
                  setCurrentView('browse');
                  setSelectedSlip(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Select User Type</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="renter"
                      checked={bookingData.userType === 'renter'}
                      onChange={(e) => setBookingData({...bookingData, userType: e.target.value})}
                      className="mr-2"
                    />
                    <span>Renter (Pay per night)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="homeowner"
                      checked={bookingData.userType === 'homeowner'}
                      onChange={(e) => setBookingData({...bookingData, userType: e.target.value})}
                      className="mr-2"
                    />
                    <span>Homeowner (Free access)</span>
                  </label>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {currentUser && currentUser.user_type === 'renter' && (
                    <p className="text-sm text-blue-600 mt-1">
                      ⏰ Renters can book up to 30 days. Book exactly 30 days for a 40% discount!
                    </p>
                  )}
                </div>
              </div>

              {/* Boat Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boat Length (ft)</label>
                  <input
                    type="number"
                    value={bookingData.boatLength}
                    onChange={(e) => setBookingData({...bookingData, boatLength: e.target.value})}
                    min="1"
                    max={selectedSlip.maxLength}
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {bookingData.boatLength && parseInt(bookingData.boatLength) > selectedSlip.maxLength && (
                    <p className="text-red-600 text-sm mt-1">Boat length exceeds maximum allowed ({selectedSlip.maxLength}ft)</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boat Make & Model</label>
                  <input
                    type="text"
                    value={bookingData.boatMakeModel}
                    onChange={(e) => setBookingData({...bookingData, boatMakeModel: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Boat Picture Upload */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  📸 Boat Picture (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a picture of your boat to help with identification and marina management. This is optional but recommended.
                </p>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBoatPictureChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {bookingData.boatPicture && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">✓ Boat picture uploaded: {bookingData.boatPicture.name}</p>
                      <img 
                        src={URL.createObjectURL(bookingData.boatPicture)} 
                        alt="Boat preview"
                        className="w-full max-w-xs h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={bookingData.guestName}
                    onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={bookingData.guestEmail}
                    onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Payment Section for Renters */}
              {(() => { console.log('Rendering payment section'); return true; })() && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </h3>
                  
                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-gray-700">Credit Card (Stripe)</span>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Slip Rate:</span>
                        <span>${selectedSlip.price_per_night}/night</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nights:</span>
                        <span>{bookingData.checkIn && bookingData.checkOut ? 
                          Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)) : 0}
                        </span>
                      </div>
                      {(() => {
                        const totalInfo = calculateBookingTotal(bookingData.checkIn, bookingData.checkOut, selectedSlip.price_per_night);
                        return (
                          <>
                            {totalInfo.hasDiscount && (
                              <>
                                <div className="flex justify-between text-green-600">
                                  <span>Base Total:</span>
                                  <span>${totalInfo.baseTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                  <span>30-Day Discount (40%):</span>
                                  <span>-${totalInfo.discount.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                            <div className="border-t pt-1 font-medium">
                              <div className="flex justify-between">
                                <span>Total:</span>
                                <span className={totalInfo.hasDiscount ? 'text-green-600' : ''}>
                                  ${totalInfo.finalTotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Credit Card Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Card Details</label>
                    <div className="border border-gray-300 rounded-md p-3 bg-white">
                      {!stripe || !elements ? (
                        <div className="text-red-600 text-sm">
                          Stripe Elements failed to load. Payment will not work.
                        </div>
                      ) : (
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                  color: '#aab7c4',
                                },
                              },
                              invalid: {
                                color: '#9e2146',
                              },
                            },
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              )}

              {/* Rental Property Information for Renters */}
              {bookingData.userType === 'renter' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Rental Property Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Property Address</label>
                      <select
                        value={bookingData.rentalProperty}
                        onChange={(e) => setBookingData({...bookingData, rentalProperty: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select rental property</option>
                        {propertyOwners.map((owner, index) => (
                          <option key={index} value={owner.address}>{owner.address}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Owner</label>
                      <select
                        value={bookingData.selectedOwner}
                        onChange={(e) => setBookingData({...bookingData, selectedOwner: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select property owner</option>
                        {propertyOwners.map((owner, index) => (
                          <option key={index} value={owner.name}>{owner.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Start Date</label>
                      <input
                        type="date"
                        value={bookingData.rentalStartDate}
                        onChange={(e) => setBookingData({...bookingData, rentalStartDate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental End Date</label>
                      <input
                        type="date"
                        value={bookingData.rentalEndDate}
                        onChange={(e) => setBookingData({...bookingData, rentalEndDate: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Document Upload Section */}
              {bookingData.userType === 'renter' && (
                <div className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">🚨 REQUIRED DOCUMENTS</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">📋 Rental Agreement</label>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setBookingData({...bookingData, rentalAgreement: e.target.files[0]})} className="w-full border-2 border-blue-500 rounded-md px-3 py-3 bg-blue-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">🛡️ Boat Insurance Proof</label>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setBookingData({...bookingData, insuranceProof: e.target.files[0]})} className="w-full border-2 border-blue-500 rounded-md px-3 py-3 bg-blue-50" />
                    </div>
                  </div>
                </div>
              )}
              {/* Dock Etiquette Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center">
                  📋 Dock Etiquette Rules
                </h3>
                <div className="text-sm text-gray-700 mb-3">
                  <p>Please review the dock etiquette rules for {selectedSlip.name}:</p>
                  <div className="bg-white p-3 rounded border mt-2 whitespace-pre-line text-gray-800">
                    {selectedSlip.dockEtiquette || 
                      "• Respect quiet hours (10 PM - 7 AM)\n• Keep slip area clean and organized\n• Follow all safety protocols\n• Notify management of any issues\n• No loud music or parties\n• Proper waste disposal required"
                    }
                  </div>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bookingData.agreedToTerms}
                    onChange={(e) => setBookingData({...bookingData, agreedToTerms: e.target.checked})}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm">I have read and agree to the dock etiquette rules</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('browse');
                    setSelectedSlip(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {bookingData.userType === 'renter' ? 'Pay & Book Slip' : 'Confirm Booking'}
                    </>
                  )}
                </button>
              </div>

              {/* Payment Error Display */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{paymentError}</p>
                </div>
              )}
            </form>
          </div>
        )}
        {currentView === 'bookings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            
            {currentUser ? (
              userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.slipName}</h3>
                          <p className="text-gray-600">{booking.checkIn} - {booking.checkOut}</p>
                          <p className="text-sm text-gray-500">Boat: {booking.boatMakeModel} ({booking.boatLength}ft)</p>
                          <p className="text-sm text-gray-500">Type: {booking.userType === 'homeowner' ? 'Property Owner' : 'Renter'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                setShowPermit(true);
                                setSelectedBooking(booking);
                              }}
                              className="block mt-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View Permit
                            </button>
                          )}
                          
                          {/* Property Owner Edit Buttons */}
                          {booking.userType === 'homeowner' && (
                            <div className="mt-2 space-y-1">
                              <button
                                onClick={() => handleEditPropertyOwnerInfo(booking)}
                                className="block text-green-600 hover:text-green-700 text-xs"
                              >
                                Edit Info
                              </button>
                              <button
                                onClick={() => handleEditPropertyOwnerDates(booking)}
                                className="block text-purple-600 hover:text-purple-700 text-xs"
                              >
                                Edit Dates
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Property Owner Edit Forms */}
                      {editingBooking?.id === booking.id && editingBooking.editingType === 'propertyOwnerInfo' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Edit Property Owner Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editingPropertyOwnerInfo?.guestName || ''}
                                onChange={(e) => setEditingPropertyOwnerInfo({...editingPropertyOwnerInfo, guestName: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editingPropertyOwnerInfo?.guestEmail || ''}
                                onChange={(e) => setEditingPropertyOwnerInfo({...editingPropertyOwnerInfo, guestEmail: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="tel"
                                value={editingPropertyOwnerInfo?.guestPhone || ''}
                                onChange={(e) => setEditingPropertyOwnerInfo({...editingPropertyOwnerInfo, guestPhone: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Boat Make & Model</label>
                              <input
                                type="text"
                                value={editingPropertyOwnerInfo?.boatMakeModel || ''}
                                onChange={(e) => setEditingPropertyOwnerInfo({...editingPropertyOwnerInfo, boatMakeModel: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Boat Length (ft)</label>
                              <input
                                type="number"
                                value={editingPropertyOwnerInfo?.boatLength || ''}
                                onChange={(e) => setEditingPropertyOwnerInfo({...editingPropertyOwnerInfo, boatLength: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={handleSavePropertyOwnerInfo}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingBooking(null);
                                setEditingPropertyOwnerInfo(null);
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {editingBooking?.id === booking.id && editingBooking.editingType === 'propertyOwnerDates' && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-3">Edit Property Owner Dates</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                              <input
                                type="date"
                                value={editingPropertyOwnerDates?.checkIn || ''}
                                onChange={(e) => setEditingPropertyOwnerDates({...editingPropertyOwnerDates, checkIn: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                              <input
                                type="date"
                                value={editingPropertyOwnerDates?.checkOut || ''}
                                onChange={(e) => setEditingPropertyOwnerDates({...editingPropertyOwnerDates, checkOut: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={handleSavePropertyOwnerDates}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => {
                                setEditingBooking(null);
                                setEditingPropertyOwnerDates(null);
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bookings found. Start by browsing available slips!</p>
                  <button
                    onClick={() => setCurrentView('browse')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Browse Slips
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Please login to view your bookings.</p>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        )}
        {currentView === 'notifications' && <div>Notifications Coming Soon...</div>}
        {currentView === 'admin' && adminMode && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            
            {/* Admin Navigation */}
            <div className="flex space-x-4 mb-6 border-b">
              <button
                onClick={() => setAdminView('overview')}
                className={`px-4 py-2 font-medium ${adminView === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setAdminView('bookings')}
                className={`px-4 py-2 font-medium ${adminView === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bookings
              </button>
              <button
                onClick={() => setAdminView('financials')}
                className={`px-4 py-2 font-medium ${adminView === 'financials' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Financials
              </button>
              <button
                onClick={() => setAdminView('settings')}
                className={`px-4 py-2 font-medium ${adminView === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Settings
              </button>
              <button
                onClick={() => setAdminView('users')}
                className={`px-4 py-2 font-medium ${adminView === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Users
              </button>

            </div>

            {/* Overview Tab */}
            {adminView === 'overview' && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Total Slips</h4>
                    <p className="text-2xl font-bold text-blue-600">{slips.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Available</h4>
                    <p className="text-2xl font-bold text-green-600">{slips.filter(s => s.available).length}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800">Occupied</h4>
                    <p className="text-2xl font-bold text-red-600">{slips.filter(s => !s.available).length}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Total Revenue</h4>
                    <p className="text-2xl font-bold text-purple-600">${calculateRevenue().toFixed(2)}</p>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Slip</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Guest</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Dates</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map(booking => (
                          <tr key={booking.id} className="border-t">
                            <td className="px-4 py-2 text-sm">{booking.slipName}</td>
                            <td className="px-4 py-2 text-sm">{booking.guestName}</td>
                            <td className="px-4 py-2 text-sm">{booking.checkIn} - {booking.checkOut}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                booking.userType === 'homeowner' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {booking.userType}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Bookings Management Tab */}
            {adminView === 'bookings' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Slip</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Guest</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Boat</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Contact</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Dates</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id} className="border-t">
                          <td className="px-4 py-2 text-sm">#{booking.id}</td>
                          <td className="px-4 py-2 text-sm">{booking.slipName}</td>
                          <td className="px-4 py-2 text-sm">{booking.guestName}</td>
                          <td className="px-4 py-2 text-sm">
                            <div className="text-xs">
                              <div>{booking.boatMakeModel}</div>
                              <div>{booking.boatLength}ft</div>
                              {booking.boatPicture && (
                                <div className="mt-1">
                                  <span className="text-green-600">📸 Picture uploaded</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div className="text-xs">
                              <div>{booking.guestEmail}</div>
                              <div>{booking.guestPhone}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm">{booking.checkIn} - {booking.checkOut}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {booking.status === 'pending' && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleApproveBooking(booking.id)}
                                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financials Tab */}
            {adminView === 'financials' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Reports</h3>
                
                {/* Revenue Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">Total Revenue</h4>
                    <p className="text-2xl font-bold text-green-600">${calculateRevenue().toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">This Month</h4>
                    <p className="text-2xl font-bold text-blue-600">${getMonthlyRevenue().toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Total Bookings</h4>
                    <p className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'confirmed' && b.userType === 'renter').length}</p>
                  </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Revenue by Slip</h4>
                  <div className="space-y-2">
                    {slips.map(slip => {
                      const slipBookings = bookings.filter(b => 
                        b.slipName === slip.name && 
                        b.status === 'confirmed' && 
                        b.userType === 'renter'
                      );
                      const slipRevenue = slipBookings.reduce((total, booking) => {
                        const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
                        return total + (nights * slip.price_per_night);
                      }, 0);
                      
                      return (
                        <div key={slip.id} className="flex justify-between items-center py-2 border-b">
                          <span className="font-medium">{slip.name}</span>
                          <span className="text-green-600">${slipRevenue.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {adminView === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Slip Management</h3>
                
                {/* New Slips Management */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Add New Slips</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Add Slips 13 and 14 to the database. These slips will be initially deactivated and can be activated from the admin panel.
                  </p>
                  <button
                    onClick={handleAddNewSlips}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Slips 13 & 14 to Database
                  </button>
                </div>

                {/* Slip Availability Management */}
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Slip Availability Control</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Activate or deactivate slips. Deactivated slips will not appear in the booking interface.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slips.filter(slip => slip.name.includes('Slip 13') || slip.name.includes('Slip 14')).map(slip => (
                      <div key={slip.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{slip.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${slip.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {slip.available ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleSlipAvailability(slip)}
                          className={`w-full px-3 py-1 rounded text-sm font-medium transition-colors ${
                            slip.available 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {slip.available ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Slip Descriptions and Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slips.map(slip => (
                    <div key={slip.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{slip.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${slip.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {slip.available ? 'Available' : 'Occupied'}
                        </span>
                      </div>
                      
                      {/* Description Editing */}
                      {editingSlip?.id === slip.id && editingSlip.editingType === 'description' ? (
                        <div className="space-y-2 mb-3">
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            placeholder="Enter slip description..."
                            className="w-full p-2 border rounded text-sm"
                            rows="3"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveDescription}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">
                            {slip.description || 'No description set'}
                          </p>
                          <button
                            onClick={() => {
                              setEditingSlip({...slip, editingType: 'description'});
                              setEditingDescription(slip.description || '');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit Description
                          </button>
                        </div>
                      )}

                      {/* Price Editing */}
                      {editingSlip?.id === slip.id && editingSlip.editingType === 'price' ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">$</span>
                            <input
                              type="number"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              className="w-20 p-1 border rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={handleSavePrice}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Current Price: <span className="font-medium">${slip.price_per_night}/night</span>
                          </p>
                          <button
                            onClick={() => {
                              setEditingSlip({...slip, editingType: 'price'});
                              setEditingPrice(slip.price_per_night.toString());
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            Edit Price
                          </button>
                        </div>
                      )}

                      {/* Image Display */}
                      {slip.images && (
                        <div className="mt-3">
                          <div className="mb-2">
                            <img 
                              src={`${slip.images}?t=${Date.now()}`} 
                              alt={slip.name}
                              className="w-full h-24 object-cover rounded border"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bulk Image Management */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Bulk Image Management</h3>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">Quick Image Actions</h4>
                    <p className="text-sm text-yellow-700">
                      Use these buttons to quickly update all dock slip images at once. 
                      Individual slip images can still be edited above.
                    </p>
                  </div>

                </div>

                {/* Dock Etiquette Management */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Dock Etiquette Management</h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">About Dock Etiquette</h4>
                    <p className="text-sm text-blue-700">
                      Set and manage dock etiquette rules for each slip. These rules help ensure proper marina behavior 
                      and create a respectful environment for all users. Users will see these rules during booking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slips.map(slip => (
                      <div key={slip.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">{slip.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${slip.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {slip.available ? 'Available' : 'Occupied'}
                          </span>
                        </div>
                        
                        {/* Etiquette Editing */}
                        {editingSlip?.id === slip.id && editingSlip.editingType === 'etiquette' ? (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Dock Etiquette Rules</label>
                            <textarea
                              value={editingEtiquette}
                              onChange={(e) => setEditingEtiquette(e.target.value)}
                              placeholder="Enter dock etiquette rules..."
                              className="w-full p-2 border rounded text-sm"
                              rows="6"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEtiquette}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save Rules
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Current Rules:</h5>
                              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
                                {slip.dockEtiquette || 'No etiquette rules set for this slip.'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditEtiquette(slip)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                            >
                              Edit Etiquette
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Etiquette Templates */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Quick Etiquette Templates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-sm mb-2">Standard Rules</h5>
                        <button
                          onClick={() => {
                            const standardRules = "• Respect quiet hours (10 PM - 7 AM)\n• Keep slip area clean and organized\n• Follow all safety protocols\n• Notify management of any issues\n• No loud music or parties\n• Proper waste disposal required";
                            setEditingEtiquette(standardRules);
                          }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Use Standard Rules
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <h5 className="font-medium text-sm mb-2">Family-Friendly Rules</h5>
                        <button
                          onClick={() => {
                            const familyRules = "• Family-friendly environment\n• Respect quiet hours (9 PM - 8 AM)\n• Supervise children at all times\n• Keep slip area clean and organized\n• Follow all safety protocols\n• No pets without permission\n• Proper waste disposal required";
                            setEditingEtiquette(familyRules);
                          }}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                        >
                          Use Family Rules
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {adminView === 'users' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">User Management</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">User Information</h4>
                  <p className="text-sm text-blue-700">
                    View and manage all registered users including property owners and renters. 
                    Contact information and booking history are available for each user.
                  </p>
                </div>

                {/* Property Owners Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    🏠 Property Owners ({propertyOwners.length})
                    {superAdminMode && (
                      <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        👑 Superadmin Access
                      </span>
                    )}
                  </h4>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {propertyOwners.map((owner, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {owner.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {owner.address}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {owner.parcel || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {owner.email ? (
                                  <a href={`mailto:${owner.email}`} className="text-blue-600 hover:text-blue-800">
                                    {owner.email}
                                  </a>
                                ) : (
                                  'No email'
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active Owner
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {superAdminMode && owner.email ? (
                                  <button
                                    onClick={() => promotePropertyOwnerToAdmin(owner)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    title="Promote to Admin (Superadmin Only)"
                                  >
                                    👑 Make Admin
                                  </button>
                                ) : owner.email ? (
                                  <span className="text-gray-400 text-xs">Contact superadmin</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No email</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Registered Users Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    👥 Registered Users ({Array.from(new Set(bookings.map(b => b.guestEmail))).length})
                  </h4>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.from(new Set(bookings.map(b => b.guestEmail))).map(email => {
                            const userBookings = bookings.filter(b => b.guestEmail === email);
                            const latestBooking = userBookings[userBookings.length - 1];
                            const userType = latestBooking.userType;
                            const totalBookings = userBookings.length;
                            const confirmedBookings = userBookings.filter(b => b.status === 'confirmed').length;
                            
                            return (
                              <tr key={email} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {latestBooking.guestName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <a href={`mailto:${email}`} className="text-blue-600 hover:text-blue-800">
                                    {email}
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {latestBooking.guestPhone || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    userType === 'homeowner' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {userType === 'homeowner' ? 'Homeowner' : 'Renter'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {totalBookings} total ({confirmedBookings} confirmed)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    confirmedBookings > 0 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {confirmedBookings > 0 ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditUser(email)}
                                      className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(email)}
                                      className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🏠</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Owners</p>
                        <p className="text-lg font-semibold text-gray-900">{propertyOwners.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">👥</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Registered Users</p>
                        <p className="text-lg font-semibold text-gray-900">{Array.from(new Set(bookings.map(b => b.guestEmail))).length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📋</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <p className="text-lg font-semibold text-gray-900">{bookings.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Confirmed Bookings</p>
                        <p className="text-lg font-semibold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simplified Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {authStep === 'email' ? 'Enter Email' : 
                 authStep === 'password' ? 'Welcome Back' : 
                 authStep === 'register' ? 'Create Account' : 
                 authStep === 'verify-contact' ? 'Review Information' : 
                 'Enter Email'}
              </h2>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  resetAuthFlow();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Step 1: Email Entry */}
            {authStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Enter your email to continue</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    autoComplete="username"
                    name="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Continue
                </button>
              </form>
            )}
            
            {/* Step 2: Password Login */}
            {authStep === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Welcome back, {loginData.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginData({ email: '', password: '' });
                      setTempEmail('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Use different email
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    name="password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Sign In
                </button>
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempEmail(loginData.email);
                      setAuthStep('forgot-password');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 block"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterData({ ...registerData, email: loginData.email });
                        setAuthStep('register');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up here
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Forgot Password Step */}
            {authStep === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Reset your password</p>
                  <button
                    type="button"
                    onClick={() => {
                      setTempEmail('');
                      setAuthStep('login');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Back to login
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    autoComplete="username"
                    name="email"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            {/* Reset Password Step */}
            {authStep === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Enter your new password</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('forgot-password');
                      setResetToken('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Back to forgot password
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the reset token from your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Reset Password
                </button>
              </form>
            )}

            {/* Resend Verification Step */}
            {authStep === 'resend-verification' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Email verification required</p>
                  <p className="text-sm text-gray-500 mt-2">
                    We sent a verification link to <strong>{loginData.email}</strong>
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    📧 Please check your email and click the verification link to activate your account.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    If you don't see the email, check your spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Resend Verification Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep('password');
                    setLoginData({ email: '', password: '' });
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-medium"
                >
                  Back to Login
                </button>
              </div>
            )}
            
            {/* Step 3: Registration */}
            {authStep === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">Create your account</p>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterData({ ...registerData, email: '' });
                      setTempEmail('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Use different email
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                    autoComplete="name"
                    name="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => {
                      console.log('Email input changed:', e.target.value);
                      setRegisterData({...registerData, email: e.target.value});
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="username"
                    name="email"
                    required
                    placeholder="Enter your email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current value: {registerData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={registerData.userType}
                    onChange={(e) => setRegisterData({...registerData, userType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="renter">Renter</option>
                    <option value="homeowner">Homeowner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    name="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    name="confirm-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Continue to Review
                </button>
              </form>
            )}

            {/* Step 4: Contact Info Verification */}
            {authStep === 'verify-contact' && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
                  <p className="text-gray-600">Please verify your contact details before creating your account</p>
                </div>
                
                {/* Contact Info Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Full Name:</span>
                    <span className="text-sm text-gray-900">{registerData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{registerData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <span className="text-sm text-gray-900">{registerData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">User Type:</span>
                    <span className="text-sm text-gray-900 capitalize">{registerData.userType}</span>
                  </div>
                </div>

                {/* Additional Contact Fields for Homeowners */}
                {registerData.userType === 'homeowner' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                      <input
                        type="text"
                        value={registerData.propertyAddress || ''}
                        onChange={(e) => setRegisterData({...registerData, propertyAddress: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your dock slip address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={registerData.emergencyContact || ''}
                        onChange={(e) => setRegisterData({...registerData, emergencyContact: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Emergency contact name and phone"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setAuthStep('register')}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 font-medium"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalRegistration}
                    className="flex-1 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-medium"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {authStep === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setRegisterData({ ...registerData, email: tempEmail });
                        setAuthStep('register');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign up here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthStep('login')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </p>
              

            </div>
          </div>
        </div>
      )}



      {/* User Edit Modal */}
      {showUserEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => {
                    setShowUserEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                  <select
                    value={editingUser.userType}
                    onChange={(e) => setEditingUser({...editingUser, userType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="renter">Renter</option>
                    <option value="homeowner">Homeowner</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingProfile.phone}
                  onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={editingProfile.userType}
                  onChange={(e) => setEditingProfile({...editingProfile, userType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="renter">Renter</option>
                  <option value="homeowner">Homeowner</option>
                </select>
              </div>

              {/* Password Change Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">Leave blank to keep current password</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={editingProfile.currentPassword}
                      onChange={(e) => setEditingProfile({...editingProfile, currentPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={editingProfile.newPassword}
                      onChange={(e) => setEditingProfile({...editingProfile, newPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={editingProfile.confirmNewPassword}
                      onChange={(e) => setEditingProfile({...editingProfile, confirmNewPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Wrapper component to provide Stripe Elements context
const DockRentalPlatformWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <DockRentalPlatform />
    </Elements>
  );
};

export default DockRentalPlatformWrapper;// Force deployment Thu Sep 18 15:33:21 EDT 2025
// Force new deployment 1758224165
// Deployment fix Fri Sep 19 17:48:08 EDT 2025
