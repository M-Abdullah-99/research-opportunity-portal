/**
 * University Research Opportunity Portal Frontend Logic
 * Implements CRUD operations, validation, modal interactions, search, and toasts.
 */

// State Management
let opportunities = [];
let selectedOpportunity = null;
let deleteTargetId = null;

// DOM Elements
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessageText = document.getElementById('errorMessageText');
const opportunitiesGrid = document.getElementById('opportunitiesGrid');
const resultsCount = document.getElementById('resultsCount');

// Stats Elements
const statOpen = document.getElementById('statOpen');
const statClosed = document.getElementById('statClosed');
const statTotal = document.getElementById('statTotal');
const statSlots = document.getElementById('statSlots');

// Filter & Search Elements
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const statusFilter = document.getElementById('statusFilter');
const departmentFilter = document.getElementById('departmentFilter');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');

// Modals
const viewModal = document.getElementById('viewModal');
const formModal = document.getElementById('formModal');
const deleteModal = document.getElementById('deleteModal');

// Form Elements
const opportunityForm = document.getElementById('opportunityForm');
const formModalTitle = document.getElementById('formModalTitle');
const formOpportunityId = document.getElementById('formOpportunityId');
const formTitle = document.getElementById('formTitle');
const formFaculty = document.getElementById('formFaculty');
const formDepartment = document.getElementById('formDepartment');
const formArea = document.getElementById('formArea');
const formPositions = document.getElementById('formPositions');
const formDeadline = document.getElementById('formDeadline');
const formStatus = document.getElementById('formStatus');
const formSkills = document.getElementById('formSkills');
const formDescription = document.getElementById('formDescription');
const submitBtnText = document.getElementById('submitBtnText');
const formErrorAlert = document.getElementById('formErrorAlert');

// Delete Elements
const deleteTargetTitle = document.getElementById('deleteTargetTitle');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' 
    ? '<i class="fa-solid fa-circle-check"></i>' 
    : '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.innerHTML = `
    ${icon}
    <div class="toast-content">${escapeHTML(message)}</div>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Utility to escape HTML to prevent XSS
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// API CLIENT CALLS
// ==========================================

// 1. Fetch All Opportunities
async function fetchOpportunities() {
  setUIState('loading');
  try {
    const res = await fetch('/api/opportunities');
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to load research opportunities.');
    }

    opportunities = json.data || [];
    populateDepartmentFilter();
    updateStats();
    renderFilteredOpportunities();
  } catch (err) {
    console.error('Fetch error:', err);
    errorMessageText.textContent = err.message || 'Could not connect to backend server. Make sure MySQL is running.';
    setUIState('error');
  }
}

// 2. Fetch Single Opportunity by ID
async function fetchOpportunityById(id) {
  try {
    const res = await fetch(`/api/opportunities/${id}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Could not retrieve opportunity details.');
    }
    return json.data;
  } catch (err) {
    showToast(err.message, 'error');
    return null;
  }
}

// 3. Create or Update Opportunity (Form Submission)
async function saveOpportunity(e) {
  e.preventDefault();
  clearFormErrors();

  const id = formOpportunityId.value.trim();
  const isEditing = Boolean(id);

  const payload = {
    title: formTitle.value.trim(),
    faculty_name: formFaculty.value.trim(),
    department: formDepartment.value.trim(),
    area: formArea.value.trim(),
    available_positions: parseInt(formPositions.value, 10),
    deadline: formDeadline.value,
    status: formStatus.value,
    required_skills: formSkills.value.trim(),
    description: formDescription.value.trim()
  };

  // Client-side Validation
  const errors = validateFormData(payload);
  if (errors.length > 0) {
    displayFormErrors(errors);
    return;
  }

  const endpoint = isEditing ? `/api/opportunities/${id}` : '/api/opportunities';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    submitBtnText.textContent = isEditing ? 'Updating...' : 'Saving...';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      if (json.errors && Array.isArray(json.errors)) {
        displayFormErrors(json.errors);
      } else {
        throw new Error(json.message || 'Failed to save opportunity.');
      }
      return;
    }

    closeModal('formModal');
    showToast(json.message || (isEditing ? 'Opportunity updated successfully.' : 'Opportunity created successfully.'));
    await fetchOpportunities();
  } catch (err) {
    console.error('Save error:', err);
    displayFormErrors([err.message]);
  } finally {
    submitBtnText.textContent = isEditing ? 'Update Opportunity' : 'Save Opportunity';
  }
}

// 4. Toggle Opportunity Status (Open <-> Closed)
async function toggleOpportunityStatus(id, currentStatus) {
  const newStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
  try {
    const res = await fetch(`/api/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update opportunity status.');
    }

    showToast(`Status changed to ${newStatus}.`);
    await fetchOpportunities();
  } catch (err) {
    console.error('Toggle status error:', err);
    showToast(err.message, 'error');
  }
}

