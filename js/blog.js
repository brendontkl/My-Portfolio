/* blog.js — Category filter + live search */
(function initBlogFilter() {
  const btns  = document.querySelectorAll('.blog-cats .filter-btn');
  const cards = document.querySelectorAll('.blog-post-card');
  if (!btns.length) return;

  let activeCat  = 'all';
  let searchTerm = '';

  function applyFilter() {
    cards.forEach(card => {
      const cat   = card.dataset.cat   || '';
      const title = card.dataset.title || '';
      const matchCat    = activeCat === 'all' || cat === activeCat;
      const matchSearch = !searchTerm || title.includes(searchTerm);
      card.classList.toggle('hidden', !(matchCat && matchSearch));
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      applyFilter();
    });
  });

  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilter();
    });
  }
})();
