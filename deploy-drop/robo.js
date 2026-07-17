/* ============================================================================
   robo.js — ROBO, the mascot (Brief 7.7, engine rao-master-18).

   PROVENANCE — ported VERBATIM from the signed-off reference files:
     · Core (dock injection, W/H live sync, synth audio, flyTo, bubble, poke
       wobble, motion pool, victory lap, facade, resize clamps):
       incoming/calm-card-v36.html (md5 deb8d07a84a9f1fbc6847b7ff57a965f),
       which embeds the robo_motion_lab_v29 rig plus every approved fix since.
     · Engagement (mood engine, six mood-solve-* reactions with hold timings
       2100/1600/2200/2000/1900/held, praise + effort pools, name
       personalization, drag/yield/roboPos persistence, eye-tracking, 45 s
       doze, stuck-child lean-in): incoming/guided-solve-rebuilt-v1.html
       (md5 362ca7c1940e1cb8bb09ab3403fdbc65) — the sanctioned rebuild.

   PRODUCTION ADAPTATIONS (each disclosed in the Brief 7.7 report):
     · The dock + SVG are INJECTED into document.body on load (the demo carried
       them as static HTML). Load robo.css alongside this file.
     · Robo.play(name) calls motion functions directly (the demo clicked its
       dev-drawer buttons, which are not ported).
     · Audio gate: the demo's #sound checkbox becomes `Robo.muted` (default
       false). Synth-only, respects mute — the app sets Robo.muted = true.
     · Slow factor: reads the --slow CSS var (default 1); the demo's #slow
       checkbox is dev-drawer chrome and is not ported.
     · Card events, not the demo ccBar: listens for the bubbling card events
       `rao:wrong` (wrong attempt), `rao:outcome` ("correct" → the reaction
       ladder; "solved-with-help" → walkthrough silence ON), `rao:next`
       (silence OFF). Emitted by engine/rao-card.js.
     · Walkthrough silence also hides any showing speech bubble immediately
       (law 6: no bubble, no mood, no motion from open through the reveal).
     · Child's name: read from window.RaoAccount.firstName (the app's
       account/session layer). Missing → the nameless line, silently.
     · The active question card (victory-lap orbit, lean-in direction) is the
       card that last fired a rao:* event, else the .pv-card nearest the
       viewport centre (the demo hardcoded its single card's id).

   NOT PORTED (Brief 7.8 territory, per ROBO-ENGAGEMENT-FRAMEWORK-v4 §A-§D):
   sneak-peek entrance · poke ladder stages 2-4 + cooldown (tap = ONE friendly
   wobble here) · idle mischief + stage bolt · attention gaze · palette tint ·
   carry flail + dust-off. The stage apple stays removed by design; the apple
   TOSS motion in the pool stays.
   ========================================================================== */
