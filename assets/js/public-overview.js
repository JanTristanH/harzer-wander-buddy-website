/* No telemetry, cookies or storage: only route into the real exported app. */
(() => {
  'use strict';
  const panel = document.querySelector('.overview-info');
  const frame = document.querySelector('.app-frame');
  const targets = JSON.parse(document.getElementById('stamp-map-targets').textContent);
  const params = new URLSearchParams(window.location.search);
  const stamp = params.get('stempel');
  const target = new URL(frame.dataset.appBase, window.location.origin);
  if (stamp && Object.hasOwn(targets, stamp)) {
    target.pathname += 'map';
    target.searchParams.set('stampId', targets[stamp]);
  } else if (params.get('ansicht') === 'karte') {
    target.pathname += 'map';
  }
  // With scripting disabled the native details element stays open, exposing
  // the same introduction, table and FAQ without depending on the iframe.
  panel.addEventListener('toggle', () => {
    // Keep keyboard focus out of the covered app while reading the HTML panel.
    frame.toggleAttribute('inert', panel.open);
  });
  panel.open = false;
  document.documentElement.classList.add('has-js');
  frame.src = target.href;

  function openAnchor() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const anchor = id && document.getElementById(id);
    if (anchor && panel.contains(anchor)) {
      panel.open = true;
      requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start' }));
    }
  }
  openAnchor();
  window.addEventListener('hashchange', openAnchor);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.open) {
      panel.open = false;
      panel.querySelector('summary').focus();
    }
  });
})();
