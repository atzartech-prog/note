// Global state variables
let allPosts = [];
const POSTS_PER_PAGE = 8;
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const postsGrid = document.getElementById('postsGrid');
const paginationNav = document.getElementById('paginationNav');
const paginationList = document.getElementById('paginationList');
const heroSection = document.getElementById('heroSection');
const filterHeader = document.getElementById('filterHeader');
const filterTypeEl = document.getElementById('filterType');
const filterValueEl = document.getElementById('filterValue');
const blogListView = document.getElementById('blogListView');
const blogDetailView = document.getElementById('blogDetailView');

// Detail page elements
const detailCategory = document.getElementById('detailCategory');
const detailDate = document.getElementById('detailDate');
const detailTitle = document.getElementById('detailTitle');
const detailTags = document.getElementById('detailTags');
const detailImage = document.getElementById('detailImage');
const detailContent = document.getElementById('detailContent');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchPosts();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Hash change router
  window.addEventListener('hashchange', router);
  
  // Theme toggle button
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Search form submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.hash = `#/search/${encodeURIComponent(query)}`;
    } else {
      window.location.hash = '#/';
    }
  });

  // Copy link to clipboard
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      navigator.clipboard.writeText(currentUrl).then(() => {
        const originalText = copyLinkBtn.innerHTML;
        copyLinkBtn.innerHTML = '<i class="fa-solid fa-check me-1"></i> Tersalin!';
        copyLinkBtn.classList.remove('btn-outline-custom');
        copyLinkBtn.classList.add('btn-success');
        
        setTimeout(() => {
          copyLinkBtn.innerHTML = originalText;
          copyLinkBtn.classList.remove('btn-success');
          copyLinkBtn.classList.add('btn-outline-custom');
        }, 2000);
      });
    });
  }
}

// Initialize theme
function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon();
}

// Toggle light/dark theme
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
  updateThemeIcon();
}

// Update the icon inside the theme toggle button
function updateThemeIcon() {
  const icon = themeToggleBtn.querySelector('i');
  if (currentTheme === 'dark') {
    icon.className = 'fa-solid fa-sun';
    themeToggleBtn.setAttribute('aria-label', 'Ganti ke mode terang');
  } else {
    icon.className = 'fa-solid fa-moon';
    themeToggleBtn.setAttribute('aria-label', 'Ganti ke mode gelap');
  }
}

