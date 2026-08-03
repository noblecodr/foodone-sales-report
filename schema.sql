-- Supabase SQL Editor에서 한 번만 실행하면 됩니다.
-- 업체 리스트 전체를 JSONB 한 덩어리로 저장하는 단일 행 테이블 (행마다 저장할 필요 없음 -
-- 프론트엔드가 항상 전체를 한 번에 불러다 클라이언트에서 필터링하는 구조이기 때문).
create table if not exists site_snapshot (
  id int primary key default 1,
  rows_json jsonb not null,
  routes_html text not null,
  total int not null,
  generated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- RLS를 켜고 정책을 하나도 안 붙이면 anon/authenticated 키로는 아예 접근 불가능해진다.
-- service_role 키(서버 쪽 Vercel 함수에서만 사용, 브라우저에 절대 노출 안 됨)는 RLS를 우회하므로
-- 정상적으로 읽고 쓸 수 있다.
alter table site_snapshot enable row level security;

-- 기준점(테헤란로 151) 거리 기반 방문동선 섹션 추가 시 도입 (2026-07-29).
alter table site_snapshot add column if not exists routes_html_base text;
