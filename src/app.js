document.addEventListener('DOMContentLoaded', () => {
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
                el.scrollIntoView({behavior: 'smooth', block: 'start'});
            }
        }, {passive: false});
    });

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
        }
    });

    const sectionIds = Array.from(document.querySelectorAll('section[id]')).map(s => s.id);
    const navMap = new Map();
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        const id = link.getAttribute('href').slice(1);
        if (id) navMap.set(id, link);
    });

    if (sectionIds.length && navMap.size) {
        const setActive = (id) => {
            navMap.forEach(l => l.classList.remove('active'));
            const link = navMap.get(id);
            if (link) link.classList.add('active');
        };

        const io = new IntersectionObserver((entries) => {
            let top = null;
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const id = e.target.id;
                if (!top || e.intersectionRatio > top.ratio) top = {id, ratio: e.intersectionRatio};
            });
            if (top) setActive(top.id);
        }, {rootMargin: '0px 0px -40% 0px', threshold: [0.2, 0.4, 0.6, 0.8, 1]});

        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
    }

    if (window.matchMedia('(min-width: 768px)').matches) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '↑ Top';
        Object.assign(btn.style, {
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            padding: '8px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'var(--elev)',
            color: 'var(--text)',
            boxShadow: '0 6px 20px rgba(0,0,0,.22)',
            opacity: '0',
            transform: 'translateY(8px)',
            transition: 'opacity .2s, transform .2s',
            pointerEvents: 'none',
            zIndex: '50'
        });
        btn.addEventListener('click', () => {
            window.scrollTo({top: 0, behavior: prefersReduced ? 'auto' : 'smooth'});
        });
        document.body.appendChild(btn);

        const toggleTop = () => {
            const show = window.scrollY > 600;
            btn.style.opacity = show ? '1' : '0';
            btn.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
            btn.style.pointerEvents = show ? 'auto' : 'none';
        };
        toggleTop();
        window.addEventListener('scroll', toggleTop, {passive: true});
    }
});

(() => {
    const attach = () => {
        const emailEl = document.querySelector('.email');
        if (!emailEl || emailEl.dataset.clipInit) return;
        emailEl.dataset.clipInit = '1';

        emailEl.style.cursor = 'pointer';
        emailEl.title = 'Click to copy';

        emailEl.addEventListener('click', () => {
            const txt = (emailEl.getAttribute('data-email') || emailEl.textContent || '').trim();
            if (!txt) return;
            navigator.clipboard.writeText(txt);

            const toast = document.createElement('div');
            toast.textContent = 'Email copied!';
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '40px',
                right: '20px',
                background: 'var(--elev)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '6px',
                opacity: '0',
                transition: 'opacity .2s',
                zIndex: '60'
            });
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.style.opacity = '1');
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 200);
            }, 1500);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attach, {once: true});
    } else {
        attach();
    }
})();
