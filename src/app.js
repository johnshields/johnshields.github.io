import { projects } from './data/projects.js';
import { badges, badgeLabels, resolveBadges } from './data/badges.js';
import { about } from './data/about.js';
import { personSchema } from './data/schema.js';

document.addEventListener('DOMContentLoaded', async () => {
    injectSchema();
    renderAbout();
    await resolveBadges();
    renderProjects();
    initializeSmoothScrolling();
    initializeProjectCards();
    initializeExternalLinks();
    initializeBackToTop();
    initializeContactButton();
});

function injectSchema() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(personSchema);
    document.head.appendChild(script);
}

function renderAbout() {
    const mount = document.getElementById('about-paragraphs');
    if (!mount) return;

    mount.innerHTML = about.map(html => `<p>${html}</p>`).join('');
}

const MOBILE_QUERY = '(max-width: 600px)';
const perPage = () => (window.matchMedia(MOBILE_QUERY).matches ? 2 : 4);

function renderProjects() {
    const mount = document.getElementById('project-container');
    if (!mount) return;

    const cards = projects.filter(p => !p.archived).map(p => `
        <article class="project-card">
            <a class="project-link" href="${p.url}" target="_blank" rel="noopener noreferrer">
                <img class="project-image" src="${p.img}" alt="${p.alt ?? p.title}" width="400" height="220" loading="lazy" decoding="async">
            </a>
            <h3 class="p-title">${p.title}</h3>
            <p class="subtext">${p.desc}</p>
            <div class="tech-box">
                ${p.tech.map(key => `
                    <img loading="lazy" decoding="async" src="${badges[key]}" alt="${badgeLabels[key] ?? key}">
                `).join('')}
            </div>
        </article>
    `);

    let currentSize = perPage();
    buildCarousel(mount, cards);

    window.addEventListener('resize', () => {
        // Rebuild when crossing the mobile breakpoint (2 vs 4 per page)
        if (perPage() !== currentSize) {
            currentSize = perPage();
            buildCarousel(mount, cards);
            return;
        }
        // Otherwise keep the active page aligned
        const viewport = mount.querySelector('.project-viewport');
        if (!viewport) return;
        const page = Number(viewport.dataset.page) || 0;
        viewport.scrollLeft = page * viewport.clientWidth;
    }, { passive: true });
}

function buildCarousel(mount, cards) {
    const size = perPage();
    const pages = [];
    for (let i = 0; i < cards.length; i += size) {
        pages.push(cards.slice(i, i + size).join(''));
    }
    const pageCount = pages.length;

    const dots = pageCount > 1
        ? `<div class="carousel-dots" role="tablist" aria-label="Project pages">
                ${pages.map((_, i) => `
                    <button class="carousel-dot${i === 0 ? ' is-active' : ''}" type="button"
                        role="tab" aria-label="Go to page ${i + 1}" data-page="${i}"></button>
                `).join('')}
            </div>`
        : '';

    const arrows = pageCount > 1
        ? `<button class="carousel-arrow prev" type="button" aria-label="Previous projects" disabled>&#8249;</button>
           <button class="carousel-arrow next" type="button" aria-label="Next projects">&#8250;</button>`
        : '';

    mount.innerHTML = `
        <div class="project-carousel">
            ${arrows}
            <div class="project-viewport" tabindex="0" aria-roledescription="carousel" aria-label="Projects" data-page="0">
                <div class="project-track">
                    ${pages.map(page => `<div class="project-page">${page}</div>`).join('')}
                </div>
            </div>
            ${dots}
        </div>
    `;

    if (pageCount > 1) initializeCarousel(mount, pageCount);
}

