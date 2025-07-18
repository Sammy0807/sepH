import React from 'react';
import PropTypes from 'prop-types';
import './Features.css';

/**
 * Features data array containing information about SEP Health features
 */
const features = [
  {
    img: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    icon: 'fa-regular fa-bell',
    title: 'Daily Nudges',
    desc: 'Stay on track with gentle reminders tailored to your wellness journey. SEP Health learns your behavior and recommends actions to stay ahead.'
  },
  {
    img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    icon: 'fa-regular fa-clipboard',
    title: 'Symptom Logging',
    desc: 'Track how you feel, when it started, and how it changes over time — helping identify patterns before they become problems.'
  },
  {
    img: 'https://ohmyfacts.com/wp-content/uploads/2024/11/34-facts-about-wearable-technology-1730652151.jpeg',
    icon: 'fa-solid fa-heartbeat',
    title: 'Wearable Sync',
    desc: 'Connect to devices like Fitbit and Apple Watch to sync your health metrics automatically and receive insights.'
  },
  {
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    icon: 'fa-solid fa-user-doctor',
    title: 'Doctor Visit Memory',
    desc: 'Record key notes from your appointments and get smart reminders to follow through on your doctor\'s advice.'
  },
  {
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
    icon: 'fa-solid fa-robot',
    title: 'AI Triage (Coming Soon)',
    desc: 'Receive early warnings and smart health assessments based on your data and symptoms before visiting a clinic.'
  }
];

/**
 * Features component that displays a grid of SEP Health features
 * @returns {JSX.Element} The features component
 */
function Features() {
  return (
    <section className="features">
      {features.map((f, i) => (
        <div className="feature" key={i}>
          <img src={f.img} alt={f.title} />
          <h3><i className={f.icon}></i> {f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </section>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
Features.propTypes = {};

export default Features; 