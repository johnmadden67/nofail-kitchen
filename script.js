/* ============================================================
   NO-FAIL KITCHEN — Shared Interactivity
   ============================================================ */

function toggleSection(header) {
  const content = header.nextElementSibling;
  const toggle = header.querySelector('.toggle');
  if (content && content.classList.contains('collapsible')) {
    content.classList.toggle('collapsed');
    toggle?.classList.toggle('collapsed');
    if (!content.classList.contains('collapsed')) {
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  }
}

function togglePhase(block) {
  const body = block.nextElementSibling;
  const toggle = block.querySelector('.phase-toggle');
  if (body && body.classList.contains('phase-body')) {
    body.classList.toggle('collapsed');
    toggle?.classList.toggle('collapsed');
  }
}

// Set initial max-height for collapsible sections
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.collapsible:not(.collapsed)').forEach(el => {
    el.style.maxHeight = el.scrollHeight + 'px';
  });
});

/* ============================================================
   NAVIGATION & SCROLL ENHANCEMENTS
   ============================================================ */
(function() {
  'use strict';

  /* --- Mobile Nav Drawer --- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    var overlay = document.querySelector('.nav-overlay');
    if (!toggle || !navLinks) return;

    function openMenu() {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      navLinks.classList.add('is-open');
      if (overlay) overlay.classList.add('is-visible');
      document.body.style.overflow = 'hidden';
      var firstLink = navLinks.querySelector('a, button');
      if (firstLink) firstLink.focus();
    }

    function closeMenu() {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      navLinks.classList.remove('is-open');
      if (overlay) overlay.classList.remove('is-visible');
      document.body.style.overflow = '';
      toggle.focus();
    }

    function isOpen() {
      return navLinks.classList.contains('is-open');
    }

    toggle.addEventListener('click', function() {
      isOpen() ? closeMenu() : openMenu();
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
      }
    });

    // Close drawer when clicking an anchor link inside it
    navLinks.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function() {
        setTimeout(closeMenu, 150);
      });
    });

    // Focus trap inside drawer
    navLinks.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab' || !isOpen()) return;
      var focusable = navLinks.querySelectorAll('a, button');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* --- Scroll Progress Bar --- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;
    var ticking = false;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Homepage Active Section Tracking --- */
  function initHomepageSectionTracking() {
    if (document.body.dataset.page !== 'home') return;

    var sections = document.querySelectorAll('#method, #recipes, #about');
    var navLinks = document.querySelectorAll('.nav-links a[data-nav-section]');
    if (!sections.length || !navLinks.length) return;

    var linkMap = {};
    navLinks.forEach(function(link) {
      linkMap[link.dataset.navSection] = link;
    });

    function setActive(sectionId) {
      navLinks.forEach(function(l) { l.classList.remove('is-active'); });
      if (linkMap[sectionId]) {
        linkMap[sectionId].classList.add('is-active');
      }
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }

  /* --- Phase Nav Active Tracking (Recipe Pages) --- */
  function initPhaseNavTracking() {
    var phaseNav = document.querySelector('.phase-nav');
    if (!phaseNav) return;

    var phaseLinks = phaseNav.querySelectorAll('a[href^="#"]');
    var targets = [];

    phaseLinks.forEach(function(link) {
      var id = link.getAttribute('href').substring(1);
      var el = document.getElementById(id);
      if (el) {
        targets.push({ id: id, element: el, link: link });
      }
    });

    if (!targets.length) return;

    function setActive(id) {
      phaseLinks.forEach(function(l) { l.classList.remove('is-active'); });
      targets.forEach(function(t) {
        if (t.id === id) {
          t.link.classList.add('is-active');
          // Auto-scroll the phase-nav to keep active link visible
          var linkRect = t.link.getBoundingClientRect();
          var navRect = phaseNav.getBoundingClientRect();
          if (linkRect.left < navRect.left || linkRect.right > navRect.right) {
            t.link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-100px 0px -65% 0px',
      threshold: 0
    });

    targets.forEach(function(t) {
      observer.observe(t.element);
    });
  }

  /* --- Phase Nav Compact Mode & Scroll Indicators --- */
  function initPhaseNavEnhancements() {
    var phaseNav = document.querySelector('.phase-nav');
    if (!phaseNav) return;

    // Compact mode: shrink after scrolling past hero
    var hero = document.querySelector('.recipe-hero');
    if (hero) {
      var compactObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          phaseNav.classList.toggle('is-compact', !entry.isIntersecting);
        });
      }, { threshold: 0 });
      compactObserver.observe(hero);
    }

    // Horizontal scroll fade indicators
    function updateScrollIndicators() {
      var scrollLeft = phaseNav.scrollLeft;
      var scrollWidth = phaseNav.scrollWidth;
      var clientWidth = phaseNav.clientWidth;
      phaseNav.classList.toggle('can-scroll-left', scrollLeft > 2);
      phaseNav.classList.toggle('can-scroll-right', scrollLeft + clientWidth < scrollWidth - 2);
    }

    phaseNav.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators, { passive: true });
    updateScrollIndicators();
  }

  /* --- Back to Top Button --- */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    var ticking = false;
    var threshold = 400;

    function update() {
      var show = window.scrollY > threshold;
      btn.classList.toggle('is-visible', show);
      btn.tabIndex = show ? 0 : -1;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    update();
  }

  /* --- Smooth Scroll with Offset --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href').substring(1);
        if (!targetId) return;
        var target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        var siteNav = document.querySelector('.site-nav');
        var phaseNav = document.querySelector('.phase-nav');
        var offset = siteNav ? siteNav.offsetHeight : 0;
        if (phaseNav) offset += phaseNav.offsetHeight;
        offset += 12;

        var targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        history.pushState(null, '', '#' + targetId);
      });
    });
  }

  /* --- Initialization --- */
  document.addEventListener('DOMContentLoaded', function() {
    // Inject scroll progress bar
    if (!document.querySelector('.scroll-progress')) {
      var progress = document.createElement('div');
      progress.className = 'scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<div class="scroll-progress-bar"></div>';
      var nav = document.querySelector('.site-nav');
      if (nav) nav.after(progress);
    }

    // Inject back-to-top button
    if (!document.querySelector('.back-to-top')) {
      var btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.tabIndex = -1;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      document.body.appendChild(btn);
    }

    // Inject overlay
    if (!document.querySelector('.nav-overlay')) {
      var overlay = document.createElement('div');
      overlay.className = 'nav-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }

    // Position progress bar below both nav bars
    var progressEl = document.querySelector('.scroll-progress');
    if (progressEl) {
      var siteNav = document.querySelector('.site-nav');
      var phaseNav = document.querySelector('.phase-nav');
      var topOffset = siteNav ? siteNav.offsetHeight : 48;
      if (phaseNav) topOffset += phaseNav.offsetHeight;
      progressEl.style.top = topOffset + 'px';
    }

    // Initialize all modules
    initMobileNav();
    initScrollProgress();
    initHomepageSectionTracking();
    initPhaseNavTracking();
    initPhaseNavEnhancements();
    initBackToTop();
    initSmoothScroll();
  });

})();
