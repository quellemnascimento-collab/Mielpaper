(() => {
  const loginScreen = document.getElementById('login-screen');
  const appScreen = document.getElementById('app-screen');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const todayBtn = document.getElementById('today-btn');
  const entriesList = document.getElementById('entries-list');
  const backBtn = document.getElementById('back-btn');
  const entryDateLabel = document.getElementById('entry-date-label');
  const entryStatus = document.getElementById('entry-status');
  const entryContent = document.getElementById('entry-content');

  let currentDate = null;
  let saveTimer = null;
  let lastSavedContent = '';

  function todayISO() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
  }

  function formatDateLabel(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    if (res.status === 401) {
      showLogin();
      throw new Error('not-authenticated');
    }
    return res;
  }

  function showLogin() {
    loginScreen.hidden = false;
    appScreen.hidden = true;
  }

  function showApp() {
    loginScreen.hidden = true;
    appScreen.hidden = false;
  }

  function setMobileView(view) {
    appScreen.classList.remove('view-list', 'view-editor');
    appScreen.classList.add(view === 'editor' ? 'view-editor' : 'view-list');
  }

  function setStatus(text, kind) {
    entryStatus.textContent = text;
    entryStatus.className = 'status' + (kind ? ' ' + kind : '');
  }

  async function loadEntries() {
    const res = await api('/api/entries');
    const { entries } = await res.json();
    entriesList.innerHTML = '';
    if (entries.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-hint';
      li.textContent = 'Nenhuma entrada ainda. Toque em "Escrever hoje" para começar.';
      entriesList.appendChild(li);
      return;
    }
    for (const entry of entries) {
      const li = document.createElement('li');
      li.className = 'entry-item' + (entry.date === currentDate ? ' active' : '');
      li.innerHTML = `
        <span class="date">${formatDateLabel(entry.date)}</span>
        <span class="preview">${entry.preview ? escapeHtml(entry.preview) : '(vazio)'}</span>
      `;
      li.addEventListener('click', () => openEntry(entry.date));
      entriesList.appendChild(li);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function openEntry(date) {
    currentDate = date;
    entryDateLabel.textContent = formatDateLabel(date);
    setStatus('Carregando...', '');
    setMobileView('editor');

    const res = await api(`/api/entries/${date}`);
    const data = await res.json();
    entryContent.value = data.content || '';
    lastSavedContent = entryContent.value;
    setStatus(data.updatedAt ? `Salvo pela última vez às ${formatTime(data.updatedAt)}` : 'Comece a escrever...', '');
    entryContent.focus();
    loadEntries();
  }

  function formatTime(iso) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  async function saveEntry() {
    if (!currentDate) return;
    const content = entryContent.value;
    if (content === lastSavedContent) return;

    setStatus('Salvando...', '');
    try {
      const res = await api(`/api/entries/${currentDate}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      lastSavedContent = content;

      if (data.backup && data.backup.ok) {
        setStatus(`Salvo às ${formatTime(data.updatedAt)} · backup no GitHub ✓`, 'ok');
      } else if (data.backup && data.backup.skipped) {
        setStatus(`Salvo às ${formatTime(data.updatedAt)} (backup no GitHub não configurado)`, '');
      } else {
        setStatus(`Salvo às ${formatTime(data.updatedAt)}, mas o backup falhou ⚠`, 'warn');
      }
      loadEntries();
    } catch (err) {
      if (err.message !== 'not-authenticated') {
        setStatus('Erro ao salvar. Verifique sua conexão.', 'warn');
      }
    }
  }

  entryContent.addEventListener('input', () => {
    setStatus('Escrevendo...', '');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveEntry, 1200);
  });

  entryContent.addEventListener('blur', () => {
    clearTimeout(saveTimer);
    saveEntry();
  });

  window.addEventListener('beforeunload', () => {
    if (entryContent.value !== lastSavedContent && currentDate) {
      navigator.sendBeacon(
        `/api/entries/${currentDate}`,
        new Blob([JSON.stringify({ content: entryContent.value })], { type: 'application/json' })
      );
    }
  });

  todayBtn.addEventListener('click', () => openEntry(todayISO()));
  backBtn.addEventListener('click', () => setMobileView('list'));

  logoutBtn.addEventListener('click', async () => {
    clearTimeout(saveTimer);
    await saveEntry();
    await api('/api/logout', { method: 'POST' });
    showLogin();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        loginError.textContent = data.error || 'Não foi possível entrar.';
        loginError.hidden = false;
        return;
      }
      passwordInput.value = '';
      await init(true);
    } catch {
      loginError.textContent = 'Erro de conexão. Tente novamente.';
      loginError.hidden = false;
    }
  });

  async function init(justLoggedIn) {
    const res = await fetch('/api/session');
    const data = await res.json();
    if (!data.authenticated) {
      showLogin();
      return;
    }
    showApp();
    setMobileView('list');
    await loadEntries();
    if (justLoggedIn) {
      openEntry(todayISO());
    }
  }

  init(false);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }
})();
