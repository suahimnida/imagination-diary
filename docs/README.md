# Imagination — AI 그림일기

오늘의 일기를 쓰면, 원하는 화풍을 골라 Gemini API가 어울리는 일러스트를 그려주는
그림일기 웹 서비스입니다. 자세한 기획 배경은 [`PLAN.md`](./PLAN.md)를 참고하세요.

## 소개
- **기본 페이지**: 지금까지 생성된 일러스트 중 3장을 랜덤으로 보여주는 갤러리
- **Diary 페이지**: 작성한 일기를 날짜·제목·일러스트 카드로 모아보기, `오늘의 일기쓰기` 버튼으로 새 일기 시작
- **일기 작성 → 스타일 설문 → AI 일러스트 생성** 흐름으로 하루를 기록

## 기술 스택
| 영역 | 기술 |
|---|---|
| 프론트엔드 | HTML / CSS / Vanilla JavaScript (프레임워크 미사용) |
| 백엔드 | Vercel Serverless Functions (Python) |
| AI | Google Gemini API — `gemini-2.5-flash-image` (이미지 생성) |
| 데이터 저장 | 브라우저 `localStorage` (MVP) |
| 배포 | GitHub + Vercel |

## 배포 URL
`https://<vercel-project-이름>.vercel.app` — https://imagination-diary-rtur2b23i-love2957love-5212.vercel.app/

## 프로젝트 구조
```
imagination-diary/
├─ index.html          # 기본 페이지
├─ diary.html           # Diary 목록 페이지
├─ write.html            # 일기 작성 페이지
├─ survey.html            # 스타일 선택 & 일러스트 생성 페이지
├─ entry.html              # 일기 상세보기 페이지
├─ css/style.css
├─ js/
│  ├─ storage.js        # localStorage 기반 데이터 레이어 (공통)
│  ├─ main.js            # 기본 페이지 갤러리 렌더링
│  ├─ diary.js             # Diary 목록 렌더링
│  ├─ write.js              # 일기 작성 폼 검증 + 임시 저장
│  ├─ survey.js              # 스타일 선택 + API 호출
│  └─ entry.js                 # 일기 상세 렌더링
├─ api/
│  └─ generate-illustration.py  # Gemini API 연동 서버리스 함수
├─ requirements.txt
├─ vercel.json           # 함수 타임아웃 설정
└─ PLAN.md               # 서비스 기획서
```

## 로컬에서 실행하는 방법

### 1) 프론트엔드만 미리보기
정적 파일만으로도 화면 구성은 확인할 수 있습니다 (일러스트 생성은 API가 필요).
```bash
cd imagination-diary
python3 -m http.server 5500
# 브라우저에서 http://localhost:5500 접속
```

### 2) API 포함 전체 실행 (Vercel CLI)
```bash
npm install -g vercel
cd imagination-diary
vercel dev
```
`vercel dev`는 `api/generate-illustration.py`를 로컬에서 서버리스 함수처럼 실행해줍니다.

## 환경 변수
| 이름 | 설명 |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio에서 발급받은 Gemini API 키. **절대 코드/README/스크린샷에 노출하지 마세요.** |

설정 방법:
- 로컬: 프로젝트 루트에 `.env.local` 파일을 만들고 `GEMINI_API_KEY=발급받은키` 를 추가합니다. (`.gitignore`에 이미 포함되어 커밋되지 않습니다.)
- Vercel: Project → Settings → Environment Variables 에서 `GEMINI_API_KEY`를 추가한 뒤 재배포합니다.

## 배포 방법 (GitHub + Vercel)
1. GitHub에 새 저장소를 만들고 이 프로젝트를 push 합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Imagination diary"
   git branch -M main
   git remote add origin <github-repo-url>
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com)에서 New Project → 방금 만든 GitHub 저장소 Import.
3. Environment Variables에 `GEMINI_API_KEY` 등록.
4. Deploy 클릭 → 배포 완료 후 발급된 URL을 이 README의 **배포 URL** 항목에 업데이트.
5. 배포 URL에서 네비게이션 / 반응형 / AI 일러스트 생성까지 전체 기능을 직접 확인합니다.
6. 수정 사항이 있으면 다시 커밋 → push 하면 Vercel이 자동으로 재배포합니다.

