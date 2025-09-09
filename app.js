// ======== 可編輯資料：最新消息 ========
const NEWS = [
  {
    id: "n-2025-08-maintain",
    title: "測試中 系統維護公告（9/5 00:30–02:30）",
    date: "2025-08-29",
    body: "為提升服務品質，9/5(五) 凌晨將進行例行維護，期間部分服務暫停，敬請見諒。",
    tags: ["公告", "維護"],
    attachments: [{ label: "維護說明 PDF", href: "/downloads/維護說明_20250905.pdf", size: "0.7 MB" }]
  },
  {
    id: "n-2025-07-product",
    title: "測試中 新服務上線：線上申請表單（試營運）",
    date: "2025-07-18",
    body: "開放線上申請表單試營運，流程更便捷，歡迎多加利用。",
    tags: ["業務", "服務更新"],
    attachments: [{ label: "申請流程說明", href: "/downloads/申請流程_說明.pdf", size: "1.1 MB" }]
  }
];

// ======== 可編輯資料：下載清單（PDF） ========
const DOWNLOADS = [
  { title: "測試中 說明", href: "/downloads/說明_2025.pdf", size: "1.2 MB", updated: "2025-08-15" },
  { title: "測試中 申請書範本", href: "/downloads/申請書_範本.pdf", size: "0.8 MB", updated: "2025-07-03" },
  { title: "測試中 銀操作手冊", href: "/downloads/操作手冊.pdf", size: "2.0 MB", updated: "2025-06-10" }
];