// 5. Delete Opportunity
async function deleteOpportunity() {
  if (!deleteTargetId) return;

  try {
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

    const res = await fetch(`/api/opportunities/${deleteTargetId}`, {
      method: 'DELETE'
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete research opportunity.');
    }

    closeModal('deleteModal');
    showToast(json.message || 'Opportunity deleted successfully.');
    deleteTargetId = null;
    await fetchOpportunities();
  } catch (err) {
    console.error('Delete error:', err);
    showToast(err.message, 'error');
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete Permanently';
  }
}

// ==========================================
// FORM VALIDATION
// ==========================================
function validateFormData(data) {
  const errors = [];
  if (!data.title) {
    errors.push({ field: 'Title', msg: 'Title is required.' });
  }
  if (!data.faculty_name) {
    errors.push({ field: 'Faculty', msg: 'Faculty supervisor name is required.' });
  }
  if (!data.department) {
    errors.push({ field: 'Department', msg: 'Department is required.' });
  }
  if (!data.area) {
    errors.push({ field: 'Area', msg: 'Research area is required.' });
  }
  if (isNaN(data.available_positions) || data.available_positions <= 0) {
    errors.push({ field: 'Positions', msg: 'Available positions must be at least 1.' });
  }
  if (!data.deadline) {
    errors.push({ field: 'Deadline', msg: 'Application deadline is required.' });
  }
  if (!data.required_skills) {
    errors.push({ field: 'Skills', msg: 'Required skills are required.' });
  }
  if (!data.description) {
    errors.push({ field: 'Description', msg: 'Research description is required.' });
  }
  return errors;
}

function displayFormErrors(errors) {
  formErrorAlert.style.display = 'block';
  
  if (typeof errors[0] === 'string') {
    formErrorAlert.innerHTML = errors.map(e => `<div>• ${escapeHTML(e)}</div>`).join('');
  } else {
    formErrorAlert.innerHTML = errors.map(e => `<div>• ${escapeHTML(e.msg)}</div>`).join('');
    errors.forEach(e => {
      const errSpan = document.getElementById(`err${e.field}`);
      const inputEl = document.getElementById(`form${e.field}`);
      if (errSpan) errSpan.textContent = e.msg;
      if (inputEl) inputEl.classList.add('is-invalid');
    });
  }
}

function clearFormErrors() {
  formErrorAlert.style.display = 'none';
  formErrorAlert.innerHTML = '';
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
}

// ==========================================
// UI RENDERING & FILTERING
// ==========================================
function setUIState(state) {
  loadingState.style.display = state === 'loading' ? 'block' : 'none';
  emptyState.style.display = state === 'empty' ? 'block' : 'none';
  errorState.style.display = state === 'error' ? 'block' : 'none';
  opportunitiesGrid.style.display = state === 'grid' ? 'grid' : 'none';
}

function updateStats() {
  const openCount = opportunities.filter(o => o.status === 'Open').length;
  const closedCount = opportunities.filter(o => o.status === 'Closed').length;
  const totalSlots = opportunities
    .filter(o => o.status === 'Open')
    .reduce((sum, o) => sum + (parseInt(o.available_positions, 10) || 0), 0);

  statOpen.textContent = openCount;
  statClosed.textContent = closedCount;
  statTotal.textContent = opportunities.length;
  statSlots.textContent = totalSlots;
}

function populateDepartmentFilter() {
  const currentDept = departmentFilter.value;
  const departments = [...new Set(opportunities.map(o => o.department).filter(Boolean))].sort();

  departmentFilter.innerHTML = '<option value="ALL">All Departments</option>';
  departments.forEach(dept => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    if (dept === currentDept) opt.selected = true;
    departmentFilter.appendChild(opt);
  });
}

