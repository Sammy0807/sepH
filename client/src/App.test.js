import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import WellnessCheck from './components/WellnessCheck/WellnessCheck';
import LoginPage from './components/LoginPage/LoginPage';

// Mock fetch for waitlist form test
global.fetch = jest.fn();

describe('Landing Page', () => {
  test('renders header and hero', () => {
    render(<LandingPage />);
    expect(screen.getByText('SEP Health')).toBeInTheDocument();
    expect(screen.getByText(/AI-powered companion/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join the waitlist/i })).toBeInTheDocument();
  });

  test('renders all features', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Daily Nudges/i)).toBeInTheDocument();
    expect(screen.getByText(/Symptom Logging/i)).toBeInTheDocument();
    expect(screen.getByText(/Wearable Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor Visit Memory/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Triage/i)).toBeInTheDocument();
  });

  test('renders waitlist form and submits', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, message: 'You have been added to the waitlist!' })
    });

    render(<LandingPage />);
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const submitBtn = screen.getByRole('button', { name: /notify me/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText(/added to the waitlist/i)).toBeInTheDocument();
    });
  });
});

describe('Wellness Check', () => {
  test('renders first question and navigates through', () => {
    render(
      <MemoryRouter>
        <WellnessCheck />
      </MemoryRouter>
    );
    expect(screen.getByText(/SEP Health 1-Minute Wellness Check/i)).toBeInTheDocument();
    expect(screen.getByText(/how often do you feel unusually tired/i)).toBeInTheDocument();
  });

  test('shows summary after finishing', () => {
    render(
      <MemoryRouter>
        <WellnessCheck />
      </MemoryRouter>
    );
    expect(screen.getByText(/Question 1 of 7/i)).toBeInTheDocument();
  });
});

describe('Login Page', () => {
  test('renders login form and validates', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });
});
