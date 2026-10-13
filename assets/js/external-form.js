(function () {
    'use strict';
    document.querySelectorAll('[data-external-form]').forEach(function (section) {
        var load = section.querySelector('[data-external-form-load]');
        var close = section.querySelector('[data-external-form-close]');
        var content = section.querySelector('[data-external-form-content]');
        if (!load || !close || !content) return;

        load.addEventListener('click', function () {
            if (content.querySelector('iframe')) return;
            var frame = document.createElement('iframe');
            frame.src = 'https://tally.so/embed/wbYe7Z?alignLeft=1&hideTitle=1&transparentBackground=1';
            frame.title = 'Warteliste zur Harzer Wanderbuddy App';
            frame.width = '100%';
            frame.height = '650';
            frame.style.border = '0';
            frame.referrerPolicy = 'no-referrer';
            content.appendChild(frame);
            load.hidden = true;
            load.setAttribute('aria-expanded', 'true');
            close.hidden = false;
            close.focus();
        });
        close.addEventListener('click', function () {
            content.replaceChildren();
            close.hidden = true;
            load.hidden = false;
            load.setAttribute('aria-expanded', 'false');
            load.focus();
        });
    });
}());
