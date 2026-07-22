/* ==========================================================================
   PORTFOLIO CMS ADMIN PANEL JAVASCRIPT
   ========================================================================== */

let portfolioData = null;
const DEFAULT_PASSCODE = 'admin123';

document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. Passcode Authentication Check ---
  const loginOverlay = document.getElementById('login-overlay');
  const passcodeInput = document.getElementById('admin-passcode-input');
  const loginBtn = document.getElementById('login-btn');
  const loginCard = document.getElementById('login-card');

  if (sessionStorage.getItem('fb_admin_auth') === 'true') {
    if (loginOverlay) loginOverlay.style.display = 'none';
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  if (passcodeInput) {
    passcodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  function handleLogin() {
    const inputCode = passcodeInput.value.trim();
    const storedPasscode = localStorage.getItem('fb_admin_passcode') || DEFAULT_PASSCODE;

    if (inputCode === storedPasscode) {
      sessionStorage.setItem('fb_admin_auth', 'true');
      loginOverlay.style.display = 'none';
      showToast('Welcome to Portfolio CMS Admin Panel!', 'success');
    } else {
      loginCard.classList.add('shake');
      showToast('Incorrect passcode! Please try again.', 'danger');
      setTimeout(() => loginCard.classList.remove('shake'), 500);
    }
  }

  // --- 2. Load Portfolio Data ---
  await loadData();

  // --- 3. Sidebar Tab Navigation ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(`panel-${targetId}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // --- 4. Bind Global Action Buttons ---
  document.getElementById('save-all-btn')?.addEventListener('click', saveAllData);
  document.getElementById('export-json-btn')?.addEventListener('click', exportDataJSON);
  document.getElementById('import-json-btn')?.addEventListener('click', () => document.getElementById('import-file-input').click());
  document.getElementById('import-file-input')?.addEventListener('change', importDataJSON);
  document.getElementById('logout-btn')?.addEventListener('click', logoutAdmin);
  document.getElementById('change-passcode-btn')?.addEventListener('click', updatePasscode);
  document.getElementById('reset-defaults-btn')?.addEventListener('click', resetToDefaults);

  // --- 5. Image & PDF File Pickers (FileReader Integration) ---
  setupImageFilePicker('hero-photo-file', 'hero-photo-preview', 'hero-photo');
  setupImageFilePicker('new-proj-file', 'new-proj-preview', 'new-proj-image');
  setupImageFilePicker('new-mem-file', 'new-mem-preview', 'new-mem-image');
  setupPdfFilePicker('hero-resume-file', 'hero-resume-filename', 'hero-resume');

  bindHeroForm();
  bindAboutForm();
  bindContactForm();
});

