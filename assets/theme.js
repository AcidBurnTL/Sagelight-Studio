/* Shared theme + mobile menu + Google Ads conversion helper — Sagelight Studio */

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


(function () {
    var themes = ['dark', 'light', 'system'];
    var icons = { dark: '☾', light: '☀', system: '◑' };
    var labels = {
        dark: 'Theme: dark. Activate to switch to light theme.',
        light: 'Theme: light. Activate to switch to system theme.',
        system: 'Theme: system. Activate to switch to dark theme.'
    };
    var idx = 0;

    function systemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function apply(t) {
        var resolved = t === 'system' ? systemTheme() : t;
        document.documentElement.setAttribute('data-theme', resolved);
        var iconEl = document.getElementById('themeIcon');
        if (iconEl) iconEl.textContent = icons[t];
        var btn = document.getElementById('themeToggle');
        if (btn) btn.setAttribute('aria-label', labels[t]);
        try { localStorage.setItem('sage-theme', t); } catch (e) {}
    }

    window.cycleTheme = function () {
        idx = (idx + 1) % themes.length;
        apply(themes[idx]);
    };

    window.toggleMobileMenu = function () {
        var nav = document.getElementById('navTabs') || document.getElementById('navLinks');
        if (!nav) return;
        var isOpen = nav.classList.toggle('nav__tabs--open');
        var btn = document.getElementById('mobileMenuBtn');
        if (btn) {
            btn.setAttribute('aria-expanded', String(isOpen));
            btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        }
    };

    var saved;
    try { saved = localStorage.getItem('sage-theme'); } catch (e) {}
    if (saved && themes.indexOf(saved) !== -1) idx = themes.indexOf(saved);
    apply(themes[idx]);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (themes[idx] === 'system') apply('system');
    });

    document.addEventListener('click', function (e) {
        var nav = document.querySelector('.nav');
        if (nav && !nav.contains(e.target)) {
            var tabs = document.getElementById('navTabs') || document.getElementById('navLinks');
            if (tabs && tabs.classList.contains('nav__tabs--open')) {
                tabs.classList.remove('nav__tabs--open');
                var btn = document.getElementById('mobileMenuBtn');
                if (btn) {
                    btn.setAttribute('aria-expanded', 'false');
                    btn.setAttribute('aria-label', 'Open menu');
                }
            }
        }
    });
})();


/* Language picker — auto-built from <link rel="alternate" hreflang> tags.
   No per-page HTML changes needed; locales discovered at runtime.
   Built with safe DOM methods (no innerHTML, no untrusted strings). */
(function () {
    var LOCALE_NAMES = {
        en: 'English', ro: 'Română', hu: 'Magyar', pl: 'Polski', cs: 'Čeština', cz: 'Čeština',
        de: 'Deutsch', fr: 'Français', es: 'Español', it: 'Italiano', nl: 'Nederlands',
        'pt-pt': 'Português', sv: 'Svenska'
    };
    var LOCALE_SHORT = {
        en: 'EN', ro: 'RO', hu: 'HU', pl: 'PL', cs: 'CZ', cz: 'CZ',
        de: 'DE', fr: 'FR', es: 'ES', it: 'IT', nl: 'NL', 'pt-pt': 'PT', sv: 'SV'
    };
    var ORDER = {
        en: 0, ro: 1, hu: 2, pl: 3, cs: 4, cz: 4,
        de: 5, fr: 6, es: 7, it: 8, nl: 9, 'pt-pt': 10, sv: 11
    };
    var ALLOWED = {
        en: 1, ro: 1, hu: 1, pl: 1, cs: 1, cz: 1,
        de: 1, fr: 1, es: 1, it: 1, nl: 1, 'pt-pt': 1, sv: 1
    };

    function makeEl(tag, attrs, text) {
        var el = document.createElement(tag);
        if (attrs) {
            for (var k in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                    el.setAttribute(k, attrs[k]);
                }
            }
        }
        if (text != null) el.textContent = text;
        return el;
    }

    function init() {
        if (document.querySelector('.lang-picker')) return;

        var alternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
        if (!alternates.length) return;

        var locales = [];
        var seen = {};
        for (var i = 0; i < alternates.length; i++) {
            var hl = (alternates[i].getAttribute('hreflang') || '').toLowerCase();
            var href = alternates[i].getAttribute('href') || '';
            if (!hl || hl === 'x-default' || seen[hl] || !href) continue;
            if (!ALLOWED[hl]) continue;
            // Only allow same-origin https URLs to the canonical domain or relative paths
            if (!/^https:\/\/sagelight-studio\.com\//.test(href) && href.charAt(0) !== '/') continue;
            seen[hl] = true;
            locales.push({ code: hl, href: href });
        }
        if (locales.length < 2) return;

        locales.sort(function (a, b) {
            return (ORDER[a.code] != null ? ORDER[a.code] : 99)
                 - (ORDER[b.code] != null ? ORDER[b.code] : 99);
        });

        var currentLang = (document.documentElement.lang || 'en').toLowerCase();
        if (currentLang === 'cz') currentLang = 'cs';

        var actions = document.querySelector('.nav__actions');
        if (!actions) return;

        // Remove any legacy static "EN · RO" text spans — superseded by this dropdown.
        var legacy = document.querySelectorAll('.lang-switch');
        for (var k = 0; k < legacy.length; k++) {
            if (legacy[k].parentNode) legacy[k].parentNode.removeChild(legacy[k]);
        }

        var wrapper = makeEl('div', { 'class': 'lang-picker' });

        var btn = makeEl('button', {
            type: 'button',
            id: 'langPickerBtn',
            'class': 'nav__icon-btn lang-picker__btn',
            'aria-label': 'Switch language',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false'
        });
        var currentLabel = makeEl('span', { 'class': 'lang-picker__current' },
            LOCALE_SHORT[currentLang] || currentLang.toUpperCase());
        var caret = makeEl('span', { 'class': 'lang-picker__caret', 'aria-hidden': 'true' }, '▾');
        btn.appendChild(currentLabel);
        btn.appendChild(caret);

        var menu = makeEl('ul', {
            'class': 'lang-picker__menu',
            role: 'menu',
            'aria-labelledby': 'langPickerBtn'
        });

        for (var j = 0; j < locales.length; j++) {
            var loc = locales[j];
            var isCurrent = loc.code === currentLang;
            var name = LOCALE_NAMES[loc.code] || loc.code.toUpperCase();
            var shortCode = LOCALE_SHORT[loc.code] || loc.code.toUpperCase();

            var li = makeEl('li', { role: 'none' });
            var aAttrs = {
                role: 'menuitem',
                href: loc.href,
                hreflang: loc.code,
                'class': 'lang-picker__item' + (isCurrent ? ' lang-picker__item--current' : '')
            };
            if (isCurrent) aAttrs['aria-current'] = 'true';
            var a = makeEl('a', aAttrs);
            a.appendChild(makeEl('span', { 'class': 'lang-picker__code', 'aria-hidden': 'true' }, shortCode));
            a.appendChild(makeEl('span', { 'class': 'lang-picker__name' }, name));
            li.appendChild(a);
            menu.appendChild(li);
        }

        wrapper.appendChild(btn);
        wrapper.appendChild(menu);
        actions.insertBefore(wrapper, actions.firstChild);

        function close() {
            wrapper.classList.remove('lang-picker--open');
            btn.setAttribute('aria-expanded', 'false');
        }
        function open() {
            wrapper.classList.add('lang-picker--open');
            btn.setAttribute('aria-expanded', 'true');
        }
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (wrapper.classList.contains('lang-picker--open')) close(); else open();
        });
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