// Fetch posts.json data
async function fetchPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) {
      throw new Error('Gagal mengambil data postingan.');
    }
    allPosts = await response.json();
    
    // Sort posts by date descending
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Run router once data is loaded
    router();
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-danger d-inline-block">
          <i class="fa-solid fa-circle-exclamation me-2"></i> Gagal memuat data weblog. Silakan coba beberapa saat lagi.
        </div>
      </div>
    `;
  }
}

// Router to handle URL hash transitions
function router() {
  const hash = window.location.hash || '#/';
  
  // Reset scroll position
  window.scrollTo(0, 0);

  // Parse hash route
  // Examples:
  // #/
  // #/page/2
  // #/post/some-slug
  // #/category/DIY
  // #/category/DIY/page/2
  // #/search/myquery
  // #/search/myquery/page/2
  
  let route = {
    view: 'home', // 'home' or 'detail'
    category: null,
    searchQuery: null,
    page: 1,
    postId: null
  };

  // Route matches
  if (hash.startsWith('#/post/')) {
    route.view = 'detail';
    route.postId = decodeURIComponent(hash.replace('#/post/', ''));
  } else if (hash.startsWith('#/category/')) {
    const parts = hash.replace('#/category/', '').split('/');
    route.category = decodeURIComponent(parts[0]);
    if (parts.length > 2 && parts[1] === 'page') {
      route.page = parseInt(parts[2]) || 1;
    }
  } else if (hash.startsWith('#/search/')) {
    const parts = hash.replace('#/search/', '').split('/');
    route.searchQuery = decodeURIComponent(parts[0]);
    if (parts.length > 2 && parts[1] === 'page') {
      route.page = parseInt(parts[2]) || 1;
    }
  } else if (hash.startsWith('#/page/')) {
    route.page = parseInt(hash.replace('#/page/', '')) || 1;
  }

  // Update navbar active status
  updateNavbarActive(route.category);

  // Render view
  if (route.view === 'detail') {
    renderDetailView(route.postId);
  } else {
    renderListView(route);
  }
}

// Update active states in the navigation menu
function updateNavbarActive(activeCategory) {
  // Remove active from all links
  document.getElementById('nav-home').classList.remove('active');
  document.getElementById('nav-diy').classList.remove('active');
  document.getElementById('nav-retro').classList.remove('active');
  document.getElementById('nav-tips').classList.remove('active');

  if (!activeCategory) {
    document.getElementById('nav-home').classList.add('active');
  } else if (activeCategory.toLowerCase() === 'diy') {
    document.getElementById('nav-diy').classList.add('active');
  } else if (activeCategory.toLowerCase() === 'retro gadgets') {
    document.getElementById('nav-retro').classList.add('active');
  } else if (activeCategory.toLowerCase() === 'tips & tricks') {
    document.getElementById('nav-tips').classList.add('active');
  }
}

// Render list of posts (supporting search, category filter, and pagination)
function renderListView(route) {
  // Show list view elements, hide detail view
  blogListView.classList.remove('d-none');
  blogDetailView.classList.add('d-none');

  let filteredPosts = [...allPosts];

  // Apply filters
  if (route.category) {
    filteredPosts = filteredPosts.filter(post => post.category.toLowerCase() === route.category.toLowerCase());
    
    // Setup filter header
    heroSection.classList.add('d-none');
    filterHeader.classList.remove('d-none');
    filterTypeEl.textContent = 'Kategori';
    filterValueEl.textContent = route.category;
  } else if (route.searchQuery) {
    const q = route.searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(q) || 
      post.summary.toLowerCase().includes(q) || 
      post.content.toLowerCase().includes(q) ||
      post.tags.some(tag => tag.toLowerCase().includes(q))
    );
    
    // Setup filter header
    heroSection.classList.add('d-none');
    filterHeader.classList.remove('d-none');
    filterTypeEl.textContent = 'Hasil Pencarian';
    filterValueEl.textContent = `"${route.searchQuery}"`;
    searchInput.value = route.searchQuery;
  } else {
    // Standard home page
    heroSection.classList.remove('d-none');
    filterHeader.classList.add('d-none');
    searchInput.value = ''; // Reset search input
  }

  // Handle empty state
  if (filteredPosts.length === 0) {
    postsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="my-4 text-muted"><i class="fa-solid fa-folder-open fa-3x mb-3"></i></div>
        <h4 class="font-accent text-muted">Tidak ada artikel ditemukan</h4>
        <p class="text-muted small">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
        <a href="#/" class="btn btn-outline-custom mt-3">Lihat Semua Postingan</a>
      </div>
    `;
    paginationNav.classList.add('d-none');
    return;
  }

  // Paginate items
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(route.page, totalPages));
  
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = Math.min(startIndex + POSTS_PER_PAGE, totalPosts);
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Render cards
  postsGrid.innerHTML = '';
  paginatedPosts.forEach(post => {
    const cardCol = document.createElement('div');
    cardCol.className = 'col-md-6 col-lg-4 col-xl-3'; // Responsive grid: 4 cards per row on large screen, 3 on md/lg, 2 on md, 1 on sm
    
    // Tag string builder
    const tagsHtml = post.tags.slice(0, 2).map(tag => `<span class="tag-pill">#${tag}</span>`).join(' ');
    
    // Formatting date
    const dateFormatted = formatDate(post.date);

    // Fallback cover pattern selection
    const fallbackCover = getFallbackCoverSvg(post.category);

    cardCol.innerHTML = `
      <article class="card-blog">
        <div class="card-img-wrapper">
          <div class="card-overlay-badge">${post.category}</div>
          <img src="${post.image}" alt="${post.title}" onerror="this.outerHTML='${fallbackCover}'">
        </div>
        <div class="card-body-custom">
          <div class="post-date"><i class="fa-regular fa-calendar me-1"></i> ${dateFormatted}</div>
          <h3 class="card-title-custom font-accent">
            <a href="#/post/${encodeURIComponent(post.id)}">${post.title}</a>
          </h3>
          <p class="card-text-custom">${post.summary}</p>
          <div class="card-footer-custom">
            <div class="d-flex gap-1">
              ${tagsHtml}
            </div>
            <a href="#/post/${encodeURIComponent(post.id)}" class="read-more-link">
              Baca <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </article>
    `;
    postsGrid.appendChild(cardCol);
  });

  // Render pagination
  renderPagination(currentPage, totalPages, route);
}

