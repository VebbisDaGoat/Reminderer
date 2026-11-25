/* Reminderer service worker: offline shell, background nudges, notification buttons. */
var CACHE = 'reminderer-v2';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).catch(function () {
        return req.mode === 'navigate' ? caches.match('index.html') : Response.error();
      });
    })
  );
});

/* ---- storage shared with the page ---- */
function db() {
  return new Promise(function (res, rej) {
    var r = indexedDB.open('nudge', 1);
    r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
    r.onsuccess = function () { res(r.result); };
    r.onerror = function () { rej(r.error); };
  });
}
function kvGet(k) {
  return db().then(function (d) {
    return new Promise(function (res, rej) {
      var q = d.transaction('kv').objectStore('kv').get(k);
      q.onsuccess = function () { res(q.result); };
      q.onerror = function () { rej(q.error); };
    });
  });
}
function kvSet(k, v) {
  return db().then(function (d) {
    return new Promise(function (res, rej) {
      var t = d.transaction('kv', 'readwrite');
      t.objectStore('kv').put(v, k);
      t.oncomplete = function () { res(); };
      t.onerror = function () { rej(t.error); };
    });
  });
}
function mins(s) { var p = String(s).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
function inRange(n, a, b) {
  if (a === b) return false;
  return a < b ? (n >= a && n < b) : (n >= a || n < b);
}
function inQuiet(st) {
  if (!st) return false;
  var d = new Date(), n = d.getHours() * 60 + d.getMinutes();
  if (st.quietOn && inRange(n, mins(st.qStart), mins(st.qEnd))) return true;
  if (st.schoolOn && (st.schoolDays || [1, 2, 3, 4, 5]).indexOf(d.getDay()) > -1 && inRange(n, mins(st.sStart || '08:30'), mins(st.sEnd || '15:00'))) return true;
  return false;
}
function show(it) {
  return self.registration.showNotification(it.title, {
    body: it.note || 'Still not checked off. Tap to open.',
    tag: it.id, renotify: true,
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png',
    data: { id: it.id },
    actions: [{ action: 'done', title: 'Done' }, { action: 'snooze', title: 'Snooze 1 h' }]
  });
}
function tellPages() {
  return self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { c.postMessage('reload'); }); });
}

/* ---- background check (Chrome periodic sync on installed apps) ---- */
function backgroundCheck() {
  return Promise.all([kvGet('items'), kvGet('settings')]).then(function (r) {
    var items = r[0] || [], st = r[1];
    if (inQuiet(st)) return;
    var now = Date.now(), changed = false, jobs = [];
    items.forEach(function (it) {
      if (!it.done && it.nextDue <= now) { jobs.push(show(it)); it.nextDue = now + it.everyH * 3600000; changed = true; }
    });
    return Promise.all(jobs).then(function () { if (changed) return kvSet('items', items).then(tellPages); });
  }).catch(function () {});
}
self.addEventListener('periodicsync', function (e) {
  if (e.tag === 'nudge-check') e.waitUntil(backgroundCheck());
});

/* ---- notification buttons ---- */
self.addEventListener('notificationclick', function (e) {
  var id = e.notification.data && e.notification.data.id;
  var action = e.action;
  e.notification.close();
  if (action === 'done' || action === 'snooze') {
    e.waitUntil(kvGet('items').then(function (items) {
      items = items || [];
      items.forEach(function (it) {
        if (it.id !== id) return;
        if (action === 'done') { it.done = true; it.doneAt = Date.now(); }
        else { it.nextDue = Date.now() + 3600000; }
      });
      return kvSet('items', items).then(tellPages);
    }));
    return;
  }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow('./');
  }));
});
