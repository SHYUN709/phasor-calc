# 페이저 계산기 · Phasor Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-1f2937)](https://shyun709.github.io/phasor-calc/)
![No dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

회로이론 공부하는 학생을 위한, **설치 없이 브라우저에서 바로 쓰는 페이저 계산기**입니다.
복소수 ↔ 페이저 변환, 페이저 사칙연산, 일반 공학 계산을 지원하고, 한 번 열어두면 **오프라인에서도** 작동합니다.

A free, open-source phasor calculator for circuit analysis students. It runs in the browser, works offline, and has zero dependencies.

👉 **바로 사용하기: https://shyun709.github.io/phasor-calc/**

---

## 왜 만들었나요?

회로망이론 수업에서 페이저 계산은 자주 하는데, 공학용 계산기는 비싸고 복소수 모드 조작이 번거롭습니다.
필요한 기능만 깔끔하게 담은 **무료 대안**을 만들고, 누구나 코드를 확인하고 고칠 수 있도록 공개했습니다.

## 기능

| 탭 | 입력 예시 | 결과 |
|---|---|---|
| 복소수 → 페이저 | `5+i` | `5.099 ∠ 11.3099°` |
| 페이저 → 복소수 | `5∠30` | `4.3301 + j2.5` |
| 페이저 연산 (+ − × ÷) | `2∠30` × `3∠60` | `6 ∠ 90°` / `j6` (두 형식 동시 표시) |
| 일반 계산 | `12*1.897/2*cos(60-41.57)` | `10.7982` |

- 각도 단위는 **도(°)**이고, 출력 각도 범위는 (-180°, 180°]입니다.
- 허수 단위는 `i`, `j`를 모두 인식합니다.
- `∠` 대신 키보드의 `<`를 입력해도 됩니다 (예: `5<30`).
- 일반 계산은 `+ − × ÷`, `^`, 괄호, `sin` `cos` `tan`과 역함수, `√`, `π`를 지원합니다.
- **PWA**라서 휴대폰에서 **홈 화면에 추가**하면 앱처럼 쓸 수 있고, 비행기 모드에서도 작동합니다.
- `eval()`을 쓰지 않고 수식 파서를 직접 구현했고, 외부 서버와 통신하지 않습니다.

## 사용법

1. https://shyun709.github.io/phasor-calc/ 에 접속합니다.
2. (선택) 휴대폰 브라우저 메뉴에서 **홈 화면에 추가**를 누릅니다.
3. 탭을 고르고 값을 입력합니다.

## 로컬에서 실행하기

빌드 도구나 프레임워크가 없는 순수 HTML/JS 프로젝트입니다.

```bash
git clone https://github.com/SHYUN709/phasor-calc.git
cd phasor-calc
python3 -m http.server 8000   # 또는 npx serve .
# 브라우저에서 http://localhost:8000 접속
```

> `file://`로 바로 열면 Service Worker(오프라인 기능)가 동작하지 않으니 위처럼 로컬 서버로 여세요.

## 테스트

Node.js만 있으면 별도 설치 없이 실행됩니다.

```bash
node test.js
```

## 프로젝트 구조

```
index.html      UI + CSS (탭 구성)
app.js          파싱·연산·포맷 로직 + UI 이벤트 (Node에서 require 가능)
sw.js           오프라인 캐시 (Service Worker)
manifest.json   PWA 설정 (홈 화면 추가)
test.js         의존성 없는 단위 테스트
```

## 기여하기

버그 제보, 기능 제안, PR 모두 환영합니다! 🙌

- **버그 제보 / 제안:** [Issues](https://github.com/SHYUN709/phasor-calc/issues)에 입력값, 기대한 결과, 실제 결과를 적어 주세요.
- **PR:** 수정 후 `node test.js`가 통과하는지 확인해 주세요. 새 기능을 넣었다면 `test.js`에 테스트 케이스도 추가해 주세요.
- 파일을 수정했다면 `sw.js`의 `CACHE` 버전(예: `v1` → `v2`)을 올려야 사용자 기기에 새 버전이 반영됩니다.

> 시험장에서도 쓸 수 있는 **단순한 계산기**가 목표라서 메모 저장, 수식 저장, 외부 통신, AI 기능은 넣지 않습니다.

## 직접 배포하기 (Fork)

1. 이 저장소를 Fork합니다.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**로 설정합니다.
3. 1~2분 뒤 `https://<깃허브아이디>.github.io/phasor-calc/`에서 확인합니다.

## 라이선스

[MIT](LICENSE) © 2026 박성현 ([@SHYUN709](https://github.com/SHYUN709))
