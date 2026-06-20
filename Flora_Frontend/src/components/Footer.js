import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span>🌿 FloraTrack</span>
          <span className="footer-slogan">Your Digital Plant Care Companion</span>
        </div>
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} FloraTrack Team. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
