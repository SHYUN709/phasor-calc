// 의존성 없는 테스트 — 실행: node test.js
const assert = require('node:assert/strict');
const c = require('./app.js');
const p = c.parseAny;

const cases = [
  ['복소수 → 페이저', () => c.fmtPolar(p('5+i')), '5.099 ∠ 11.3099°'],
  ['j 표기 + 음수 각도', () => c.fmtPolar(p('3-4j')), '5 ∠ -53.1301°'],
  ['음의 실수는 180°', () => c.fmtPolar(p('-1')), '1 ∠ 180°'],
  ['페이저 → 복소수', () => c.fmtRect(p('5∠30')), '4.3301 + j2.5'],
  ['< 를 ∠ 대신 사용', () => c.fmtRect(p('5<-45')), '3.5355 − j3.5355'],
  ['페이저 곱셈', () => c.fmtPolar(c.ops['*'](p('2∠30'), p('3∠60'))), '6 ∠ 90°'],
  ['페이저 나눗셈', () => c.fmtPolar(c.ops['/'](p('10∠90'), p('2∠30'))), '5 ∠ 60°'],
  ['일반 계산: 거듭제곱·괄호', () => c.fmt(c.evalExpr('2^3+(1+1)*2')), '12'],
  ['일반 계산: sin (도 단위)', () => c.fmt(c.evalExpr('sin(30)')), '0.5'],
  ['일반 계산: 제곱근', () => c.fmt(c.evalExpr('√(16)')), '4'],
];

let failed = 0;
for (const [name, fn, expected] of cases) {
  try {
    assert.equal(fn(), expected);
    console.log(`✔ ${name}`);
  } catch (e) {
    failed++;
    console.log(`✘ ${name}\n  ${e.message}`);
  }
}

try {
  c.ops['/'](p('1'), p('0'));
  failed++;
  console.log('✘ 0으로 나누기는 에러가 나야 함');
} catch {
  console.log('✔ 0으로 나누기 에러 처리');
}

console.log(failed ? `\n${failed}개 실패` : '\n모든 테스트 통과');
process.exit(failed ? 1 : 0);
