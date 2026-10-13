/* Shared behaviour — Sagelight Studio ("Data Manifest" theme)
   - Google Ads conversion helper
   - single dark theme (legacy toggle neutralised)
   - mobile menu, language picker
   - motion: ambient glows, scroll progress, reveals, spec cascades,
     scramble text, hero tilt, card spotlight, principle highlights.
   All motion is skipped under prefers-reduced-motion. */

// Conversion helper. Fires Google Ads conversion (cookieless under default-denied
// Consent Mode v2) without preventing default link behavior — so target="_blank"
// links still open new tabs and gtag.js sendBeacon ensures the conversion ping
// survives navigation. Generates a unique transaction_id per click so Google can
// deduplicate cleanly when "Una" counting is selected.
window.gtagReportConversion = function (sendTo) {
    if (typeof window.gtag === 'function') {
        var txId = 'sgl-' + Date.now().toString(36) + '-' +
                   Math.random().toString(36).slice(2, 10);
        window.gtag('event', 'conversion', {
            'send_to': sendTo,
            'transaction_id': txId
        });
    }
    return true;
};


/* Theme + mobile menu */
(function () {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('js');
    window.cycleTheme = function () {};

    function navList() {
        return document.getElementById('navTabs') || document.getElementById('navLinks');
    }
    function setMenu(open) {
        var nav = navList();
        if (!nav) return;
        nav.classList.toggle('nav__tabs--open', open);
        var btn = document.getElementById('mobileMenuBtn');
        if (btn) {
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        }
    }
    window.toggleMobileMenu = function () {
        var nav = navList();
        if (nav) setMenu(!nav.classList.contains('nav__tabs--open'));
    };

    // Pages without an inline onclick get the handler attached here.
    function bindMenuBtn() {
        var btn = document.getElementById('mobileMenuBtn');
        if (btn && !btn.hasAttribute('onclick') && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', function (e) { e.stopPropagation(); window.toggleMobileMenu(); });
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindMenuBtn);
    else bindMenuBtn();

    document.addEventListener('click', function (e) {
        var nav = document.querySelector('.nav');
        if (nav && !nav.contains(e.target)) setMenu(false);
        if (e.target.closest && e.target.closest('.nav__tab')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setMenu(false);
    });
})();


/* Language picker — built from <link rel="alternate" hreflang> tags. Pages that
   exist in one language only fall back to each locale's home page, so the picker
   is always available. Built with safe DOM methods (no innerHTML). */
(function () {
    var LOCALES = [
        { code: 'en',    short: 'EN', name: 'English',    home: '/' },
        { code: 'ro',    short: 'RO', name: 'Română',     home: '/ro/' },
        { code: 'hu',    short: 'HU', name: 'Magyar',     home: '/hu/' },
        { code: 'pl',    short: 'PL', name: 'Polski',     home: '/pl/' },
        { code: 'cs',    short: 'CZ', name: 'Čeština',    home: '/cz/' },
        { code: 'de',    short: 'DE', name: 'Deutsch',    home: '/de/' },
        { code: 'fr',    short: 'FR', name: 'Français',   home: '/fr/' },
        { code: 'es',    short: 'ES', name: 'Español',    home: '/es/' },
        { code: 'it',    short: 'IT', name: 'Italiano',   home: '/it/' },
        { code: 'nl',    short: 'NL', name: 'Nederlands', home: '/nl/' },
        { code: 'pt-pt', short: 'PT', name: 'Português',  home: '/pt/' },
        { code: 'sv',    short: 'SV', name: 'Svenska',    home: '/sv/' }
    ];

    function makeEl(tag, attrs, text) {
        var el = document.createElement(tag);
        if (attrs) for (var k in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
        }
        if (text != null) el.textContent = text;
        return el;
    }
    function svgGlobe() {
        var NS = 'http://www.w3.org/2000/svg';
        var s = document.createElementNS(NS, 'svg');
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
        s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.6');
        s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'lang-picker__globe');
        ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z', 'M3 12h18', 'M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z']
            .forEach(function (d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.appendChild(p); });
        return s;
    }
    // Map canonical https://sagelight-studio.com/... to a root-relative path so the
    // picker also works on local previews.
    function localHref(href) {
        var m = /^https:\/\/sagelight-studio\.com(\/.*)$/.exec(href);
        if (m) return m[1];
        return href.charAt(0) === '/' ? href : null;
    }

    function init() {
        if (document.querySelector('.lang-picker')) return;
        var actions = document.querySelector('.nav__actions');
        if (!actions) return;

        var byCode = {};
        var alternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
        for (var i = 0; i < alternates.length; i++) {
            var hl = (alternates[i].getAttribute('hreflang') || '').toLowerCase();
            var href = localHref(alternates[i].getAttribute('href') || '');
            if (hl && hl !== 'x-default' && href && !byCode[hl]) byCode[hl] = href;
        }

        var currentLang = (document.documentElement.lang || 'en').toLowerCase();
        if (currentLang === 'cz') currentLang = 'cs';
        if (currentLang === 'pt') currentLang = 'pt-pt';

        var legacy = document.querySelectorAll('.lang-switch');
        for (var k = 0; k < legacy.length; k++) legacy[k].parentNode && legacy[k].parentNode.removeChild(legacy[k]);

        var wrapper = makeEl('div', { 'class': 'lang-picker' });
        var btn = makeEl('button', {
            type: 'button', id: 'langPickerBtn',
            'class': 'nav__icon-btn lang-picker__btn',
            'aria-label': 'Language', 'aria-haspopup': 'true', 'aria-expanded': 'false',
            'aria-controls': 'langPickerMenu'
        });
        var cur = LOCALES.filter(function (l) { return l.code === currentLang; })[0] || LOCALES[0];
        btn.appendChild(svgGlobe());
        btn.appendChild(makeEl('span', { 'class': 'lang-picker__current' }, cur.short));
        btn.appendChild(makeEl('span', { 'class': 'lang-picker__caret', 'aria-hidden': 'true' }, '▾'));

        var menu = makeEl('ul', { 'class': 'lang-picker__menu', id: 'langPickerMenu' });
        LOCALES.forEach(function (loc) {
            var isCurrent = loc.code === currentLang;
            var target = byCode[loc.code] || loc.home;
            var li = makeEl('li');
            var attrs = { href: target, hreflang: loc.code, lang: loc.code,
                'class': 'lang-picker__item' + (isCurrent ? ' lang-picker__item--current' : '') };
            if (isCurrent) attrs['aria-current'] = 'true';
            var a = makeEl('a', attrs);
            a.appendChild(makeEl('span', { 'class': 'lang-picker__code', 'aria-hidden': 'true' }, loc.short));
            a.appendChild(makeEl('span', { 'class': 'lang-picker__name' }, loc.name));
            li.appendChild(a);
            menu.appendChild(li);
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(menu);
        actions.insertBefore(wrapper, actions.firstChild);

        function close() { wrapper.classList.remove('lang-picker--open'); btn.setAttribute('aria-expanded', 'false'); }
        function open() { wrapper.classList.add('lang-picker--open'); btn.setAttribute('aria-expanded', 'true'); }
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (wrapper.classList.contains('lang-picker--open')) close(); else open();
        });
        document.addEventListener('click', function (e) { if (!wrapper.contains(e.target)) close(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && wrapper.classList.contains('lang-picker--open')) { close(); btn.focus(); }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();


/* Motion */
(function () {
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        // ambient glows + scroll progress, injected once per page
        if (!calm && !document.querySelector('.ambient')) {
            var amb = document.createElement('div');
            amb.className = 'ambient'; amb.setAttribute('aria-hidden', 'true');
            amb.appendChild(document.createElement('span'));
            amb.appendChild(document.createElement('span'));
            document.body.insertBefore(amb, document.body.firstChild);
        }
        if (!document.querySelector('.progress')) {
            var bar = document.createElement('div');
            bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
            document.body.insertBefore(bar, document.body.firstChild);
        }

        // spec rows cascade in one after another
        document.querySelectorAll('.spec').forEach(function (dl) {
            Array.prototype.forEach.call(dl.children, function (row, i) { row.style.setProperty('--d', i); });
        });

        // reveal on scroll (also covers spec lists that sit outside a .reveal)
        var revealEls = document.querySelectorAll('.reveal, .spec');
        if (calm || !('IntersectionObserver' in window)) {
            revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        } else {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            revealEls.forEach(function (el) { io.observe(el); });
        }

        // numbered principles light up while crossing the middle of the viewport
        var rules = document.querySelectorAll('.rules > li');
        if (calm || !('IntersectionObserver' in window)) {
            rules.forEach(function (li) { li.classList.add('lit'); });
        } else {
            var lit = new IntersectionObserver(function (es) {
                es.forEach(function (e) { e.target.classList.toggle('lit', e.isIntersecting); });
            }, { rootMargin: '-35% 0px -45% 0px' });
            rules.forEach(function (li) { lit.observe(li); });
        }

        if (calm) return;

        // scramble: random glyphs settle left-to-right into the final text
        var G = '01#%&*<>/=+$@ABCDEF';
        document.querySelectorAll('[data-scramble]').forEach(function (el) {
            var fin = el.textContent, n = fin.length, start = null, dur = 900;
            el.style.minWidth = el.offsetWidth + 'px';
            setTimeout(function () {
                requestAnimationFrame(function step(t) {
                    if (!start) start = t;
                    var p = Math.min((t - start) / dur, 1), done = Math.floor(p * n);
                    while (el.firstChild) el.removeChild(el.firstChild);
                    for (var i = 0; i < n; i++) {
                        var c = fin[i];
                        if (i < done || c === ' ' || c === ' ') el.appendChild(document.createTextNode(c));
                        else {
                            var g = document.createElement('span'); g.className = 'g';
                            g.textContent = G[(Math.random() * G.length) | 0]; el.appendChild(g);
                        }
                    }
                    if (p < 1) requestAnimationFrame(step); else el.textContent = fin;
                });
            }, +el.getAttribute('data-scramble') || 0);
        });

        if (!fine) return;

        // gentle tilt toward the pointer for [data-tilt] elements
        document.querySelectorAll('[data-tilt]').forEach(function (tilt) {
            var zone = tilt.closest('section') || tilt;
            zone.addEventListener('pointermove', function (e) {
                var r = tilt.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
                tilt.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
                tilt.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
            });
            zone.addEventListener('pointerleave', function () {
                tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg');
            });
        });

        // spotlight follows the cursor across cards
        document.addEventListener('pointermove', function (e) {
            var card = e.target.closest && e.target.closest('.glass-card, .solid-card, .manifest');
            if (!card) return;
            var r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }, { passive: true });
    });
})();
