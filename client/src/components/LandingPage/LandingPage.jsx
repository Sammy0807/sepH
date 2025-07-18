import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Header/Header';
import SurveyBanner from '../SurveyBanner/SurveyBanner';
import Features from '../Features/Features';
import Footer from '../Footer/Footer';
import './LandingPage.css';

/**
 * LandingPage component that displays the main landing page with all sections
 * @returns {JSX.Element} The landing page component
 */
function LandingPage() {
  return (
    <div className="App">
      <Header />
      <SurveyBanner />
      <Features />
      <Footer />
    </div>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
LandingPage.propTypes = {};

export default LandingPage; 