/**
 * ============================================================
 * 🏛️ اتحاد طلاب تحيا مصر - محافظة المنوفية
 * Admin Dashboard Logic & CRUD Controller
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const userNavActions = document.getElementById('user-nav-actions');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  const statNewsCount = document.getElementById('stat-news-count');
  const statEventsCount = document.getElementById('stat-events-count');
  const statJoinCount = document.getElementById('stat-join-count');
  const statContactCount = document.getElementById('stat-contact-count');
  const statDbStatus = document.getElementById('stat-db-status');

  const newsTableBody = document.getElementById('news-table-body');
  const eventsTableBody = document.getElementById('events-table-body');
  const joinTableBody = document.getElementById('join-table-body');
  const contactTableBody = document.getElementById('contact-table-body');
  const boardTableBody = document.getElementById('board-table-body');

  const newsModal = document.getElementById('news-modal');
  const eventModal = document.getElementById('event-modal');
  const detailsModal = document.getElementById('details-modal');
  const boardModal = document.getElementById('board-modal');
  const detailsModalTitle = document.getElementById('details-modal-title');
  const detailsModalContent = document.getElementById('details-modal-content');
  const boardModalTitle = document.getElementById('board-modal-title');

  const newsForm = document.getElementById('news-form');
  const eventForm = document.getElementById('event-form');
  const boardForm = document.getElementById('board-form');
  const addBoardBtn = document.getElementById('add-board-btn');

  let currentNewsList = [];
  let currentEventsList = [];
  let currentJoinList = [];
  let currentContactList = [];
  let currentBoardList = [];

  // ==================== CUSTOM ALERT & CONFIRM DIALOGS ====================
  const dialogModal = document.getElementById('custom-dialog-modal');
  const dialogIcon = document.getElementById('dialog-icon');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogMessage = document.getElementById('dialog-message');
  const dialogCancelBtn = document.getElementById('dialog-cancel-btn');
  const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');

  function showConfirmDialog(message, title = 'تأكيد الإجراء', icon = '🗑️', confirmText = 'نعم، إتمام الحذف 🗑️', isDanger = true) {
    return new Promise((resolve) => {
      if (!dialogModal) {
        resolve(confirm(message));
        return;
      }

      dialogIcon.textContent = icon;
      dialogTitle.textContent = title;
      dialogMessage.textContent = message;
      dialogCancelBtn.style.display = 'inline-flex';
      dialogConfirmBtn.textContent = confirmText;

      if (isDanger) {
        dialogConfirmBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        dialogConfirmBtn.style.borderColor = '#e74c3c';
        dialogConfirmBtn.style.color = '#ffffff';
      } else {
        dialogConfirmBtn.style.background = 'var(--gradient-primary)';
        dialogConfirmBtn.style.borderColor = 'transparent';
        dialogConfirmBtn.style.color = '#ffffff';
      }

      dialogModal.classList.add('active');

      const handleConfirm = () => {
        cleanup();
        resolve(true);
      };

      const handleCancel = () => {
        cleanup();
        resolve(false);
      };

      const cleanup = () => {
        dialogConfirmBtn.removeEventListener('click', handleConfirm);
        dialogCancelBtn.removeEventListener('click', handleCancel);
        dialogModal.classList.remove('active');
      };

      dialogConfirmBtn.addEventListener('click', handleConfirm);
      dialogCancelBtn.addEventListener('click', handleCancel);
    });
  }

  function showAlertDialog(message, title = 'تنبيه', icon = '💡') {
    return new Promise((resolve) => {
      if (!dialogModal) {
        alert(message);
        resolve(true);
        return;
      }

      dialogIcon.textContent = icon;
      dialogTitle.textContent = title;
      dialogMessage.textContent = message;
      dialogCancelBtn.style.display = 'none';
      dialogConfirmBtn.textContent = 'حسناً 👍';
      dialogConfirmBtn.style.background = 'var(--gradient-primary)';
      dialogConfirmBtn.style.borderColor = 'transparent';

      dialogModal.classList.add('active');

      const handleConfirm = () => {
        dialogConfirmBtn.removeEventListener('click', handleConfirm);
        dialogModal.classList.remove('active');
        resolve(true);
      };

      dialogConfirmBtn.addEventListener('click', handleConfirm);
    });
  }

  // ==================== 1. AUTHENTICATION FLOW ====================
  async function checkAuth() {
    try {
      const user = await window.TMSU_API.getCurrentUser();
      if (user) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        userNavActions.style.display = 'flex';
        updateDbStatusBadge();
        loadDashboardData();
      } else {
        authSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
        userNavActions.style.display = 'none';
      }
    } catch (e) {
      authSection.style.display = 'flex';
      dashboardSection.style.display = 'none';
      userNavActions.style.display = 'none';
    }
  }

  function updateDbStatusBadge() {
    if (!statDbStatus) return;
    if (window.TMSU_API.isConfigured()) {
      statDbStatus.className = 'db-status-pill online';
      statDbStatus.innerHTML = '<span class="status-pulse"></span> سحابي مباشر (تحديث لحظي 🔴)';
    } else {
      statDbStatus.className = 'db-status-pill offline';
      statDbStatus.innerHTML = '<span class="status-pulse"></span> ديمو محلي (تحديث تلقائي ⚡)';
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      await window.TMSU_API.login(email, password);
      checkAuth();
    } catch (err) {
      await showAlertDialog(err.message || 'بيانات غير صحيحة', 'خطأ في تسجيل الدخول ❌', '🔒');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await window.TMSU_API.logout();
    checkAuth();
  });

  // ==================== 2. TABS NAVIGATION ====================
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.style.display = 'block';
      if (tabId === 'tab-board') renderBoardMembers();
      if (tabId === 'tab-top-members') renderTopMembers();
    });
  });

  // ==================== 3. DATA LOADING & RENDERING ====================
  let realtimeSub = null;
  let autoPollingTimer = null;
  let lastJoinCount = -1;
  let lastContactCount = -1;

  async function loadDashboardData() {
    await Promise.all([renderNews(), renderEvents(), renderJoinApplications(), renderContactMessages(), renderBoardMembers(), renderTopMembers()]);

    // 🔴 1. Supabase Realtime Subscription
    if (!realtimeSub && window.TMSU_API?.subscribeToRealtimeChanges) {
      realtimeSub = window.TMSU_API.subscribeToRealtimeChanges(async (table) => {
        if (table === 'join_applications') {
          await renderJoinApplications();
          if (window.showToast) window.showToast('🔔 وصل طلب انضمام جديد الآن!');
        } else if (table === 'contact_messages') {
          await renderContactMessages();
          if (window.showToast) window.showToast('💬 وصلتك رسالة تواصل جديدة الآن!');
        }
      });
    }

    // ⚡ 2. Silent Auto-Polling Fallback (Every 4 Seconds)
    if (!autoPollingTimer) {
      autoPollingTimer = setInterval(async () => {
        try {
          const freshJoin = await window.TMSU_API.fetchJoinApplications();
          if (freshJoin.length !== lastJoinCount) {
            currentJoinList = freshJoin;
            if (statJoinCount) statJoinCount.textContent = currentJoinList.length;
            if (lastJoinCount !== -1 && freshJoin.length > lastJoinCount && window.showToast) {
              window.showToast('🔔 وصل طلب انضمام جديد الآن!');
            }
            lastJoinCount = freshJoin.length;
            renderJoinTableRowsOnly();
          }

          const freshContact = await window.TMSU_API.fetchContactMessages();
          if (freshContact.length !== lastContactCount) {
            currentContactList = freshContact;
            if (statContactCount) statContactCount.textContent = currentContactList.length;
            if (lastContactCount !== -1 && freshContact.length > lastContactCount && window.showToast) {
              window.showToast('💬 وصلتك رسالة تواصل جديدة الآن!');
            }
            lastContactCount = freshContact.length;
            renderContactTableRowsOnly();
          }
        } catch (e) {}
      }, 4000);
    }
  }

  // --- Render News ---
  async function renderNews() {
    newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentNewsList = await window.TMSU_API.fetchNews();
      statNewsCount.textContent = currentNewsList.length;

      if (currentNewsList.length === 0) {
        newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">لا يوجد أخبار حالياً</td></tr>';
        return;
      }

      newsTableBody.innerHTML = currentNewsList.map(item => `
        <tr>
          <td><img src="${item.image_url || 'https://placehold.co/100x60'}" class="table-thumb" alt="Thumb"></td>
          <td style="font-weight: var(--fw-semibold);">${item.title_ar}</td>
          <td><span class="badge badge-primary">${item.category || 'أخبار'}</span></td>
          <td>${item.is_featured ? '<span class="badge badge-success">نعم ⭐</span>' : 'لا'}</td>
          <td>${new Date(item.created_at || Date.now()).toLocaleDateString('ar-EG')}</td>
          <td>
            <button class="btn btn--outline btn--sm edit-news-btn" data-id="${item.id}" style="margin-left: 5px;">✏️ تعديل</button>
            <button class="btn btn--outline btn--sm delete-news-btn" data-id="${item.id}" style="color: #e74c3c; border-color: #e74c3c;">🗑️ حذف</button>
          </td>
        </tr>
      `).join('');

      attachNewsActionListeners();
    } catch (e) {
      console.error('Error rendering news:', e);
      newsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل الأخبار</td></tr>';
    }
  }

  // --- Render Events ---
  async function renderEvents() {
    eventsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentEventsList = await window.TMSU_API.fetchEvents();
      statEventsCount.textContent = currentEventsList.length;

      if (currentEventsList.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">لا يوجد فعاليات حالياً</td></tr>';
        return;
      }

      eventsTableBody.innerHTML = currentEventsList.map(item => `
        <tr>
          <td><img src="${item.image_url || 'https://placehold.co/100x60'}" class="table-thumb" alt="Thumb"></td>
          <td style="font-weight: var(--fw-semibold);">${item.title_ar}</td>
          <td>${item.event_date || 'غير محدد'}</td>
          <td>${item.location_ar || 'المنوفية'}</td>
          <td><span class="badge badge-primary">${item.category || 'عام'}</span></td>
          <td>
            <button class="btn btn--outline btn--sm edit-event-btn" data-id="${item.id}" style="margin-left: 5px;">✏️ تعديل</button>
            <button class="btn btn--outline btn--sm delete-event-btn" data-id="${item.id}" style="color: #e74c3c; border-color: #e74c3c;">🗑️ حذف</button>
          </td>
        </tr>
      `).join('');

      attachEventsActionListeners();
    } catch (e) {
      console.error('Error rendering events:', e);
      eventsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل الفعاليات</td></tr>';
    }
  }

  // --- Render Join Applications ---
  async function renderJoinApplications() {
    if (!joinTableBody) return;
    joinTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentJoinList = await window.TMSU_API.fetchJoinApplications();
      lastJoinCount = currentJoinList.length;
      if (statJoinCount) statJoinCount.textContent = currentJoinList.length;
      renderJoinTableRowsOnly();
    } catch (e) {
      console.error('Error rendering join applications:', e);
      joinTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل الطلبات</td></tr>';
    }
  }

  function renderJoinTableRowsOnly() {
    if (!joinTableBody) return;
    if (currentJoinList.length === 0) {
      joinTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">لا توجد طلبات انضمام مقدمة حتى الآن</td></tr>';
      return;
    }

    joinTableBody.innerHTML = currentJoinList.map(item => `
      <tr>
        <td style="font-weight: var(--fw-bold); white-space: nowrap;">${item.full_name || 'متقدم'}</td>
        <td style="white-space: nowrap;"><a href="tel:${item.phone}" style="color: var(--clr-accent); font-weight: 600;">${item.phone || 'غير محدد'}</a></td>
        <td style="white-space: nowrap;">${item.email || 'غير محدد'}</td>
        <td>${item.university || 'غير محدد'} ${item.faculty ? '- ' + item.faculty : ''}</td>
        <td style="white-space: nowrap;"><span class="badge badge-committee">${item.committee || 'عام'}</span></td>
        <td style="white-space: nowrap; font-size: 0.82rem;">${new Date(item.created_at || Date.now()).toLocaleDateString('ar-EG')}</td>
        <td style="white-space: nowrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn--outline btn--sm view-join-btn" data-id="${item.id}">👁️ التفاصيل</button>
            <button class="btn btn--outline btn--sm delete-join-btn" data-id="${item.id}" style="color: #e74c3c; border-color: rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08);">🗑️ حذف</button>
          </div>
        </td>
      </tr>
    `).join('');

    attachJoinActionListeners();
  }

  function attachJoinActionListeners() {
    document.querySelectorAll('.view-join-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const app = currentJoinList.find(a => String(a.id) === String(id));
        if (app) showJoinDetails(app);
      });
    });

    document.querySelectorAll('.delete-join-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف طلب الانضمام هذا؟ لا يمكن الاسترجاع بعد الحذف.', 'حذف طلب انضمام', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteJoinApplication(id);
          await renderJoinApplications();
        }
      });
    });
  }

  function showJoinDetails(app) {
    if (!detailsModal || !detailsModalContent) return;
    detailsModalTitle.textContent = `تفاصيل طلب انضمام: ${app.full_name || 'متقدم'}`;
    detailsModalContent.innerHTML = `
      <div style="display: grid; gap: 12px; font-size: var(--fs-md);">
        <div><strong>👤 الاسم بالكامل:</strong> ${app.full_name || 'غير محدد'}</div>
        <div><strong>🆔 تفاصيل:</strong> ${app.national_id || 'غير محدد'}</div>
        <div><strong>📞 رقم الهاتف:</strong> <a href="tel:${app.phone}" style="color: var(--clr-accent); font-weight: bold;">${app.phone || 'غير محدد'}</a></div>
        <div><strong>📧 البريد الإلكتروني:</strong> <a href="mailto:${app.email}" style="color: var(--clr-accent);">${app.email || 'غير محدد'}</a></div>
        <div><strong>🎓 الجامعة والكلية:</strong> ${app.university || 'غير محدد'}</div>
        <div><strong>🏛️ اللجنة المطلوبة:</strong> <span class="badge badge-committee">${app.committee || 'عام'}</span></div>
        <div><strong>📅 تاريخ تقديم الطلب:</strong> ${new Date(app.created_at || Date.now()).toLocaleString('ar-EG')}</div>
        ${app.notes ? `<div style="background: color-mix(in oklch, var(--text-primary) 5%, transparent); padding: 12px; border-radius: 8px; margin-top: 8px;"><strong>📝 دوافع الانضمام:</strong><br><p style="margin-top: 4px; line-height: 1.6;">${app.notes}</p></div>` : ''}
      </div>
    `;
    detailsModal.classList.add('active');
  }

  // --- Render Contact Messages ---
  async function renderContactMessages() {
    if (!contactTableBody) return;
    contactTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentContactList = await window.TMSU_API.fetchContactMessages();
      lastContactCount = currentContactList.length;
      if (statContactCount) statContactCount.textContent = currentContactList.length;
      renderContactTableRowsOnly();
    } catch (e) {
      console.error('Error rendering contact messages:', e);
      contactTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل الرسائل</td></tr>';
    }
  }

  function renderContactTableRowsOnly() {
    if (!contactTableBody) return;
    if (currentContactList.length === 0) {
      contactTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">لا توجد رسائل تواصل ملموسة حتى الآن</td></tr>';
      return;
    }

    contactTableBody.innerHTML = currentContactList.map(item => `
      <tr>
        <td style="font-weight: var(--fw-bold); white-space: nowrap;">${item.name || 'زائر'}</td>
        <td style="white-space: nowrap;">${item.email || 'غير محدد'}</td>
        <td style="white-space: nowrap;"><a href="tel:${item.phone}" style="color: var(--clr-accent); font-weight: 600;">${item.phone || 'غير محدد'}</a></td>
        <td style="white-space: nowrap;">${item.subject || 'استفسار عام'}</td>
        <td style="white-space: nowrap; font-size: 0.82rem;">${new Date(item.created_at || Date.now()).toLocaleDateString('ar-EG')}</td>
        <td style="white-space: nowrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn--outline btn--sm view-contact-btn" data-id="${item.id}">👁️ قراءة الرسالة</button>
            <button class="btn btn--outline btn--sm delete-contact-btn" data-id="${item.id}" style="color: #e74c3c; border-color: rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08);">🗑️ حذف</button>
          </div>
        </td>
      </tr>
    `).join('');

    attachContactActionListeners();
  }

  function attachContactActionListeners() {
    document.querySelectorAll('.view-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const msg = currentContactList.find(m => String(m.id) === String(id));
        if (msg) showContactDetails(msg);
      });
    });

    document.querySelectorAll('.delete-contact-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن استرجاعها بعد الحذف.', 'حذف رسالة تواصل', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteContactMessage(id);
          await renderContactMessages();
        }
      });
    });
  }

  function showContactDetails(msg) {
    if (!detailsModal || !detailsModalContent) return;
    const name = msg.name || 'زائر';
    const email = msg.email || 'غير محدد';
    const phone = msg.phone || 'غير محدد';
    const subject = msg.subject || 'استفسار عام';
    const dateStr = new Date(msg.created_at || Date.now()).toLocaleString('ar-EG');
    const messageText = msg.message || 'لا يوجد نص';

    if (detailsModalTitle) detailsModalTitle.textContent = `تفاصيل رسالة من: ${name}`;
    detailsModalContent.innerHTML = `
      <div style="display: grid; gap: 12px; font-size: var(--fs-md);">
        <div><strong>👤 الاسم:</strong> ${name}</div>
        <div><strong>📧 البريد الإلكتروني:</strong> <a href="mailto:${email}" style="color: var(--clr-accent); font-weight: bold;">${email}</a></div>
        <div><strong>📞 رقم الهاتف:</strong> <a href="tel:${phone}" style="color: var(--clr-accent); font-weight: bold;">${phone}</a></div>
        <div><strong>📌 الموضوع:</strong> ${subject}</div>
        <div><strong>📅 تاريخ الرسالة:</strong> ${dateStr}</div>
        <div style="background: color-mix(in oklch, var(--text-primary) 5%, transparent); padding: 16px; border-radius: 8px; margin-top: 8px;">
          <strong>💬 نص الرسالة:</strong><br>
          <p style="white-space: pre-wrap; margin-top: 8px; color: var(--text-primary); font-size: var(--fs-base); line-height: 1.6;">${messageText}</p>
        </div>
      </div>
    `;
    detailsModal.classList.add('active');
  }

  // --- Render Board Members (الهيكل القيادي والبورد) ---
  async function renderBoardMembers() {
    if (!boardTableBody) return;
    boardTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentBoardList = await window.TMSU_API.fetchBoardMembers();
      renderBoardTableRowsOnly();
    } catch (e) {
      console.error('Error rendering board members:', e);
      boardTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل البورد القيادي</td></tr>';
    }
  }

  function renderBoardTableRowsOnly() {
    if (!boardTableBody) return;
    if (currentBoardList.length === 0) {
      boardTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">لا يوجد أعضاء في الهيكل القيادي حالياً</td></tr>';
      return;
    }

    boardTableBody.innerHTML = currentBoardList.map(item => `
      <tr>
        <td><img src="${item.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" class="table-thumb" style="border-radius: 50%; width: 44px; height: 44px; object-fit: cover;" alt="${item.name}"></td>
        <td style="font-weight: var(--fw-bold); white-space: nowrap;">${item.name}</td>
        <td style="white-space: nowrap;"><span class="badge badge-primary">${item.title}</span></td>
        <td style="white-space: nowrap;"><span class="badge badge-committee">المستوى ${item.role_level || 1}</span></td>
        <td style="white-space: nowrap;">${item.committee || 'القيادة العامة'}</td>
        <td style="white-space: nowrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn--outline btn--sm edit-board-btn" data-id="${item.id}">✏️ تعديل</button>
            <button class="btn btn--outline btn--sm delete-board-btn" data-id="${item.id}" style="color: #e74c3c; border-color: rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08);">🗑️ حذف</button>
          </div>
        </td>
      </tr>
    `).join('');

    attachBoardActionListeners();
  }

  function attachBoardActionListeners() {
    document.querySelectorAll('.edit-board-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const member = currentBoardList.find(b => String(b.id) === String(id));
        if (member) openBoardModal(member);
      });
    });

    document.querySelectorAll('.delete-board-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف هذا القائد من البورد الهيكلي؟', 'حذف قائد قيادي', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteBoardMember(id);
          await renderBoardMembers();
        }
      });
    });
  }

  function openBoardModal(member = null) {
    if (!boardModal) return;
    boardForm?.reset();
    document.getElementById('board-preview-container').style.display = 'none';

    if (member) {
      if (boardModalTitle) boardModalTitle.textContent = 'تعديل بيانات القائد';
      document.getElementById('board-id').value = member.id;
      document.getElementById('board-name').value = member.name || '';
      document.getElementById('board-title').value = member.title || '';
      document.getElementById('board-level').value = member.role_level || 1;
      document.getElementById('board-committee').value = member.committee || 'مجلس إدارة الاتحاد';
      document.getElementById('board-image').value = member.image_url || '';
      document.getElementById('board-phone').value = member.phone || '';
      document.getElementById('board-linkedin').value = member.linkedin_url || '';

      if (member.image_url) {
        document.getElementById('board-preview-img').src = member.image_url;
        document.getElementById('board-preview-container').style.display = 'block';
      }
    } else {
      if (boardModalTitle) boardModalTitle.textContent = 'إضافة قائد جديد للبورد';
      document.getElementById('board-id').value = '';
    }
    boardModal.classList.add('active');
  }

  addBoardBtn?.addEventListener('click', () => openBoardModal());

  boardForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('board-id').value;
    const memberData = {
      name: document.getElementById('board-name').value.trim(),
      title: document.getElementById('board-title').value.trim(),
      role_level: parseInt(document.getElementById('board-level').value, 10) || 1,
      committee: document.getElementById('board-committee').value,
      image_url: document.getElementById('board-image').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: document.getElementById('board-phone').value.trim(),
      linkedin_url: document.getElementById('board-linkedin').value.trim()
    };

    if (id) {
      await window.TMSU_API.updateBoardMember(id, memberData);
    } else {
      await window.TMSU_API.addBoardMember(memberData);
    }

    boardModal.classList.remove('active');
    await renderBoardMembers();
  });

  const boardFileInput = document.getElementById('board-file-input');
  const boardImageInput = document.getElementById('board-image');
  const boardPreviewContainer = document.getElementById('board-preview-container');
  const boardPreviewImg = document.getElementById('board-preview-img');

  boardFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        boardImageInput.value = evt.target.result;
        boardPreviewImg.src = evt.target.result;
        boardPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Export to CSV / Excel Utility with UTF-8 BOM for Arabic Support ---
  function exportDataToExcel(filename, headers, rows) {
    if (!rows || rows.length === 0) {
      showAlertDialog('لا توجد بيانات متاحة للتصدير حالياً!', 'تصدير إكسيل 📊', 'ℹ️');
      return;
    }

    let csvContent = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

    rows.forEach(row => {
      const rowLine = row.map(val => {
        const cleanVal = (val === null || val === undefined) ? '' : String(val).replace(/"/g, '""').replace(/\n/g, ' ');
        return `"${cleanVal}"`;
      }).join(',');
      csvContent += rowLine + '\n';
    });

    // Add UTF-8 BOM (\uFEFF) so Excel opens Arabic correctly in proper columns
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Bind Export Buttons
  const exportJoinBtn = document.getElementById('export-join-btn');
  exportJoinBtn?.addEventListener('click', () => {
    const headers = ['الاسم بالكامل', 'رقم الهاتف', 'البريد الإلكتروني', 'الجامعة والكلية', 'اللجنة المطلوبة', 'التفاصيل/العمر', 'تاريخ الطلب', 'دوافع الانضمام'];
    const rows = currentJoinList.map(item => [
      item.full_name || '',
      item.phone || '',
      item.email || '',
      item.university || '',
      item.committee || '',
      item.national_id || '',
      new Date(item.created_at || Date.now()).toLocaleString('ar-EG'),
      item.notes || ''
    ]);
    exportDataToExcel('طلبات_الانضمام_اتحاد_طلاب_تحيا_مصر', headers, rows);
  });

  const exportContactBtn = document.getElementById('export-contact-btn');
  exportContactBtn?.addEventListener('click', () => {
    const headers = ['اسم الراسل', 'البريد الإلكتروني', 'رقم الهاتف', 'الموضوع', 'تاريخ الرسالة', 'نص الرسالة'];
    const rows = currentContactList.map(item => [
      item.name || '',
      item.email || '',
      item.phone || '',
      item.subject || '',
      new Date(item.created_at || Date.now()).toLocaleString('ar-EG'),
      item.message || ''
    ]);
    exportDataToExcel('رسائل_تواصل_معنا_اتحاد_طلاب_تحيا_مصر', headers, rows);
  });

  // ==================== 4. MODALS & CRUD OPERATIONS ====================

  const topModal = document.getElementById('top-member-modal');

  // Close modals
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      newsModal?.classList.remove('active');
      eventModal?.classList.remove('active');
      detailsModal?.classList.remove('active');
      boardModal?.classList.remove('active');
      topModal?.classList.remove('active');
    });
  });

  // --- File Upload & Preview Handlers ---
  const newsFileInput = document.getElementById('news-file-input');
  const newsImageInput = document.getElementById('news-image');
  const newsPreviewContainer = document.getElementById('news-preview-container');
  const newsPreviewImg = document.getElementById('news-preview-img');

  newsFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        newsImageInput.value = evt.target.result;
        newsPreviewImg.src = evt.target.result;
        newsPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  const eventFileInput = document.getElementById('event-file-input');
  const eventImageInput = document.getElementById('event-image');
  const eventPreviewContainer = document.getElementById('event-preview-container');
  const eventPreviewImg = document.getElementById('event-preview-img');

  eventFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        eventImageInput.value = evt.target.result;
        eventPreviewImg.src = evt.target.result;
        eventPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // --- News Modal Open ---
  document.getElementById('open-news-modal-btn').addEventListener('click', () => {
    document.getElementById('news-modal-title').textContent = 'إضافة خبر جديد';
    newsForm.reset();
    document.getElementById('news-id').value = '';
    newsPreviewContainer.style.display = 'none';
    newsModal.classList.add('active');
  });

  function attachNewsActionListeners() {
    document.querySelectorAll('.edit-news-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const news = currentNewsList.find(n => n.id === id);
        if (!news) return;

        document.getElementById('news-modal-title').textContent = 'تعديل الخبر';
        document.getElementById('news-id').value = news.id;
        document.getElementById('news-title-ar').value = news.title_ar || '';
        document.getElementById('news-title-en').value = news.title_en || '';
        document.getElementById('news-category').value = news.category || 'أخبار';
        document.getElementById('news-is-featured').checked = !!news.is_featured;
        document.getElementById('news-image').value = news.image_url || '';
        document.getElementById('news-content-ar').value = news.content_ar || '';

        if (news.image_url) {
          newsPreviewImg.src = news.image_url;
          newsPreviewContainer.style.display = 'block';
        } else {
          newsPreviewContainer.style.display = 'none';
        }

        newsModal.classList.add('active');
      });
    });

    document.querySelectorAll('.delete-news-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف هذا الخبر؟ لا يمكن الاسترجاع بعد الحذف.', 'حذف خبر', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteNews(id);
          await renderNews();
        }
      });
    });
  }

  newsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('news-id').value;
    const newsData = {
      title_ar: document.getElementById('news-title-ar').value.trim(),
      title_en: document.getElementById('news-title-en').value.trim(),
      category: document.getElementById('news-category').value,
      is_featured: document.getElementById('news-is-featured').checked,
      image_url: document.getElementById('news-image').value.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      content_ar: document.getElementById('news-content-ar').value.trim()
    };

    try {
      if (id) {
        await window.TMSU_API.updateNews(id, newsData);
      } else {
        await window.TMSU_API.addNews(newsData);
      }
      newsModal.classList.remove('active');
      await renderNews();
    } catch (err) {
      await showAlertDialog('حدث خطأ أثناء حفظ الخبر: ' + err.message, 'خطأ في الحفظ ❌', '⚠️');
    }
  });

  // --- Events Modal Open ---
  document.getElementById('open-event-modal-btn').addEventListener('click', () => {
    document.getElementById('event-modal-title').textContent = 'إضافة فعالية جديدة';
    eventForm.reset();
    document.getElementById('event-id').value = '';
    eventPreviewContainer.style.display = 'none';
    eventModal.classList.add('active');
  });

  function attachEventsActionListeners() {
    document.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const ev = currentEventsList.find(e => e.id === id);
        if (!ev) return;

        document.getElementById('event-modal-title').textContent = 'تعديل الفعالية';
        document.getElementById('event-id').value = ev.id;
        document.getElementById('event-title-ar').value = ev.title_ar || '';
        document.getElementById('event-date').value = ev.event_date || '';
        document.getElementById('event-category').value = ev.category || 'ورش عمل';
        document.getElementById('event-location-ar').value = ev.location_ar || '';
        document.getElementById('event-image').value = ev.image_url || '';
        document.getElementById('event-desc-ar').value = ev.description_ar || '';

        if (ev.image_url) {
          eventPreviewImg.src = ev.image_url;
          eventPreviewContainer.style.display = 'block';
        } else {
          eventPreviewContainer.style.display = 'none';
        }

        eventModal.classList.add('active');
      });
    });

    document.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف هذه الفعالية؟ لا يمكن الاسترجاع بعد الحذف.', 'حذف فعالية', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteEvent(id);
          await renderEvents();
        }
      });
    });
  }

  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('event-id').value;
    const eventData = {
      title_ar: document.getElementById('event-title-ar').value.trim(),
      event_date: document.getElementById('event-date').value,
      category: document.getElementById('event-category').value,
      location_ar: document.getElementById('event-location-ar').value.trim() || 'المنوفية',
      image_url: document.getElementById('event-image').value.trim() || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      description_ar: document.getElementById('event-desc-ar').value.trim()
    };

    try {
      if (id) {
        await window.TMSU_API.updateEvent(id, eventData);
      } else {
        await window.TMSU_API.addEvent(eventData);
      }
      eventModal.classList.remove('active');
      await renderEvents();
    } catch (err) {
      await showAlertDialog('حدث خطأ أثناء حفظ الفعالية: ' + err.message, 'خطأ في الحفظ ❌', '⚠️');
    }
  });

  // Clear All Data Handler
  document.getElementById('clear-all-data-btn')?.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog(
      'هل أنت متأكد من تفريغ ومسح جميع الأخبار والفعاليات والبيانات الحالية للبدء من جديد؟',
      'تأكيد المسح الشامل ⚠️',
      '🗑️',
      'نعم، مسح كافة البيانات 🗑️',
      true
    );
    if (confirmed) {
      await window.TMSU_API.deleteAllData();
      await loadDashboardData();
      await showAlertDialog('تم تفريغ كافة الأخبار والفعاليات والبيانات بنجاح!', 'تم المسح بنجاح ✅', '🎉');
    }
  });

  // --- Render Top Members (أعضاء الشهر المميزين) ---
  const topTableBody = document.getElementById('top-table-body');
  const statTopCount = document.getElementById('stat-top-count');
  const topModalTitle = document.getElementById('top-modal-title');
  const topForm = document.getElementById('top-member-form');
  const openTopModalBtn = document.getElementById('open-top-modal-btn');
  const topFileInput = document.getElementById('top-file-input');
  const topImageInput = document.getElementById('top-image');
  const topPreviewContainer = document.getElementById('top-preview-container');
  const topPreviewImg = document.getElementById('top-preview-img');
  let currentTopList = [];

  async function renderTopMembers() {
    if (!topTableBody) return;
    topTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">جاري التحميل...</td></tr>';
    try {
      currentTopList = await window.TMSU_API.fetchTopMembers();
      if (statTopCount) statTopCount.textContent = currentTopList.length;
      renderTopTableRowsOnly();
    } catch (e) {
      console.error('Error rendering top members:', e);
      topTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #e74c3c;">حدث خطأ أثناء تحميل أعضاء لوحة الشرف</td></tr>';
    }
  }

  function renderTopTableRowsOnly() {
    if (!topTableBody) return;
    if (currentTopList.length === 0) {
      topTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">لا يوجد أعضاء في لوحة الشرف حالياً</td></tr>';
      return;
    }

    topTableBody.innerHTML = currentTopList.map(item => `
      <tr>
        <td><img src="${item.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" class="table-thumb" style="border-radius: 50%; width: 44px; height: 44px; object-fit: cover;" alt="${item.name}"></td>
        <td style="font-weight: var(--fw-bold); white-space: nowrap;">${item.name}</td>
        <td style="white-space: nowrap;"><span class="badge badge-committee">${item.committee || item.title_or_role || 'عضو متميز'}</span></td>
        <td style="white-space: nowrap;"><span class="badge badge-primary">🌟 ${item.month_year || '2026'}</span></td>
        <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-secondary);">${item.achievement || 'تم التكريم للجهد المتميز باللجنة'}</td>
        <td style="white-space: nowrap;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn--outline btn--sm edit-top-btn" data-id="${item.id}">✏️ تعديل</button>
            <button class="btn btn--outline btn--sm delete-top-btn" data-id="${item.id}" style="color: #e74c3c; border-color: rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08);">🗑️ حذف</button>
          </div>
        </td>
      </tr>
    `).join('');

    attachTopActionListeners();
  }

  function attachTopActionListeners() {
    document.querySelectorAll('.edit-top-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const member = currentTopList.find(b => String(b.id) === String(id));
        if (member) openTopModal(member);
      });
    });

    document.querySelectorAll('.delete-top-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const confirmed = await showConfirmDialog('هل أنت متأكد من حذف هذا العضو من لوحة الشرف؟', 'حذف عضو متميز', '🗑️');
        if (confirmed) {
          await window.TMSU_API.deleteTopMember(id);
          await renderTopMembers();
        }
      });
    });
  }

  function openTopModal(member = null) {
    if (!topModal) return;
    topForm?.reset();
    if (topPreviewContainer) topPreviewContainer.style.display = 'none';

    if (member) {
      if (topModalTitle) topModalTitle.textContent = 'تعديل بيانات العضو المتميز';
      document.getElementById('top-id').value = member.id;
      document.getElementById('top-name').value = member.name || '';
      document.getElementById('top-committee').value = member.committee || member.title_or_role || '';
      document.getElementById('top-month').value = member.month_year || '';
      document.getElementById('top-image').value = member.image_url || '';
      document.getElementById('top-achievement').value = member.achievement || '';

      if (member.image_url && topPreviewImg && topPreviewContainer) {
        topPreviewImg.src = member.image_url;
        topPreviewContainer.style.display = 'block';
      }
    } else {
      if (topModalTitle) topModalTitle.textContent = 'إضافة عضو متميز جديد لوحة الشرف';
      document.getElementById('top-id').value = '';
    }

    topModal.classList.add('active');
  }

  openTopModalBtn?.addEventListener('click', () => openTopModal(null));

  topFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        if (topImageInput) topImageInput.value = evt.target.result;
        if (topPreviewImg) topPreviewImg.src = evt.target.result;
        if (topPreviewContainer) topPreviewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  topForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('top-id').value;
    const topData = {
      name: document.getElementById('top-name').value.trim(),
      committee: document.getElementById('top-committee').value.trim(),
      title_or_role: document.getElementById('top-committee').value.trim(),
      month_year: document.getElementById('top-month').value.trim() || 'شهر يوليو 2026',
      image_url: document.getElementById('top-image').value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      achievement: document.getElementById('top-achievement').value.trim()
    };

    try {
      if (id) {
        await window.TMSU_API.updateTopMember(id, topData);
      } else {
        await window.TMSU_API.addTopMember(topData);
      }
      topModal.classList.remove('active');
      await renderTopMembers();
    } catch (err) {
      await showAlertDialog('حدث خطأ أثناء حفظ العضو المتميز: ' + err.message, 'خطأ في الحفظ ❌', '⚠️');
    }
  });

  // Check auth initial state
  await checkAuth();
});
