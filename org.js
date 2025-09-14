// 頁尾年份
(() => {
  const y = new Date().getFullYear();
  document.querySelectorAll('#year2').forEach(el => el && (el.textContent = y));
})();

// 手機漢堡選單（與首頁行為一致，但不混用 app.js）
(() => {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('primaryNav');
  const openClose = () => {
    const opened = nav.classList.toggle('open');
    toggle?.setAttribute('aria-expanded', String(opened));
  };
  toggle?.addEventListener('click', openClose);
  nav?.addEventListener('click', (e) => {
    if (e.target.matches('a')) nav.classList.remove('open');
  });
})();
