/* === 首次載入一律置頂（無錨點時）=== */
(() => {
  // 1) 關掉瀏覽器的自動捲動還原（Chrome/Android、iOS Safari 都會用到）
  if ('scrollRestoration' in history) {
    try { history.scrollRestoration = 'manual'; } catch {}
  }

  // 有錨點就尊重錨點（例如 #news / #history）
  const hasHash = !!location.hash && location.hash !== '#top';

  // 用 pageshow 可同時涵蓋一般載入與 iOS Safari 特性
  window.addEventListener('pageshow', (e) => {
    // BFCache（返回上一頁）就不要動原本的位置
    if (e.persisted) return;
    if (hasHash) return;

    // 置頂：多次嘗試可避免某些瀏覽器位移
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 50);
    setTimeout(() => window.scrollTo(0, 0), 250);
  }, { once: true });
})();


// ======== 可編輯資料：最新消息 ========
const NEWS = [
  {
    id: "n-2025-09-election",
    title: "第13屆會員代表暨小組長選舉公告（登記制）",
    date: "2025-09-01",
    body:
      "公告：本會《第13屆會員代表暨小組長選舉》，經本會第12屆第2次臨時理監事會議決通過，採取《登記制》，如要參選《會員代表》或《小組長》者，請向工會登記，登記後將印刷入選票，截止登記至民國114年9月12日（星期五）15:00止，敬請留意！",
    tags: ["公告", "選舉"]
  },
  {
    id: "n-2025-09-benefit",
    title: "114年度會員福利品兌領注意事項",
    date: "2025-09-01",
    body:
      "公告：民國114年度會員福利品兌領請至《當區連絡處》領取，切勿跨區領取，禮券已分送各連絡處，未兌領者114.10.20～114.11.20始得前往工會兌領（依本會第12屆第2次臨時理監事會議決通過執行），逾期作廢，謝謝合作！",
    tags: ["公告", "福利"]
  }
];

// ======== 可編輯資料：下載清單（PDF） ========
const DOWNLOADS = [
  { title: "測試中 說明", href: "/downloads/說明_2025.pdf", size: "1.2 MB", updated: "2025-08-15" },
  { title: "測試中 申請書範本", href: "/downloads/申請書_範本.pdf", size: "0.8 MB", updated: "2025-07-03" },
  { title: "測試中 操作手冊", href: "/downloads/操作手冊.pdf", size: "2.0 MB", updated: "2025-06-10" }
];

