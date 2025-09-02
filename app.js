// ======== 可編輯資料：最新消息 ========
const NEWS = [
  { id: "n-2025-08-maintain", title: "系統維護公告（9/5 00:30-02:30）", date: "2025-08-29",
    body: "為提升服務品質，預計 9/5(五) 凌晨進行例行維護，期間部分服務暫停。造成不便，敬請見諒。",
    tags: ["公告","維護"], attachments: [{ label: "維護說明 PDF", href: "/downloads/維護說明_20250905.pdf", size: "0.7 MB" }] },
  { id: "n-2025-07-product", title: "新服務上線：線上申請表單（試營運）", date: "2025-07-18",
    body: "推出線上申請表單試營運，提供更便捷的申請流程，歡迎多加利用。",
    tags: ["業務","服務更新"], attachments: [{ label: "申請流程說明", href: "/downloads/申請流程_說明.pdf", size: "1.1 MB" }] }
];

// ======== 可編輯資料：下載清單（PDF） ========
const DOWNLOADS = [
  { title: "存款利率說明（2025 Q3）", href: "/downloads/存款利率說明_2025Q3.pdf", size: "1.2 MB", updated: "2025-08-15" },
  { title: "貸款申請書範本", href: "/downloads/貸款申請書_範本.pdf", size: "0.8 MB", updated: "2025-07-03" },
  { title: "自然人憑證網銀操作手冊", href: "/downloads/自然人憑證_網銀操作手冊.pdf", size: "2.0 MB", updated: "2025-06-10" }
];

// ======== 輔助函式 ========
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const fmtDate = (d) => new Intl.DateTimeFormat('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date(d));
const daysBetween = (a, b) => Math.round((+b - +a) / 86400000);

// ======== 最新消息渲染 ========
(function renderNews(){
  const grid = document.getElementById('newsGrid');
  const chipsWrap = document.getElementById('newsChips');
  const inp = document.getElementById('newsSearch');

  const sorted = [...NEWS].sort((a,b) => new Date(b.date) - new Date(a.date));
  const allTags = Array.from(new Set(sorted.flatMap(x => x.tags || [])));
  let activeTag = '全部';
  let keyword = '';

  function buildChips(){
    chipsWrap.innerHTML = '';
    const tags = ['全部', ...allTags];
    for (const t of tags) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'chip' + (t === activeTag ? ' active' : '');
      el.textContent = t;
      el.dataset.tag = t;
      chipsWrap.appendChild(el);
    }
  }

  function render(){
    grid.innerHTML = '';
    const list = sorted.filter(item => {
      const matchTag = activeTag === '全部' || (item.tags || []).includes(activeTag);
      const text = `${item.title} ${item.body} ${(item.tags||[]).join(' ')}`.toLowerCase();
      const matchKey = !keyword || text.includes(keyword.toLowerCase());
      return matchTag && matchKey;
    });
    if (!list.length) {
      grid.innerHTML = `<div class="card" role="status">查無符合的消息。</div>`;
      return;
    }
    for (const it of list) {
      const isNew = daysBetween(new Date(it.date), new Date()) <= 14;
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-head">
          ${it.tags?.[0] ? `<span class="badge">${it.tags[0]}</span>` : ''}
          ${isNew ? `<span class="badge new">NEW</span>` : ''}
          <div class="title">${it.title}</div>
          <div class="meta" aria-label="發布日期">${fmtDate(it.date)}</div>
        </div>
        <div class="body">${it.body}</div>
        ${Array.isArray(it.attachments) && it.attachments.length ? `<div class="attachments">${it.attachments.map(a => `<a class="a-btn" href="${a.href}" target="_blank" rel="noopener" download><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> ${a.label}${a.size ? `（${a.size}）` : ''}</a>`).join('')}</div>` : ''}
      `;
      grid.appendChild(card);
    }
  }

  chipsWrap.addEventListener('click', (e) => {
    const t = e.target.closest('.chip');
    if (!t) return;
    activeTag = t.dataset.tag; buildChips(); render();
  });
  inp.addEventListener('input', () => { keyword = inp.value.trim(); render(); });

  buildChips();
  render();
})();

// ======== 下載清單渲染 ========
(function renderDownloads(){
  const list = document.getElementById('dlList');
  const inp = document.getElementById('dlSearch');
  const data = [...DOWNLOADS].sort((a,b)=> new Date(b.updated) - new Date(a.updated));
  let keyword = '';

  function render(){
    list.innerHTML = '';
    const rows = data.filter(x => {
      const text = `${x.title} ${x.href}`.toLowerCase();
      return !keyword || text.includes(keyword.toLowerCase());
    });
    if (!rows.length) {
      list.innerHTML = `<div class="card" role="status">查無符合的檔案。</div>`;
      return;
    }
    for (const it of rows) {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `
        <div class="muted">${fmtDate(it.updated)}</div>
        <div><strong>${it.title}</strong></div>
        <div>${it.size || ''}</div>
        <div><a href="${it.href}" target="_blank" rel="noopener" download>下載 PDF</a></div>
      `;
      list.appendChild(row);
    }
  }

  inp.addEventListener('input', () => { keyword = inp.value.trim(); render(); });
  render();
})();

// ======== 一頁式：導覽錨點高亮 & 返回頂部 ========
(function onePageEnhance(){
  const links = $$('.nav-links a[href^="#"]');
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // 高亮目前區塊對應的導覽連結
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = links.find(a => a.getAttribute('href') === id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });
  sections.forEach(s => io.observe(s));

  // 返回頂部按鈕
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label','返回頂部');
  btn.innerText = '↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 480);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// 年份
document.getElementById('year').textContent = new Date().getFullYear();
