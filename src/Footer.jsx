import React from 'react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="app-footer">
      <div className="footer-copyright">
        <p>&copy; 2025 WeatherApp</p>
      </div>
      <div className="footer-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="#">Privacy Policy</a>
      </div>
      <div className="footer-back-to-top">
        <button onClick={scrollToTop} className="back-to-top">
          &uarr;
        </button>
      </div>
    </footer>
  );
};

export default Footer;
