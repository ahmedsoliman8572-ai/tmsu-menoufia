/* ============================================================
   TMSU Menoufia — Animations JavaScript
   IntersectionObserver, Counters, Parallax, Stagger
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initParallax();
  initAccordion();
});

/* ==================== SCROLL REVEAL ==================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optionally stop observing after reveal
          // observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  revealElements.forEach(el => observer.observe(el));

  // Auto-stagger children with .stagger-children class
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 100}ms`;
    });
  });
}

window.initScrollReveal = initScrollReveal;

/* ==================== ANIMATED COUNTERS ==================== */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-counter'), 10);
  const suffix = element.getAttribute('data-counter-suffix') || '';
  const prefix = element.getAttribute('data-counter-prefix') || '';
  const duration = parseInt(element.getAttribute('data-counter-duration'), 10) || 2000;
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const currentValue = Math.round(easedProgress * target);

    element.textContent = prefix + currentValue.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ==================== PARALLAX ==================== */
function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        parallaxElements.forEach(el => {
          const speed = parseFloat(el.getAttribute('data-parallax')) || 0.3;
          const rect = el.getBoundingClientRect();
          const yPos = -(rect.top * speed);
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==================== ACCORDION ==================== */
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const content = header.nextElementSibling;
      const accordion = header.closest('.accordion');

      // Close other accordion items in same accordion
      if (accordion) {
        accordion.querySelectorAll('.accordion-header').forEach(otherHeader => {
          if (otherHeader !== header) {
            otherHeader.setAttribute('aria-expanded', 'false');
            const otherContent = otherHeader.nextElementSibling;
            if (otherContent) {
              otherContent.style.maxHeight = null;
            }
          }
        });
      }

      // Toggle current
      header.setAttribute('aria-expanded', !isExpanded);
      if (content) {
        if (!isExpanded) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = null;
        }
      }
    });
  });
}

/* ==================== EVENT FILTER ==================== */
function initEventFilter() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const eventCards = document.querySelectorAll('.event-card');

  if (filterTabs.length === 0 || eventCards.length === 0) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      // Filter cards with animation
      eventCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.style.display = '';
          card.style.animationDelay = `${index * 80}ms`;
          card.classList.add('revealed');
          // Force reflow then show
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

// Init event filter if on events page
if (document.querySelector('.filter-tab')) {
  initEventFilter();
}
