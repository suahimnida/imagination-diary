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
