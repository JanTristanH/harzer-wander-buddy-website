/* Public static overview. The rendered HTML remains usable without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('[data-guest-overview]');
  if (!root) return;

  const list = root.querySelector('[data-stamp-list]');
  const cards = Array.from(list.querySelectorAll('.stamp-card'));
  const search = root.querySelector('#stamp-search');
  const count = root.querySelector('[data-result-count]');
  const locationStatus = root.querySelector('[data-location-status]');
  const mapStatus = root.querySelector('[data-map-status]');
  const mapPanel = root.querySelector('#stamp-map-panel');
  const listPanel = root.querySelector('#stamp-list-panel');
  const filters = Array.from(root.querySelectorAll('[data-filter]'));
  const views = Array.from(root.querySelectorAll('[data-view]'));
  let filter = 'all';
  let position = null;
  let locationRequest = 0;
  let mode = 'liste';
  let map;
  let markers;
  let leafletPromise;

  const normalize = (value) => value.toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
  const searchable = new Map(cards.map((card) => [card, normalize(`${card.dataset.number} ${card.dataset.name}`)]));

  function distance(card) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitude = Number(card.dataset.lat);
    const longitude = Number(card.dataset.lng);
    const a = Math.sin(radians(latitude - position.latitude) / 2) ** 2
      + Math.cos(radians(position.latitude)) * Math.cos(radians(latitude))
      * Math.sin(radians(longitude - position.longitude) / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function renderMarkers() {
    if (!map) return;
    markers.clearLayers();
    const visible = cards.filter((card) => !card.hidden);
    visible.forEach((card) => {
      const title = `HWN ${card.dataset.number}: ${card.dataset.name}`;
      const popup = document.createElement('div');
      const heading = document.createElement('strong');
      heading.textContent = title;
      const link = document.createElement('a');
      link.href = card.querySelector('.stamp-card-link').getAttribute('href');
      link.className = 'hwb-map-link';
      link.textContent = 'Stempelstelle entdecken →';
      popup.append(heading, document.createElement('br'), link);
      window.L.marker([Number(card.dataset.lat), Number(card.dataset.lng)], {
        title,
        alt: title,
        icon: window.L.divIcon({
          className: 'hwb-marker',
          html: String(Number(card.dataset.number)),
          iconSize: [34, 30],
          iconAnchor: [17, 15],
        }),
      }).bindPopup(popup).addTo(markers);
    });
    if (visible.length) map.fitBounds(markers.getBounds(), { padding: [30, 30], maxZoom: 13, animate: false });
  }

  function render() {
    // Match words independently, so "HWN 46" and "46 grenzmuseum" both work.
    const terms = normalize(search.value).trim().split(/\s+/).filter((term) => term && term !== 'hwn');
    let total = 0;
    cards.forEach((card) => {
      const km = position ? distance(card) : null;
      const matches = terms.every((term) => /^\d+$/.test(term)
        ? Number(term) === Number(card.dataset.number) : searchable.get(card).includes(term));
      card.hidden = !matches || (filter === 'near' && (km === null || km > 15));
      card.querySelector('[data-distance]').textContent = km === null ? '' : `${km.toLocaleString('de-DE', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km Luftlinie`;
      if (!card.hidden) total += 1;
    });
    const ordered = [...cards].sort((a, b) => filter === 'near' && position
      ? distance(a) - distance(b) : Number(a.dataset.number) - Number(b.dataset.number));
    ordered.forEach((card) => list.append(card));
    count.textContent = `${total} ${total === 1 ? 'Stempelstelle' : 'Stempelstellen'}${filter === 'near' ? ' im Umkreis von 15 km' : ''}`;
    root.querySelector('[data-empty]').hidden = total > 0;
    filters.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderMarkers();
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (!leafletPromise) {
      leafletPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = root.dataset.leafletUrl;
        script.onload = () => window.L ? resolve() : reject(new Error('Leaflet unavailable'));
        script.onerror = reject;
        document.head.append(script);
      }).catch((error) => {
        leafletPromise = null;
        throw error;
      });
    }
    return leafletPromise;
  }

  async function showMap() {
    mapStatus.textContent = 'Karte wird geladen …';
    try {
      await loadLeaflet();
      if (mode !== 'karte') return;
      if (!map) {
        map = window.L.map(root.querySelector('#stamp-map'), { scrollWheelZoom: false }).setView([51.77, 10.75], 10);
        window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).on('tileerror', () => {
          mapStatus.textContent = 'Ein Teil der Karte konnte nicht geladen werden. Alle Stempelstellen findest du auch in der Liste.';
        }).addTo(map);
        markers = window.L.featureGroup().addTo(map);
      }
      map.invalidateSize();
      renderMarkers();
      mapStatus.textContent = '';
    } catch {
      mapStatus.textContent = 'Die Karte konnte nicht geladen werden. Wechsle zur Liste, um die Stempelstellen zu entdecken.';
    }
  }

  function setView() {
    mode = window.location.hash === '#karte' ? 'karte' : 'liste';
    listPanel.hidden = mode !== 'liste';
    mapPanel.hidden = mode !== 'karte';
    views.forEach((view) => {
      if (view.dataset.view === mode) view.setAttribute('aria-current', 'true');
      else view.removeAttribute('aria-current');
    });
    if (mode === 'karte') showMap();
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    const request = ++locationRequest;
    if (button.dataset.filter !== 'near') {
      filter = 'all';
      locationStatus.textContent = '';
      render();
      return;
    }
    if (position) {
      filter = 'near';
      locationStatus.textContent = '';
      render();
      return;
    }
    if (!navigator.geolocation) {
      locationStatus.textContent = 'Dein Browser unterstützt keine Standortsuche.';
      return;
    }
    locationStatus.textContent = 'Standort wird ermittelt …';
    navigator.geolocation.getCurrentPosition((result) => {
      if (request !== locationRequest) return;
      position = result.coords;
      filter = 'near';
      locationStatus.textContent = '';
      render();
    }, () => {
      if (request !== locationRequest) return;
      locationStatus.textContent = 'Standort nicht verfügbar. Du kannst weiter nach Nummer oder Ort suchen.';
    }, { timeout: 10000, maximumAge: 60000 });
  }));

  search.addEventListener('input', render);
  window.addEventListener('hashchange', setView);
  // Enhancement controls are exposed only after their handlers are ready.
  root.querySelector('[data-controls]').hidden = false;
  root.querySelector('[data-view-switch]').hidden = false;
  render();
  setView();
})();
