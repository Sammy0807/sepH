import React from 'react';
import PropTypes from 'prop-types';
import './SurveyBanner.css';

/**
 * SurveyBanner component that displays a banner encouraging users to take the wellness survey
 * @returns {JSX.Element} The survey banner component
 */
function SurveyBanner() {
  return (
    <div className="survey-banner">
      Help us shape SEP Health to fit your needs!
      <a href="/wellness-check" target="_blank" rel="noopener noreferrer">Take our 2-minute survey</a>
    </div>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
SurveyBanner.propTypes = {};

export default SurveyBanner; 