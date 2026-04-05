(function () {
  const SHARE_KIND = (document.body && document.body.dataset.shareKind) || 'generic';
  const stateNode = document.querySelector('[data-share-state]');
  const chipNode = document.querySelector('[data-share-chip]');
  const openNode = document.querySelector('[data-share-open]');
  const fineprintNode = document.querySelector('[data-share-fineprint]');

  const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod|Mobile/i;
  const SAFE_FALLBACK = '/app-waitlist';

  function readParam(name) {
    const value = new URLSearchParams(window.location.search).get(name);
    return value ? value.trim() : '';
  }

  function isSafeId(value) {
    return /^[A-Za-z0-9._:-]+$/.test(value);
  }

  function buildNativeTarget(kind, id, poiKind) {
    if (!isSafeId(id)) {
      return null;
    }

    if (kind === 'poi') {
      if (poiKind === 'parking') {
        return `harzerwanderbuddyapp://parking/${encodeURIComponent(id)}`;
      }

      if (poiKind === 'stamp') {
        return `harzerwanderbuddyapp://stamps/${encodeURIComponent(id)}`;
      }

      if (poiKind === 'tour') {
        return `harzerwanderbuddyapp://tours/${encodeURIComponent(id)}`;
      }

      return null;
    }

    if (kind === 'stamp') {
      return `harzerwanderbuddyapp://stamps/${encodeURIComponent(id)}`;
    }

    if (kind === 'parking') {
      return `harzerwanderbuddyapp://parking/${encodeURIComponent(id)}`;
    }

    if (kind === 'tour') {
      return `harzerwanderbuddyapp://tours/${encodeURIComponent(id)}`;
    }

    return null;
  }

  function setState(message) {
    if (stateNode) {
      stateNode.textContent = message;
    }
  }

  function setChip(message) {
    if (chipNode) {
      chipNode.textContent = message;
    }
  }

  function setOpenLink(target) {
    if (openNode && target) {
      openNode.href = target;
    }
  }

  function setFineprint(message) {
    if (fineprintNode) {
      fineprintNode.textContent = message;
    }
  }

  function resolveShareConfig() {
    const url = new URL(window.location.href);
    const kind = SHARE_KIND !== 'generic' ? SHARE_KIND : (readParam('type') || 'generic');
    const id = readParam('id');
    const poiKind = (readParam('poiKind') || readParam('subtype') || readParam('kind')).toLowerCase();
    const title = readParam('title');
    const description = readParam('description');
    const image = readParam('image');

    return {
      kind,
      id,
      poiKind,
      title,
      description,
      image,
      hasPreviewQuery: url.searchParams.has('title') || url.searchParams.has('description') || url.searchParams.has('image'),
    };
  }

  const share = resolveShareConfig();
  const target = buildNativeTarget(share.kind, share.id, share.poiKind);
  const fallbackTarget = SAFE_FALLBACK;
  const effectiveTarget = target || fallbackTarget;

  if (share.kind === 'poi') {
    if (share.poiKind === 'parking') {
      setChip('POI · Parkplatz');
    } else if (share.poiKind === 'stamp') {
      setChip('POI · Stempel');
    } else if (share.poiKind === 'tour') {
      setChip('POI · Tour');
    } else {
      setChip('POI');
    }
  } else if (share.kind === 'stamp') {
    setChip('Stempelstelle');
  } else if (share.kind === 'parking') {
    setChip('Parkplatz');
  } else if (share.kind === 'tour') {
    setChip('Tour');
  } else {
    setChip('Harzer Wanderbuddy');
  }

  if (!target && share.kind !== 'generic') {
    setState('Ungültiger oder unvollständiger Link. Du wirst zur Warteliste weitergeleitet.');
  } else if (target) {
    setState('Link wird in der App geöffnet ...');
  } else {
    setState('Warteliste wird geöffnet ...');
  }

  if (share.hasPreviewQuery && (share.title || share.description || share.image)) {
    const previewBits = [];

    if (share.title) {
      previewBits.push(share.title);
    }

    if (share.description) {
      previewBits.push(share.description);
    }

    if (share.image) {
      previewBits.push(`Bild: ${share.image}`);
    }

    setFineprint(previewBits.join(' · '));
  }

  setOpenLink(effectiveTarget);
  if (openNode) {
    openNode.textContent = target ? 'In der App öffnen' : 'Warteliste öffnen';
  }

  if (share.kind !== 'generic' && effectiveTarget && MOBILE_USER_AGENT.test(navigator.userAgent)) {
    window.setTimeout(() => {
      window.location.href = effectiveTarget;
    }, 650);
  }

  window.addEventListener('load', () => {
    if (share.kind !== 'generic' && effectiveTarget && MOBILE_USER_AGENT.test(navigator.userAgent)) {
      setState('Wenn die App nicht automatisch öffnet, tippe auf "In der App öffnen".');
      return;
    }

    if (share.kind !== 'generic' && effectiveTarget) {
      setState('Tippe auf "In der App öffnen", um den Link direkt zu starten.');
      return;
    }

    setState('Dieser Link führt zur Warteliste und nicht direkt in die App.');
  });
})();
