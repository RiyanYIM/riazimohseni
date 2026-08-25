/**
 * Sabzlearn Luxe / Riazi Mohseni Academy - Main Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Toast Notifications Container
  createToastContainer();

  // Initialize Header Scroll Effect
  initHeaderScroll();

  // Initialize Mobile Menu
  initMobileMenu();

  // Initialize Course Filtering & Grid Rendering (if on page with courses)
  initCoursesGrid();

  // Initialize Auth Modal
  initAuthModal();

  // Initialize Quick View Modal
  initQuickViewModal();

  // Initialize Promo Code Button in Cart
  initPromoCodeHandler();
});

/* Toast Notification Utility */
function createToastContainer() {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer') || document.body;
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '✨';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '⚠️';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};

/* Header Sticky Shadow on Scroll */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* Mobile Menu Toggle */
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (!btn || !navLinks) return;

  btn.addEventListener('click', () => {
    const isShown = navLinks.style.display === 'flex';
    navLinks.style.display = isShown ? 'none' : 'flex';
    if (!isShown) {
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '78px';
      navLinks.style.right = '0';
      navLinks.style.left = '0';
      navLinks.style.background = 'rgba(18, 18, 20, 0.98)';
      navLinks.style.padding = '24px';
      navLinks.style.borderBottom = '1px solid var(--border-light)';
      navLinks.style.gap = '18px';
    }
  });
}

/* Course Grid & Filter Logic */
let activeFilters = {
  categories: [],
  onlyFree: false,
  myCoursesOnly: false,
  searchQuery: '',
  sortBy: 'newest'
};

function initCoursesGrid() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  // Checkbox category filters
  const categoryCheckboxes = document.querySelectorAll('.category-filter-checkbox');
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      activeFilters.categories = Array.from(categoryCheckboxes)
        .filter(c => c.checked)
        .map(c => c.value);
      renderCourses();
    });
  });

  // Switch: Free only
  const freeToggle = document.getElementById('filterFreeOnly');
  if (freeToggle) {
    freeToggle.addEventListener('change', (e) => {
      activeFilters.onlyFree = e.target.checked;
      renderCourses();
    });
  }

  // Switch: My Courses
  const myCoursesToggle = document.getElementById('filterMyCourses');
  if (myCoursesToggle) {
    myCoursesToggle.addEventListener('change', (e) => {
      activeFilters.myCoursesOnly = e.target.checked;
      renderCourses();
    });
  }

  // Search input
  const searchInput = document.getElementById('coursesSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeFilters.searchQuery = e.target.value.trim().toLowerCase();
      renderCourses();
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('coursesSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeFilters.sortBy = e.target.value;
      renderCourses();
    });
  }

  // Reset filter button
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      categoryCheckboxes.forEach(cb => cb.checked = false);
      if (freeToggle) freeToggle.checked = false;
      if (myCoursesToggle) myCoursesToggle.checked = false;
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'newest';

      activeFilters = {
        categories: [],
        onlyFree: false,
        myCoursesOnly: false,
        searchQuery: '',
        sortBy: 'newest'
      };
      renderCourses();
      window.showToast("فیلترها به حالت اولیه بازگشتند.", "info");
    });
  }

  // Initial render
  renderCourses();
}