## AI 기능 실패 처리
- **빈 입력**: 일기 작성 페이지에서 제목/날짜/내용 중 하나라도 비어 있으면 인라인 오류 메시지를 보여주고 제출을 막습니다.
- **API 오류 (4xx/5xx)**: `/api/generate-illustration`이 실패 응답을 주면 상태 코드와 함께 한국어 안내 배너를 표시합니다.
- **지연/타임아웃**: 요청이 30초를 넘기면 자동으로 취소하고 재시도를 안내합니다.

## 반응형 확인
`css/style.css`는 데스크톱(4열 그리드) → 태블릿(2열) → 모바일(1열, 세로 스택 갤러리)까지
최소 3가지 폭 기준으로 미디어 쿼리를 적용했습니다. 브라우저 개발자 도구의 기기 툴바로
`390px`(모바일), `768px`(태블릿), `1280px`(데스크톱) 폭에서 레이아웃을 확인해주세요.

## 보안 참고
- API 키는 반드시 환경 변수로만 관리하며, 클라이언트(JS)에서는 절대 직접 호출하지 않고
  서버리스 함수(`api/generate-illustration.py`)를 통해서만 Gemini API를 호출합니다.
- 키 유출이 의심되면 Google AI Studio에서 즉시 키를 폐기/재발급하고, 유출된 커밋이 있다면
  `git filter-repo` 등으로 히스토리를 정리한 뒤 강제 push 하세요.





# 서비스 기획서 — Imagination

## 1. 서비스 소개
**Imagination**은 오늘 하루를 짧은 글로 남기면, 그 내용과 원하는 화풍(카툰·반실사·수채화·애니메이션·3D)을 바탕으로
AI가 어울리는 일러스트를 그려주는 그림일기 웹 서비스입니다. 글로만 남기던 일기를, 나만의 그림이 함께 있는
기록으로 바꾸는 것이 핵심 가치입니다.

## 2. 타깃 사용자
- 매일 짧게라도 기록을 남기고 싶지만 글쓰기만으로는 동기부여가 부족한 사람
- 다이어리를 꾸미는 걸 좋아하지만 그림 실력에는 자신이 없는 사람
- 감정과 하루를 시각적으로 아카이빙하고 싶은 사람

## 3. 핵심 기능
| 기능 | 설명 |
|---|---|
| 기본 페이지 | 지금까지 생성된 일러스트 중 3장을 랜덤으로 보여주는 갤러리형 랜딩 페이지 |
| Diary 목록 | 작성한 일기를 날짜순 카드 형태(날짜/제목/일러스트)로 모아보기 |
| 일기 작성 | 제목·날짜·본문을 입력하는 글쓰기 화면 |
| 스타일 설문 | 카툰/반실사/수채화/애니메이션/3D 중 1~5개 선택 |
| AI 일러스트 생성 | 선택한 스타일과 일기 본문을 조합해 Gemini API로 이미지 생성 |
| 일기 상세보기 | 개별 카드를 클릭하면 제목/날짜/본문/일러스트 전체를 확인 |

## 4. 사용자 흐름
```
기본 페이지 → Diary 페이지 → [오늘의 일기쓰기] → 일기 작성 → [일기 작성 완료]
→ 스타일 설문(1~5개 선택) → [일러스트 생성하기] → AI 일러스트 생성
→ Diary 페이지에 새 카드로 반영 (기본 페이지 갤러리에도 랜덤 노출)
```

## 5. 기술 스택
- **프론트엔드**: 순수 HTML / CSS / JavaScript (프레임워크 미사용)
- **백엔드**: Vercel Serverless Functions (Python)
- **AI**: Google Gemini API (`gemini-2.5-flash-image`, 이미지 생성)
- **데이터 저장**: MVP 단계에서는 브라우저 `localStorage`에 일기·일러스트를 저장 (추후 실제 DB로 교체 가능한 구조)
- **배포**: GitHub + Vercel 연동 배포

## 6. 실패 처리 (AI 기능 UX 최소 기준)
- 빈 입력: 일기 작성 페이지·설문 페이지에서 필수값 미입력 시 인라인 오류 메시지 표시
- API 오류(4xx/5xx): 서버 응답 코드와 한국어 안내 문구를 배너로 표시
- 지연/타임아웃: 30초 이상 응답이 없으면 요청을 취소하고 재시도 안내 표시

## 7. 향후 확장
- 사용자 계정 및 실제 데이터베이스 연동
- 일기 수정/삭제 기능
- 월간 캘린더 뷰, 감정 태그, 통계
