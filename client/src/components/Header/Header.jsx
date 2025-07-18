import React from 'react';
import PropTypes from 'prop-types';
import './Header.css';

/**
 * Header component that displays the main hero section with title, description, and CTA button
 * @returns {JSX.Element} The header component
 */
function Header() {
  return (
    <header className="hero-header">
      <div className="hero-overlay">
        <h1>SEP Health</h1>
        <p>Your AI-powered companion for preventive wellness and smarter self-care.</p>
        <button className="cta-button" onClick={() => document.querySelector('footer').scrollIntoView({ behavior: 'smooth' })}>
          Join the Waitlist
        </button>
      </div>
    </header>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
Header.propTypes = {};

export default Header; 