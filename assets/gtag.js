/* Google Ads tag (AW-17758801825), Consent Mode v2.
   Consent defaults are set immediately so they exist before gtag.js arrives.
   The library itself (~171 KB) loads on the first interaction or when the
   browser is idle, so it does not compete with hero text (LCP) on mobile.
   The tag is not removed. */
(function () {
    'use strict';

    var ID = 'AW-17758801825';
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    window.gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500
    });
    window.gtag('set', 'url_passthrough', true);
    window.gtag('set', 'ads_data_redaction', true);

    var loaded = false;
    function load() {
        if (loaded) return;
        loaded = true;
        window.gtag('js', new Date());
        window.gtag('config', ID);
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
        document.head.appendChild(script);
    }
    window.sageLoadGtag = load;

    ['pointerdown', 'keydown', 'touchstart'].forEach(function (eventName) {
        window.addEventListener(eventName, load, { once: true, passive: true });
    });

    if ('requestIdleCallback' in window) {
        requestIdleCallback(load, { timeout: 5000 });
    } else {
        window.addEventListener('load', function () { setTimeout(load, 4000); });
    }
})();