// --- Image File Picker & Preview Helper ---
function setupImageFilePicker(fileInputId, previewImgId, hiddenValueInputId) {
  const fileInput = document.getElementById(fileInputId);
  const previewImg = document.getElementById(previewImgId);
  const hiddenInput = document.getElementById(hiddenValueInputId);

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file!', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (previewImg) previewImg.src = dataUrl;
      if (hiddenInput) hiddenInput.value = dataUrl;
      showToast(`Selected "${file.name}" successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  });
}

// --- PDF File Picker Helper ---
function setupPdfFilePicker(fileInputId, filenameBadgeId, hiddenValueInputId) {
  const fileInput = document.getElementById(fileInputId);
  const filenameBadge = document.getElementById(filenameBadgeId);
  const hiddenInput = document.getElementById(hiddenValueInputId);

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please select a valid PDF file!', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (filenameBadge) filenameBadge.textContent = file.name;
      if (hiddenInput) hiddenInput.value = dataUrl;
      showToast(`Selected Resume PDF: "${file.name}"`, 'success');
    };
    reader.readAsDataURL(file);
  });
}

// --- Data Loading ---
async function loadData() {
  const localData = localStorage.getItem('fb_portfolio_data');
  if (localData) {
    try {
      portfolioData = JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local portfolio data:', e);
    }
  }

  if (!portfolioData) {
    try {
      const res = await fetch('data/portfolio-data.json');
      portfolioData = await res.json();
    } catch (e) {
      console.error('Failed to fetch default JSON portfolio data:', e);
    }
  }

  if (portfolioData) {
    populateAllForms();
  }
}

function populateAllForms() {
  if (!portfolioData) return;

  if (portfolioData.personal) {
    setVal('hero-name', portfolioData.personal.name);
    setVal('hero-title', portfolioData.personal.title);
    setVal('hero-status', portfolioData.personal.statusBadge);
    setVal('hero-bio', portfolioData.personal.bio);
    setVal('hero-photo', portfolioData.personal.photoUrl);
    setVal('hero-resume', portfolioData.personal.resumeUrl);

    const photoPrev = document.getElementById('hero-photo-preview');
    if (photoPrev && portfolioData.personal.photoUrl) {
      photoPrev.src = portfolioData.personal.photoUrl;
    }

    const resumeBadge = document.getElementById('hero-resume-filename');
    if (resumeBadge && portfolioData.personal.resumeUrl) {
      if (portfolioData.personal.resumeUrl.startsWith('data:')) {
        resumeBadge.textContent = 'Custom Uploaded Resume (PDF)';
      } else {
        resumeBadge.textContent = portfolioData.personal.resumeUrl;
      }
    }

    if (portfolioData.personal.stats) {
      setVal('stat1-number', portfolioData.personal.stats[0]?.number || 0);
      setVal('stat1-label', portfolioData.personal.stats[0]?.label || '');
      setVal('stat2-number', portfolioData.personal.stats[1]?.number || 0);
      setVal('stat2-label', portfolioData.personal.stats[1]?.label || '');
      setVal('stat3-number', portfolioData.personal.stats[2]?.number || 0);
      setVal('stat3-label', portfolioData.personal.stats[2]?.label || '');
    }
  }

  if (portfolioData.about) {
    setVal('about-p1', portfolioData.about.paragraphs[0] || '');
    setVal('about-p2', portfolioData.about.paragraphs[1] || '');
  }

  renderEducationList();
  renderSkillsLists();
  renderProjectsList();
  renderMemoriesList();
  renderExperienceList();

  if (portfolioData.contact) {
    setVal('contact-email', portfolioData.contact.email);
    setVal('contact-phone', portfolioData.contact.phone);
    setVal('contact-location', portfolioData.contact.location);

    if (portfolioData.contact.social) {
      setVal('social-linkedin', portfolioData.contact.social.linkedin);
      setVal('social-github', portfolioData.contact.social.github);
      setVal('social-twitter', portfolioData.contact.social.twitter);
      setVal('social-instagram', portfolioData.contact.social.instagram);
    }
  }
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function bindHeroForm() {
  const saveBtn = document.getElementById('save-hero-btn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    portfolioData.personal.name = getVal('hero-name');
    portfolioData.personal.title = getVal('hero-title');
    portfolioData.personal.statusBadge = getVal('hero-status');
    portfolioData.personal.bio = getVal('hero-bio');
    portfolioData.personal.photoUrl = getVal('hero-photo');
    portfolioData.personal.resumeUrl = getVal('hero-resume');

    portfolioData.personal.stats = [
      { number: parseInt(getVal('stat1-number'), 10) || 0, suffix: '+', label: getVal('stat1-label') },
      { number: parseInt(getVal('stat2-number'), 10) || 0, suffix: '+', label: getVal('stat2-label') },
      { number: parseInt(getVal('stat3-number'), 10) || 0, suffix: '+', label: getVal('stat3-label') }
    ];

    saveAllData();
  });
}

function bindAboutForm() {
  const saveBtn = document.getElementById('save-about-btn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    portfolioData.about.paragraphs = [ getVal('about-p1'), getVal('about-p2') ];
    saveAllData();
  });
}

function bindContactForm() {
  const saveBtn = document.getElementById('save-contact-btn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', () => {
    portfolioData.contact = {
      email: getVal('contact-email'),
      phone: getVal('contact-phone'),
      location: getVal('contact-location'),
      social: {
        linkedin: getVal('social-linkedin'),
        github: getVal('social-github'),
        twitter: getVal('social-twitter'),
        instagram: getVal('social-instagram')
      }
    };
    saveAllData();
  });
}

function renderEducationList() {
  const container = document.getElementById('education-list');
  if (!container) return;
  container.innerHTML = '';

  const items = [...(portfolioData.education || []), ...(portfolioData.certifications || [])];
  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <h4>${item.title}</h4>
        <p>${item.institution} | ${item.year}</p>
      </div>
      <div class="item-actions">
        <button class="icon-btn danger" onclick="deleteEducationItem('${item.id}')" title="Delete Entry">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.deleteEducationItem = function(id) {
  portfolioData.education = (portfolioData.education || []).filter(i => i.id !== id);
  portfolioData.certifications = (portfolioData.certifications || []).filter(i => i.id !== id);
  renderEducationList();
  saveAllData();
};

document.getElementById('add-edu-btn')?.addEventListener('click', () => {
  const title = getVal('new-edu-title');
  const institution = getVal('new-edu-inst');
  const year = getVal('new-edu-year');
  const type = getVal('new-edu-type');

  if (!title || !institution) {
    showToast('Please fill in Title and Institution!', 'danger');
    return;
  }

  const newItem = {
    id: `edu-${Date.now()}`,
    year: year || '2024',
    title,
    institution,
    desc: 'Newly added qualification entry.',
    type
  };

  if (type === 'degree') {
    portfolioData.education.push(newItem);
  } else {
    portfolioData.certifications.push(newItem);
  }

  setVal('new-edu-title', '');
  setVal('new-edu-inst', '');
  setVal('new-edu-year', '');
  renderEducationList();
  saveAllData();
});

function renderSkillsLists() {
  const techContainer = document.getElementById('tech-skills-list');
  const softContainer = document.getElementById('soft-skills-list');

  if (techContainer) {
    techContainer.innerHTML = '';
    (portfolioData.skills?.technical || []).forEach((skill, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-info">
          <h4>${skill.name}</h4>
          <p>Proficiency: ${skill.level}%</p>
        </div>
        <div class="item-actions">
          <button class="icon-btn danger" onclick="deleteTechSkill(${idx})" title="Delete Skill">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      techContainer.appendChild(row);
    });
  }

  if (softContainer) {
    softContainer.innerHTML = '';
    (portfolioData.skills?.soft || []).forEach((skill, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-info">
          <h4><i class="${skill.icon || 'fas fa-check-circle'}"></i> ${skill.name}</h4>
        </div>
        <div class="item-actions">
          <button class="icon-btn danger" onclick="deleteSoftSkill(${idx})" title="Delete Skill">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      softContainer.appendChild(row);
    });
  }
}

window.deleteTechSkill = function(idx) {
  portfolioData.skills.technical.splice(idx, 1);
  renderSkillsLists();
  saveAllData();
};

window.deleteSoftSkill = function(idx) {
  portfolioData.skills.soft.splice(idx, 1);
  renderSkillsLists();
  saveAllData();
};

document.getElementById('add-tech-skill-btn')?.addEventListener('click', () => {
  const name = getVal('new-tech-name');
  const level = parseInt(getVal('new-tech-level'), 10) || 85;

  if (!name) {
    showToast('Enter skill name!', 'danger');
    return;
  }

  portfolioData.skills.technical.push({ name, level });
  setVal('new-tech-name', '');
  setVal('new-tech-level', '85');
  renderSkillsLists();
  saveAllData();
});

document.getElementById('add-soft-skill-btn')?.addEventListener('click', () => {
  const name = getVal('new-soft-name');
  const icon = getVal('new-soft-icon') || 'fas fa-star';

  if (!name) {
    showToast('Enter skill badge name!', 'danger');
    return;
  }

  portfolioData.skills.soft.push({ icon, name });
  setVal('new-soft-name', '');
  renderSkillsLists();
  saveAllData();
});

function renderProjectsList() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  container.innerHTML = '';

  (portfolioData.projects || []).forEach((proj, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <h4>${proj.title} <span style="font-size:0.75rem; color:var(--admin-gold); margin-left:8px;">[${proj.categoryLabel || proj.category}]</span></h4>
        <p>${proj.desc.substring(0, 80)}...</p>
      </div>
      <div class="item-actions">
        <button class="icon-btn danger" onclick="deleteProject(${idx})" title="Delete Project">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.deleteProject = function(idx) {
  portfolioData.projects.splice(idx, 1);
  renderProjectsList();
  saveAllData();
};

document.getElementById('add-project-btn')?.addEventListener('click', () => {
  const title = getVal('new-proj-title');
  const category = getVal('new-proj-category') || 'geopolitics';
  const desc = getVal('new-proj-desc');
  const image = getVal('new-proj-image') || 'assets/project1.png';
  const techStr = getVal('new-proj-tech');

  if (!title || !desc) {
    showToast('Title and Description are required!', 'danger');
    return;
  }

  const categoryLabelMap = { geopolitics: 'Geopolitics', elections: 'Elections', policy: 'Policy Briefs' };

  const newProj = {
    id: `proj-${Date.now()}`,
    title,
    category,
    categoryLabel: categoryLabelMap[category] || 'Analysis',
    desc,
    image,
    tech: techStr ? techStr.split(',').map(t => t.trim()) : ['Policy Analysis'],
    link: 'assets/resume.pdf',
    linkText: 'Read Brief',
    repo: 'https://github.com/fairoz-bashir'
  };

  portfolioData.projects.push(newProj);
  setVal('new-proj-title', '');
  setVal('new-proj-desc', '');
  setVal('new-proj-tech', '');
  renderProjectsList();
  saveAllData();
});

function renderMemoriesList() {
  const container = document.getElementById('memories-list');
  if (!container) return;
  container.innerHTML = '';

  (portfolioData.memories || []).forEach((mem, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <h4>${mem.title} <span style="font-size:0.75rem; color:var(--admin-gold); margin-left:8px;">[${mem.categoryLabel || mem.category}]</span></h4>
        <p>${mem.date} | ${mem.location}</p>
      </div>
      <div class="item-actions">
        <button class="icon-btn danger" onclick="deleteMemory(${idx})" title="Delete Memory">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.deleteMemory = function(idx) {
  portfolioData.memories.splice(idx, 1);
  renderMemoriesList();
  saveAllData();
};

document.getElementById('add-memory-btn')?.addEventListener('click', () => {
  const title = getVal('new-mem-title');
  const category = getVal('new-mem-category') || 'campus';
  const date = getVal('new-mem-date');
  const location = getVal('new-mem-location');
  const image = getVal('new-mem-image') || 'assets/memory1.png';
  const desc = getVal('new-mem-desc');

  if (!title || !desc) {
    showToast('Memory Title and Description are required!', 'danger');
    return;
  }

  const categoryLabelMap = { graduation: 'Graduation', debates: 'Debates & MUN', campus: 'Campus Life' };

  if (!portfolioData.memories) portfolioData.memories = [];

  const newMem = {
    id: `mem-${Date.now()}`,
    title,
    category,
    categoryLabel: categoryLabelMap[category] || 'Campus Life',
    date: date || 'June 2022',
    location: location || 'University Campus',
    image,
    desc
  };

  portfolioData.memories.push(newMem);
  setVal('new-mem-title', '');
  setVal('new-mem-date', '');
  setVal('new-mem-location', '');
  setVal('new-mem-desc', '');
  renderMemoriesList();
  saveAllData();
});

function renderExperienceList() {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';

  (portfolioData.experience || []).forEach((exp, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <h4>${exp.role} @ ${exp.company}</h4>
        <p>${exp.duration}</p>
      </div>
      <div class="item-actions">
        <button class="icon-btn danger" onclick="deleteExperience(${idx})" title="Delete Job">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.deleteExperience = function(idx) {
  portfolioData.experience.splice(idx, 1);
  renderExperienceList();
  saveAllData();
};

document.getElementById('add-exp-btn')?.addEventListener('click', () => {
  const role = getVal('new-exp-role');
  const company = getVal('new-exp-company');
  const duration = getVal('new-exp-duration');
  const resp1 = getVal('new-exp-resp1');
  const resp2 = getVal('new-exp-resp2');

  if (!role || !company) {
    showToast('Role and Company are required!', 'danger');
    return;
  }

  const newExp = {
    id: `exp-${Date.now()}`,
    role,
    company,
    duration: duration || '2024 – Present',
    responsibilities: [resp1, resp2].filter(Boolean)
  };

  portfolioData.experience.push(newExp);
  setVal('new-exp-role', '');
  setVal('new-exp-company', '');
  setVal('new-exp-duration', '');
  setVal('new-exp-resp1', '');
  setVal('new-exp-resp2', '');
  renderExperienceList();
  saveAllData();
});

function saveAllData() {
  if (!portfolioData) return;
  localStorage.setItem('fb_portfolio_data', JSON.stringify(portfolioData));
  showToast('All changes saved to LocalStorage! Live UI updated.', 'success');
}

function exportDataJSON() {
  if (!portfolioData) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(portfolioData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "Fairoz_Bashir_Portfolio_Data.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Portfolio JSON backup file downloaded!', 'success');
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      portfolioData = JSON.parse(evt.target.result);
      saveAllData();
      populateAllForms();
      showToast('Portfolio data imported successfully!', 'success');
    } catch (err) {
      showToast('Invalid JSON file format!', 'danger');
    }
  };
  reader.readAsText(file);
}

function updatePasscode() {
  const newPass = getVal('new-passcode');
  if (!newPass || newPass.length < 4) {
    showToast('Passcode must be at least 4 characters!', 'danger');
    return;
  }
  localStorage.setItem('fb_admin_passcode', newPass);
  setVal('new-passcode', '');
  showToast('Admin Passcode updated successfully!', 'success');
}

function resetToDefaults() {
  if (confirm('Are you sure you want to reset all portfolio data to factory defaults?')) {
    localStorage.removeItem('fb_portfolio_data');
    location.reload();
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('fb_admin_auth');
  location.reload();
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
