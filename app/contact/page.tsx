'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    fetch('https://edenreich.app.n8n.cloud/webhook/181836c1-34d1-499b-a811-9f5cd5514528', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setShowSuccessNotification(true);
        return response.json();
      })
      .catch(error => {
        setShowErrorNotification(true);
        console.error('Error:', error);
      });

    event.currentTarget.reset();

    setTimeout(() => {
      setShowSuccessNotification(false);
      setShowErrorNotification(false);
    }, 13000);
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form-card">
        <h1 className="contact-form-title">Contact</h1>
        <p className="mb-6">Have a question? Feel free to leave me a message.</p>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="contact-form-field">
            <label htmlFor="name" className="contact-form-label">
              Name:
            </label>
            <input
              type="text"
              id="name"
              className="contact-form-input"
              placeholder="Your name"
              required
            />
          </div>
          <div className="contact-form-field">
            <label htmlFor="email" className="contact-form-label">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="contact-form-input"
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="contact-form-field">
            <label htmlFor="message" className="contact-form-label">
              Message:
            </label>
            <textarea
              id="message"
              rows={5}
              className="contact-form-input"
              placeholder="Type your message here..."
              required
            ></textarea>
          </div>
          <button type="submit" className="cta-button w-full">
            Submit
          </button>
        </form>

        {showSuccessNotification && (
          <div className="contact-form-notification-success">Message sent successfully!</div>
        )}
        {showErrorNotification && (
          <div className="contact-form-notification-error">
            There was an error sending your message.
          </div>
        )}
      </div>
    </div>
  );
}
