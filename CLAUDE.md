# 페이저 계산기 — 프로젝트 안내 (Claude Code용)

회로망이론 시험용 웹 계산기. GitHub Pages로 배포하는 정적 PWA (빌드 도구·프레임워크 없음).

## 범위 (중요)
교수님께 "기능이 단순한 계산기"로 허가받을 예정이므로 기능을 함부로 늘리지 말 것.
- 복소수 → 페이저 변환
- 페이저 → 복소수 변환
- 페이저/복소수 사칙연산 (+ − × ÷)
- 일반 계산: 사칙연산, ^, 괄호, sin/cos/tan(도 단위), 역삼각함수, √, π — `evalExpr` (eval() 사용 금지, 직접 파서)
메모 저장, 수식 저장, 외부 서버 통신, AI 기능은 넣지 않는다.

## 파일 구조
- `index.html` — UI + CSS (인라인), 탭 3개
- `app.js` — 파싱/연산/포맷 로직 + UI 이벤트. Node에서 `require('./app.js')`로 로직만 테스트 가능
- `sw.js` — 오프라인 캐시. **파일 수정 시 `CACHE` 버전을 반드시 올릴 것** (예: v1 → v2)
- `manifest.json`, `icon-192.png`, `icon-512.png` — 홈 화면 추가(PWA)용

## 규칙
- 각도 단위: 도(°). 출력 각도 범위 (-180, 180]
- 입력: `i`/`j` 모두 허용, `∠` 대신 `<` 허용, `−`(유니코드 마이너스) 허용
- 숫자 표시: 소수점 4자리, 뒤의 0 제거
- 에러 메시지는 한국어

## 테스트
```bash
node -e 'const c=require("./app.js"); console.log(c.fmtPolar(c.parseRect("5+i")))'   # 5.099 ∠ 11.3099°
node -e 'const c=require("./app.js"); console.log(c.fmtRect(c.parsePolar("5∠30")))'  # 4.3301 + j2.5
```
로컬 확인: `npx serve .` 또는 `python3 -m http.server` 후 브라우저 접속 (Service Worker는 file://에서 동작 안 함)

## 배포
GitHub 저장소 → Settings → Pages → `main` / `(root)` → `https://<아이디>.github.io/phasor-calc/`
