import React from "react";
import { Link } from "react-router-dom";
import logoImg1 from "../assets/logo-1.png";
import logoImg2 from "../assets/logo-2.png";


import "../styles/landing.css";

function LandingPage() {
  return (
    <div className="lp-wrapper">

      {/* Header */}
      <header className="lp-header">
        <div className="lp-header-inner">

          {/* Left: Logo + icon */}
          <div className="lp-header-left">
            <img src={logoImg1} alt="logo" className="lp-logo-image" />
          </div>


          {/* Right: Sign Up butonu */}
          <div className="lp-header-right">
            <div className="lp-nav-links">
              <a href="#about">Home</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>

            <Link to="/signup" className="lp-signup-btn">Sign Up</Link>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="lp-main">

        {/* HERO */}
        <section
          className="lp-hero" >
          <div className="lp-hero-left">
            <h1>
              <span className="fast">Fast</span> Food <br /> Delivery
            </h1>
            <p className="lp-hero-text">
              Craving something tasty? From gourmet burgers to fresh salads and
              comforting pasta bowls — your favorite meals are now just a tap away.
              Order in seconds. Enjoy in minutes.
            </p>
            <Link to="/signup" className="lp-order-btn">
              Order now
            </Link>
          </div>


        </section>

      </main>


      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">

          {/* Logo column */}
          <div className="lp-footer-col lp-footer-logo">

            <img src={logoImg2} alt="logo" className="lp-logo-image" />

            <p className="lp-footer-desc">
              Delivering your favorite meals fresh and fast — anytime, anywhere.
            </p>
            <div className="lp-socials">
              <i className="fa-brands fa-facebook lp-social-circle"></i>
              <i className="fa-brands fa-twitter lp-social-circle"></i>
              <i className="fa-brands fa-instagram lp-social-circle"></i>
            </div>
          </div>

          {/* About column */}
          <div className="lp-footer-col">
            <h4>About</h4>
            <ul>
              <li>How it works</li>
              <li>Featured</li>
              <li>Partnership</li>
              <li>Business Relation</li>
            </ul>
          </div>

          {/* Community column */}
          <div className="lp-footer-col">
            <h4>Community</h4>
            <ul>
              <li>Events</li>
              <li>Blog</li>
              <li>Podcast</li>
              <li>Invite a friend</li>
            </ul>
          </div>

          {/* Socials column */}
          <div className="lp-footer-col">
            <h4>Socials</h4>
            <ul>
              <li>Discord</li>
              <li>Instagram</li>
              <li>Twitter</li>
              <li>Facebook</li>
            </ul>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© 2025 Company Name. All rights reserved</span>
          <div className="lp-footer-bottom-links">
            <a href="#">Privacy &amp; Policy</a>
            <a href="#">Terms &amp; Condition</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