function initializeCarousel(mount, pageCount) {
    const viewport = mount.querySelector('.project-viewport');
    const prev = mount.querySelector('.carousel-arrow.prev');
    const next = mount.querySelector('.carousel-arrow.next');
    const dots = Array.from(mount.querySelectorAll('.carousel-dot'));
    if (!viewport) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;

    const goTo = (page) => {
        current = Math.max(0, Math.min(pageCount - 1, page));
        viewport.scrollTo({
            left: current * viewport.clientWidth,
            behavior: prefersReduced ? 'auto' : 'smooth',
        });
    };

    const syncControls = () => {
        const page = Math.round(viewport.scrollLeft / viewport.clientWidth);
        current = page;
        viewport.dataset.page = page;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === page));
        if (prev) prev.disabled = page <= 0;
        if (next) next.disabled = page >= pageCount - 1;
    };

    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(Number(d.dataset.page))));

    viewport.addEventListener('scroll', syncControls, { passive: true });

    viewport.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(current + 1);
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(current - 1);
        }
    });
}

function initializeSmoothScrolling() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const id = anchor.getAttribute('href').slice(1);
            if (!id) return;

            const el = document.getElementById(id);
            if (!el) return;

            e.preventDefault();
            if (prefersReduced) {
                el.scrollIntoView();
            } else {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, { passive: false });
    });
}

function initializeProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        const anchor = card.querySelector('.project-link');
        if (!anchor || !anchor.href) return;

        card.style.cursor = 'pointer';
        card.setAttribute('role', 'link');
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

        const go = (newTab = false) => {
            const url = anchor.href;
            if (newTab) window.open(url, '_blank', 'noopener');
            else window.location.href = url;
        };

        card.addEventListener('click', (e) => {
            if (e.defaultPrevented) return;
            if (e.target.closest('a')) return;
            const newTab = e.metaKey || e.ctrlKey;
            go(newTab);
        });

        card.addEventListener('auxclick', (e) => {
            if (e.button === 1) go(true);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') go(false);
            if (e.key === ' ') {
                e.preventDefault();
                go(false);
            }
        });
    });
}

function initializeExternalLinks() {
    const allLinks = document.querySelectorAll('a[href]');

    allLinks.forEach(a => {
        try {
            const url = new URL(a.getAttribute('href'), window.location.href);
            const isHash = a.getAttribute('href')?.startsWith('#');
            const isSameHost = url.host === window.location.host;

            if (!isHash && !isSameHost && !a.hasAttribute('data-noext')) {
                a.target = '_blank';
                const rel = new Set((a.rel || '').split(/\s+/).filter(Boolean));
                rel.add('noopener');
                rel.add('noreferrer');
                a.rel = Array.from(rel).join(' ');
            }
        } catch {
            // Ignore invalid URLs
        }
    });
}

function initializeBackToTop() {
    if (!window.matchMedia('(min-width: 768px)').matches) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '↑ Top';
    btn.className = 'back-to-top';

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReduced ? 'auto' : 'smooth'
        });
    });

    document.body.appendChild(btn);

    const toggleTop = () => {
        btn.classList.toggle('is-visible', window.scrollY > 600);
    };

    toggleTop();
    window.addEventListener('scroll', toggleTop, { passive: true });
}

function initializeContactButton() {
    const btn = document.getElementById('copy-email-btn');
    if (btn) btn.addEventListener('click', copyEmail);
}

function copyEmail() {
    const email = atob('c2hpZWxkcy5qb2huZEBnbWFpbC5jb20=');

    navigator.clipboard.writeText(email).then(() => {
        showCopied();
    }).catch(() => {
        fallbackCopyToClipboard(email);
    });
}

let copyResetTimer;

function showCopied() {
    const btn = document.getElementById('copy-email-btn');
    if (!btn) return;

    const badge = btn.querySelector('.custom-badge');
    const icon = btn.querySelector('i');
    const label = btn.querySelector('span');
    if (!badge || !icon || !label) return;

    badge.classList.add('is-copied');
    icon.className = 'fa fa-check';
    label.textContent = 'COPIED';

    clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
        badge.classList.remove('is-copied');
        icon.className = 'fa fa-envelope';
        label.textContent = 'EMAIL';
    }, 2000);
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopied();
}