// ======== 工具函式 ========
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const fmtDate = (d) => new Intl.DateTimeFormat('zh-TW', { year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(d));
const daysBetween = (a, b) => Math.round((+b - +a) / 86400000);

// ======== 最新消息（列表）渲染：單一膠囊 + 搜尋 ========
(function renderNews(){
  const list = $('#newsList');
  const chipsWrap = $('#newsChips');
  const searchInput = $('#newsSearch');

  const sorted = [...NEWS].sort((a,b) => new Date(b.date) - new Date(a.date));
  let keyword = '';

  // 單一「本會公告」膠囊（僅標示，不可點）
  function buildChips(){
    chipsWrap.innerHTML = '';
    const pill = document.createElement('span');
    pill.className = 'chip active';
    pill.textContent = '本會公告';
    chipsWrap.appendChild(pill);
  }

  function render(){
    list.innerHTML = '';
    const items = sorted.filter(item => {
      const text = `${item.title} ${item.body} ${(item.tags||[]).join(' ')} ${item.date}`.toLowerCase();
      return !keyword || text.includes(keyword.toLowerCase());
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

// ======== 一頁式導覽高亮 & 手機選單 & 回頂部 ========
(function navEnhance(){
  const links = $$('.nav-links a[href^="#"]');
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

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
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', (e) => {
    if(e.target.matches('a[href^="#"]')) closeMenu();
  });

  // 特例：點到 #downloads 時，導到 #history（你的需求）
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#downloads"]');
    if(!a) return;
    e.preventDefault();
    document.querySelector('#history')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 返回頂部按鈕
  const btn = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('show', window.scrollY > 480);
  });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// 年份（頁尾）
(() => {
  const y = new Date().getFullYear();
  document.querySelectorAll('#year2').forEach(el => el && (el.textContent = y));
})();

/* === 重要公告 Modal（修正作用域：不外漏變數） === */
(function announcementModal(){
  // 截止時間：選舉（2025-09-12 15:00 +08）與福利品（到 2025-11-20 23:59:59 +08）
  const DEADLINE_TS = new Date('2025-11-20T23:59:59+08:00').getTime();
  const KEY = 'union-ann-hide-until-v1';

  const backdrop = document.getElementById('annBackdrop');
  const modal = document.getElementById('annModal');
  if(!backdrop || !modal) return; // 沒有 modal 就不執行

  const closeBtn = document.getElementById('annClose');
  const confirmBtn = document.getElementById('annConfirm');
  const laterBtn = document.getElementById('annLater');
  const dontShow = document.getElementById('annDontShow');

  const open = () => {
    document.body.classList.add('modal-open');
    backdrop.hidden = false; modal.hidden = false;
    (closeBtn || confirmBtn || modal).focus?.({ preventScroll: true });
    trapFocus(true);
  };
  const close = () => {
    trapFocus(false);
    backdrop.hidden = true; modal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  // 讓 Tab 焦點圈定在對話框
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

  // 初始顯示判斷（全部留在 IIFE 裡）
  const now = Date.now();
  const hideUntil = parseInt(localStorage.getItem(KEY) || '0', 10);
  if (now <= DEADLINE_TS && !(hideUntil && now < hideUntil)) {
    setTimeout(open, 120);
  }

  // 事件
  backdrop.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  laterBtn?.addEventListener('click', close);
  confirmBtn?.addEventListener('click', () => {
    if(dontShow?.checked){
      localStorage.setItem(KEY, String(DEADLINE_TS));
    }
    close();
  });
})();

/* === 歷年重要記事：資料（節錄自你提供的 docx） === */
/* === 歷年重要記事資料（依你提供內容整理） === */
const ANNALS = [
  { year: 114, items: [
    { date: "4月1日", text: "本會向勞保局陳情本會職災費率調整修正在案，依勞保局114.04.29.保納新字第11460094550號函同意施行通過，自114.04.01.起，本會職災費率由現行0.57％調整為0.37％，低差0.2％。" }
  ]},

  { year: 112, items: [
    { date: "3月2日", text: "本會為方便會員繳納會保費，經第12屆第6次理監事會議決通過執行，會員繳費除原先郵局及本會臨櫃外，另擴增可至7-11超商、全家超商及彰化五信繳納。" }
  ]},

  { year: 107, items: [
    { date: "6月1日", text: "本會開辦興華保險經紀公司《會員意外團保險》。" }
  ]},

  { year: 103, items: [
    { date: "8月25日", text: "本會與嘉義縣、雲林縣、澎湖縣四縣市營造工會締盟姊妹會。" }
  ]},

  { year: 102, items: [
    { date: "5月1日", text: "本會於假台北參加「全國勞工抗議勞、健保不當改革，捍衛權益遊行」，計動員118名（3台車）參加。" }
  ]},

  { year: 100, items: [
    { date: "5月1日", text: "工會法新修定：自100.05.01起基層工會改為理事長制，任期為4年。" }
  ]},

  { year: 97, items: [
    { date: "5月21日", text: "協助大陸四川汶川地震賑災，本會捐款彰化縣總工會帳戶新台幣萬元。" }
  ]},

  { year: 90, items: [
    { date: "1月16日", text: "本會參加中華民國營造業職業工會全國聯合總會成立大會。" },
    { date: "7月2日", text: "本會與木工工會、泥水工會、模板工會、鐵工工會、水電工會、室內裝潢工會、油漆工會續辦彰化縣建築業聯誼會。" }
  ]},

  { year: 89, items: [
    { date: "3月9日", text: "本會接受省聯合會「補助九二一地震受災會員，重建家園活動」，計核符36戶(每名2,200元)，總計補助金額新台幣79,200元，並全數寄發合格震災戶。" },
    { date: "3月12日", text: "本會榮獲彰化縣政府評鑑為89年推行勞工安全衛生自動檢查優良單位。" },
    { date: "4月24日", text: "本會經健保局評鑑為89年健保優良工會。" },
    { date: "5月30日", text: "本會與嘉義縣營造工會締盟姊妹會，並與澎湖縣營造工會三會共同結盟姊妹會。" }
  ]},

  { year: 88, items: [
    { date: "2月2日", text: "本會與澎湖縣營造工會締盟姊妹會。" },
    { date: "5月5日", text: "本會經行政院勞委會指定為88年度優良會務報告及示範單位，並接受各縣市及各聯合會理事長、總幹事的來會參訪及高度肯定。" },
    { date: "7月29日", text: "本會配合省聯合會、全國總工會假台北市參加勞健保抗爭遊行。" },
    { date: "11月2日", text: "協助九二一地震賑災，本會捐款彰化縣政府帳戶新台幣2萬元。" },
    { date: "11月9日", text: "協助九二一地震賑災，本會捐款聯合會帳戶新台幣20萬元。" },
    { date: "12月3日", text: "辦理九二一震災互助，協助會員受災戶重建家園，本會受理全倒房屋23件(每名2萬元)、半倒房屋16件(每名1萬元)及領有受災戶健保卡之會員及眷屬(每名500元)81人，連同急難救助互助金寄發申請合格人，全年度總核發946,120元。" }
  ]},

  { year: 82, items: [
    { date: "4月1日",  text: "本會會員粘錦成代表我參加第32屆國際技能競賽，榮獲世界金牌獎。" },
    { date: "4月22日", text: "召開第3屆第8次理監事會，研討慶祝會館新落成暨成立8週年實施辦法。" },
    { date: "4月22日", text: "本會與泥水工會、木工工會、鐵工工會、水電工會共同發起彰化縣建築業工會幹部聯誼會（民國86年後停辦）。" },
    { date: "5月1日",  text: "本會榮獲勞委會評鑑為82年全國優良工會。" }
  ]},

  { year: 81, items: [
    { date: "2月20日", text: "召開第3屆第1次臨時理監事會，決定遷移會址。" },
    { date: "3月1日",  text: "正式遷移會所至彰化市民生路447號10樓辦公。" },
    { date: "5月8日",  text: "召開第3屆第4次理監事會，通過本會秘書為專任總幹事，修改出差及加班費標準表。" },
    { date: "6月30日", text: "召開第3屆第2次臨時理事會，通過會員福利互助辦法。" },
    { date: "6月30日", text: "與本縣餐飲工會締結為姊妹會。" },
    { date: "8月3日",  text: "假彰化市富王餐廳發起成立中部五縣市營造工會幹部聯誼會。" },
    { date: "8月15日", text: "召開第3屆第5次理監事會，通過辦理會員代表出國訪問實施辦法、小組長研習會實施辦法、入會辦法、議事規則等。" },
    { date: "9月8日",  text: "假彰化市富貴園餐廳召開第3屆第2次會員代表大會，通過會員福利互助辦法、重陽敬老由75歲修改為70歲，及追認購置會所經費案。" },
    { date: "10月5日", text: "本會榮獲行政院勞委會評鑑為81年度全國推行勞工教育優良工會。" }
  ]},

  { year: 80, items: [
    { date: "2月1日",  text: "起廢除派員赴各區民眾服務站辦理入會案。" },
    { date: "4月25日", text: "省聯合會80年度模範勞工90人蒞會拜訪，本會招待參觀鹿港古蹟及午餐。" },
    { date: "4月27日", text: "本會榮獲縣政府辦理營造業流動安全衛生教育訓練優良單位。" },
    { date: "5月21日", text: "召開第2屆第1次臨時理監事會，通過購買東民街林氏大樓3樓作為會所，因屋主拒絕出，無法成交。" },
    { date: "9月19日", text: "假彰化市富貴園餐廳召開第3屆第1次會員代表大會，通過會員入會費由300元調整為500元，保證金1,000元調整為2,000元。" },
    { date: "11月2日", text: "召開第3屆第2次理監事會，通過購置曉陽名邸作為本會會館。" },
    { date: "12月26日",text: "辦理本會首期安全衛生講習會，計有100名參加。" }
  ]},

  { year: 79, items: [
    { date: "1月20日", text: "本會陳杰常理，經全體會員積極助選，榮獲彰化區最高票當選彰化縣議員。" },
    { date: "9月18日", text: "假彰化市富貴園餐廳召開第2屆第3次會員代表大會，通過訂定「聯絡處設置管理辦法」。" }
  ]},

  { year: 78, items: [
    { date: "8月19日", text: "本會榮獲省聯合會77年度特優工會獎牌。" },
    { date: "12月29日", text: "召開第2屆第8次理監事會，通過支持陳杰常理競選彰化縣議員。" }
  ]},

  { year: 77, items: [
    { date: "2月6日",  text: "召開第1屆第11次理監事會暨連絡處主任聯席會，通過本會會旗圖樣，及會員代表暨小組長選舉辦法。" },
    { date: "8月11日", text: "本會榮獲省聯合會77年度優等單位獎。" },
    { date: "8月30日", text: "縣總工會舉辦彰化縣第1屆金輪獎歌唱比賽，本會會員張玉仙榮獲第1名。" },
    { date: "8月31日", text: "本會辦理技能檢定，本會王連贊等7名丙級技術士檢定及格。" },
    { date: "10月1日", text: "起每月定期派員駐二林、溪湖、田中、北斗、員林各鄉鎮民眾服務社，辦理會員入會。" },
    { date: "10月1日", text: "本會成立彰化營造工會就業服務中心，聯合全省辦理就業輔導工作。" }
  ]},

  { year: 76, items: [
    { date: "5月1日",  text: "本會經縣政府評定為優良工會。" },
    { date: "8月13日", text: "省聯合會召開第2屆第2次會員代表大會，本會榮獲省聯合會頒發特優單位獎牌。" },
    { date: "9月2日",  text: "假縣政府大禮堂召開第1屆第3次會員代表大會，通過設立急難救助辦法及重陽敬老辦法。" },
    { date: "9月30日", text: "召開第1屆第10次理監事會，通過樂捐225,000元作為省聯合會會館基金。" }
  ]},

  { year: 75, items: [
    { date: "1月28日", text: "召開第1屆第3次理監事會及小組長聯席會，通過擬定會員代表暨小組長選舉辦法。" },
    { date: "6月13日", text: "召開第1屆第4次理監事會，通過前往各地宣導，勸導從事營造業無一定雇主勞工入會。" },
    { date: "8月15日", text: "召開第1屆第2次會員大會，會員有932名，大會修改章程將入會費由100元調300元，大會改開會員代表大會，並通過設立子女獎學金及表揚熱心幹部。" }
  ]},

  { year: 74, items: [
    { date: "4月15日", text: "在員林鎮祝樂餐廳成立大會，會員有101名，大會通過預算、工作計劃章程及投保勞工保險並選舉首屆理監事。" },
    { date: "4月19日", text: "召開第1次理監事會，選舉林源豐為常理、游秋軒為常監，通過會址設於彰化市，並聘請吳鴻祺為秘書，吳國印、蔡寶美為幹事。" },
    { date: "4月27日", text: "依法向彰化縣政府申請登記，經核准並核登彰府社勞字第230號工會登記證書。" },
    { date: "4月27日", text: "依法申請加入彰化縣總工會為會，經核准並核發彰總工證字第145號會員證書。" },
    { date: "4月27日", text: "依法向台閩地區勞工保險局申請投保會員勞工保，經核准並核發職字第721號勞工保險證，自74.04.27.起生效。" },
    { date: "4月27日", text: "依法申請加入台灣省營造業職業工會聯合會為會，經核准發給省聯會證字第17號會員證書。" },
    { date: "4月29日", text: "向彰化郵局三支分局申請設立郵政劃撥帳，經核准設立，帳號中字02642662號。" }
  ]}
];


/* === 歷年重要記事：經典可讀版（年份索引與圖片等高；手機為橫向膠囊） === */
(function renderAnnalsClassic(){
  const host = document.getElementById('annalsList');
  if (!host) return;

  const YEARS = Array.isArray(ANNALS) ? [...ANNALS].sort((a,b)=> b.year - a.year) : [];
  if (!YEARS.length){ host.innerHTML = `<div class="card">尚無資料。</div>`; return; }

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
  const getHashYear = () => {
    const m = location.hash.match(/^#y(\d{2,3})$/); return m ? +m[1] : null;
  };
  let currentYear = getHashYear() || YEARS[0].year;

  // 骨架（中：年份索引；右：事件面板）
  host.innerHTML = `
    <div class="annals-3col">
      <aside class="year-rail" id="yearRail" aria-label="年份索引">
        <div class="rail-head">
          <button class="rail-jump" id="railTop" title="跳到最新">↑</button>
          <div class="rail-caption">年份</div>
          <button class="rail-jump" id="railBottom" title="跳到最舊">↓</button>
        </div>
        <div class="rail-body" id="railBody"></div>
      </aside>

      <section class="ann-panel" aria-live="polite">
        <header class="ann-panel-head">
          <h3 class="ann-year-title" id="annYearTitle"></h3>
          <div class="ann-year-count" id="annYearCount"></div>
          <div class="ann-chip-row" id="annChipRow" aria-label="年份（行動版）"></div>
        </header>
        <ol class="evs" id="annEvents"></ol>
        <div class="ann-actions" id="annActions"></div>
      </section>
    </div>
  `;

  const railBody   = document.getElementById('railBody');
  const railTop    = document.getElementById('railTop');
  const railBottom = document.getElementById('railBottom');
  const yearTitle  = document.getElementById('annYearTitle');
  const yearCount  = document.getElementById('annYearCount');
  const chipRow    = document.getElementById('annChipRow');
  const evList     = document.getElementById('annEvents');
  const actions    = document.getElementById('annActions');
  const yearRail   = document.getElementById('yearRail');

  // 與左側圖片等高
  const fig = document.querySelector('#history .history-figure');
  const updateRailHeight = () => {
    if (isMobile()) { yearRail.style.height = ''; return; }
    if (!fig) return;
    const h = Math.round(fig.getBoundingClientRect().height);
    yearRail.style.height = h + 'px';
  };
  if (fig) {
    new ResizeObserver(updateRailHeight).observe(fig);
    updateRailHeight();
  }

  // 建立年份索引（含十年分隔）
  let lastDecade = null;
  railBody.innerHTML = YEARS.map(y=>{
    const decade = Math.floor(y.year / 10) * 10;
    const sep = (decade !== lastDecade) ? `<div class="rail-sep">${decade} 年代</div>` : '';
    lastDecade = decade;
    return `
      ${sep}
      <button class="y-item${y.year===currentYear?' active':''}" data-year="${y.year}" aria-current="${y.year===currentYear?'true':'false'}">
        <span class="y">民國${y.year}</span>
        <span class="c">${y.items.length}則</span>
      </button>
    `;
  }).join('');

  // 行動版：橫向膠囊
  chipRow.innerHTML = YEARS.map(y=>`
    <button class="chip ${y.year===currentYear?'active':''}" data-year="${y.year}">民國${y.year}</button>
  `).join('');

  // 渲染某一年的事件
  function renderYear(yr){
    const y = YEARS.find(v=>v.year===yr) || YEARS[0];
    currentYear = y.year;

    yearTitle.textContent = `民國 ${y.year} 年`;
    yearCount.textContent = `${y.items.length} 則`;

    const PAGE = 6;
    let showAll = false;
    const draw = () => {
      const rows = showAll ? y.items : y.items.slice(0, PAGE);
      evList.innerHTML = rows.map(ev=>`
        <li class="ev">
          <div class="ev-date">${ev.date || ''}</div>
          <div class="ev-text">${ev.text || ''}</div>
        </li>
      `).join('');
      if (y.items.length > PAGE) {
        actions.innerHTML = `<button class="btn ann-toggle">${showAll ? '收合' : `顯示全部（${y.items.length}）`}</button>`;
        actions.querySelector('.ann-toggle').onclick = () => { showAll = !showAll; draw(); };
      } else {
        actions.innerHTML = '';
      }
    };
    draw();

    // 更新索引高亮 & 捲到可視範圍
    railBody.querySelectorAll('.y-item').forEach(b=>{
      const on = +b.dataset.year === y.year;
      b.classList.toggle('active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && !isMobile()) b.scrollIntoView({ block:'nearest' });
    });
    chipRow.querySelectorAll('.chip').forEach(c=>{
      c.classList.toggle('active', +c.dataset.year === y.year);
      if (c.classList.contains('active') && isMobile()) c.scrollIntoView({ inline:'center', block:'nearest' });
    });

    history.replaceState(null, '', `#y${y.year}`);
  }

  // 事件：點年份（索引／膠囊）
  railBody.addEventListener('click', (e)=>{
    const btn = e.target.closest('.y-item'); if(!btn) return;
    renderYear(+btn.dataset.year);
  });
  chipRow.addEventListener('click', (e)=>{
    const btn = e.target.closest('.chip'); if(!btn) return;
    renderYear(+btn.dataset.year);
  });

  // 索引快速跳到最上/最下
  railTop.addEventListener('click', ()=> railBody.scrollTo({ top: 0, behavior: 'smooth' }));
  railBottom.addEventListener('click', ()=> railBody.scrollTo({ top: railBody.scrollHeight, behavior: 'smooth' }));

  // hash 直接導向
  window.addEventListener('hashchange', ()=>{
    const hy = getHashYear();
    if (hy && hy !== currentYear) renderYear(hy);
  });

  // 斷點切換時調整高度
  const mql = window.matchMedia('(max-width: 900px)');
  mql.addEventListener('change', updateRailHeight);

  // 初次顯示
  renderYear(currentYear);
})();