function renderFilteredOpportunities() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedStatus = statusFilter.value;
  const selectedDept = departmentFilter.value;

  const filtered = opportunities.filter(opp => {
    // Status filter
    if (selectedStatus !== 'ALL' && opp.status !== selectedStatus) return false;
    // Dept filter
    if (selectedDept !== 'ALL' && opp.department !== selectedDept) return false;
    // Query search
    if (query) {
      const matchTitle = (opp.title || '').toLowerCase().includes(query);
      const matchFaculty = (opp.faculty_name || '').toLowerCase().includes(query);
      const matchArea = (opp.area || '').toLowerCase().includes(query);
      const matchSkills = (opp.required_skills || '').toLowerCase().includes(query);
      const matchDept = (opp.department || '').toLowerCase().includes(query);
      return matchTitle || matchFaculty || matchArea || matchSkills || matchDept;
    }
    return true;
  });

  resultsCount.textContent = `${filtered.length} opportunity${filtered.length === 1 ? '' : 'ies'}`;

  if (filtered.length === 0) {
    setUIState('empty');
    return;
  }

  setUIState('grid');
  opportunitiesGrid.innerHTML = filtered.map(opp => createOpportunityCardHTML(opp)).join('');

  // Attach card event listeners
  attachCardEvents();
}

function createOpportunityCardHTML(opp) {
  const isOpen = opp.status === 'Open';
  const badgeClass = isOpen ? 'badge-open' : 'badge-closed';
  const badgeIcon = isOpen ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>';
  const toggleIcon = isOpen ? 'fa-lock' : 'fa-lock-open';
  const toggleTitle = isOpen ? 'Close Opportunity' : 'Reopen Opportunity';

  const skills = (opp.required_skills || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const skillsHTML = skills.slice(0, 4)
    .map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`)
    .join('') + (skills.length > 4 ? `<span class="skill-tag">+${skills.length - 4} more</span>` : '');

  return `
    <article class="opp-card" data-id="${opp.id}">
      <div>
        <div class="opp-card-header">
          <span class="opp-area">${escapeHTML(opp.area)}</span>
          <span class="badge ${badgeClass}">${badgeIcon} ${escapeHTML(opp.status)}</span>
        </div>
        <h3 class="opp-title">${escapeHTML(opp.title)}</h3>
        <p class="opp-description">${escapeHTML(opp.description)}</p>

        <div class="opp-meta">
          <div class="opp-meta-row">
            <span><i class="fa-solid fa-user-tie"></i> Faculty:</span>
            <strong>${escapeHTML(opp.faculty_name)}</strong>
          </div>
          <div class="opp-meta-row">
            <span><i class="fa-solid fa-building-columns"></i> Dept:</span>
            <span>${escapeHTML(opp.department)}</span>
          </div>
          <div class="opp-meta-row">
            <span><i class="fa-solid fa-users"></i> Available Positions:</span>
            <strong>${opp.available_positions}</strong>
          </div>
          <div class="opp-meta-row">
            <span><i class="fa-regular fa-calendar-check"></i> Deadline:</span>
            <span>${formatDate(opp.deadline)}</span>
          </div>
        </div>

        <div class="skills-tags">
          ${skillsHTML}
        </div>
      </div>

      <div class="opp-card-actions">
        <button class="btn btn-secondary btn-sm view-btn" data-id="${opp.id}">
          <i class="fa-regular fa-eye"></i> View Details
        </button>

        <div style="display: flex; gap: 0.35rem;">
          <button class="btn-icon status-btn" data-id="${opp.id}" data-status="${opp.status}" title="${toggleTitle}">
            <i class="fa-solid ${toggleIcon}"></i>
          </button>
          <button class="btn-icon edit-btn" data-id="${opp.id}" title="Edit Opportunity">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon danger delete-btn" data-id="${opp.id}" data-title="${escapeHTML(opp.title)}" title="Delete Opportunity">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function attachCardEvents() {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => openViewModal(btn.dataset.id));
  });

  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleOpportunityStatus(btn.dataset.id, btn.dataset.status));
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.title));
  });
}

