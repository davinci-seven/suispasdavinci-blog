(function () {
  'use strict';

  function updateClock() {
    var node = document.getElementById('local-time');
    if (!node) return;
    try {
      node.textContent = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date());
    } catch (error) {
      node.textContent = '--:--';
    }
  }

  function revealSections() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  function correctProjectCredits() {
    var row = document.querySelector('a[href*="GeminiWatermarkTool"]');
    if (!row) return;

    row.href = 'https://github.com/davinci-seven/wechat-article-pipeline';

    var meta = row.querySelector('div p');
    var title = row.querySelector('div h3');
    var description = row.querySelector('em');
    var action = row.querySelector(':scope > b');

    if (meta) meta.textContent = 'CONTENT PIPELINE / WINDOWS';
    if (title) title.textContent = 'WeChat Article Pipeline';
    if (description) {
      description.textContent = '把Markdown、配图、公众号HTML、复制预览、手机长截图和完整性检查串成一条可复用流程。';
    }
    if (action) action.textContent = 'VIEW↗';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
    updateClock();
    window.setInterval(updateClock, 30000);
    correctProjectCredits();
    revealSections();
  });
})();
