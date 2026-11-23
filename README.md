# 비켜비

강우와 침수 위험 정보를 바탕으로 **빠른 경로와 안전 경로를 비교하는 보행 경로 서비스**입니다.
동국대학교 공개SW 프로젝트의 프론트엔드이며, 강남역 반경 1km를 시범 지역으로 제공합니다.

## 주요 기능

- 출발지·목적지 검색 및 최근 장소 조회
- 빠른 경로와 안전 경로의 시간·거리·위험 구간 통과 거리 비교
- 지도에서 위험 구역과 통행 제외 구역, 위험 근거 확인
- 현재 강우 조회 및 경로 정보 갱신
- 자주 선택한 장소를 주소 카드로 표시

## 기술 스택

React 19 · Vite 8 · JavaScript · Tailwind CSS 4 · React Router 7 · Axios · Kakao Maps SDK

## 실행 방법

Node.js 22.13 이상인 22.x 환경을 권장합니다.

```bash
npm ci
cp .env.example .env
```

`.env`에 백엔드 주소와 카카오 JavaScript 키를 설정해 주세요.

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_KAKAO_MAP_KEY=your_kakao_javascript_key
```

- `VITE_API_BASE_URL`: 백엔드 API 주소입니다. 배포 서버를 사용한다면 해당 주소로 변경해 주세요. `/api`는 붙이지 않습니다.
- `VITE_KAKAO_MAP_KEY`: 카카오 JavaScript 키입니다. 카카오 앱에 프론트 접속 도메인을 등록해 주세요.

```bash
npm run dev
```

## 개발 명령어

| 명령어            | 설명           |
| ----------------- | -------------- |
| `npm run dev`     | 개발 서버 실행 |
| `npm run build`   | 배포용 빌드    |
| `npm run preview` | 빌드 결과 확인 |
| `npm run lint`    | 코드 검사      |

## 가상 강우 시연

출발지와 목적지를 선택한 뒤 `/main?rain=50`으로 접속하면 1시간 강우량을 50mm로 가정합니다. 서버 허용 범위는 0~200mm이며, `/main?rain=off`로 해제합니다.

설정은 같은 탭에서 유지됩니다. 홈의 현재 강우는 항상 실제 관측값입니다.
