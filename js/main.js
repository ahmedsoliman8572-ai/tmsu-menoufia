/* ============================================================
   TMSU Menoufia — Main JavaScript
   Navigation, Theme, Scroll Effects, Back-to-Top
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initScrollProgress();
  initBackToTop();
  initSmoothScroll();
  initActiveNavLink();
  initRippleEffect();
});

/* ==================== NAVBAR ==================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (!navbar) return;

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      navOverlay?.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on overlay click
    navOverlay?.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      navOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay?.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ==================== THEME TOGGLE ==================== */
function initThemeToggle() {
  const themeToggle = document.querySelectorAll('.theme-toggle');
  const savedTheme = localStorage.getItem('tmsu-theme') || 'light';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('tmsu-theme', next);
      updateThemeIcon(next);
    });
  });
}

function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/* ==================== SCROLL PROGRESS ==================== */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  // Use CSS scroll-driven animation if supported
  if (CSS.supports('animation-timeline', 'scroll()')) {
    progressBar.style.animation = 'none';
    progressBar.style.animationTimeline = 'scroll()';
    progressBar.style.animationName = 'scroll-progress-fill';

    // Add the keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-progress-fill {
        from { scale: 0 1; }
        to { scale: 1 1; }
      }
    `;
    document.head.appendChild(style);
  } else {
    // Fallback: JS-based scroll progress
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.scale = `${progress} 1`;
    }, { passive: true });
  }
}

/* ==================== BACK TO TOP ==================== */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==================== SMOOTH SCROLL ==================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
}

/* ==================== ACTIVE NAV LINK ==================== */
function initActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ==================== RIPPLE EFFECT ==================== */
function initRippleEffect() {
  document.querySelectorAll('.ripple-effect').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ==================== LANGUAGE TOGGLE (Integration) ==================== */
function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      i18n.toggle();
    });
  });
}

// Init language toggle after DOM is ready and i18n is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof i18n !== 'undefined') {
    initLangToggle();
  }
});

/* ==================== HTML ESCAPE UTILITY ==================== */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==================== DYNAMIC NEWS & EVENTS LOADER ==================== */
async function initDynamicContent() {
  if (!window.TMSU_API) return;

  // Render Dynamic News on news.html or index.html if grid exists
  const newsGrid = document.getElementById('dynamic-news-grid');
  if (newsGrid) {
    try {
      const news = await window.TMSU_API.fetchNews();
      if (news && news.length > 0) {
        newsGrid.innerHTML = news.map(item => `
          <div class="card reveal hover-lift revealed">
            <div style="width: 100%; aspect-ratio: 16/10; overflow: hidden; position: relative;">
              <img src="${escapeHtml(item.image_url) || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(item.title_ar)}" style="width:100%; height:100%; object-fit:cover;">
              <span class="badge badge--accent" style="position:absolute; top:12px; right:12px; z-index:2;">${escapeHtml(item.category) || 'أخبار'}</span>
            </div>
            <div class="card-body">
              <span class="badge badge--primary mb-sm">${new Date(item.created_at || Date.now()).toLocaleDateString('ar-EG')}</span>
              <h3 class="card-title" style="margin-top: var(--sp-xs); font-size: var(--fs-lg);">${escapeHtml(item.title_ar)}</h3>
              <p class="card-text">${escapeHtml(item.content_ar)}</p>
            </div>
          </div>
        `).join('');
      } else {
        newsGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: var(--sp-2xl); background: var(--surface-card); border-radius: var(--radius-xl);">
            <div style="font-size: 3rem; margin-bottom: var(--sp-xs);">📰</div>
            <h3>لا توجد أخبار مضافة حالياً</h3>
            <p style="margin-top: 6px; font-size: var(--fs-sm);">تابعنا قريباً للاطلاع على آخر الأخبار والمستجدات الخاصة بالاتحاد</p>
          </div>
        `;
      }
    } catch (e) {
      console.warn('Error loading dynamic news:', e);
    }
  }

  // Render Dynamic Events on events.html or index.html if container exists
  const eventsContainer = document.getElementById('dynamic-events-grid');
  if (eventsContainer) {
    try {
      const events = await window.TMSU_API.fetchEvents();
      if (events && events.length > 0) {
        eventsContainer.innerHTML = events.map(ev => `
          <div class="card reveal hover-lift revealed" data-category="${escapeHtml(ev.category) || 'عام'}">
            <div style="width: 100%; aspect-ratio: 16/10; overflow: hidden; position: relative;">
              <img src="${escapeHtml(ev.image_url) || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(ev.title_ar)}" style="width:100%; height:100%; object-fit:cover;">
              <span class="badge badge--primary" style="position:absolute; top:12px; right:12px; z-index:2;">${escapeHtml(ev.category) || 'فعالية'}</span>
            </div>
            <div class="card-body">
              <div style="display: flex; gap: 8px; margin-bottom: var(--sp-xs); flex-wrap: wrap;">
                <span class="badge" style="background: color-mix(in oklch, var(--clr-accent) 20%, transparent); color: var(--clr-accent);">📅 ${escapeHtml(ev.event_date) || 'قريباً'}</span>
                <span class="badge" style="background: color-mix(in oklch, var(--clr-primary) 15%, transparent); color: var(--clr-primary);">📍 ${escapeHtml(ev.location_ar) || 'المنوفية'}</span>
              </div>
              <h3 class="card-title" style="margin-top: var(--sp-xs); font-size: var(--fs-lg);">${escapeHtml(ev.title_ar)}</h3>
              <p class="card-text">${escapeHtml(ev.description_ar)}</p>
            </div>
          </div>
        `).join('');
      } else {
        eventsContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: var(--sp-2xl); background: var(--surface-card); border-radius: var(--radius-xl);">
            <div style="font-size: 3rem; margin-bottom: var(--sp-xs);">📅</div>
            <h3>لا توجد فعاليات مضافة حالياً</h3>
            <p style="margin-top: 6px; font-size: var(--fs-sm);">تابعنا قريباً للاطلاع على الفعاليات والأنشطة القادمة</p>
          </div>
        `;
      }
    } catch (e) {
      console.warn('Error loading dynamic events:', e);
    }
  }

  // Render Public Board Hierarchy if container exists
  await renderPublicBoardHierarchy();

  // Render Public Top Members / Honor Board if container exists
  await renderPublicTopMembers();

  if (window.initScrollReveal) {
    window.initScrollReveal();
  }
}

// Render Top Members / Honor Board in Public Pages
async function renderPublicTopMembers() {
  const container = document.getElementById('dynamic-top-members-container');
  if (!container) return;

  try {
    const members = await window.TMSU_API.fetchTopMembers();
    if (!members || members.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: var(--sp-2xl); background: var(--surface-card); border-radius: var(--radius-xl); color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: var(--sp-xs);">🌟</div>
          <h3>سيتم إعلان أعضاء الشهر المتميزين قريباً</h3>
          <p style="margin-top: 6px; font-size: var(--fs-sm);">يتم تكريم وتوثيق تميز أعضاء اللجان شهرياً من خلال لوحة الشرف</p>
        </div>
      `;
      return;
    }

    container.innerHTML = members.map(item => `
      <div class="top-member-card glass-card reveal">
        <div class="top-member-header">
          <div class="top-member-badge">🌟 عضو الشهر المميز</div>
          <span class="top-member-date">${escapeHtml(item.month_year || '2026')}</span>
        </div>
        <div class="top-member-img-wrapper">
          <img src="${escapeHtml(item.image_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtml(item.name)}" class="top-member-img">
        </div>
        <div class="top-member-body">
          <h3 class="top-member-name">${escapeHtml(item.name)}</h3>
          <span class="top-member-committee">📍 ${escapeHtml(item.committee || item.title_or_role || 'عضو متميز')}</span>
          ${item.achievement ? `<p class="top-member-achievement">" ${escapeHtml(item.achievement)} "</p>` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.warn('Error rendering top members:', e);
  }
}

/* ==================== DYNAMIC BOARD HIERARCHY LOADER ==================== */
async function renderPublicBoardHierarchy() {
  const container = document.getElementById('dynamic-board-container');
  if (!container) return;
  if (!window.TMSU_API) {
    setTimeout(renderPublicBoardHierarchy, 300);
    return;
  }

  try {
    let members = await window.TMSU_API.fetchBoardMembers();
    if (!members || members.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: var(--sp-2xl); background: var(--surface-card); border-radius: var(--radius-xl);">
          <div style="font-size: 3rem; margin-bottom: var(--sp-xs);">👑</div>
          <h3>لا يوجد أعضاء في الهيكل القيادي حالياً</h3>
          <p style="margin-top: 6px; font-size: var(--fs-sm);">يمكن للمدير إضافة أعضاء الهيكل القيادي والبورد من لوحة التحكم</p>
        </div>
      `;
      return;
    }

    // Helper function to check if title is a primary leader
    function isPrimaryLeaderTitle(title) {
      const t = (title || '').trim();
      return (t === 'رئيس الاتحاد' || t.includes('منسق عام') || (t.includes('رئيس') && !t.includes('نائب')));
    }

    // Helper to ensure primary leader is first in DOM order
    function sortPrimaryLeaderFirst(arr) {
      if (!arr || arr.length < 2) return arr;
      const mainIdx = arr.findIndex(m => isPrimaryLeaderTitle(m.title));
      if (mainIdx > 0) {
        const leader = arr[mainIdx];
        const rest = arr.filter((_, idx) => idx !== mainIdx);
        return [leader, ...rest];
      }
      return arr;
    }

    const level1 = sortPrimaryLeaderFirst(members.filter(m => parseInt(m.role_level, 10) === 1));
    const level2 = sortPrimaryLeaderFirst(members.filter(m => parseInt(m.role_level, 10) === 2));
    const level3 = members.filter(m => parseInt(m.role_level, 10) === 3);

    let html = '';

    // Helper to format or hide redundant committee badges
    function renderCommitteeBadge(committee, icon = '📌') {
      if (!committee) return '';
      const c = committee.trim();
      if (c === 'القيادة العليا' || c === 'مجلس إدارة الاتحاد' || c === 'منسقية المحافظة' || c === 'قيادة المحافظة' || c === 'مجلس إدارة المحافظة' || c === 'مجلس إدارة محافظة المنوفية' || c === 'المكتب التنفيذي لمحافظة المنوفية') {
        return '';
      }
      return `<span class="board-member-committee">${icon} ${escapeHtml(c)}</span>`;
    }

    // LEVEL 1: مجلس إدارة الاتحاد
    if (level1.length > 0) {
      html += `
        <div class="board-tier board-tier--level1 reveal">
          <div class="board-tier-heading">
            <span>👑</span> مجلس إدارة الاتحاد
          </div>
          <div class="board-grid">
            ${level1.map(item => {
              const isLeader = isPrimaryLeaderTitle(item.title);
              const leaderClass = isLeader ? ' board-card--leader' : '';
              return `
                <div class="board-card board-card--level1${leaderClass}">
                  <div class="board-card-img-wrapper">
                    <img src="${escapeHtml(item.image_url) || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtml(item.name)}" class="board-card-img">
                    <div class="board-card-img-overlay"></div>
                    <span class="board-level-badge">👑 مجلس إدارة الاتحاد</span>
                  </div>
                  <div class="board-card-body">
                    <h4 class="board-member-name">${escapeHtml(item.name)}</h4>
                    <span class="board-member-title">${escapeHtml(item.title)}</span>
                    ${renderCommitteeBadge(item.committee, '📍')}
                    ${item.phone ? `
                      <div class="board-member-actions">
                        <a href="tel:${escapeHtml(item.phone)}" class="board-action-btn">📞 ${escapeHtml(item.phone)}</a>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // LEVEL 2: مجلس إدارة محافظة المنوفية
    if (level2.length > 0) {
      html += `
        <div class="board-tier board-tier--level2 reveal">
          <div class="board-tier-heading">
            <span>🏛️</span> مجلس إدارة محافظة المنوفية
          </div>
          <div class="board-grid">
            ${level2.map(item => {
              const isLeader = isPrimaryLeaderTitle(item.title);
              const leaderClass = isLeader ? ' board-card--leader' : '';
              return `
                <div class="board-card board-card--level2${leaderClass}">
                  <div class="board-card-img-wrapper">
                    <img src="${escapeHtml(item.image_url) || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtml(item.name)}" class="board-card-img">
                    <div class="board-card-img-overlay"></div>
                    <span class="board-level-badge">🏛️ مجلس إدارة محافظة المنوفية</span>
                  </div>
                  <div class="board-card-body">
                    <h4 class="board-member-name">${escapeHtml(item.name)}</h4>
                    <span class="board-member-title">${escapeHtml(item.title)}</span>
                    ${renderCommitteeBadge(item.committee, '🏛️')}
                    ${item.phone ? `
                      <div class="board-member-actions">
                        <a href="tel:${escapeHtml(item.phone)}" class="board-action-btn">📞 ${escapeHtml(item.phone)}</a>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // LEVEL 3: المكتب التنفيذي لمحافظة المنوفية
    if (level3.length > 0) {
      html += `
        <div class="board-tier board-tier--level3 reveal">
          <div class="board-tier-heading">
            <span>⭐</span> المكتب التنفيذي لمحافظة المنوفية
          </div>
          <div class="board-grid">
            ${level3.map(item => `
              <div class="board-card board-card--level3">
                <div class="board-card-img-wrapper">
                  <img src="${escapeHtml(item.image_url) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="${escapeHtml(item.name)}" class="board-card-img">
                  <div class="board-card-img-overlay"></div>
                  <span class="board-level-badge">⭐ المكتب التنفيذي</span>
                </div>
                <div class="board-card-body">
                  <h4 class="board-member-name">${escapeHtml(item.name)}</h4>
                  <span class="board-member-title">${escapeHtml(item.title)}</span>
                  ${renderCommitteeBadge(item.committee, '📌')}
                  ${item.phone ? `
                    <div class="board-member-actions">
                      <a href="tel:${escapeHtml(item.phone)}" class="board-action-btn">📞 ${escapeHtml(item.phone)}</a>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach Level Filter listeners
    const filterBtns = document.querySelectorAll('.board-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active', 'btn--primary');
          b.classList.add('btn--outline');
        });
        btn.classList.add('active', 'btn--primary');
        btn.classList.remove('btn--outline');

        const level = btn.getAttribute('data-level');
        const tiers = container.querySelectorAll('.board-tier');

        tiers.forEach((tier) => {
          if (level === 'all' || tier.classList.contains(`board-tier--level${level}`)) {
            tier.style.display = 'block';
          } else {
            tier.style.display = 'none';
          }
        });
      });
    });
  } catch (e) {
    console.warn('Error rendering public board hierarchy:', e);
  }
}

// 🔴 Real-time Live Updates & Polling for Public News, Events & Board
document.addEventListener('DOMContentLoaded', () => {
  initDynamicContent();

  if (window.TMSU_API?.subscribeToRealtimeChanges) {
    window.TMSU_API.subscribeToRealtimeChanges(async (table) => {
      if (table === 'news' || table === 'events' || table === 'board_members') {
        await initDynamicContent();
      }
    });
  }

  if (!window._publicPollingTimer) {
    window._publicPollingTimer = setInterval(async () => {
      const newsGrid = document.getElementById('dynamic-news-grid');
      const eventsContainer = document.getElementById('dynamic-events-grid');
      const boardContainer = document.getElementById('dynamic-board-container');
      if (newsGrid || eventsContainer || boardContainer) {
        await initDynamicContent();
      }
    }, 60000);
  }
});

