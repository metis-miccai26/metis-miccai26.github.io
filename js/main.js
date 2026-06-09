/* ============================================================
   METIS Workshop — Main JavaScript (Redesigned)
   Handles: parallax, particles canvas, scroll progress,
   reveal animations, 3D tilt, nav highlighting, counters
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== 1. NAVBAR SCROLL EFFECT ==========
  // Toggle 'scrolled' class on #navbar when scrollY > 60
  const navbar = document.getElementById('navbar');
  const onScroll = () => { navbar.classList.toggle('scrolled', window.scrollY > 60); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ========== 2. SMOOTH SCROLL FOR ANCHOR LINKS ==========
  // All a[href^="#"] — preventDefault, calculate offset (80px for navbar),
  // scrollTo with smooth behavior. Close mobile menu on click.
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  // ========== 3. MOBILE HAMBURGER ==========
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // ========== 4. SCROLL PROGRESS BAR ==========
  // Find element with class 'scroll-progress' and update its width
  // based on scroll percentage (0% at top, 100% at bottom)
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ========== 5. ENHANCED SCROLL REVEAL ==========
  // Support for data-reveal attribute: 'left', 'right', 'scale', default 'up'
  // Each variant starts from different transform position
  // Use IntersectionObserver with threshold 0.12
  // On intersection, add 'visible' class and unobserve
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
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ========== 6. STAGGERED GRID ITEM ANIMATION ==========
  const addStagger = (selector, delayMs = 100) => {
    document.querySelectorAll(selector).forEach((item, i) => {
      item.style.transitionDelay = `${i * delayMs}ms`;
    });
  };
  addStagger('.clinical-col', 150);
  addStagger('.organizer-card', 80);
  addStagger('.award-card', 100);
  addStagger('.program-item', 80);
  addStagger('.timeline-item', 200);

  // ========== 7. GEOMETRIC PARTICLE CANVAS ==========
  // Create an interactive canvas-based particle network in the hero section.
  // - Canvas element: document.getElementById('heroCanvas')
  // - Particles: ~60 small circles (radius 1.5-3px), white with low opacity
  // - Each particle drifts slowly in a random direction
  // - When two particles are within 120px, draw a connecting line between them
  // - Lines fade with distance (opacity proportional to proximity)
  // - On window resize, update canvas size
  // - Use requestAnimationFrame loop
  // - Particles wrap around edges
  // - Colors: particles rgba(255,255,255,0.5), lines rgba(255,255,255, opacity)
  // - Use Math.random for initial positions and velocities
  // - Velocity range: -0.3 to 0.3 px/frame
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 65;
    const CONNECTION_DIST = 130;

    const resizeCanvas = () => {
      heroCanvas.width = heroCanvas.parentElement.offsetWidth;
      heroCanvas.height = heroCanvas.parentElement.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * heroCanvas.width;
        this.y = Math.random() * heroCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 1.5 + 1;
        this.opacity = Math.random() * 0.4 + 0.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = heroCanvas.width;
        if (this.x > heroCanvas.width) this.x = 0;
        if (this.y < 0) this.y = heroCanvas.height;
        if (this.y > heroCanvas.height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  // ========== 8. PARALLAX EFFECT ==========
  // Elements with class 'parallax-layer' and data-speed attribute
  // On scroll, translate Y based on scrollY * speed factor
  // Use requestAnimationFrame for smooth performance
  const parallaxElements = document.querySelectorAll('.parallax-layer');
  if (parallaxElements.length > 0) {
    let ticking = false;
    const updateParallax = () => {
      const scrollY = window.scrollY;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        const rect = el.parentElement.getBoundingClientRect();
        // Only apply parallax when element's parent is in view
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const yPos = scrollY * speed * 0.1;
          el.style.transform = `translateY(${yPos}px)`;
        }
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ========== 9. ACTIVE NAV HIGHLIGHTING ==========
  // Scroll-spy: highlight current section's nav link
  // Get all sections with IDs, check which one is currently in viewport
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinksAll.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  // ========== 10. 3D TILT EFFECT ON CARDS ==========
  // Apply to .organizer-card and .award-card
  // On mousemove: calculate tilt based on mouse position relative to card center
  // Max tilt: 8 degrees
  // On mouseleave: reset transform
  const tiltCards = document.querySelectorAll('.organizer-card, .award-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease';
    });
  });

  // ========== 11. HERO FLOATING PARTICLES (DOM-based) ==========
  // Also keep the original floating particles in .hero-particles container
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    for (let i = 0; i < 25; i++) {
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

});
