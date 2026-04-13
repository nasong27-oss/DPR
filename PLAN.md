# PM 에이전트 허브 — 프로젝트 플랜

> 팀의 PM 역량을 AI 에이전트로 집약하고, 구글 계정으로 어디서든 활용할 수 있는 사내 AI 허브 플랫폼  
> 웹 플랜 페이지: `/plan`

---

## 01. 배경 및 목적

PM팀은 시장 조사, 경쟁사 분석, PRD 작성, UX 리서치 등 다양한 업무에서 AI를 활용하고 있습니다.
그러나 각자 개인 계정으로 AI 도구를 사용하면서 노하우가 분산되고, 팀 전체의 AI 활용 역량이 축적되지 않는 문제가 있었습니다.

| 문제 | 내용 |
|------|------|
| 노하우 분산 | 팀원별 프롬프트와 활용법이 개인 도구에만 남아 공유가 어려움 |
| 반복 설정 | 로그인할 때마다 API 키를 재입력해야 하는 번거로움 |
| 역할 혼재 | UX 리서치·경쟁사 분석·마케팅 등 역할별 최적화된 AI가 없음 |

---

## 02. 핵심 기능

### 🤖 에이전트 등록 & 관리
팀원 누구나 자신의 PM 역할과 업무 방식을 프롬프트로 등록. AI가 원본 프롬프트를 자동 정제하여 일관된 품질 유지.
- 역할 명확화 / 중복 제거 / 출력 형식 표준화

### ★ 마스터 에이전트
등록된 모든 에이전트의 역량을 하나로 통합한 마스터 에이전트 자동 생성.
- 자동 통합 / 팀 전체 역량 / 실시간 재생성

### 💬 실시간 AI 채팅
Gemini와 Claude 중 원하는 모델을 선택해 에이전트와 대화. SSE 스트리밍 방식.
- Gemini 2.5/3.1 / Claude Haiku/Sonnet/Opus

### 🔍 Gemini 웹 검색 그라운딩
Google Search를 통해 실시간 웹 정보를 검색하여 최신 뉴스, 경쟁사 동향, 시장 데이터를 답변에 반영.

### 🖼️ 이미지 생성 & 편집
Gemini 이미지 모델로 마케팅 소재, 화면 목업, 개념 시각화 이미지 생성 및 편집.

### 💌 익명 피드백
에이전트 품질 개선을 위한 익명 피드백 시스템. 피드백은 GitHub에 누적되고 다음 프롬프트 정제 시 자동 반영.

---

## 03. 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router), React 18, Tailwind CSS 3 |
| 인증 | next-auth v4, Google OAuth 2.0 |
| AI | Gemini API (2.5/3.1), Claude API (Haiku/Sonnet/Opus) |
| 웹 검색 | Google Search Grounding (`googleSearch` tool) |
| 이미지 AI | Gemini Vision (`gemini-2.0-flash-preview-image-generation`) |
| 저장소 | GitHub API (에이전트 레지스트리) |
| 암호화 | AES-256-GCM + HKDF-SHA256 (Node.js crypto) |
| 배포 | Vercel (Edge Functions) |
| 개발 | TypeScript 5.8, ESLint |

---

## 04. 시스템 아키텍처

```
브라우저 (Next.js 클라이언트)
  ↓ Google OAuth (NextAuth)
서버 (Next.js API Routes)
  ↓ HTTP-only 쿠키에서 API 키 복호화
  ├─ Gemini API  ← Google Search 그라운딩
  ├─ Claude API
  └─ GitHub API  ← 에이전트 레지스트리

GitHub 저장소 구조:
registry/
  ├─ {agentId}/meta.json       # 메타데이터
  ├─ {agentId}/refined.md      # 정제된 프롬프트
  ├─ {agentId}/feedback.md     # 익명 피드백
  └─ .keys/{hash}.enc          # 암호화된 API 키
master/master-prompt.md        # 통합 마스터 프롬프트
outputs/                       # 저장된 대화 기록
```

---

## 05. 보안 설계

API 키는 어디에도 평문으로 저장되지 않습니다.

| 단계 | 처리 |
|------|------|
| 키 저장 | HKDF-SHA256(NEXTAUTH_SECRET + email) → AES-256-GCM 암호화 → GitHub 저장 + HTTP-only 쿠키 |
| 재접속 | 쿠키 확인 → 없으면 GitHub에서 복호화 → 쿠키 재설정 (크로스 디바이스 지원) |
| API 호출 | 요청 본문에 키 미포함 → 서버에서 쿠키 복호화 후 API 호출 |
| 로그아웃 | GitHub 암호화 파일 삭제 + 쿠키 만료 |

---

## 06. 개발 현황

- [x] Google OAuth 인증 및 팀 코드 접근 제어
- [x] 에이전트 등록·수정·삭제·제외 (GitHub CRUD)
- [x] AI 프롬프트 자동 정제 (Gemini / Claude)
- [x] 마스터 에이전트 자동 생성·재생성
- [x] 실시간 스트리밍 채팅 (SSE)
- [x] Gemini Google Search 웹 검색 그라운딩
- [x] 이미지 생성 및 편집 (Gemini Vision)
- [x] 익명 피드백 시스템
- [x] AES-256-GCM 암호화 API 키 저장 (크로스 디바이스)
- [x] 모델 선택 UI (Gemini 2.5/3.1 · Claude 3종)
- [x] 탭 전환 시 채팅 상태 유지
- [x] 대화 복사 버튼 / GitHub 저장 기능
- [x] 모바일 반응형 레이아웃

---

## 07. 향후 로드맵

### 단기
- Gemini 3.1 모델 안정화 반영
- 대화 내보내기 (PDF/DOCX)
- 에이전트별 사용 통계
- PDF 파일 컨텍스트 채팅

### 중기
- 팀원 권한 관리 (View/Edit/Admin)
- 에이전트 버전 히스토리 비교
- Slack / Notion 연동
- 에이전트 공개 템플릿 마켓

### 장기
- 멀티팀 / 조직 분리 지원
- 자동화 워크플로우 (에이전트 체이닝)
- 음성 입력 인터페이스
- 사내 데이터 RAG 연동

---

*PM 에이전트 허브 · dpr-agent-hub · 2026*