(function () {
  if (window.Robo) return;   /* idempotent load */

  /* The rig SVG — verbatim from calm-card-v36 (dock HTML 22443-22514). */
  var ROBO_SVG = [
    '<svg class="rao-mascot" id="raoMascot" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg">',
    '  <defs>',
    '    <linearGradient id="raoGrad" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#6366f1"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <ellipse class="m-shadow" cx="60" cy="123" rx="29" ry="6" fill="rgba(31,25,60,0.14)"/>',
    '  <g class="m-dust"><ellipse cx="34" cy="122" rx="8" ry="4" fill="rgba(148,163,184,.65)"/><ellipse cx="86" cy="122" rx="8" ry="4" fill="rgba(148,163,184,.65)"/></g>',
    '  <g class="m-speedlines"><line x1="0" y1="26" x2="26" y2="26" class="sl sl1"/><line x1="0" y1="48" x2="18" y2="48" class="sl sl2"/><line x1="0" y1="70" x2="30" y2="70" class="sl sl3"/><line x1="0" y1="92" x2="16" y2="92" class="sl sl4"/><line x1="0" y1="110" x2="24" y2="110" class="sl sl5"/></g>',
    '  <g class="m-thruster"><path d="M50 114 C50 123 55 130 60 133 C65 130 70 123 70 114 Z" fill="#f59e0b"/><path d="M55 114 C55 121 57 126 60 128 C63 126 65 121 65 114 Z" fill="#fde047"/></g>',
    '  <g class="m-flip">',
    '  <g class="m-cape"><path class="m-cape-cloth" d="M44 56 Q18 74 6 110 Q18 102 26 108 Q34 98 42 107 Q50 99 57 104 Q64 96 70 100 L80 58 Q62 66 44 56 Z" fill="#ef4444"/>',
    '    <path d="M46 58 Q28 74 18 100" stroke="rgba(153,27,27,.5)" stroke-width="3" fill="none"/></g>',
    '  <g class="m-antenna">',
    '    <line x1="60" y1="30" x2="60" y2="15" stroke="#a78bfa" stroke-width="3" stroke-linecap="round"/>',
    '    <polygon class="m-star" points="60,3 62.4,9.6 69.4,9.6 63.8,13.8 66,20.6 60,16.4 54,20.6 56.2,13.8 50.6,9.6 57.6,9.6" fill="#f59e0b"/>',
    '  </g>',
    '  <g class="m-noodle m-noodle-l" transform="translate(22,74) rotate(150)"><g class="ns ns1"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns2"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns3"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns4"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns5"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#8b5cf6"/><g transform="translate(0,11)"><g class="ns ns6"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#8b5cf6"/><g transform="translate(0,11)"><g class="ns ns7"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#c4b5fd"/><g transform="translate(0,11)"><g class="ns ns8"><rect x="-5" y="0" width="10" height="13" rx="5" fill="#c4b5fd"/></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g>',
    '  <g class="m-noodle m-noodle-r" transform="translate(98,74) rotate(-150)"><g class="ns ns1"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns2"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns3"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns4"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#7c3aed"/><g transform="translate(0,11)"><g class="ns ns5"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#8b5cf6"/><g transform="translate(0,11)"><g class="ns ns6"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#8b5cf6"/><g transform="translate(0,11)"><g class="ns ns7"><rect x="-5" y="0" width="10" height="14" rx="5" fill="#c4b5fd"/><g transform="translate(0,11)"><g class="ns ns8"><rect x="-5" y="0" width="10" height="13" rx="5" fill="#c4b5fd"/></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g></g>',
    '  <rect class="m-arm m-arm-l" x="16" y="70" width="12" height="30" rx="6" fill="#7c3aed"/>',
    '  <rect class="m-arm m-arm-r" x="92" y="70" width="12" height="30" rx="6" fill="#7c3aed"/>',
    '  <g class="m-body">',
    '    <path class="m-torso" d="M60 30 C88 30 100 52 100 80 C100 108 82 120 60 120 C38 120 20 108 20 80 C20 52 32 30 60 30 Z" fill="url(#raoGrad)"/>',
    '    <ellipse class="m-belly" cx="60" cy="88" rx="26" ry="24" fill="rgba(255,255,255,0.16)"/>',
    '    <g class="m-booty"><ellipse cx="96" cy="99" rx="18" ry="16" fill="url(#raoGrad)"/><path d="M104 88 Q112 99 103 111" stroke="rgba(76,29,149,.0)" fill="none"/><path d="M89 89 Q97 99 89 110" stroke="rgba(76,29,149,.45)" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M87 112 Q97 117 106 108" stroke="rgba(59,31,120,.28)" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="101" cy="91" rx="5" ry="3.4" fill="rgba(255,255,255,.2)"/></g>',
    '    <ellipse class="m-flush" cx="60" cy="70" rx="29" ry="16" fill="#ef4444"/>',
    '    <path class="m-brow m-brow-l" d="M38 58 L54 62" stroke="#3b1f78" stroke-width="3.2" stroke-linecap="round"/>',
    '    <path class="m-brow m-brow-r" d="M82 58 L66 62" stroke="#3b1f78" stroke-width="3.2" stroke-linecap="round"/>',
    '    <g class="m-eye-l">',
    '      <ellipse class="m-eye-white" cx="47" cy="72" rx="9" ry="11" fill="#fff"/>',
    '      <circle class="m-pupil" cx="48" cy="74" r="4.4" fill="#221a3a"/>',
    '      <circle cx="49.6" cy="72" r="1.5" fill="#fff"/>',
    '      <rect class="m-lid" x="37" y="60" width="20" height="13" rx="4" fill="url(#raoGrad)"/>',
    '    </g>',
    '    <g class="m-eye-r">',
    '      <ellipse class="m-eye-white" cx="73" cy="72" rx="9" ry="11" fill="#fff"/>',
    '      <circle class="m-pupil" cx="72" cy="74" r="4.4" fill="#221a3a"/>',
    '      <circle cx="73.6" cy="72" r="1.5" fill="#fff"/>',
    '      <rect class="m-lid" x="63" y="60" width="20" height="13" rx="4" fill="url(#raoGrad)"/>',
    '    </g>',
    '    <circle class="m-cheek m-cheek-l" cx="38" cy="86" r="5.5" fill="#f9a8d4" opacity="0.85"/>',
    '    <circle class="m-cheek m-cheek-r" cx="82" cy="86" r="5.5" fill="#f9a8d4" opacity="0.85"/>',
    '    <path class="m-mouth mouth-smile" d="M50 92 Q60 100 70 92" stroke="#3b1f78" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '    <path class="m-mouth mouth-grin" d="M48 90 Q60 106 72 90 Q60 96 48 90 Z" fill="#3b1f78"/>',
    '    <ellipse class="m-mouth mouth-o" cx="60" cy="95" rx="5" ry="6.5" fill="#3b1f78"/>',
    '    <path class="m-mouth mouth-pout" d="M53 97 Q60 92 67 97" stroke="#3b1f78" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '    <path class="m-mouth mouth-hmm" d="M52 96 Q60 98 68 91" stroke="#3b1f78" stroke-width="2.8" fill="none" stroke-linecap="round"/>',
    '    <path class="m-mouth mouth-chew" d="M53 94.5 Q60 97.5 67 94.5" stroke="#3b1f78" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '    <g class="m-mouth mouth-grit"><rect x="50" y="90" width="20" height="8" rx="3" fill="#3b1f78"/><path d="M55 90 L55 98 M60 90 L60 98 M65 90 L65 98" stroke="#fff" stroke-width="1.4"/></g>',
    '    <g class="m-tongue"><ellipse cx="60" cy="99.5" rx="4.6" ry="5.8" fill="#ec4899"/><line x1="60" y1="96" x2="60" y2="103" stroke="#be185d" stroke-width="1.2" stroke-linecap="round"/></g>',
    '    <!-- clap rig: front paws + impact spark, only visible during mood-clap -->',
    '    <g class="m-paw m-paw-l"><rect x="33" y="88" width="14" height="17" rx="7" fill="#7c3aed"/><ellipse cx="40" cy="96" rx="4" ry="5.5" fill="#a78bfa"/></g>',
    '    <g class="m-paw m-paw-r"><rect x="73" y="88" width="14" height="17" rx="7" fill="#7c3aed"/><ellipse cx="80" cy="96" rx="4" ry="5.5" fill="#a78bfa"/></g>',
    '    <polygon class="m-clap-spark" points="60,84 62.5,91 69,93 62.5,95 60,102 57.5,95 51,93 57.5,91" fill="#fbbf24"/>',
    '  </g>',
    '  <g class="m-anger-flames"><path d="M46 30 C44 20 47 12 52 8 C52 15 55 20 56 26 Z" fill="#f97316"/><path d="M56 26 C55 14 59 5 64 2 C63 11 67 17 68 24 Z" fill="#ef4444"/><path d="M66 28 C66 19 70 12 75 10 C73 17 75 22 74 27 Z" fill="#fbbf24"/></g>',
    '  <g class="m-steam"><circle cx="52" cy="22" r="5" fill="rgba(203,213,225,.8)"/><circle cx="61" cy="16" r="6.5" fill="rgba(226,232,240,.8)"/><circle cx="70" cy="21" r="4.5" fill="rgba(203,213,225,.8)"/></g>',
    '  <text class="m-susq" x="94" y="46" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#8b5cf6">?</text>',
    '  <g class="m-apple"><circle cx="84" cy="88" r="11" fill="#ef4444"/><circle cx="80" cy="84" r="3.2" fill="rgba(255,255,255,.45)"/><line x1="84" y1="77" x2="85.5" y2="71.5" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="89.5" cy="73" rx="4.4" ry="2.3" fill="#22c55e" transform="rotate(-25 89.5 73)"/></g>',
    '  <path class="m-shake-l" d="M16 96 Q9 105 16 114" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '  <path class="m-shake-r" d="M104 96 Q111 105 104 114" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round"/>',
    '  <!-- v25 mischief props: live INSIDE the rig (stage-prop law untouched) -->',
    '  <g class="m-spanner" transform="translate(74,30)"><rect x="-2.2" y="2" width="4.4" height="18" rx="2.2" fill="#94a3b8"/><path d="M-6 0 A6.5 6.5 0 1 1 6 0 L3 0 A3.4 3.4 0 1 0 -3 0 Z" fill="#94a3b8"/></g>',
    '  <g class="m-jugg"><g class="m-jb m-jb1"><circle cx="44" cy="22" r="4.6" fill="#94a3b8"/><circle cx="44" cy="22" r="1.9" fill="#64748b"/></g><g class="m-jb m-jb2"><circle cx="60" cy="14" r="4.6" fill="#94a3b8"/><circle cx="60" cy="14" r="1.9" fill="#64748b"/></g><g class="m-jb m-jb3"><circle cx="76" cy="22" r="4.6" fill="#94a3b8"/><circle cx="76" cy="22" r="1.9" fill="#64748b"/></g></g>',
    '  <g class="m-mag" transform="translate(86,78)"><circle cx="0" cy="0" r="9.5" fill="rgba(191,219,254,.45)" stroke="#475569" stroke-width="3"/><line x1="6.8" y1="6.8" x2="15" y2="15" stroke="#475569" stroke-width="4.2" stroke-linecap="round"/></g>',
    '  </g><!-- /m-flip -->',
    '</svg>'
  ].join('\n');

  function init() {
    if (document.querySelector('.rao-dock')) return;   /* one Robo per page */

    /* ── the dock (the demo carried this as static HTML; production injects) ── */
    var dock = document.createElement('div');
    dock.className = 'rao-dock';
    dock.innerHTML = '<div class="rao-bubble"></div><div class="rao-mascot-wrap">' + ROBO_SVG + '</div>';
    document.body.appendChild(dock);
    var wrap = dock.querySelector('.rao-mascot-wrap');
    var bubbleEl = dock.querySelector('.rao-bubble');
    var svg = dock.querySelector('.rao-mascot');

    var W = 120, H = 130;
    /* v22: W/H track the RENDERED wrap size (responsive @600px), so clamps,
       fly-home and stage bounds stay honest at every viewport. offsetWidth is
       transform-immune, so mood/carry animations can't corrupt the numbers. */
    function _syncWH(){ if (wrap && wrap.offsetWidth) { W = wrap.offsetWidth; H = wrap.offsetHeight; } }
    _syncWH(); window.addEventListener('resize', _syncWH);
    var travelTimer = null;
    var muted = false;   /* the app's mute switch — Robo.muted (demo: #sound checkbox) */

    /* whoosh — same synth as the demo */
    var actx = null;
    function getCtx() {
      if (!actx) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
      if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }
      return actx;
    }
    function whoosh(dur) {
      if (muted) return;
      var ctx = getCtx(); if (!ctx) return;
      dur = dur || 0.55;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
      var t = ctx.currentTime;
      bp.frequency.setValueAtTime(500, t);
      bp.frequency.exponentialRampToValueAtTime(1600, t + dur * 0.6);
      bp.frequency.exponentialRampToValueAtTime(400, t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
    }
    /* clap hit: sharp filtered-noise burst; slight pitch jitter per clap */
    function clapSfx(k) {
      if (muted) return;
      var ctx = getCtx(); if (!ctx) return;
      var dur = 0.09;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = 1300 + (k || 0) * 180; bp.Q.value = 1.8;
      var t = ctx.currentTime;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
    }
    /* small chirp helper for motion SFX */
    function chirp(f0, f1, at, dur, type, vol) {
      if (muted) return;
      var ctx = getCtx(); if (!ctx) return;
      var t = ctx.currentTime + (at || 0);
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol || 0.07, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    }
    /* generic filtered-noise sweep (burst, hiss) */
    function noiseSweep(f0, f1, at, dur, vol, q) {
      if (muted) return;
      var ctx = getCtx(); if (!ctx) return;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q || 1.2;
      var t = ctx.currentTime + (at || 0);
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol || 0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
    }

    /* production: no #slow toggle — honour a host-set --slow, default 1 */
    function slowFactor() {
      var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slow'));
      return (v && v > 0) ? v : 1;
    }

    function flyTo(x, y, quietFly) {
      var cur = dock.getBoundingClientRect();
      /* Brief 7.7.1: landing clamps ALIGNED with the drag clamps (4px margins),
         so any destination nearestClear selects is one flyTo can land on. The
         demo's tighter 8/60/70 insets clamped below-the-card yield spots back
         onto the card footer on crowded mobile pages. Victory-lap exact-return
         is WAAPI translate keyframes, not flyTo — unaffected. */
      var nx = Math.max(4, Math.min(window.innerWidth - W - 4, x - W / 2));
      var ny = Math.max(4, Math.min(window.innerHeight - H - 4, y - H / 2));
      dock.classList.toggle('fly-right', nx > cur.left);
      dock.classList.toggle('fly-left', nx <= cur.left);
      if (!quietFly) whoosh(0.55 * slowFactor());
      dock.classList.add('rao-travelling');
      dock.style.left = nx + 'px'; dock.style.top = ny + 'px';
      if (travelTimer) clearTimeout(travelTimer);
      travelTimer = setTimeout(function () {
        dock.classList.remove('rao-travelling');
        dock.classList.remove('fly-right'); dock.classList.remove('fly-left');
      }, 560 * slowFactor());
    }

    /* speech bubble */
    var bubbleTimer = null;
    function showBubble(text, ms) {
      bubbleEl.textContent = text;
      bubbleEl.classList.add('show');
      if (bubbleTimer) clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(function () { bubbleEl.classList.remove('show'); }, ms || 1300);
    }
    function hideBubble() {
      bubbleEl.classList.remove('show');
      if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
    }

    /* tap = poke: ONE friendly wobble + blip. The poke LADDER (stages 2-4,
       cooldown) is Brief 7.8 scope and is deliberately not here. */
    function pokeStage(cls, ms, sfx) {
      var s = slowFactor();
      clapBusy = true;
      svg.classList.add(cls);
      if (sfx) sfx(s);
      setTimeout(function () { svg.classList.remove(cls); clapBusy = false; }, ms * s + 40);
    }
    function poke() {
      if (clapBusy) return;
      pokeStage('mood-poked', 500, function (s) { chirp(1200, 1550, 0, 0.06, 'square', 0.05); });
    }

    /* ── the motion pool (verbatim WAAPI/SFX bodies; demo buttons → functions) ── */
    var clapBusy = false;
    function playClap() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      svg.classList.add('mood-clap');
      [0.16, 0.48, 0.80].forEach(function (t, k) {   // contacts = 50% of each .32s cycle
        setTimeout(function () { clapSfx(k); }, t * 1000 * s);
      });
      setTimeout(function () { svg.classList.remove('mood-clap'); clapBusy = false; }, 1000 * s);
    }
    function playTumble() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 2.2 * s;                                   // seconds, matches CSS
      var cur = dock.getBoundingClientRect();
      var margin = 16;
      var maxLeft = window.innerWidth - W - margin;
      var roomR = maxLeft - cur.left, roomL = cur.left - margin;
      var goRight = roomR >= roomL;
      var dist = Math.min(window.innerWidth * 0.55, goRight ? roomR : roomL);
      var nx = cur.left + (goRight ? dist : -dist);
      svg.classList.toggle('tumble-left', !goRight);     // mirror for leftward rolls
      svg.classList.add('mood-tumble');
      dock.style.transition = 'left ' + D + 's linear';  // constant tumbling velocity
      dock.style.left = nx + 'px';
      /* SFX: launch boing -> thump+tick on each of the three touchdowns -> ta-da */
      chirp(200, 900, 0.04 * D, 0.09 * D);
      [0.31, 0.59, 0.87].forEach(function (f, k) {
        setTimeout(function () { chirp(140, 60, 0, 0.1, 'sine', 0.12); clapSfx(k); }, f * D * 1000);
      });
      chirp(900, 1500, 0.9 * D, 0.05 * D);
      chirp(1100, 1900, 0.95 * D, 0.06 * D);
      setTimeout(function () {
        svg.classList.remove('mood-tumble'); svg.classList.remove('tumble-left');
        dock.style.transition = '';
        clapBusy = false;
      }, D * 1000 + 80);
    }
    function playAngry() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 2.4 * s;
      svg.classList.add('mood-angry');
      /* SFX arc: rumble builds -> kettle whistle -> flame burst + crackle -> steam hiss -> phew */
      chirp(75, 155, 0.05 * D, 0.5 * D, 'sine', 0.10);
      chirp(500, 2000, 0.35 * D, 0.32 * D, 'sine', 0.045);
      setTimeout(function () {
        noiseSweep(300, 900, 0, 0.22, 0.16, 1);
        setTimeout(function () { clapSfx(2); }, 55);
        setTimeout(function () { clapSfx(3); }, 125);
      }, 0.57 * D * 1000);
      setTimeout(function () { noiseSweep(2600, 700, 0, 0.5, 0.05, 2); }, 0.72 * D * 1000);
      chirp(700, 450, 0.88 * D, 0.12 * D, 'sine', 0.06);
      chirp(450, 850, 0.92 * D, 0.14 * D, 'sine', 0.05);
      setTimeout(function () { svg.classList.remove('mood-angry'); clapBusy = false; }, D * 1000 + 60);
    }
    function playDance() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 3.2 * s;                       // 8 beats x 0.4s
      var beat = 0.4 * s;
      svg.classList.add('mood-dance');
      /* THE GROOVE — all synthesized:
         kick on every beat, hats on off-beats, square bassline, riff into the finale */
      var bass = [130.81, 130.81, 164.81, 98.00, 130.81, 164.81, 196.00, 261.63]; // C E G walk
      for (var k = 0; k < 8; k++) {
        chirp(150, 52, k * beat, 0.12, 'sine', 0.13);                 // kick
        noiseSweep(6000, 2800, k * beat + beat / 2, 0.05, 0.03, 3);   // hat
        chirp(bass[k], bass[k] * 1.001, k * beat + 0.02, 0.2, 'square', 0.045); // bass
      }
      chirp(523.25, 659.25, 4.5 * beat, 0.14, 'square', 0.05);        // riff climbing in
      chirp(659.25, 783.99, 5.5 * beat, 0.14, 'square', 0.05);
      chirp(783.99, 1046.5, 6.5 * beat, 0.16, 'square', 0.05);
      chirp(900, 1500, 7.4 * beat, 0.1);                              // ta-da!
      chirp(1100, 1900, 7.65 * beat, 0.14);
      setTimeout(function () { svg.classList.remove('mood-dance'); clapBusy = false; }, D * 1000 + 60);
    }
    function playSus() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 2.6 * s;
      svg.classList.add('mood-sus');
      /* detective plucks on each eye-dart, then a rising "hmmmm" */
      chirp(165, 160, 0.12 * D, 0.2, 'triangle', 0.09);
      chirp(147, 142, 0.52 * D, 0.2, 'triangle', 0.09);
      chirp(170, 265, 0.82 * D, 0.4 * s, 'sine', 0.06);
      setTimeout(function () { svg.classList.remove('mood-sus'); clapBusy = false; }, D * 1000 + 60);
    }
    function playMac() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var beat = 0.42 * s;
      var D = 12 * beat;
      svg.classList.add('mood-mac');
      /* ORIGINAL latin groove — Am vamp, clave woodblock, shaker, marimba riff.
         Deliberately NOT the Macarena melody (copyright). */
      var bass = [110,110,164.81,110, 98,98,146.83,98, 110,164.81,110,220];
      for (var k = 0; k < 12; k++) {
        chirp(bass[k], bass[k]*1.001, k*beat+0.01, 0.22, 'square', 0.045);   // bass
        if (k % 2 === 0) chirp(150, 52, k*beat, 0.1, 'sine', 0.11);          // kick 1 & 3
        noiseSweep(7000, 3500, k*beat + beat/2, 0.04, 0.025, 3);             // shaker off-beats
      }
      [0, 1.5, 3, 5, 6, 8, 9.5, 11].forEach(function (b) {                   // 3-2 clave woodblock
        noiseSweep(2100, 1900, b*beat, 0.05, 0.09, 8);
      });
      /* original marimba riff (triangle) — sparse, minor-mode noodle */
      [[659.25,2.2],[587.33,3.2],[523.25,6.2],[493.88,7.2],[440,10.1],[523.25,10.5],[659.25,10.9]]
        .forEach(function (n) { chirp(n[0], n[0]*1.001, n[1]*beat, 0.18, 'triangle', 0.055); });
      /* the jump-turn: whoosh + "¡HEY!" */
      setTimeout(function () { whoosh(0.35 * s); }, 11.2 * beat * 1000);
      setTimeout(function () { showBubble('¡HEY!', 900 * s); chirp(900, 1600, 0, 0.12); }, 11.6 * beat * 1000);
      setTimeout(function () { svg.classList.remove('mood-mac'); clapBusy = false; }, D * 1000 + 80);
    }
    function playApple() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 3.6 * s;
      svg.classList.add('mood-apple');
      /* toss swish -> falling whistle -> CRUNCH x3 -> gulp -> mmm */
      chirp(400, 950, 0.13 * D, 0.16 * s, 'sine', 0.06);
      chirp(950, 500, 0.34 * D, 0.28 * s, 'sine', 0.05);
      [0.58, 0.68, 0.78].forEach(function (f, k) {
        setTimeout(function () { noiseSweep(900 - k * 120, 240, 0, 0.09, 0.14, 1); }, f * D * 1000);
      });
      setTimeout(function () { chirp(300, 115, 0, 0.18, 'sine', 0.09); }, 0.87 * D * 1000);   // gulp
      setTimeout(function () {
        chirp(523.25, 659.25, 0, 0.12, 'sine', 0.06); chirp(659.25, 784, 0.13 * s, 0.16, 'sine', 0.05);
        showBubble('Mmm! 😋', 1100 * s);
      }, 0.93 * D * 1000);
      setTimeout(function () { svg.classList.remove('mood-apple'); clapBusy = false; }, D * 1000 + 80);
    }
    function playLean() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 3.6 * s;
      svg.classList.add('mood-lean');
      dock.classList.add('rao-leaning');
      /* zoom whoosh-in -> glance pluck -> rising question intonation -> whoosh-out */
      noiseSweep(400, 1300, 0.08 * D, 0.28 * s, 0.06, 1.5);
      chirp(180, 320, 0.1 * D, 0.24 * s, 'sine', 0.08);
      chirp(160, 152, 0.33 * D, 0.18, 'triangle', 0.08);            // glance pluck
      chirp(430, 455, 0.6 * D, 0.14 * s, 'square', 0.05);           // "hm-"
      chirp(520, 560, 0.66 * D, 0.14 * s, 'square', 0.05);          // "hm-"
      chirp(620, 1080, 0.72 * D, 0.3 * s, 'square', 0.055);         // "hmMM?" — the rise
      noiseSweep(1100, 380, 0.86 * D, 0.26 * s, 0.045, 1.5);
      setTimeout(function () { showBubble('Diiid you understaaand? 🤨', 2400 * s); }, 0.32 * D * 1000);
      setTimeout(function () {
        svg.classList.remove('mood-lean');
        dock.classList.remove('rao-leaning');
        clapBusy = false;
      }, D * 1000 + 80);
    }
    function playBooty() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 3.0 * s;
      svg.classList.add('mood-booty');
      /* whip-around whoosh -> bongo on every wiggle -> whip-back -> wink */
      noiseSweep(500, 1400, 0.02 * D, 0.2 * s, 0.06, 1.5);
      chirp(300, 500, 0.03 * D, 0.14 * s, 'sine', 0.07);
      for (var k = 0; k < 9; k++) {                           // 4Hz — one bongo per bounce
        chirp(k % 2 ? 180 : 235, k % 2 ? 165 : 215, (0.55 + k * 0.24) * s, 0.08, 'sine', 0.1);
      }
      [2, 5, 8].forEach(function (k) {                        // rubber-band boings
        chirp(190, 400, (0.55 + k * 0.24) * s, 0.15 * s, 'triangle', 0.08);
      });
      noiseSweep(1400, 500, 0.84 * D, 0.2 * s, 0.05, 1.5);
      chirp(900, 1500, 0.94 * D, 0.09 * s);                   // wink!
      chirp(1200, 1800, 0.965 * D, 0.1 * s);
      setTimeout(function () { showBubble('hehe 😜', 1000 * s); }, 0.92 * D * 1000);
      setTimeout(function () { svg.classList.remove('mood-booty'); clapBusy = false; }, D * 1000 + 80);
    }
    function playNoodle() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var beat = 0.6 * s;                                   // beat = one arm-wave cycle
      var D = 8 * beat;
      svg.classList.add('mood-noodle');
      chirp(900, 240, 0.05 * s, 0.32 * s, 'sine', 0.07);    // bones leave
      for (var k = 0; k < 8; k++) {
        var t = k * beat;
        /* rubbery wobble bass: bends UP on even beats, DOWN on odd — noodle music */
        if (k % 2 === 0) chirp(85, 140, t + 0.02, 0.42 * s, 'square', 0.05);
        else chirp(140, 82, t + 0.02, 0.42 * s, 'square', 0.05);
        chirp(150, 52, t, 0.1, 'sine', 0.12);                              // kick on every crest
        if (k % 2 === 1) noiseSweep(1800, 900, t + beat / 2, 0.07, 0.06, 2); // backbeat snare
        chirp(300, 700, t + 0.04 * s, 0.16 * s, 'sawtooth', 0.03);          // wah on the crest...
        chirp(700, 320, t + 0.21 * s, 0.15 * s, 'sawtooth', 0.03);          // ...wah
        noiseSweep(6500, 3200, t + beat / 2, 0.04, 0.02, 3);                // hat
      }
      chirp(240, 880, D - 0.35 * s, 0.3 * s, 'sine', 0.07); // bones return
      setTimeout(function () { svg.classList.remove('mood-noodle'); clapBusy = false; }, D * 1000 + 80);
    }
    function playSquash() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 3.6 * s;
      svg.classList.add('mood-squash');
      chirp(180, 950, 0.01 * D, 0.28 * s, 'sine', 0.05);                    // riser with the jump
      chirp(900, 420, 0.135 * D, 0.2 * s, 'sine', 0.045);                   // falling whistle
      setTimeout(function () {                                              // THE DROP (20%)
        noiseSweep(500, 110, 0, 0.22, 0.18, 1);
        chirp(110, 36, 0, 0.5 * s, 'sine', 0.17);
        chirp(48, 42, 0.06 * s, 0.4 * s, 'sine', 0.08);
      }, 0.195 * D * 1000);
      setTimeout(function () { chirp(58, 52, 0, 0.06, 'sine', 0.05); }, 0.23 * D * 1000);
      setTimeout(function () { chirp(90, 820, 0, 0.28 * s, 'triangle', 0.1); }, 0.26 * D * 1000); // SPRING
      setTimeout(function () { chirp(1250, 1550, 0, 0.06, 'square', 0.04); }, 0.385 * D * 1000);  // apex glint
      /* decaying bounce contacts: pitch and volume fall with impact speed */
      [[0.49, 140, 0.12], [0.635, 118, 0.085], [0.73, 100, 0.055], [0.81, 86, 0.035]].forEach(function (c) {
        setTimeout(function () { chirp(c[1], 48, 0, 0.11, 'sine', c[2]); }, c[0] * D * 1000);
      });
      setTimeout(function () { clapSfx(1); }, 0.49 * D * 1000);             // grit on the big second contact
      setTimeout(function () { svg.classList.remove('mood-squash'); clapBusy = false; }, D * 1000 + 80);
    }
    function playHero() {
      if (clapBusy) return;
      clapBusy = true;
      var s = slowFactor();
      var D = 4.2 * s;
      svg.classList.add('mood-hero');
      /* transformation sparkle -> fanfare -> wind gusts + zip ticks -> landing */
      chirp(500, 900, 0.02 * D, 0.09 * s); chirp(700, 1250, 0.05 * D, 0.09 * s);
      chirp(950, 1700, 0.08 * D, 0.12 * s);
      noiseSweep(400, 1400, 0.1 * D, 0.25 * s, 0.06, 1.5);
      setTimeout(function () { showBubble('Super Robo! 🌟', 1300 * s); }, 0.15 * D * 1000);
      [523.25, 783.99, 1046.5].forEach(function (f, k) {                    // original 3-note fanfare
        chirp(f, f * 1.002, (0.17 + k * 0.07) * D, 0.16 * s, 'triangle', 0.06);
      });
      [0.28, 0.46, 0.64, 0.8].forEach(function (f) {                        // wind gusts
        setTimeout(function () { noiseSweep(900, 2200, 0, 0.4 * s, 0.035, 1.2); }, f * D * 1000);
      });
      [0.36, 0.58, 0.74].forEach(function (f) {                             // speed-line zips
        setTimeout(function () { chirp(2200, 1400, 0, 0.06, 'square', 0.025); }, f * D * 1000);
      });
      setTimeout(function () { noiseSweep(1400, 450, 0, 0.28 * s, 0.05, 1.5); }, 0.88 * D * 1000);
      setTimeout(function () { chirp(150, 55, 0, 0.11, 'sine', 0.1); }, 0.93 * D * 1000);   // touchdown
      chirp(900, 1500, 0.955 * D, 0.09 * s); chirp(1200, 1900, 0.975 * D, 0.11 * s);        // ta-da
      setTimeout(function () { svg.classList.remove('mood-hero'); clapBusy = false; }, D * 1000 + 80);
    }

    /* ══ VICTORY LAP — orbit the active question card, exact-return ══ */
    var lapActive = false;
    function playLap(rect) {
      if (clapBusy) return;
      clapBusy = true; lapActive = true;
      var s = slowFactor();
      var T = 3.3 * s;                                   // seconds total
      /* orbit rect in dock top-left coords (default: page, inset from edges/controls) */
      var minX = rect ? rect.minX : 16,
          maxX = rect ? rect.maxX : window.innerWidth - W - 16,
          minY = rect ? rect.minY : 74,
          maxY = rect ? rect.maxY : window.innerHeight - H - 84;
      var r = Math.min(90, (maxX - minX) / 2 - 1, (maxY - minY) / 2 - 1);
      if (r < 8) { clapBusy = false; lapActive = false; return; }      // no room, bail
      /* parametric clockwise rounded-rect: 4 straights + 4 corner arcs */
      var sw = (maxX - minX) - 2 * r, sh = (maxY - minY) - 2 * r, arc = Math.PI * r / 2;
      var per = 2 * sw + 2 * sh + 4 * arc;
      var segs = [
        { L: sw,  f: function (d) { return { x: minX + r + d, y: minY, a: 0 }; } },
        { L: arc, f: function (d) { var a = -Math.PI / 2 + d / r;
            return { x: maxX - r + r * Math.cos(a), y: minY + r + r * Math.sin(a), a: a + Math.PI / 2 }; } },
        { L: sh,  f: function (d) { return { x: maxX, y: minY + r + d, a: Math.PI / 2 }; } },
        { L: arc, f: function (d) { var a = d / r;
            return { x: maxX - r + r * Math.cos(a), y: maxY - r + r * Math.sin(a), a: a + Math.PI / 2 }; } },
        { L: sw,  f: function (d) { return { x: maxX - r - d, y: maxY, a: Math.PI }; } },
        { L: arc, f: function (d) { var a = Math.PI / 2 + d / r;
            return { x: minX + r + r * Math.cos(a), y: maxY - r + r * Math.sin(a), a: a + Math.PI / 2 }; } },
        { L: sh,  f: function (d) { return { x: minX, y: maxY - r - d, a: -Math.PI / 2 }; } },
        { L: arc, f: function (d) { var a = Math.PI + d / r;
            return { x: minX + r + r * Math.cos(a), y: minY + r + r * Math.sin(a), a: a + Math.PI / 2 }; } }
      ];
      function pt(t) {                                    // t in [0,1) clockwise from top-left arc end
        var d = ((t % 1) + 1) % 1 * per;
        for (var i = 0; i < segs.length; i++) {
          if (d <= segs[i].L || i === segs.length - 1) return segs[i].f(Math.min(d, segs[i].L));
          d -= segs[i].L;
        }
      }
      var ox = dock.offsetLeft, oy = dock.offsetTop;
      /* nearest point on the orbit = entry */
      var t0 = 0, best = 1e9;
      for (var i = 0; i < 160; i++) {
        var p = pt(i / 160), dd = (p.x - ox) * (p.x - ox) + (p.y - oy) * (p.y - oy);
        if (dd < best) { best = dd; t0 = i / 160; }
      }
      /* keyframes: 0→0.10 swoop in · 0.10→0.90 full lap · 0.90→1 swoop home */
      var N = 44, move = [], bank = [];
      function bankDeg(ux) { return Math.max(-16, Math.min(16, 16 * ux)); }
      move.push({ offset: 0, transform: 'translate(0px,0px)', easing: 'ease-in' });
      bank.push({ offset: 0, transform: 'rotate(0deg)', easing: 'ease-in' });
      for (var k = 0; k <= N; k++) {
        var t = t0 + k / N, q = pt(t), off = 0.10 + 0.80 * (k / N);
        move.push({ offset: off, transform: 'translate(' + (q.x - ox).toFixed(1) + 'px,' + (q.y - oy).toFixed(1) + 'px)' });
        bank.push({ offset: off, transform: 'rotate(' + bankDeg(Math.cos(q.a)).toFixed(1) + 'deg)' });
      }
      move.push({ offset: 1, transform: 'translate(0px,0px)', easing: 'ease-out' });
      bank.push({ offset: 1, transform: 'rotate(0deg)', easing: 'ease-out' });
      move[move.length - 2].easing = 'ease-out'; bank[bank.length - 2].easing = 'ease-out';
      dock.classList.add('rao-travelling');               // thruster + shadow drop + float pause
      svg.classList.add('mood-lap');
      var aMove = dock.animate(move, { duration: T * 1000, fill: 'both' });
      var aBank = svg.animate(bank, { duration: T * 1000, fill: 'both' });
      showBubble('Wheee! 🎉', 1300 * s);
      /* sparkle comet trail at his live position */
      var sparkT = setInterval(function () {
        var rct = dock.getBoundingClientRect();
        var sp = document.createElement('div');
        sp.className = 'lap-spark' + (Math.random() < 0.4 ? ' star' : '');
        sp.style.background = ['#f59e0b', '#8b5cf6', '#c4b5fd'][Math.floor(Math.random() * 3)];
        sp.style.left = (rct.left + rct.width / 2 - 5 + (Math.random() * 18 - 9)) + 'px';
        sp.style.top = (rct.top + rct.height * 0.62 + (Math.random() * 14 - 7)) + 'px';
        document.body.appendChild(sp);
        setTimeout(function () { sp.remove(); }, 680 * s);
      }, 85 * s);
      /* SFX — launch riser, C-E-G-C corner arpeggio, two air whooshes, thump + ta-da.
         Deterministic counts for QA: 8 oscillators, 2 buffer sources. */
      chirp(320, 1250, 0.02 * T, 0.16 * T, 'square', 0.06);            // riser
      var corners = [sw + arc / 2, sw + arc + sh + arc / 2, sw + arc + sh + arc + sw + arc / 2,
                     sw + arc + sh + arc + sw + arc + sh + arc / 2].map(function (d) { return d / per; });
      [523.25, 659.25, 783.99, 1046.5].forEach(function (f, k) {
        var tc = 0.10 + 0.80 * (((corners[k] - t0) % 1 + 1) % 1);
        chirp(f, f * 1.02, tc * T, 0.09, 'sine', 0.06);                // corner blip
      });
      noiseSweep(1400, 500, 0.16 * T, 0.30 * T, 0.05, 1);              // air whooshes
      noiseSweep(1500, 450, 0.52 * T, 0.30 * T, 0.05, 1);
      chirp(150, 60, 0.925 * T, 0.10, 'sine', 0.10);                   // landing thump
      chirp(900, 1500, 0.955 * T, 0.06);                               // ta-da
      chirp(1100, 1900, 0.975 * T, 0.07);
      setTimeout(function () {
        clearInterval(sparkT);
        aMove.cancel(); aBank.cancel();
        dock.classList.remove('rao-travelling');
        svg.classList.remove('mood-lap');
        clapBusy = false; lapActive = false;
      }, T * 1000 + 80);
    }
    /* the active question card: the one that last spoke, else nearest to centre */
    var lastCard = null;
    function activeCardEl() {
      if (lastCard && document.contains(lastCard)) return lastCard;
      var cards = document.querySelectorAll('.pv-card'), bestEl = null, bestD = 1e9;
      var cy = window.innerHeight / 2;
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        if (!r.width && !r.height) continue;
        var d = Math.abs((r.top + r.bottom) / 2 - cy);
        if (d < bestD) { bestD = d; bestEl = cards[i]; }
      }
      return bestEl;
    }
    function cardOrbitRect() {
      var c = activeCardEl();
      if (!c) return null;
      var r = c.getBoundingClientRect();                      /* computed at trigger time, never cached */
      return { minX: Math.max(4, r.left - W * 0.5),
               maxX: Math.min(window.innerWidth  - W - 4, r.right  - W * 0.5),
               minY: Math.max(4, r.top  - H * 0.5),
               maxY: Math.min(window.innerHeight - H - 4, r.bottom - H * 0.5) };
    }

    /* ══ window.Robo facade (Guide §5). DROP policy: play() returns false while busy. ══ */
    var MOTIONS = { clap: playClap, tumble: playTumble, angry: playAngry, dance: playDance,
      sus: playSus, mac: playMac, apple: playApple, lean: playLean, booty: playBooty,
      noodle: playNoodle, squash: playSquash, hero: playHero,
      lap: function () { playLap(cardOrbitRect() || undefined); } };
    window.Robo = {
      play: function (name) {
        if (clapBusy || lapActive) return false;               /* DROP, never queue */
        var f = MOTIONS[name]; if (!f) return false;
        f(); return true;
      },
      flyTo: function (x, y) { if (!lapActive) flyTo(x, y); },
      bubble: showBubble,
      poke: poke,
      busy: function () { return clapBusy || lapActive; }
    };
    Object.defineProperty(window.Robo, 'muted', {
      get: function () { return muted; },
      set: function (v) { muted = !!v; }
    });
    /* start position: bottom-right; left/top-driven like the demo */
    dock.style.left = (window.innerWidth - W - 26) + 'px';
    dock.style.top = (window.innerHeight - H - 118) + 'px';
    window.addEventListener('resize', function () {
      if (lapActive || clapBusy) return;
      var l = Math.max(4, Math.min(window.innerWidth - W - 4, dock.offsetLeft));
      var t = Math.max(4, Math.min(window.innerHeight - H - 4, dock.offsetTop));
      dock.style.left = l + 'px'; dock.style.top = t + 'px';
    });

    /* ═══ ENGAGEMENT — the reaction ladder (guided-solve-rebuilt-v1, canonical),
       wired to REAL card events, plus L3 physical play and L4 ambience. ═══ */
    var MOODS = ['mood-solve-encourage','mood-solve-happy','mood-solve-celebrate',
                 'mood-solve-hyped','mood-solve-shook','mood-solve-sleepy'];
    var moodTimer = null, quiet = false, streak = 0, hadWrong = false;

    function clearMood(){ MOODS.forEach(function(c){ svg.classList.remove(c); });
      if (moodTimer) { clearTimeout(moodTimer); moodTimer = null; } }
    function mood(name, holdMs){
      if (quiet) return false;                       /* walkthrough silence rule */
      if (window.Robo.busy()) return false;          /* DROP, never queue */
      clearMood();
      svg.classList.add('mood-solve-' + name);
      if (holdMs !== 0) moodTimer = setTimeout(clearMood, (holdMs || 1800) * slowFactor());
      return true;
    }
    function wake(){ if (svg.classList.contains('mood-solve-sleepy')) clearMood(); idleReset(); }

    /* ── L1-L2: ladder wiring to REAL card events ── */
    var leanDone = false; /* v23: stuck-child rule — one lean-in per stuck period */
    function onWrong(){ streak = 0; hadWrong = true; leanDone = false; mood('encourage', 2100); }
    var PRAISE = ['Nailed it!','That’s it!','Perfect estimate!','You got it!']; /* exact spec strings */
    /* v23: Framework v3 — comeback draws from its OWN effort pool, never the outcome pool */
    var COMEBACK = ['You didn’t give up!','You fixed it yourself!',
                    'That’s how it’s done — keep trying!','You worked it out!'];
    /* the child's first name, from the app's account/session layer; '' degrades
       silently to the nameless line */
    function childName(){
      try {
        var a = window.RaoAccount;
        var n = a && a.firstName;
        return n ? String(n).trim() : '';
      } catch (e) { return ''; }
    }
    function onCorrect(){
      var comeback = hadWrong; hadWrong = false; leanDone = false; streak++;
      var played;
      if (streak >= 5)      played = mood('hyped', 2000);
      else if (streak >= 3) played = mood('celebrate', 2200);
      else if (comeback)    played = mood('shook', 1900);
      else                  played = mood('happy', 1600);
      if (played) setTimeout(function () {                     /* beat 2: Robo cheers himself */
        var pool = comeback ? COMEBACK : PRAISE;
        var line = pool[Math.floor(Math.random() * pool.length)];
        /* name — streak>=3 milestones only, never on comeback (v3 law) */
        var nm = childName();
        if (nm && !comeback && streak >= 3) line = line.replace(/!$/, ', ' + nm + '!');
        window.Robo.bubble(
          line + (streak >= 2 ? ' ⚡ ' + streak + ' in a row!' : ''), 1900 * slowFactor());
      }, 150);
    }
    function setQuiet(q){
      quiet = q;
      if (q) { clearMood(); hideBubble(); }   /* law 6: no bubble, no mood, no motion */
    }
    function trackCard(e){
      if (e && e.target && e.target.closest) {
        var c = e.target.closest('.pv-card');
        if (c) lastCard = c;
      }
    }
    document.addEventListener('rao:wrong', function (e) { trackCard(e); onWrong(); });
    document.addEventListener('rao:outcome', function (e) {
      trackCard(e);
      var o = e.detail && e.detail.outcome;
      if (o === 'correct') onCorrect();
      else if (o === 'solved-with-help') setQuiet(true);   /* walkthrough open = the commit point */
    });
    document.addEventListener('rao:next', function () { setQuiet(false); });

    /* ── L3: drag him anywhere · tap = poke · yield rule · session persistence ── */
    var drag = null;
    function clampL(x){ return Math.max(4, Math.min(window.innerWidth - W - 4, x)); }
    function clampT(y){ return Math.max(4, Math.min(window.innerHeight - H - 4, y)); }
    function dockBlocks(l, t){
      var r = { left: l, top: t, right: l + W, bottom: t + H }, hit = false;
      document.querySelectorAll('.opt,.check-btn,.next-btn,.reveal-btn,button,input,a,.hint-box').forEach(function (el) {
        if (hit) return;
        var b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) return;
        if (getComputedStyle(el).visibility === 'hidden') return;
        if (!(r.right < b.left || b.right < r.left || r.bottom < b.top || b.bottom < r.top)) hit = true;
      });
      return hit;
    }
    function nearestClear(l, t){
      if (!dockBlocks(l, t)) return { l: l, t: t };
      for (var rad = 40; rad <= 480; rad += 40)
        for (var a = 0; a < 12; a++){
          var th = a / 12 * Math.PI * 2;
          var cl = clampL(l + Math.cos(th) * rad), ct = clampT(t + Math.sin(th) * rad);
          if (!dockBlocks(cl, ct)) return { l: cl, t: ct };
        }
      return { l: clampL(window.innerWidth - W - 26), t: clampT(window.innerHeight - H - 118) };
    }
    function savePos(){ try { sessionStorage.setItem('roboPos',
      JSON.stringify({ l: dock.offsetLeft, t: dock.offsetTop })); } catch (e) {} }
    try { var sp = JSON.parse(sessionStorage.getItem('roboPos') || 'null');
      if (sp) { dock.style.left = clampL(sp.l) + 'px'; dock.style.top = clampT(sp.t) + 'px'; } } catch (e) {}

    wrap.addEventListener('pointerdown', function (e) {
      wake();
      if (window.Robo.busy()) return;                /* not grabbable mid-motion (exact-return) */
      e.preventDefault();
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY,
               ol: dock.offsetLeft, ot: dock.offsetTop, moved: false, t0: Date.now(), px: e.clientX };
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;      /* tap-vs-drag threshold */
      drag.moved = true;
      dock.classList.add('robo-carried');
      dock.classList.toggle('carry-r', e.clientX > drag.px + 1);
      dock.classList.toggle('carry-l', e.clientX < drag.px - 1);
      drag.px = e.clientX;
      dock.style.left = clampL(drag.ol + dx) + 'px';
      dock.style.top = clampT(drag.ot + dy) + 'px';
    });
    wrap.addEventListener('pointerup', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var wasTap = !drag.moved && (Date.now() - drag.t0) < 500;
      dock.classList.remove('robo-carried', 'carry-r', 'carry-l');
      drag = null;
      if (wasTap) { window.Robo.poke(); return; }
      var spot = nearestClear(dock.offsetLeft, dock.offsetTop);       /* yield rule */
      if (spot.l !== dock.offsetLeft || spot.t !== dock.offsetTop)
        window.Robo.flyTo(spot.l + W / 2, spot.t + H / 2);
      setTimeout(savePos, 700);
    });
    wrap.addEventListener('pointercancel', function () {
      dock.classList.remove('robo-carried', 'carry-r', 'carry-l'); drag = null; });

    /* ── L4: pointer eye-tracking + 45s doze + the stuck-child lean-in ── */
    var eyeRaf = null;
    document.addEventListener('pointermove', function (e) {
      if (drag || window.Robo.busy()) return;
      if (eyeRaf) return;
      eyeRaf = requestAnimationFrame(function () {
        eyeRaf = null;
        var r = dock.getBoundingClientRect();
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var d = Math.hypot(e.clientX - cx, e.clientY - cy);
        svg.querySelectorAll('.m-pupil').forEach(function (p) {
          p.style.transform = d < 260
            ? 'translate(' + (Math.max(-1, Math.min(1, (e.clientX - cx) / 260)) * 3.2) + 'px,'
                           + (Math.max(-1, Math.min(1, (e.clientY - cy) / 260)) * 2.6) + 'px)'
            : '';
        });
      });
    }, { passive: true });

    /* v23: the one sanctioned brush with never-interrupt — a single silent lean
       toward the card. No bubble, no sound, no mood class, no repeat until the
       child answers again. */
    function leanIn(){
      if (leanDone) return; leanDone = true;
      svg.dataset.leans = (parseInt(svg.dataset.leans || '0', 10) + 1);
      var card = activeCardEl();
      var dir = 1;
      if (card) { var c = card.getBoundingClientRect(), d = dock.getBoundingClientRect();
        dir = (c.left + c.width / 2) < (d.left + d.width / 2) ? -1 : 1; }
      svg.animate([
        { transform: 'rotate(0deg) translateX(0px)' },
        { transform: 'rotate(' + (7 * dir) + 'deg) translateX(' + (6 * dir) + 'px)', offset: .35 },
        { transform: 'rotate(' + (5 * dir) + 'deg) translateX(' + (4 * dir) + 'px)', offset: .7 },
        { transform: 'rotate(0deg) translateX(0px)' }
      ], { duration: 1400, easing: 'ease-in-out' });
    }
    var idleTimer = null;
    function idleReset(){
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        if (quiet || window.Robo.busy()) return;   /* walkthrough silence outranks everything */
        if (hadWrong) { leanIn(); return; }        /* v23: never doze on a stuck child */
        if (mood('sleepy', 0)) window.Robo.bubble('Zzz…', 2600);
      }, 45000);
    }
    ['pointerdown', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, wake, { capture: true, passive: true }); });
    idleReset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
