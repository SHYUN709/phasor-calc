// ===== 복소수 / 페이저 핵심 로직 =====
const DEG = Math.PI / 180;

// "5+i", "3-4j", "-2.5i", "7" → {re, im}
function parseRect(str) {
  let s = str.replace(/\s+/g, '').replace(/[jJI]/g, 'i').replace(/−/g, '-');
  if (!s) throw new Error('값을 입력해 주세요');
  if (!/^[0-9.+\-ie]+$/.test(s)) throw new Error('복소수 형식이 아니에요 (예: 5+i, 3-4j)');
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== s) throw new Error('복소수 형식이 아니에요 (예: 5+i, 3-4j)');
  let re = 0, im = 0;
  for (const t of terms) {
    if (t.includes('i')) {
      let c = t.replace('i', '');
      if (c === '' || c === '+') c = '1';
      else if (c === '-') c = '-1';
      const v = Number(c);
      if (!isFinite(v) || (t.match(/i/g) || []).length > 1) throw new Error(`"${t}" 를 읽을 수 없어요`);
      im += v;
    } else {
      const v = Number(t);
      if (!isFinite(v)) throw new Error(`"${t}" 를 읽을 수 없어요`);
      re += v;
    }
  }
  return { re, im };
}

// "5∠30", "5<-45", "5∠30°" → {re, im}
function parsePolar(str) {
  const s = str.replace(/\s+/g, '').replace(/°/g, '').replace(/−/g, '-').replace('<', '∠');
  const parts = s.split('∠');
  if (parts.length !== 2 || parts[0] === '' || parts[1] === '') throw new Error('페이저 형식이 아니에요 (예: 5∠30)');
  const mag = Number(parts[0]), ang = Number(parts[1]);
  if (!isFinite(mag) || !isFinite(ang)) throw new Error('크기/각도는 숫자여야 해요');
  return { re: mag * Math.cos(ang * DEG), im: mag * Math.sin(ang * DEG) };
}

// 두 형식 모두 허용
function parseAny(str) {
  return /[∠<]/.test(str) ? parsePolar(str) : parseRect(str);
}

function clean(x) {
  if (Math.abs(x) < 1e-10) return 0;
  return x;
}

function fmt(x, d = 4) {
  x = clean(x);
  let s = Number(x.toFixed(d)).toString();
  return s === '-0' ? '0' : s;
}

function toPolar(z) {
  const mag = Math.hypot(z.re, z.im);
  let ang = mag < 1e-12 ? 0 : Math.atan2(clean(z.im), clean(z.re)) / DEG;
  if (ang <= -180 + 1e-9) ang = 180;
  return { mag, ang };
}

function fmtPolar(z) {
  const p = toPolar(z);
  return `${fmt(p.mag)} ∠ ${fmt(p.ang)}°`;
}

function fmtRect(z) {
  const re = clean(z.re), im = clean(z.im);
  if (im === 0) return fmt(re);
  const imAbs = fmt(Math.abs(im));
  const sign = im < 0 ? '−' : '+';
  if (re === 0) return `${im < 0 ? '−' : ''}j${imAbs}`;
  return `${fmt(re)} ${sign} j${imAbs}`;
}

const ops = {
  '+': (a, b) => ({ re: a.re + b.re, im: a.im + b.im }),
  '-': (a, b) => ({ re: a.re - b.re, im: a.im - b.im }),
  '*': (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }),
  '/': (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    if (d < 1e-20) throw new Error('0으로 나눌 수 없어요');
    return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
  },
};

// ===== 일반 계산 (사칙연산 + 삼각함수, 각도는 도) =====
// eval 없이 직접 파싱: 숫자, + - * / ^, 괄호, sin cos tan asin acos atan sqrt, pi
const FUNCS = {
  sin: (x) => Math.sin(x * DEG), cos: (x) => Math.cos(x * DEG), tan: (x) => Math.tan(x * DEG),
  asin: (x) => Math.asin(x) / DEG, acos: (x) => Math.acos(x) / DEG, atan: (x) => Math.atan(x) / DEG,
  sqrt: Math.sqrt,
};

