import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DockRentalPlatform from './DockRentalPlatform';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SG5p53j9XCjmWOGSpK1ex75CbbmwN01r6RbOZ2QKgoWZ7Q6K1gEu12OgUhgSb2ur6LoBJSOA7V2K9zS0WhbPwJk00l16UUppK'
);

// Simplified - just wrap with Elements, let PaymentPage handle its own Elements context
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <DockRentalPlatform />
    </Elements>
  </React.StrictMode>
);