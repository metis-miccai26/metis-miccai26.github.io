/* ============================================================
   METIS Workshop — Main JavaScript
   Handles: scroll effects, animations, nav, particles
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- navbar scroll effect ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      // close mobile menu if open
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // ---------- mobile hamburger ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // ---------- scroll-reveal (IntersectionObserver) ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  } else {
    // fallback: show all
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ---------- hero particles ----------
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    for (let i = 0; i < 20; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 30 + 10;
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${Math.random() * 100}%`;
      span.style.animationDuration = `${Math.random() * 12 + 8}s`;
      span.style.animationDelay = `${Math.random() * 8}s`;
      particleContainer.appendChild(span);
    }
  }

  // ---------- staggered reveal for grid items ----------
  const addStagger = (selector, delayMs = 100) => {
    const items = document.querySelectorAll(selector);
    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * delayMs}ms`;
    });
  };
  addStagger('.track-card', 150);
  addStagger('.organizer-card', 80);
  addStagger('.award-card', 100);
  addStagger('.program-item', 80);
});
