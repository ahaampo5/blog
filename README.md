# Full-Stack AI Engineer Blog

풀스택 블로그 애플리케이션입니다. React (TypeScript) 프론트엔드와 FastAPI 백엔드로 구성되어 있습니다.

## 🚀 기능

### Public 기능
- 📖 블로그 포스트 목록 및 상세 조회
- 🏷️ 카테고리별, 태그별 포스트 필터링
- 📱 반응형 디자인 (Tailwind CSS)
- 🔍 포스트 검색 기능
- 📄 마크다운 지원

### Admin 기능
- 🔐 JWT 기반 인증 시스템
- ✍️ 포스트 생성, 수정, 삭제 (CRUD)
- 📁 카테고리 관리
- 🏷️ 태그 관리
- 🖼️ 이미지 업로드
- 📊 관리자 대시보드

## 🛠️ 기술 스택

### Frontend
- **React 18** with TypeScript
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **React Context** - 상태 관리

### Backend
- **FastAPI** - 웹 프레임워크
- **MongoDB** - 데이터베이스
- **Motor** - 비동기 MongoDB 드라이버
- **JWT** - 인증
- **BCrypt** - 패스워드 해싱
- **Pydantic** - 데이터 검증

## 📦 설치 및 실행

### 전제 조건
- Node.js 18+ 
- Python 3.9+
- MongoDB (또는 Docker)

### 1. 저장소 클론
```bash
git clone <repository-url>
cd blog
```

### 2. 백엔드 설정
```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 설정값 입력
```

### 3. MongoDB 설정
```bash
# Option 1: Docker 사용
docker-compose up -d

# Option 2: 로컬 설치 (macOS)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### 4. 백엔드 실행
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 5. 프론트엔드 설정 및 실행
```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 API URL 설정

# 개발 서버 실행
npm run dev
```

## 🌐 접속 정보

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://127.0.0.1:8000
- **API 문서**: http://127.0.0.1:8000/docs
- **관리자 로그인**: http://localhost:3000/admin/login

### 기본 관리자 계정
- **사용자명**: admin
- **비밀번호**: admin123

## 📁 프로젝트 구조

```
blog/
├── backend/                 # FastAPI 백엔드
│   ├── api/v1/routers/     # API 라우터
│   ├── core/               # 핵심 설정 및 의존성
│   ├── models/             # 데이터 모델
│   ├── schemas/            # Pydantic 스키마
│   └── uploads/            # 업로드된 파일
├── frontend/               # React 프론트엔드
│   ├── src/components/     # React 컴포넌트
│   ├── src/pages/          # 페이지 컴포넌트
│   ├── src/services/       # API 서비스
│   └── src/types/          # TypeScript 타입
└── docker-compose.yml      # Docker 설정
```

## 🔧 개발 가이드

### API 엔드포인트

#### 공개 API
- `GET /api/v1/posts/` - 포스트 목록
- `GET /api/v1/posts/{id}` - 포스트 상세
- `GET /api/v1/categories/` - 카테고리 목록
- `GET /api/v1/tags/` - 태그 목록

#### 관리자 API (인증 필요)
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/posts/` - 포스트 생성
- `PUT /api/v1/posts/{id}` - 포스트 수정
- `DELETE /api/v1/posts/{id}` - 포스트 삭제
- `POST /api/v1/upload/image` - 이미지 업로드

### 환경 변수

#### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=blog_db
SECRET_KEY=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ALLOWED_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

## 🚀 배포

### Docker를 사용한 배포
```bash
docker-compose up -d
```

### 프로덕션 환경 설정
1. 환경 변수에서 보안 키와 패스워드 변경
2. CORS 설정 업데이트
3. MongoDB 인증 설정
4. HTTPS 설정

## 📄 라이선스

MIT

## 📧 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해 주세요.
