import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DockRentalPlatform from './DockRentalPlatform';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Suppress WebSocket errors from React Hot Module Replacement (HMR)
// These are harmless development warnings and don't affect functionality
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('WebSocket connection to') ||
       args[0].includes('Failed to load resource: ws://'))
    ) {
      // Suppress WebSocket/HMR errors
      return;
    }
    originalError.apply(console, args);
  };
}

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