import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './LoginPage.css';

/**
 * LoginPage component that handles user authentication (login/register)
 * @returns {JSX.Element} The login page component
 */
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [registerMode, setRegisterMode] = useState(false);

  /**
   * Handles form submission for both login and registration
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (registerMode) {
      // Registration
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          setMessage('Registration successful! You can now log in.');
          setRegisterMode(false);
        } else {
          setMessage(data.message || 'Registration failed.');
        }
      } catch {
        setMessage('Network error. Try again.');
      }
    } else {
      // Login
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          setMessage('Login successful!');
        } else {
          setMessage(data.message || 'Login failed.');
        }
      } catch {
        setMessage('Network error. Try again.');
      }
    }
  };

  return (
    <div className="wellness-wrapper">
      <div className="login-container">
        <h2 className="login-title">{registerMode ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <input type="submit" value={registerMode ? 'Register' : 'Login'} />
        </form>
        <button
          className="wellness-button secondary"
          style={{ marginTop: '1rem' }}
          onClick={() => { setRegisterMode(!registerMode); setMessage(''); }}
        >
          {registerMode ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
        {message && <div className="login-message">{message}</div>}
      </div>
    </div>
  );
}

// PropTypes for type checking (currently no props, but good practice for future extensibility)
LoginPage.propTypes = {};

export default LoginPage;