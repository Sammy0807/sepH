'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '../style.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Thanks! You have been added to the waitlist.');
        setEmail('');
      } else {
        setMessage(result.message || 'Something went wrong.');
      }
    } catch {
      setMessage('Network error. Try again later.');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const scrollToSignup = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header 
        className="hero-header" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')" }}
      >
        <div className="hero-overlay">
          <h1><i className="fa-solid fa-heart-pulse"></i> SEP Health</h1>
          <p>Your AI-powered companion for preventive wellness and smarter self-care.</p>
          <button className="cta-button" onClick={scrollToSignup}>
            Sign up to get early access
          </button>
        </div>
      </header>

      <div className="survey-banner">
        Discover personalized wellness insights tailored just for you
        <Link href="/wellness-check">Take our 2-minute wellness assessment</Link>
      </div>

      <section className="features">
        <div className="feature">
          <Image src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80" alt="Daily Nudges" width={600} height={400} />
          <h3><i className="fa-regular fa-bell"></i> Daily Nudges</h3>
          <p>Stay on track with gentle reminders tailored to your wellness journey. SEP Health learns your behavior and recommends actions to stay ahead.</p>
        </div>
        <div className="feature">
          <Image src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80" alt="Symptom Logging" width={600} height={400} />
          <h3><i className="fa-regular fa-clipboard"></i> Symptom Logging</h3>
          <p>Track how you feel, when it started, and how it changes over time, helping identify patterns before they become problems.</p>
        </div>
        <div className="feature">
          <Image src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80" alt="Wearable Sync" width={600} height={400} />
          <h3><i className="fa-solid fa-heartbeat"></i> Wearable Sync</h3>
          <p>Connect to devices like Fitbit and Apple Watch to sync your health metrics automatically and receive insights.</p>
        </div>
        <div className="feature">
          <Image src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" alt="Doctor Visit Memory" width={600} height={400} />
          <h3><i className="fa-solid fa-user-doctor"></i> Doctor Visit Memory</h3>
          <p>Record key notes from your appointments and get smart reminders to follow through on your doctor&apos;s advice.</p>
        </div>
        <div className="feature">
          <Image src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80" alt="AI Triage" width={600} height={400} />
          <h3><i className="fa-solid fa-robot"></i> AI Triage</h3>
          <p>Receive early warnings and smart health assessments based on your data and symptoms before visiting a clinic.</p>
        </div>
      </section>

      <footer>
        <h2>Be the first to know when SEP Health launches</h2>
        <p>We&apos;re working on something special. Sign up to get exclusive early access.</p>
        <div className="email-signup">
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" 
              required 
            />
            <input type="submit" value="Notify Me" />
          </form>
          {message && <div className="message">{message}</div>}
        </div>
        <h3 style={{ marginTop: '2rem', color: 'white' }}>Ready to transform your wellness journey?</h3>
        <p>Get personalized health insights and discover how SEP Health can help you stay ahead of potential health issues.</p>
      </footer>
    </>
  );
}
