/* ==========================================================================
   FAIROZ BASHIR - PORTFOLIO INTERACTIVE & DYNAMIC RENDERER JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. Load Portfolio Data Dynamically ---
  await loadAndRenderPortfolio();

  // --- 2. Theme Toggle (Dark / Light Mode) ---
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
  
  const savedTheme = localStorage.getItem('fb-portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('fb-portfolio-theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.className = 'fas fa-moon';
      themeBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      themeIcon.className = 'fas fa-sun';
      themeBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }

  // --- 3. Mobile Navigation Drawer ---
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }

  // --- 4. Active Nav Link Observer ---
  const sections = document.querySelectorAll('section[id]');
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));

  // --- 5. Scroll Reveal Observer ---
  setupScrollReveal();

  // --- 6. Back to Top Button ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- 7. Lightbox Close Listeners ---
  const lightboxModal = document.getElementById('memory-lightbox-modal');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  if (lightboxCloseBtn && lightboxModal) {
    lightboxCloseBtn.addEventListener('click', closeMemoryLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeMemoryLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMemoryLightbox();
    });
  }
});

// --- Dynamic Data Loader & UI Renderer ---
async function loadAndRenderPortfolio() {
  let data = null;
  const localData = localStorage.getItem('fb_portfolio_data');

  if (localData) {
    try {
      data = JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local portfolio data:', e);
    }
  }

  if (!data) {
    try {
      const res = await fetch('data/portfolio-data.json');
      data = await res.json();
    } catch (e) {
      console.error('Failed to fetch default portfolio JSON:', e);
    }
  }

  if (!data) return;

  // 1. Render Hero Section
  if (data.personal) {
    const nameEls = document.querySelectorAll('.dynamic-name');
    nameEls.forEach(el => el.textContent = data.personal.name);

    const titleEl = document.getElementById('hero-role-display');
    if (titleEl) titleEl.textContent = data.personal.title;

    const bioEl = document.getElementById('hero-bio-display');
    if (bioEl) bioEl.textContent = data.personal.bio;

    const badgeEl = document.getElementById('hero-badge-display');
    if (badgeEl && data.personal.statusBadge) {
      badgeEl.innerHTML = `<i class="fas fa-circle-dot"></i> ${data.personal.statusBadge}`;
    }

    const photoEl = document.getElementById('hero-photo-display');
    if (photoEl && data.personal.photoUrl) photoEl.src = data.personal.photoUrl;

    const resumeBtn = document.getElementById('download-resume-btn');
    if (resumeBtn && data.personal.resumeUrl) {
      resumeBtn.href = data.personal.resumeUrl;
    }

    if (data.personal.stats && data.personal.stats.length >= 3) {
      const s1Num = document.getElementById('stat1-num');
      const s1Lbl = document.getElementById('stat1-lbl');
      if (s1Num) s1Num.setAttribute('data-target', data.personal.stats[0].number);
      if (s1Lbl) s1Lbl.textContent = data.personal.stats[0].label;

      const s2Num = document.getElementById('stat2-num');
      const s2Lbl = document.getElementById('stat2-lbl');
      if (s2Num) s2Num.setAttribute('data-target', data.personal.stats[1].number);
      if (s2Lbl) s2Lbl.textContent = data.personal.stats[1].label;

      const s3Num = document.getElementById('stat3-num');
      const s3Lbl = document.getElementById('stat3-lbl');
      if (s3Num) s3Num.setAttribute('data-target', data.personal.stats[2].number);
      if (s3Lbl) s3Lbl.textContent = data.personal.stats[2].label;
    }
  }

  // 2. Render About Section
  if (data.about) {
    const aboutTextContainer = document.getElementById('about-text-container');
    if (aboutTextContainer && data.about.paragraphs) {
      aboutTextContainer.innerHTML = data.about.paragraphs
        .map(p => `<p>${p}</p>`).join('');
    }

    const focusCardsContainer = document.getElementById('about-focus-cards');
    if (focusCardsContainer && data.about.focusCards) {
      focusCardsContainer.innerHTML = data.about.focusCards.map(card => `
        <div class="focus-card">
          <i class="${card.icon}"></i>
          <h4>${card.title}</h4>
          <p>${card.desc}</p>
        </div>
      `).join('');
    }
  }

  // 3. Render Qualifications Section
  const timelineContainer = document.getElementById('qualifications-timeline');
  if (timelineContainer) {
    const allQuals = [...(data.education || []), ...(data.certifications || [])];
    timelineContainer.innerHTML = allQuals.map(item => `
      <div class="timeline-item reveal">
        <div class="timeline-icon">
          <i class="${item.type === 'degree' ? 'fas fa-graduation-cap' : 'fas fa-certificate'}"></i>
        </div>
        <div class="timeline-content">
          <span class="timeline-year">${item.year}</span>
          <h3 class="timeline-title">${item.title}</h3>
          <div class="timeline-institution">${item.institution}</div>
          <p class="timeline-desc">${item.desc}</p>
        </div>
      </div>
    `).join('');
  }

  // 4. Render Skills Section
  if (data.skills) {
    const techContainer = document.getElementById('tech-skills-container');
    if (techContainer && data.skills.technical) {
      techContainer.innerHTML = data.skills.technical.map(skill => `
        <div class="skill-bar-item">
          <div class="skill-info">
            <span>${skill.name}</span>
            <span>${skill.level}%</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" data-width="${skill.level}%"></div>
          </div>
        </div>
      `).join('');
    }

    const softContainer = document.getElementById('soft-skills-container');
    if (softContainer && data.skills.soft) {
      softContainer.innerHTML = data.skills.soft.map(skill => `
        <span class="skill-tag"><i class="${skill.icon || 'fas fa-star'}"></i> ${skill.name}</span>
      `).join('');
    }
  }

  // 5. Render Projects Section
  const projectsContainer = document.getElementById('projects-grid-container');
  if (projectsContainer && data.projects) {
    projectsContainer.innerHTML = data.projects.map(proj => `
      <div class="project-card reveal" data-category="${proj.category}">
        <div class="project-thumb">
          <img src="${proj.image || 'assets/project1.png'}" alt="${proj.title}">
          <span class="project-category-badge">${proj.categoryLabel || 'Analysis'}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${proj.title}</h3>
          <p class="project-desc">${proj.desc}</p>
          <div class="project-tech">
            ${(proj.tech || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <div class="project-links">
            <a href="${proj.link || 'assets/resume.pdf'}" target="_blank" class="project-link" rel="noopener">
              <i class="fas fa-file-pdf"></i> ${proj.linkText || 'Read Brief'}
            </a>
            ${proj.repo ? `
              <a href="${proj.repo}" target="_blank" class="project-link" rel="noopener">
                <i class="fab fa-github"></i> Repository
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    setupProjectFilters();
  }

  // 6. Render College Memories Section
  const memoriesContainer = document.getElementById('memories-grid-container');
  if (memoriesContainer && data.memories) {
    memoriesContainer.innerHTML = data.memories.map(mem => `
      <div class="memory-card reveal" data-category="${mem.category}" onclick='openMemoryLightbox(${JSON.stringify(mem)})'>
        <div class="memory-thumb">
          <img src="${mem.image || 'assets/memory1.png'}" alt="${mem.title}">
          <div class="memory-overlay">
            <i class="fas fa-expand"></i>
          </div>
        </div>
        <div class="memory-body">
          <h4 class="memory-title">${mem.title}</h4>
          <div class="memory-meta">
            <span><i class="fas fa-calendar-alt"></i> ${mem.date}</span>
            <span><i class="fas fa-location-dot"></i> ${mem.location}</span>
          </div>
        </div>
      </div>
    `).join('');

    setupMemoryFilters();
  }

  // 7. Render Experience Section
  const expContainer = document.getElementById('experience-list-container');
  if (expContainer && data.experience) {
    expContainer.innerHTML = data.experience.map(exp => `
      <div class="exp-card reveal">
        <div class="exp-header">
          <div>
            <h3 class="exp-role">${exp.role}</h3>
            <div class="exp-company">${exp.company}</div>
          </div>
          <span class="exp-duration">${exp.duration}</span>
        </div>
        <ul class="exp-responsibilities">
          ${(exp.responsibilities || []).map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  // 8. Render Contact Section
  if (data.contact) {
    const emailBadges = document.querySelectorAll('.dynamic-email');
    emailBadges.forEach(el => el.textContent = data.contact.email);

    const phoneBadges = document.querySelectorAll('.dynamic-phone');
    phoneBadges.forEach(el => el.textContent = data.contact.phone);

    const locationBadges = document.querySelectorAll('.dynamic-location');
    locationBadges.forEach(el => el.textContent = data.contact.location);

    const mailtoBtn = document.getElementById('mailto-btn');
    if (mailtoBtn) {
      mailtoBtn.href = `mailto:${data.contact.email}?subject=Let's%20Connect%20-%20Political%20Analysis`;
    }

    if (data.contact.social) {
      const li = document.getElementById('social-linkedin-link');
      if (li) li.href = data.contact.social.linkedin;

      const gh = document.getElementById('social-github-link');
      if (gh) gh.href = data.contact.social.github;

      const tw = document.getElementById('social-twitter-link');
      if (tw) tw.href = data.contact.social.twitter;

      const ig = document.getElementById('social-instagram-link');
      if (ig) ig.href = data.contact.social.instagram;
    }
  }

  setupScrollReveal();
}

// --- Lightbox Modal Open / Close ---
window.openMemoryLightbox = function(mem) {
  const modal = document.getElementById('memory-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const meta = document.getElementById('lightbox-meta');
  const desc = document.getElementById('lightbox-desc');

  if (!modal) return;

  if (img) img.src = mem.image || 'assets/memory1.png';
  if (title) title.textContent = mem.title;
  if (meta) meta.innerHTML = `<i class="fas fa-calendar"></i> ${mem.date} | <i class="fas fa-location-dot"></i> ${mem.location}`;
  if (desc) desc.textContent = mem.desc;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function closeMemoryLightbox() {
  const modal = document.getElementById('memory-lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --- Setup Scroll Reveal Animations ---
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserverOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        if (entry.target.classList.contains('skills-category') || entry.target.id === 'skills') {
          animateSkillBars();
        }
        if (entry.target.classList.contains('hero-stats')) {
          animateStatsCounters();
        }
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

function animateSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  fills.forEach(fill => {
    const targetWidth = fill.getAttribute('data-width') || '85%';
    fill.style.width = targetWidth;
  });
}

let statsAnimated = false;
function animateStatsCounters() {
  if (statsAnimated) return;
  statsAnimated = true;

  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0', 10);
    const suffix = counter.getAttribute('data-suffix') || '';
    let count = 0;
    const speed = Math.max(1, Math.ceil(target / 30));

    const updateCount = () => {
      count += speed;
      if (count >= target) {
        counter.textContent = target + suffix;
      } else {
        counter.textContent = count + suffix;
        requestAnimationFrame(updateCount);
      }
    };
    updateCount();
  });
}

function setupProjectFilters() {
  const filterBtns = document.querySelectorAll('.project-filters .filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

function setupMemoryFilters() {
  const filterBtns = document.querySelectorAll('.memory-filters .filter-btn');
  const memoryCards = document.querySelectorAll('.memory-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      memoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}