// Render the pagination list links
function renderPagination(currentPage, totalPages, route) {
  if (totalPages <= 1) {
    paginationNav.classList.add('d-none');
    return;
  }
  
  paginationNav.classList.remove('d-none');
  paginationList.innerHTML = '';

  // Helper to build correct hash link depending on active filters
  const getHashLink = (page) => {
    if (route.category) {
      return `#/category/${encodeURIComponent(route.category)}/page/${page}`;
    } else if (route.searchQuery) {
      return `#/search/${encodeURIComponent(route.searchQuery)}/page/${page}`;
    } else {
      return `#/page/${page}`;
    }
  };

  // Prev Button
  const prevLi = document.createElement('li');
  prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevLi.innerHTML = `
    <a class="page-link" href="${currentPage === 1 ? 'javascript:void(0)' : getHashLink(currentPage - 1)}" aria-label="Previous">
      <i class="fa-solid fa-chevron-left"></i>
    </a>
  `;
  paginationList.appendChild(prevLi);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageLi = document.createElement('li');
    pageLi.className = `page-item ${currentPage === i ? 'active' : ''}`;
    pageLi.innerHTML = `
      <a class="page-link" href="${getHashLink(i)}">${i}</a>
    `;
    paginationList.appendChild(pageLi);
  }

  // Next Button
  const nextLi = document.createElement('li');
  nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextLi.innerHTML = `
    <a class="page-link" href="${currentPage === totalPages ? 'javascript:void(0)' : getHashLink(currentPage + 1)}" aria-label="Next">
      <i class="fa-solid fa-chevron-right"></i>
    </a>
  `;
  paginationList.appendChild(nextLi);
}

// Render a single post detail page
function renderDetailView(postId) {
  const post = allPosts.find(p => p.id === postId);

  if (!post) {
    postsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning d-inline-block">
          <i class="fa-solid fa-circle-exclamation me-2"></i> Artikel tidak ditemukan.
        </div>
        <div class="mt-3">
          <a href="#/" class="btn btn-primary-custom">Kembali ke Home</a>
        </div>
      </div>
    `;
    blogListView.classList.add('d-none');
    blogDetailView.classList.remove('d-none');
    return;
  }

  // Set up metadata
  document.title = `${post.title} | Weblogdancatan`;
  document.querySelector('meta[name="description"]').setAttribute('content', post.summary);

  // Hide list view, show detail view
  blogListView.classList.add('d-none');
  heroSection.classList.add('d-none');
  filterHeader.classList.add('d-none');
  blogDetailView.classList.remove('d-none');

  // Fill content
  detailCategory.textContent = post.category;
  detailCategory.setAttribute('href', `#/category/${encodeURIComponent(post.category)}`);
  detailDate.innerHTML = `<i class="fa-regular fa-calendar me-1"></i> ${formatDate(post.date)}`;
  detailTitle.textContent = post.title;
  
  // Tags
  detailTags.innerHTML = post.tags.map(tag => `<span class="tag-pill font-accent">#${tag}</span>`).join(' ');

  // Featured Image
  detailImage.src = post.image;
  // If image fails to load, use a canvas-based or CSS background
  detailImage.onerror = function() {
    this.style.display = 'none';
    const container = this.parentElement;
    container.className += ' d-flex align-items-center justify-content-center';
    container.style.height = '350px';
    container.style.background = 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)';
    container.innerHTML = `
      <div class="text-center text-white p-5">
        <i class="${getCategoryIconClass(post.category)} fa-5x mb-3 opacity-75"></i>
        <h2 class="font-accent h4">${post.title}</h2>
      </div>
    `;
  };

  // Body content
  detailContent.innerHTML = post.content;
}

// Helpers
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
}

// Returns font awesome icon for category
function getCategoryIconClass(category) {
  switch(category.toLowerCase()) {
    case 'diy':
      return 'fa-solid fa-screwdriver-wrench';
    case 'retro gadgets':
      return 'fa-solid fa-gamepad';
    case 'tips & tricks':
      return 'fa-solid fa-lightbulb';
    default:
      return 'fa-solid fa-newspaper';
  }
}

// Returns a beautiful gradient SVG image string in case the image asset fails to load or is missing
function getFallbackCoverSvg(category) {
  let icon = 'f0ad'; // default screwdriver wrench
  let gradStart = '#4f46e5';
  let gradEnd = '#9333ea';
  
  if (category.toLowerCase() === 'retro gadgets') {
    icon = 'f11b'; // gamepad
    gradStart = '#ec4899';
    gradEnd = '#8b5cf6';
  } else if (category.toLowerCase() === 'tips & tricks') {
    icon = 'f0eb'; // lightbulb
    gradStart = '#06b6d4';
    gradEnd = '#3b82f6';
  }

  // Create SVG inline data string
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${gradStart};stop-opacity:1"/><stop offset="100%" style="stop-color:${gradEnd};stop-opacity:1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><g fill="white" opacity="0.1"><circle cx="100" cy="100" r="150"/><circle cx="700" cy="400" r="200"/></g><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="220" fill="white" opacity="0.15">&#x${icon};</text><text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-family="Outfit, sans-serif" font-weight="700" font-size="32" fill="white" opacity="0.8">${category.toUpperCase()}</text></svg>`;
}
