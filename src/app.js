import { projects } from './data/projects.js';
import { badges, badgeLabels } from './data/badges.js';
import { about } from './data/about.js';

document.addEventListener('DOMContentLoaded', () => {
    renderAbout();
    renderProjects();
    initializeSmoothScrolling();
    initializeProjectCards();
    initializeExternalLinks();
    initializeBackToTop();
    initializeContactButton();
});

function renderAbout() {
    const mount = document.getElementById('about-paragraphs');
    if (!mount) return;

    mount.innerHTML = about.map(html => `<p>${html}</p>`).join('');
}

function renderProjects() {
    const mount = document.getElementById('project-container');
    if (!mount) return;

    const visible = projects.filter(p => !p.archived);

    mount.innerHTML = visible.map(p => `
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
    `).join('');
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