function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;

  let filtered = [...COURSES_DATA];

  // 1. Filter by category
  if (activeFilters.categories.length > 0) {
    filtered = filtered.filter(course => activeFilters.categories.includes(course.category));
  }

  // 2. Filter free
  if (activeFilters.onlyFree) {
    filtered = filtered.filter(course => course.isFree);
  }

  // 3. Filter My Courses
  if (activeFilters.myCoursesOnly) {
    const enrolledIds = window.cart?.getEnrolledCourses() || [];
    filtered = filtered.filter(course => enrolledIds.includes(course.id));
  }

  // 4. Filter search
  if (activeFilters.searchQuery) {
    const q = activeFilters.searchQuery;
    filtered = filtered.filter(course => 
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q) ||
      course.categoryName.toLowerCase().includes(q)
    );
  }

  // 5. Sorting
  if (activeFilters.sortBy === 'newest') {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else if (activeFilters.sortBy === 'popular') {
    filtered.sort((a, b) => b.studentsCount - a.studentsCount);
  } else if (activeFilters.sortBy === 'price-low') {
    filtered.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (activeFilters.sortBy === 'price-high') {
    filtered.sort((a, b) => b.finalPrice - a.finalPrice);
  }

  // Render HTML
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
        <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
        <h3 style="color: var(--primary-gold); margin-bottom: 8px;">هیچ دوره‌ای با این مشخصات یافت نشد!</h3>
        <p style="color: var(--text-muted); font-size: 14px;">لطفاً فیلترها را تغییر دهید یا عبارت دیگری را جستجو کنید.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(course => createCourseCardHtml(course)).join('');
}

function createCourseCardHtml(course) {
  const telegramLink = getCourseTelegramOrderLink(course);

  return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-card-media" onclick="openCourseQuickView('${course.id}')" style="cursor: pointer;" title="مشاهده سرفصل‌ها و جزییات">
        ${course.coverSvg}
      </div>

      <div class="course-card-body">
        <h3 class="course-card-title" onclick="openCourseQuickView('${course.id}')" style="cursor: pointer;">${course.title}</h3>
        <div class="course-card-subtitle">${course.subtitle}</div>
        <div class="course-features-tag">${course.feature}</div>
        
        <div class="course-instructor-meta">
          <div class="instructor-info">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>${course.instructor}</span>
          </div>
          <div class="students-count">
            <span>${course.studentsCount}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        </div>
      </div>

      <div class="course-card-footer">
        <div class="price-row">
          <div class="discount-badge">${course.discountPercent}% تخفیف</div>
          <div class="prices-container">
            ${course.originalPrice > 0 ? `<div class="original-price">${formatPrice(course.originalPrice)}</div>` : ''}
            <div class="final-price">
              ${formatPrice(course.finalPrice)}
              ${course.finalPrice > 0 ? `<span>تومان</span>` : ''}
            </div>
          </div>
        </div>

        <div class="card-actions-grid">
          <button class="btn-card-cart" onclick="window.cart.addItem('${course.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span>افزودن به سبد</span>
          </button>
          
          <a href="${telegramLink}" target="_blank" class="btn-card-telegram" title="سفارش مستقیم و دریافت آنی لینک از تلگرام">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            <span>خرید تلگرام</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

/* Quick View Course Modal */
function initQuickViewModal() {
  const modal = document.getElementById('courseQuickViewModal');
  const closeBtn = document.getElementById('closeQuickViewModalBtn');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

window.openCourseQuickView = function(courseId) {
  const course = COURSES_DATA.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('courseQuickViewModal');
  const body = document.getElementById('quickViewModalBody');
  if (!modal || !body) return;

  const tgLink = getCourseTelegramOrderLink(course);

  body.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; align-items: center;">
      <div style="flex: 1; min-width: 240px;">
        <span class="discount-badge" style="margin-bottom: 8px; display: inline-block;">${course.categoryName} • ${course.discountPercent}٪ تخفیف</span>
        <h2 style="font-size: 22px; color: var(--primary-gold); margin-bottom: 8px;">${course.title}</h2>
        <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.7;">${course.description}</p>
      </div>
      <div style="width: 140px; height: 140px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-light);">
        ${course.coverSvg}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; text-align: center;">
      <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div style="font-size: 11px; color: var(--text-muted);">مدت آموزش</div>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${course.hours} ساعت</div>
      </div>
      <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div style="font-size: 11px; color: var(--text-muted);">دانشجویان فعال</div>
        <div style="font-size: 15px; font-weight: 700; color: var(--text-primary);">${course.studentsCount} نفر</div>
      </div>
      <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div style="font-size: 11px; color: var(--text-muted);">امتیاز رضایت</div>
        <div style="font-size: 15px; font-weight: 700; color: var(--primary-gold);">${course.rating} ★</div>
      </div>
    </div>

    <h4 style="font-size: 15px; color: var(--text-primary); margin-bottom: 12px; border-bottom: 1px solid var(--border-light); padding-bottom: 6px;">سرفصل‌های آموزشی دوره:</h4>
    <ul style="list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px;">
      ${course.syllabus.map((item, idx) => `
        <li style="font-size: 13px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: var(--radius-sm);">
          <span style="color: var(--primary-gold); font-weight: bold;">${idx + 1}.</span>
          <span>${item}</span>
        </li>
      `).join('')}
    </ul>

    <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; border-top: 1px solid var(--border-light); padding-top: 18px; flex-wrap: wrap;">
      <div>
        <span style="font-size: 12px; color: var(--text-muted);">قیمت نهایی با تخفیف:</span>
        <div style="font-size: 20px; font-weight: 800; color: var(--primary-gold);">${formatPrice(course.finalPrice)} تومان</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn-auth-gold" onclick="window.cart.addItem('${course.id}'); document.getElementById('courseQuickViewModal').classList.remove('active');">
          🛒 افزودن به سبد خرید
        </button>
        <a href="${tgLink}" target="_blank" class="btn-card-telegram" style="padding: 10px 20px; font-size: 14px;">
          🚀 ثبت سفارش در تلگرام
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

/* Auth / Login Modal */
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const openBtns = document.querySelectorAll('.auth-modal-trigger');
  const closeBtn = document.getElementById('closeAuthModalBtn');
  const form = document.getElementById('authForm');
  if (!modal) return;

  openBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('authPhoneInput')?.value;
      if (!phone || phone.length < 10) {
        window.showToast("لطفاً شماره موبایل معتبر وارد کنید.", "danger");
        return;
      }
      modal.classList.remove('active');
      window.showToast(`خوش آمدید! ورود با موفقیت انجام شد.`, "success");
      
      // Update Auth button text
      document.querySelectorAll('.btn-auth-gold').forEach(btn => {
        btn.innerHTML = `<span>👤 پنل کاربری</span>`;
      });
    });
  }
}

/* Cart Promo Code Application */
function initPromoCodeHandler() {
  const btn = document.getElementById('applyPromoBtn');
  const input = document.getElementById('promoCodeInput');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    window.cart?.applyPromo(input.value);
  });
}
