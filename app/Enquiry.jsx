
"use client"
import React, { useState, useEffect, useRef } from 'react';

// Copy this component to your React project
const LeadForGrowWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef(null);

  const config = {
    token: "lfg_form_127c5311e96c0e1930bf1460a845430b13860796423f4b54c26c14e49d116d8e",
    baseUrl: "https://www.leadforgrow.com"
  };

  const startTimer = (delay) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isSubmitted && !isOpen) setIsOpen(true);
    }, delay);
  };

  useEffect(() => {
    startTimer(30000);
    return () => clearTimeout(timerRef.current);
  }, [isSubmitted, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (!isSubmitted) startTimer(45000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const data = { token: config.token };
    new FormData(e.target).forEach((v, k) => data[k] = v);

    try {
      const resp = await fetch(`${config.baseUrl}/api/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await resp.json();
      if (res.success) {
        setIsSubmitted(true);
        setSuccess(true);
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        alert(res.error || 'Failed to send');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Badge */}
      <div
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#4F46E5', color: 'white', width: '60px', height: '60px', borderRadius: '50%', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 9999 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M11.07,12.85c0.77-1.39,2.25-2.21,3.11-3.44c0.91-1.29,0.4-3.7-2.18-3.7c-1.69,0-2.52,1.28-2.87,2.34L6.54,6.96 C7.25,4.83,9.18,3,12.19,3c4.1,0,6.21,3.12,4.84,6.03l-0.01,0.01c-0.6,1.28-2.1,2.42-2.98,3.41c-0.84,0.93-0.92,1.65-1.02,2.55 h-3C11.02,14.28,11.07,13.62,11.07,12.85z M13.84,19.33c0,1.29-1.05,2.34-2.34,2.34s-2.34-1.05-2.34-2.34s1.05-2.34,2.34-2.34 S13.84,18.04,13.84,19.33z" /></svg>
      </div>

      {/* Modal Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9998, opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '450px', position: 'relative', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15)' }}>
          <div onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', fontSize: '24px' }}>&times;</div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>✅ Success!</h3>
              <p style={{ marginTop: '10px', color: '#64748b' }}>Thank you! We'll get back to you soon.</p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#000000' }}>Contact Us</h3>
              <p style={{ fontSize: '14px', color: '#000000', opacity: 0.7, marginBottom: '24px' }}>Share your details and we'll get in touch!</p>
              <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Full Name" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <input type="email" name="email" placeholder="Email Address" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <input type="tel" name="phone" placeholder="Phone Number" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <textarea name="message" placeholder="Message" rows="3" style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }}></textarea>
                <button type="submit" disabled={isSending} style={{ width: '100%', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSending ? 0.7 : 1 }}>
                  {isSending ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadForGrowWidget;