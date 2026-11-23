/* Botón de comentarios (💬) para Mi día, Hungry y Temple.
   Manda tus bugs, ideas y dudas a tu cuenta de Supabase (ruta feedback/<app>/<id>) con datos técnicos automáticos,
   para que Claude los lea en su próxima sesión y los repare. Sin internet se guardan en el teléfono y se mandan después.
   Uso:  <script src="feedback.js" data-app="mi-dia" data-key="mi-dia.auth.v1" data-version="2026-11-23"></script>
   data-key = llave de localStorage donde la app guarda su sesión. El botón NUNCA renueva la sesión (solo la lee), así no choca con la app. */
(function () {
  var S = document.currentScript || {}, D = S.dataset || {};
  var APP = D.app || 'app', KEY = D.key || '', VER = D.version || '', BOT = Number(D.bottom || 78);
  var URL_ = 'https://tkuiwssnwljjxgcixhtr.supabase.co', ANON = 'sb_publishable_OGOh4KwojGkr4r2zUI6pGQ_hgSfFFgo', QK = 'fb.cola.' + APP;
  var errs = [];
  function lee(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function guarda(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function anota(m) { errs.push({ t: new Date().toTimeString().slice(0, 8), m: String(m).slice(0, 220) }); if (errs.length > 8) errs.shift(); }
  window.addEventListener('error', function (e) { anota((e.message || 'error') + ' @' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { anota('promesa: ' + ((e.reason && e.reason.message) || e.reason)); });
  try { var ce = console.error; console.error = function () { try { anota('console: ' + [].slice.call(arguments).map(function (a) { return a && a.message ? a.message : String(a); }).join(' ')); } catch (x) { } return ce.apply(console, arguments); }; } catch (e) { }

  function sesion() { var s = lee(KEY, null); return s && s.at && s.exp - 30 > Math.floor(Date.now() / 1000) ? s : null; }
  function uid(s) { try { return JSON.parse(atob(s.at.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub; } catch (e) { return null; } }
  var cola = lee(QK, []).filter(function (x) { return x && x.id; }), enviando = false;
  function persiste() { guarda(QK, cola); }
  function vaciar() {
    if (enviando || !cola.length || navigator.onLine === false) return;
    var s = sesion(), u = s && uid(s); if (!u) return;
    enviando = true;
    (function sig() {
      var it = cola[0]; if (!it) { enviando = false; pinta(); return; }
      fetch(URL_ + '/rest/v1/docs?on_conflict=user_id,path', { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + s.at, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: u, path: 'feedback/' + it.app + '/' + it.id, data: it, updated_at: new Date().toISOString() }) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); cola.shift(); persiste(); sig(); })
        .catch(function () { enviando = false; pinta(); });
    })();
  }
  function mios(cb) {
    var s = sesion(); if (!s || navigator.onLine === false) return cb(null);
    fetch(URL_ + '/rest/v1/docs?path=like.' + encodeURIComponent('feedback/' + APP + '/*') + '&select=data&order=updated_at.desc&limit=6', { headers: { apikey: ANON, Authorization: 'Bearer ' + s.at } })
      .then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { cb(j ? j.map(function (x) { return x.data; }) : null); }).catch(function () { cb(null); });
  }
  function contexto() {
    var c = { app: APP, version: VER, url: location.pathname + location.search + location.hash, titulo: document.title, pantalla: innerWidth + 'x' + innerHeight, dpr: devicePixelRatio, en_linea: navigator.onLine, instalada: !!(navigator.standalone || (matchMedia && matchMedia('(display-mode: standalone)').matches)), tema_oscuro: !!(matchMedia && matchMedia('(prefers-color-scheme: dark)').matches), navegador: navigator.userAgent, hora_local: new Date().toString(), errores_recientes: errs.slice(), pendientes_fb: cola.length };
    try { if (typeof window.FB_CTX === 'function') c.app_estado = window.FB_CTX(); } catch (e) { c.app_estado = 'error al leer estado: ' + e.message; }
    return c;
  }

  // ---- interfaz (en un shadow DOM para no chocar con los estilos de la app) ----
  var host = document.createElement('div'), root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  var tipo = 'bug';
  var CSS = ':host{all:initial}*{box-sizing:border-box;font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif}' +
    '.fab{position:fixed;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + ' + BOT + 'px);width:46px;height:46px;border-radius:50%;border:0;background:#2f5d3a;color:#fff;font-size:21px;box-shadow:0 4px 14px rgba(0,0,0,.3);z-index:2147483000;cursor:pointer;opacity:.9}' +
    '.fab:active{transform:scale(.94)}.fab .n{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;background:#b45309;font-size:11px;line-height:18px;padding:0 4px}' +
    '.m{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483001;display:flex;align-items:flex-end;justify-content:center}' +
    '.h{background:#f6f4ef;color:#1c1c1a;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 22px)}' +
    '@media(prefers-color-scheme:dark){.h{background:#1e211c;color:#ecebe4}textarea{background:#141613;color:#ecebe4;border-color:#2e322a}.t{background:#141613;border-color:#2e322a;color:#ecebe4}.l{border-color:#2e322a}}' +
    'h2{margin:0 0 4px;font-size:19px}p{margin:0 0 10px;font-size:13px;opacity:.7}.ts{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}' +
    '.t{border:1px solid #d9d5c8;background:#fff;color:#1c1c1a;border-radius:99px;padding:9px 13px;font-size:14px;min-height:42px;cursor:pointer}.t.on{background:#2f5d3a;border-color:#2f5d3a;color:#fff;font-weight:600}' +
    'textarea{width:100%;min-height:110px;border:1px solid #d9d5c8;border-radius:12px;padding:10px;font-size:16px;resize:vertical}' +
    '.r{display:flex;gap:8px;margin-top:12px;align-items:center}.b{flex:1;border:0;border-radius:12px;padding:13px;font-size:16px;font-weight:600;background:#2f5d3a;color:#fff;min-height:48px;cursor:pointer}.b.s{background:transparent;color:inherit;border:1px solid #d9d5c8;flex:0 0 auto;padding:13px 16px}' +
    '.ck{font-size:13px;display:flex;gap:8px;align-items:center;margin-top:8px}.l{border-top:1px solid #e3e0d6;margin-top:14px;padding-top:10px;font-size:13px}.l div{padding:5px 0}.e{display:inline-block;font-size:11px;padding:2px 8px;border-radius:99px;background:#e9f1e6;color:#2f5d3a;margin-left:6px}.e.r2{background:#2f5d3a;color:#fff}' +
    '.o{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#1c1c1a;color:#fff;padding:9px 15px;border-radius:99px;font-size:14px;z-index:2147483002}';
  var st = document.createElement('style'); st.textContent = CSS; root.appendChild(st);
  var fab = document.createElement('button'); fab.className = 'fab'; fab.setAttribute('aria-label', 'Enviar comentario o reportar un problema'); fab.innerHTML = '💬'; root.appendChild(fab);
  function pinta() { var n = cola.length; var b = fab.querySelector('.n'); if (n) { if (!b) { b = document.createElement('span'); b.className = 'n'; fab.appendChild(b); } b.textContent = n; } else if (b) b.remove(); }
  function aviso(t) { var o = document.createElement('div'); o.className = 'o'; o.textContent = t; root.appendChild(o); setTimeout(function () { o.remove(); }, 2600); }
  var ETI = { nuevo: 'Enviado', visto: 'Claude lo vio', resuelto: 'Resuelto ✓' };
  function abrir() {
    var m = document.createElement('div'); m.className = 'm';
    var T = [['bug', '🐞 Algo falló'], ['idea', '💡 Idea o mejora'], ['duda', '❓ No entendí'], ['bien', '👍 Me gustó']];
    m.innerHTML = '<div class="h"><h2>Comentarios · ' + ({ 'mi-dia': 'Mi día', hungry: 'Hungry', temple: 'Temple' }[APP] || APP) + '</h2><p>Cuéntame qué pasó. Mando datos técnicos para poder repararlo (nunca tus contraseñas ni lo que escribes en otros campos).</p><div class="ts">' +
      T.map(function (t) { return '<button class="t' + (t[0] === tipo ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<textarea id="x" placeholder="¿Qué estabas haciendo? ¿Qué esperabas que pasara y qué pasó?"></textarea>' +
      '<label class="ck"><input type="checkbox" id="c" checked> Incluir datos técnicos (recomendado)</label>' +
      '<div class="r"><button class="b s" id="no">Cancelar</button><button class="b" id="ok">Enviar</button></div><div class="l" id="ls"></div></div>';
    root.appendChild(m);
    var q = function (s) { return m.querySelector(s); };
    m.addEventListener('click', function (e) { if (e.target === m) m.remove(); var b = e.target.closest && e.target.closest('[data-t]'); if (b) { tipo = b.dataset.t; m.querySelectorAll('[data-t]').forEach(function (x) { x.classList.toggle('on', x === b); }); } });
    q('#no').onclick = function () { m.remove(); };
    q('#ok').onclick = function () {
      var t = q('#x').value.trim(); if (!t) { q('#x').focus(); return; }
      var d = new Date(), it = { id: d.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14) + '-' + Math.random().toString(36).slice(2, 6), app: APP, tipo: tipo, texto: t, estado: 'nuevo', ts: Date.now(), fecha: d.toISOString().slice(0, 10) };
      if (q('#c').checked) it.ctx = contexto();
      cola.push(it); persiste(); pinta(); vaciar(); m.remove();
      aviso(navigator.onLine === false || !sesion() ? 'Guardado. Se envía cuando haya conexión ✓' : 'Guardado ✓ Se manda en un momento');
    };
    mios(function (l) { if (l && l.length) q('#ls').innerHTML = '<b>Tus últimos comentarios</b>' + l.map(function (x) { return '<div>' + (x.texto || '').replace(/</g, '&lt;').slice(0, 70) + '<span class="e ' + (x.estado === 'resuelto' ? 'r2' : '') + '">' + (ETI[x.estado] || x.estado) + '</span>' + (x.nota_claude ? '<br><i>Claude: ' + String(x.nota_claude).replace(/</g, '&lt;').slice(0, 160) + '</i>' : '') + '</div>'; }).join(''); });
  }
  fab.onclick = abrir;
  function montar() { if (!document.body) return setTimeout(montar, 100); document.body.appendChild(host); pinta(); vaciar(); }
  montar();
  window.addEventListener('online', vaciar); document.addEventListener('visibilitychange', function () { if (!document.hidden) vaciar(); }); setInterval(vaciar, 30000);
  window.FEEDBACK = { abrir: abrir, enviarAhora: vaciar };
})();