function evalExpr(str) {
  const s = str.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    .replace(/√/g, 'sqrt').replace(/π/g, 'pi').replace(/°/g, '').toLowerCase();
  if (!s) throw new Error('식을 입력해 주세요');
  let i = 0;
  const peek = () => s[i];
  const expect = (c) => { if (s[i] !== c) throw new Error(`"${c}" 가 필요해요`); i++; };

  function expr() {          // + -
    let v = term();
    while (peek() === '+' || peek() === '-') { const o = s[i++]; const r = term(); v = o === '+' ? v + r : v - r; }
    return v;
  }
  function term() {          // * /
    let v = unary();
    while (peek() === '*' || peek() === '/' || peek() === '(' || /[a-z]/.test(peek() || '')) {
      let o = '*';
      if (peek() === '*' || peek() === '/') o = s[i++];
      const r = unary();     // 2(3) 또는 2cos(30) 같은 암시적 곱셈 허용
      if (o === '/' && r === 0) throw new Error('0으로 나눌 수 없어요');
      v = o === '*' ? v * r : v / r;
    }
    return v;
  }
  function unary() {
    if (peek() === '-') { i++; return -unary(); }
    if (peek() === '+') { i++; return unary(); }
    return power();
  }
  function power() {         // ^ (오른쪽 결합)
    const b = atom();
    if (peek() === '^') { i++; return Math.pow(b, unary()); }
    return b;
  }
  function atom() {
    if (peek() === '(') { i++; const v = expr(); expect(')'); return v; }
    const num = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/);
    if (num) { i += num[0].length; return Number(num[0]); }
    const name = s.slice(i).match(/^[a-z]+/);
    if (name) {
      i += name[0].length;
      if (name[0] === 'pi') return Math.PI;
      const f = FUNCS[name[0]];
      if (!f) throw new Error(`"${name[0]}" 는 지원하지 않아요`);
      expect('(');
      const v = f(expr());
      expect(')');
      return v;
    }
    throw new Error('식을 읽을 수 없어요');
  }

  const v = expr();
  if (i < s.length) throw new Error(`"${s.slice(i)}" 부분을 읽을 수 없어요`);
  if (!isFinite(v)) throw new Error('계산할 수 없는 값이에요');
  return v;
}

if (typeof module !== 'undefined') {
  module.exports = { parseRect, parsePolar, parseAny, fmtPolar, fmtRect, ops, evalExpr, fmt };
}

// ===== UI =====
if (typeof document !== 'undefined') {
  const $ = (id) => document.getElementById(id);

  function show(outId, html, isErr = false) {
    const el = $(outId);
    el.innerHTML = html;
    el.classList.toggle('err', isErr);
  }

  function run(outId, fn) {
    try { show(outId, fn()); }
    catch (e) { show(outId, e.message, true); }
  }

  // 탭
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((b) => b.classList.remove('on'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('on'));
      btn.classList.add('on');
      $(btn.dataset.panel).classList.add('on');
    });
  });

  // 기호 삽입 버튼 (커서 위치에)
  document.querySelectorAll('[data-insert]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = $(btn.dataset.target);
      const ch = btn.dataset.insert;
      const st = input.selectionStart ?? input.value.length;
      const en = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, st) + ch + input.value.slice(en);
      input.focus();
      input.setSelectionRange(st + ch.length, st + ch.length);
    });
  });

  // 1) 복소수 → 페이저
  const doR2P = () => run('r2pOut', () => fmtPolar(parseRect($('r2pIn').value)));
  $('r2pBtn').addEventListener('click', doR2P);
  $('r2pIn').addEventListener('keydown', (e) => e.key === 'Enter' && doR2P());

  // 2) 페이저 → 복소수
  const doP2R = () => run('p2rOut', () => fmtRect(parsePolar($('p2rIn').value)));
  $('p2rBtn').addEventListener('click', doP2R);
  $('p2rIn').addEventListener('keydown', (e) => e.key === 'Enter' && doP2R());

  // 3) 페이저 연산
  let op = '+';
  document.querySelectorAll('.op').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.op').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      op = b.dataset.op;
    });
  });
  const doCalc = () => run('calcOut', () => {
    const r = ops[op](parseAny($('calcA').value), parseAny($('calcB').value));
    return `<div class="big">${fmtPolar(r)}</div><div class="sub">= ${fmtRect(r)}</div>`;
  });
  $('calcBtn').addEventListener('click', doCalc);
  ['calcA', 'calcB'].forEach((id) => $(id).addEventListener('keydown', (e) => e.key === 'Enter' && doCalc()));

  // 4) 일반 계산
  const doEval = () => run('evalOut', () => fmt(evalExpr($('evalIn').value), 6));
  $('evalBtn').addEventListener('click', doEval);
  $('evalIn').addEventListener('keydown', (e) => e.key === 'Enter' && doEval());

  // 오프라인 지원
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}
