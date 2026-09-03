## :one:. 서비스 소개
작성한 일기와 선택한 화풍을 바탕으로 제작된 일러스트를 통해
<br>그 날 하루를 하나의 그림으로 기억할 수 있게 해주는 웹 서비스</br>

## :two:. 기술 스택
| 영역 | 기술 |
|---|---|
| 프론트엔드 | HTML / CSS / Vanilla JavaScript (프레임워크 미사용) |
| 백엔드 | Vercel Serverless Functions (Python) |
| AI | Google Gemini API — `gemini-2.5-flash-image` (이미지 생성) |
| 데이터 저장 | 브라우저 `localStorage` (MVP) |
| 배포 | GitHub + Vercel |

## :three:. 실행방법
배포 URL _ https://imagination-diary-rtur2b23i-love2957love-5212.vercel.app/

### :three:-:one:. 프로젝트 파일 저장
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

### :three:-:two:. 깃허브에 푸시
- GitHub에 새 저장소를 만들고 이 프로젝트를 push 합니다
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Imagination diary"
   git branch -M main
   git remote add origin <github-repo-url>
   git push -u origin main
   ```

### :three:-:three:. API 포함 전체 실행 (Vercel CLI)
```bash
npm install -g vercel
cd imagination-diary
vercel dev
```

### :three:-:four:. Vercel 확인 및 API 등록 후 실
1. Vercel에 로그인하여 깃허브 계정과 연결한 후 프로젝트 열림 확인
2. Environment Variables에 `GEMINI_API_KEY` 등록
3. Deploy 클릭 → 배포 완료 후 발급된 URL을 이 README의 배포 URL 항목에 업데이트
4. 배포 URL에서 네비게이션 / 반응형 / AI 일러스트 생성까지 전체 기능을 직접 확인합니다
5. 수정 사항이 있으면 다시 커밋 후 push 하면 Vercel이 자동으로 재배포합니다
