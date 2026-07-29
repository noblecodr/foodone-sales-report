# foodone-sales-report

푸드원시스템 강남구 영업 리스트업 - 공개 배포용 저장소.

이 저장소엔 소스코드(파이프라인 로직)가 없다. 데이터는 [foodone-katsu-sales](https://github.com/noblecodr/foodone-katsu-sales)(private)에서 만들어 Supabase에 올리고, 이 저장소는 그 데이터를 비밀번호 확인 후 보여주는 껍데기(정적 페이지 + Vercel 서버리스 함수)만 가지고 있다.

## 구조

- `public/index.html` — 정적 페이지 셸 (데이터 없음). foodone-katsu-sales의 `python deploy.py`가 생성.
- `api/login.js` — 비밀번호 확인 후 세션 쿠키 발급 (Vercel 서버리스 함수)
- `api/data.js` — 세션 쿠키 확인 후 Supabase에서 데이터 조회 (service_role 키 사용, 브라우저엔 노출 안 됨)
- `schema.sql` — Supabase에 한 번만 실행하면 되는 테이블 생성 SQL

## Vercel 환경변수 (Project Settings > Environment Variables)

| 이름 | 값 |
|---|---|
| `REPORT_PASSWORD` | 페이지 열람용 비밀번호 |
| `SESSION_SECRET` | 세션 쿠키 서명용 랜덤 문자열 (아무 긴 랜덤 문자열이면 됨, 32자 이상 권장) |
| `SUPABASE_URL` | Supabase 프로젝트 Settings > API > Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 프로젝트 Settings > API > service_role 키 |

## 데이터 갱신 흐름

1. foodone-katsu-sales에서 `python main.py` (파이프라인 재실행)
2. `python upload_to_supabase.py` (Supabase 데이터 갱신 — 이것만으로 배포 사이트에 바로 반영됨, 재배포 불필요)
3. UI/CSS/JS를 바꿨을 때만: `python deploy.py` 후 이 저장소에 커밋+푸시 (Vercel이 자동 재배포)
