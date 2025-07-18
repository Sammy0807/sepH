import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Footer.css';

/**
 * Footer component that displays the waitlist signup form and additional information
 * @returns {JSX.Element} The footer component
 */
function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  /**
   * Handles the form submission for the waitlist signup
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setMessageColor('red');
      setMessage('Please enter a valid email address.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setMessageColor('green');
        setMessage(data.message);
      } else {
        setMessageColor('orange');
        setMessage(data.message || 'You\'re already on the waitlist.');
      }
      setEmail('');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessageColor('red');
      setMessage('Network error. Try again later.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <footer>
      <h2>Be the first to know when SEP Health launches</h2>
      <p>We're working on something special. Sign up to get exclusive early access.</p>
      <div className="email-signup">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <input type="submit" value="Notify Me" />
        </form>
        <div id="message" style={{ color: messageColor, fontWeight: 'bold' }}>{message}</div>
      </div>
      <h3 style={{ marginTop: '2rem', color: 'white' }}>Want to help us shape SEP Health?</h3>
      <p>
        <a href="/wellness-check" target="_blank" rel="noopener noreferrer" style={{ color: '#26a69a', fontWeight: 'bold', textDecoration: 'underline' }}>
          Tell us about your health habits
        </a> so we can personalize SEP Health to better serve you.
      </p>
    </footer>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
Footer.propTypes = {};

export default Footer; 