// ======== 工具函式 ========
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const fmtDate = (d) => new Intl.DateTimeFormat('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(d));
const daysBetween = (a, b) => Math.round((+b - +a) / 86400000);

// ======== 最新消息（列表）渲染：分類按鈕 + 搜尋 ========
(function renderNews(){
  const list = $('#newsList');
  const chipsWrap = $('#newsChips');
  const searchInput = $('#newsSearch');

  const sorted = [...NEWS].sort((a,b) => new Date(b.date) - new Date(a.date));
  const allTags = Array.from(new Set(sorted.flatMap(x => x.tags || [])));
  let activeTag = '全部';
  let keyword = '';

  function buildChips(){
    chipsWrap.innerHTML = '';
    const tags = ['全部', ...allTags];
    for (const t of tags){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (t === activeTag ? ' active' : '');
      btn.textContent = t;
      btn.dataset.tag = t;
      chipsWrap.appendChild(btn);
    }
  }

  function render(){
    list.innerHTML = '';
    const items = sorted.filter(item => {
      const matchTag = activeTag === '全部' || (item.tags || []).includes(activeTag);
      const text = `${item.title} ${item.body} ${(item.tags||[]).join(' ')} ${item.date}`.toLowerCase();
      const matchKey = !keyword || text.includes(keyword.toLowerCase());
      return matchTag && matchKey;
    });

    if(!items.length){
      list.innerHTML = `<div class="card">查無符合的消息。</div>`;
      return;
    }

    for(const it of items){
      const isNew = daysBetween(new Date(it.date), new Date()) <= 14;
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="n-head">
          ${it.tags?.[0] ? `<span class="badge">${it.tags[0]}</span>` : ''}
          ${isNew ? `<span class="badge new">NEW</span>` : ''}
          <div class="n-title">${it.title}</div>
          <div class="n-date" aria-label="發布日期">${fmtDate(it.date)}</div>
        </div>
        <div class="n-body">${it.body}</div>
        ${Array.isArray(it.attachments) && it.attachments.length ? `
          <div class="attachments">
            ${it.attachments.map(a => `
              <a class="a-btn" href="${a.href}" target="_blank" rel="noopener" download>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                ${a.label}${a.size ? `（${a.size}）` : ''}
              </a>
            `).join('')}
          </div>` : ''}
      `;
      list.appendChild(card);
    }
  }

  chipsWrap.addEventListener('click', (e) => {
    const t = e.target.closest('.chip'); if(!t) return;
    activeTag = t.dataset.tag; buildChips(); render();
  });
  searchInput.addEventListener('input', () => { keyword = searchInput.value.trim(); render(); });

  buildChips(); render();
})();

// ======== 下載專區渲染 ========
(function renderDownloads(){
  const grid = $('#dlGrid');
  const searchInput = $('#dlSearch');
  const data = [...DOWNLOADS].sort((a,b)=> new Date(b.updated) - new Date(a.updated));
  let keyword = '';

  function render(){
    grid.innerHTML = '';
    const rows = data.filter(x => {
      const text = `${x.title} ${x.href}`.toLowerCase();
      return !keyword || text.includes(keyword.toLowerCase());
    });

    if(!rows.length){
      grid.innerHTML = `<div class="card">查無符合的檔案。</div>`;
      return;
    }

    for(const it of rows){
      const card = document.createElement('div');
      card.className = 'dl-card';
      card.innerHTML = `
        <div class="file-ico" aria-hidden="true">PDF</div>
        <div>
          <div class="dl-title">${it.title}</div>
          <div class="dl-meta">更新：${fmtDate(it.updated)}｜大小：${it.size || '—'}</div>
        </div>
        <div class="dl-action">
          <a href="${it.href}" target="_blank" rel="noopener" download aria-label="下載 ${it.title}">下載</a>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  searchInput.addEventListener('input', () => { keyword = searchInput.value.trim(); render(); });
  render();
})();

// ======== 一頁式導覽高亮 & 手機選單 ========
(function navEnhance(){
  const links = $$('.nav-links a[href^="#"]');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // 高亮導覽
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = links.find(a => a.getAttribute('href') === id);
      if(!link) return;
      if(entry.isIntersecting){
        links.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });
  sections.forEach(s => io.observe(s));

  // 手機漢堡選單
  const toggle = $('#menuToggle');
  const nav = $('#primaryNav');
  const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if(e.target.matches('a[href^="#"]')) closeMenu();
  });

  // 返回頂部
  const btn = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 480);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// 年份
document.getElementById('year').textContent = new Date().getFullYear();

/* === 新增：重要公告 Modal === */
(function announcementModal(){
  // 截止時間：選舉（2025-09-12 15:00 +08）與福利品（到 2025-11-20 23:59:59 +08）
  const DEADLINE_TS = new Date('2025-11-20T23:59:59+08:00').getTime();
  const KEY = 'union-ann-hide-until-v1';

  const backdrop = document.getElementById('annBackdrop');
  const modal = document.getElementById('annModal');
  if(!backdrop || !modal) return; // 安全保護：沒有 modal 就不執行

  const closeBtn = document.getElementById('annClose');
  const confirmBtn = document.getElementById('annConfirm');
  const laterBtn = document.getElementById('annLater');
  const dontShow = document.getElementById('annDontShow');

  const open = () => {
    document.body.classList.add('modal-open');
    backdrop.hidden = false; modal.hidden = false;
    // 聚焦到關閉按鈕，利於鍵盤操作
    (closeBtn || confirmBtn || modal).focus({ preventScroll: true });
    trapFocus(true);
  };
  const close = () => {
    trapFocus(false);
    backdrop.hidden = true; modal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  // Tab 鍵焦點圈定在對話框
  let focusHandler;
  function trapFocus(enable){
    if(!enable){
      document.removeEventListener('keydown', focusHandler);
      return;
    }
    const selectors = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusables = () => Array.from(modal.querySelectorAll(selectors)).filter(el => !el.hasAttribute('disabled'));
    focusHandler = (e) => {
      if(e.key === 'Escape') { e.preventDefault(); close(); return; }
      if(e.key !== 'Tab') return;
      const f = getFocusables();
      if(!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', focusHandler);
  }

  // 初始顯示判斷
  const now = Date.now();
  const hideUntil = parseInt(localStorage.getItem(KEY) || '0', 10);
  if (now <= DEADLINE_TS && now >= 0 && now >= 0 && now >= 0 && now >= 0) { // 小心保底
    if (!(hideUntil && now < hideUntil)) {
      // 延遲一點點再顯示，避免跟首屏動畫搶畫面
      setTimeout(open, 120);
    }
  }

  // 事件
  backdrop.addEventListener('click', close);
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(laterBtn) laterBtn.addEventListener('click', close);
  if(confirmBtn) confirmBtn.addEventListener('click', () => {
    if(dontShow && dontShow.checked){
      localStorage.setItem(KEY, String(DEADLINE_TS));
    }
    close();
  });
})();
