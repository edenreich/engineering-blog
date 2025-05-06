'use client';

import { useState } from 'react';

export default function ContactPage() {
    const [showNotification, setShowNotification] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setShowNotification(true);

        event.currentTarget.reset();

        setTimeout(() => {
            setShowNotification(false);
        }, 13000);
    };

    return (
        <div className="contact-form-container">
            <div className="contact-form-card">
                <h1 className="contact-form-title">Contact</h1>
                <p className="mb-6">Have a question? Feel free to leave me a message.</p>
                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="contact-form-field">
                        <label htmlFor="name" className="contact-form-label">Name:</label>
                        <input
                            type="text"
                            id="name"
                            className="contact-form-input"
                            placeholder="Your name"
                            required
                        />
                    </div>
                    <div className="contact-form-field">
                        <label htmlFor="email" className="contact-form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="contact-form-input"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                    <div className="contact-form-field">
                        <label htmlFor="message" className="contact-form-label">Message:</label>
                        <textarea
                            id="message"
                            rows={5}
                            className="contact-form-input"
                            placeholder="Type your message here..."
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="cta-button w-full"
                    >
                        Submit
                    </button>
                </form>

                {showNotification && (
                    <div className="contact-form-notification">
                        Please use Linkedin to contact me.
                    </div>
                )}
            </div>
        </div>
    );
}