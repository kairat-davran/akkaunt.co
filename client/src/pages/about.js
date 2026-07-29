import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const About = () => {
  const theme = useSelector(state => state.theme);

  const features = [
    { icon: 'photo_camera', title: 'Share Moments', desc: 'Post photos and connect with people who follow you.' },
    { icon: 'explore', title: 'Discover', desc: 'Explore posts from new people beyond your network.' },
    { icon: 'storefront', title: 'Bazar', desc: 'Buy and sell items locally with built-in messaging.' },
    { icon: 'event', title: 'Events', desc: 'Create and discover events happening near you.' },
    { icon: 'near_me', title: 'Messaging', desc: 'Real-time direct messages with audio and video calls.' },
    { icon: 'notifications', title: 'Notifications', desc: 'Stay in the loop with likes, comments, and follows.' },
  ];

  return (
    <div className={`about-page ${theme ? 'dark' : ''}`}>
      <style>{`
        .about-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          font-family: 'Georgia', serif;
          color: #111;
          animation: fadeUp 0.5s ease both;
        }
        .about-page.dark {
          color: #e0e0e0;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hero */
        .about-hero {
          text-align: center;
          margin-bottom: 56px;
        }
        .about-logo {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -1px;
          color: #111;
          margin-bottom: 12px;
        }
        .about-page.dark .about-logo { color: #e0e0e0; }
        .about-tagline {
          font-size: 1.15rem;
          color: #555;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
          font-style: italic;
        }
        .about-page.dark .about-tagline { color: #aaa; }

        /* Divider */
        .about-divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 40px 0;
        }
        .about-page.dark .about-divider { border-color: #2f3e4d; }

        /* Section */
        .about-section { margin-bottom: 48px; }
        .about-section h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #111;
          font-family: 'Georgia', serif;
        }
        .about-page.dark .about-section h2 { color: #e0e0e0; }
        .about-section p {
          font-size: 1rem;
          line-height: 1.8;
          color: #444;
        }
        .about-page.dark .about-section p { color: #bbb; }

        /* Features grid */
        .about-features {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .about-feature {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .about-feature:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.07);
        }
        .about-page.dark .about-feature {
          border-color: #2f3e4d;
        }
        .about-feature .material-icons {
          font-size: 28px;
          color: #000;
          margin-bottom: 10px;
          cursor: default;
        }
        .about-page.dark .about-feature .material-icons { color: #93c5fd; }
        .about-feature h4 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #111;
        }
        .about-page.dark .about-feature h4 { color: #e0e0e0; }
        .about-feature p {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
        .about-page.dark .about-feature p { color: #aaa; }

        /* Back link */
        .about-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #333;
          font-size: 0.9rem;
          margin-bottom: 40px;
          text-decoration: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: opacity 0.2s;
        }
        .about-back:hover { opacity: 0.6; color: #333; }
        .about-page.dark .about-back { color: #93c5fd; }

        /* Footer note */
        .about-footer-note {
          text-align: center;
          font-size: 0.85rem;
          color: #999;
          margin-top: 48px;
          font-family: -apple-system, sans-serif;
        }

        @media (max-width: 600px) {
          .about-page { padding: 32px 16px 80px; }
          .about-logo { font-size: 2.2rem; }
          .about-features { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <Link to="/" className="about-back">
        <span className="material-icons" style={{ fontSize: '18px' }}>arrow_back</span>
        Back to Home
      </Link>

      <div className="about-hero">
        <div className="about-logo">αккαυηт</div>
        <p className="about-tagline">
          A social platform built for real connections — share, discover, trade, and communicate.
        </p>
      </div>

      <hr className="about-divider" />

      <div className="about-section">
        <h2>What is akkaunt?</h2>
        <p>
          <strong>akkaunt</strong> is a full-featured social network where you can share photos,
          follow people you care about, and discover content from around the world.
          Beyond the social feed, akkaunt brings together a local marketplace (Bazar),
          real-time messaging with voice and video calls, and a community events board —
          all in one place.
        </p>
      </div>

      <div className="about-section">
        <h2>What can you do here?</h2>
        <div className="about-features">
          {features.map((f, i) => (
            <div className="about-feature" key={i}>
              <span className="material-icons">{f.icon}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="about-divider" />

      <div className="about-section">
        <h2>Privacy & Safety</h2>
        <p>
          Your data stays yours. akkaunt uses secure JWT-based authentication, and your
          account information is never sold or shared with advertisers. You control who
          follows you and can manage your profile at any time from Settings.
        </p>
      </div>

      <div className="about-section">
        <h2>Get in touch</h2>
        <p>
          Have feedback, a bug report, or just want to say hello? Reach out via the
          official website at{' '}
          <a href="https://www.akkaunt.co" target="_blank" rel="noreferrer">
            akkaunt.co
          </a>
          . We read everything.
        </p>
      </div>

      <p className="about-footer-note">&copy; 2025 akkaunt — made with ♥</p>
    </div>
  );
};

export default About;