// ==========================================
// MODAL CONTROLS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Open View Details Modal
async function openViewModal(id) {
  const opp = opportunities.find(o => o.id == id) || await fetchOpportunityById(id);
  if (!opp) return;

  selectedOpportunity = opp;
  document.getElementById('modalTitle').textContent = opp.title;
  document.getElementById('modalFaculty').textContent = opp.faculty_name;
  document.getElementById('modalDepartment').textContent = opp.department;
  document.getElementById('modalArea').textContent = opp.area;
  document.getElementById('modalPositions').textContent = `${opp.available_positions} student position(s)`;
  document.getElementById('modalDeadline').textContent = formatDate(opp.deadline);
  document.getElementById('modalId').textContent = `#${opp.id}`;
  document.getElementById('modalDescription').textContent = opp.description;

  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.className = `badge ${opp.status === 'Open' ? 'badge-open' : 'badge-closed'}`;
  statusBadge.textContent = opp.status;

  const skillsContainer = document.getElementById('modalSkillsList');
  skillsContainer.innerHTML = (opp.required_skills || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<span class="skill-tag">${escapeHTML(s)}</span>`)
    .join('');

  openModal('viewModal');
}

// Open Create Modal
function openCreateModal() {
  opportunityForm.reset();
  formOpportunityId.value = '';
  formModalTitle.textContent = 'Post New Research Opportunity';
  submitBtnText.textContent = 'Save Opportunity';
  formStatus.value = 'Open';
  clearFormErrors();

  // Set default deadline to 30 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  formDeadline.value = defaultDate.toISOString().split('T')[0];

  openModal('formModal');
}

// Open Edit Modal
async function openEditModal(id) {
  const opp = opportunities.find(o => o.id == id) || await fetchOpportunityById(id);
  if (!opp) return;

  clearFormErrors();
  formOpportunityId.value = opp.id;
  formModalTitle.textContent = `Edit Research Opportunity #${opp.id}`;
  submitBtnText.textContent = 'Update Opportunity';

  formTitle.value = opp.title || '';
  formFaculty.value = opp.faculty_name || '';
  formDepartment.value = opp.department || '';
  formArea.value = opp.area || '';
  formPositions.value = opp.available_positions || 1;
  formDeadline.value = opp.deadline ? opp.deadline.split('T')[0] : '';
  formStatus.value = opp.status || 'Open';
  formSkills.value = opp.required_skills || '';
  formDescription.value = opp.description || '';

  closeModal('viewModal');
  openModal('formModal');
}

// Open Delete Modal
function openDeleteModal(id, title) {
  deleteTargetId = id;
  deleteTargetTitle.textContent = title ? `"${title}" (ID: #${id})` : `Opportunity #${id}`;
  openModal('deleteModal');
}

// ==========================================
// EVENT LISTENERS INITIALIZATION
// ==========================================
function initEvents() {
  // Modal close triggers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close modals on outside click
  window.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id);
    }
  });

  // Close modals on ESC
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['viewModal', 'formModal', 'deleteModal'].forEach(closeModal);
    }
  });

  // Header buttons
  document.getElementById('openCreateModalBtn').addEventListener('click', openCreateModal);
  document.getElementById('emptyPostBtn').addEventListener('click', openCreateModal);
  refreshBtn.addEventListener('click', () => {
    showToast('Refreshing listings...');
    fetchOpportunities();
  });
  retryBtn.addEventListener('click', fetchOpportunities);

  // Detail Modal Edit Button
  document.getElementById('modalEditBtn').addEventListener('click', () => {
    if (selectedOpportunity) {
      openEditModal(selectedOpportunity.id);
    }
  });

  // Form Submission
  opportunityForm.addEventListener('submit', saveOpportunity);

  // Delete Confirmation
  confirmDeleteBtn.addEventListener('click', deleteOpportunity);

  // Search Input with debounce
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderFilteredOpportunities, 200);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderFilteredOpportunities();
    searchInput.focus();
  });

  // Filters
  statusFilter.addEventListener('change', renderFilteredOpportunities);
  departmentFilter.addEventListener('change', renderFilteredOpportunities);
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchOpportunities();
});
