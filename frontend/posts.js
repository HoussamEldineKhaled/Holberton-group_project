(() => {
  let user = null;
  try { user = JSON.parse(localStorage.getItem("userId")); } catch {}
  if (!user) {
    const ret = encodeURIComponent("posts.html");
    window.location.href = `login.html?return=${ret}`;
  }

  const postsList = document.getElementById('postsList');
  const metaEl = document.getElementById('meta');
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const searchInput = document.getElementById('searchQuery'); 
  const userIdFilter = document.getElementById('userIdFilter');
  const sortSelect = document.getElementById('sortSelect');
  const pageSize = document.getElementById('pageSize');
  const applyBtn = document.getElementById('applyBtn');
  const clearBtn = document.getElementById('clearBtn');

  const API_BASE = (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || 'http://127.0.0.1:5000';

  let state = {
    page: 1,
    page_size: Number(pageSize?.value) || 20,
    sort: (sortSelect?.value) || 'latest',
    user_id: '',
    q: (searchInput?.value || '').trim()
  };

  try {
    if (typeof APP_NAME !== 'undefined' && APP_NAME) {
      document.title = `Posts - ${APP_NAME}`;
    }
  } catch {}

  function qs() {
    const p = new URLSearchParams();
    p.set('page', state.page);
    p.set('page_size', state.page_size);
    p.set('sort', state.sort);
    if (state.user_id) p.set('user_id', state.user_id);
    if (state.q) p.set('q', state.q);
    p.set('include_attachments', '1');
    return p.toString();
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function isImageAttachment(att) {
    const t = (att?.A_type || '').toLowerCase();
    if (t.startsWith('image/')) return true;

    const name = (att?.A_name || '').toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
  }

  function attachmentUrl(att) {

    return `${API_BASE}/attachments/${encodeURIComponent(att.id)}`;
  }

  function renderPosts(data) {
    postsList.innerHTML = '';
    if (!data || !Array.isArray(data.data) || data.data.length === 0) {
      postsList.innerHTML = '<li class="list-item muted">No posts found.</li>';
      return;
    }

    data.data.forEach(post => {
      const li = document.createElement('li');
      li.className = 'list-item';

      const title = escapeHtml(post.title || '(Untitled)');
      const desc = escapeHtml(post.description || '');
      const authorName = escapeHtml((post.author && post.author.name) || 'Unknown');
      const authorId = post.author && post.author.id ? post.author.id : '—';
      const time = escapeHtml(post.post_time || '');
      const attCount = Number(post.attachments_count || 0);

      const atts = Array.isArray(post.attachments) ? post.attachments : [];

      const galleryImgs = atts.filter(isImageAttachment).slice(0, 8).map(a => {
        const url = attachmentUrl(a);
        const alt = escapeHtml(a.A_name || 'image');
        return `<a href="${url}" target="_blank" rel="noopener">
                  <img src="${url}" alt="${alt}" loading="lazy">
                </a>`;
      }).join('');

      const nonImageItems = atts.filter(a => !isImageAttachment(a)).map(a => {
        const name = escapeHtml(a.A_name || 'file');
        const type = escapeHtml(a.A_type || '');
        const size = (a.File_size != null) ? `${a.File_size} bytes` : '';
        const when = escapeHtml(a.A_time || '');
        const url = attachmentUrl(a);
        return `
          <li class="att-item">
            <div class="att-name"><a href="${url}" target="_blank" rel="noopener">${name}</a></div>
            <div class="att-meta">
              <span>${type}</span>
              ${size ? '<span class="dot">•</span><span>' + size + '</span>' : ''}
              ${when ? '<span class="dot">•</span><span>' + when + '</span>' : ''}
            </div>
          </li>
        `;
      }).join('');

      const attachmentsHtml = atts.length ? `
        <div class="attachments">
          ${galleryImgs ? `<div class="att-gallery">${galleryImgs}</div>` : ''}
          ${nonImageItems ? `
            <div class="att-title" style="margin-top:10px;">Files</div>
            <ul class="att-list">${nonImageItems}</ul>
          ` : ''}
        </div>
      ` : '';

      li.innerHTML = `
        <div class="item-header">
          <h3 class="item-title">${title}</h3>
          <span class="badge">${attCount} attachment${attCount === 1 ? '' : 's'}</span>
        </div>
        <p class="item-desc">${desc || '<span class="muted">(no description)</span>'}</p>

        <div class="item-meta">
          <span>By <strong>${authorName}</strong> (ID: ${authorId})</span>
          <span class="dot">•</span>
          <span>${time}</span>
        </div>

        ${attachmentsHtml}
      `;

      postsList.appendChild(li);
    });
  }

  function updateMeta(total, page, pageSize) {
    const start = Math.min((page - 1) * pageSize + 1, total || 0);
    const end = Math.min(page * pageSize, total || 0);
    metaEl.textContent = total
      ? `Showing ${start}-${end} of ${total}${state.q ? ` · filtered by “${escapeHtml(state.q)}”` : ''}`
      : '';
    pageInfo.textContent = `Page ${page}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = end >= (total || 0);
  }

  async function fetchPosts() {
    try {
      const url = `${API_BASE}/posts?${qs()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      renderPosts(data);
      updateMeta(data.total || 0, data.page || state.page, data.page_size || state.page_size);
    } catch (err) {
      postsList.innerHTML = `<li class="list-item error">Failed to load posts: ${escapeHtml(err.message)}</li>`;
      metaEl.textContent = '';
      pageInfo.textContent = '';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  applyBtn?.addEventListener('click', () => {
    state.page = 1;
    state.page_size = Number(pageSize?.value) || 20;
    state.sort = (sortSelect?.value) || 'latest';
    state.user_id = (userIdFilter?.value || '').trim();
    state.q = (searchInput?.value || '').trim();
    fetchPosts();
  });

  clearBtn?.addEventListener('click', () => {
    if (userIdFilter) userIdFilter.value = '';
    if (sortSelect) sortSelect.value = 'latest';
    if (pageSize) pageSize.value = '20';
    if (searchInput) searchInput.value = '';
    state = { page: 1, page_size: 20, sort: 'latest', user_id: '', q: '' };
    fetchPosts();
  });

  prevBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page -= 1;
      fetchPosts();
    }
  });

  nextBtn.addEventListener('click', () => {
    state.page += 1;
    fetchPosts();
  });

  fetchPosts();
})();
