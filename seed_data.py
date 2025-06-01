#!/usr/bin/env python3
"""
샘플 데이터 생성 스크립트
블로그 애플리케이션에 테스트용 데이터를 추가합니다.
"""

import asyncio
import requests
import json
from datetime import datetime

# API 설정
API_BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

class BlogDataSeeder:
    def __init__(self):
        self.token = None
        self.headers = {"Content-Type": "application/json"}
        
    def login(self):
        """관리자 로그인하여 토큰 획득"""
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json=ADMIN_CREDENTIALS,
            headers=self.headers
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data["access_token"]
            self.headers["Authorization"] = f"Bearer {self.token}"
            print("✅ 관리자 로그인 성공")
            return True
        else:
            print(f"❌ 로그인 실패: {response.text}")
            return False
    
    def create_categories(self):
        """카테고리 생성"""
        categories = [
            {"name": "기술", "description": "프로그래밍 및 개발 관련 포스트"},
            {"name": "일상", "description": "일상생활과 개인적인 이야기"},
            {"name": "리뷰", "description": "제품, 서비스, 책 리뷰"},
            {"name": "튜토리얼", "description": "단계별 가이드 및 튜토리얼"},
            {"name": "뉴스", "description": "기술 뉴스 및 업계 동향"}
        ]
        
        created_categories = {}
        
        for category in categories:
            response = requests.post(
                f"{API_BASE_URL}/categories/",
                json=category,
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                created_categories[category["name"]] = data["id"]
                print(f"✅ 카테고리 생성: {category['name']}")
            else:
                print(f"❌ 카테고리 생성 실패: {category['name']} - {response.text}")
        
        return created_categories
    
    def create_tags(self):
        """태그 생성"""
        tags = [
            "React", "Python", "JavaScript", "TypeScript", "FastAPI",
            "MongoDB", "Node.js", "CSS", "HTML", "웹개발",
            "프론트엔드", "백엔드", "풀스택", "데이터베이스", "API"
        ]
        
        created_tags = []
        
        for tag in tags:
            response = requests.post(
                f"{API_BASE_URL}/tags/",
                json={"name": tag},
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                created_tags.append(tag)
                print(f"✅ 태그 생성: {tag}")
            else:
                print(f"❌ 태그 생성 실패: {tag} - {response.text}")
        
        return created_tags
    
    def create_posts(self, categories, tags):
        """샘플 포스트 생성"""
        posts = [
            {
                "title": "React 18의 새로운 기능들",
                "content": """# React 18의 새로운 기능들

React 18이 출시되면서 많은 새로운 기능들이 추가되었습니다. 이번 포스트에서는 주요 변경사항들을 살펴보겠습니다.

## Automatic Batching

React 18에서는 자동 배칭이 개선되어 더 나은 성능을 제공합니다.

```javascript
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 18에서는 이 두 setState가 자동으로 배치됩니다
}
```

## Suspense 개선

Suspense 컴포넌트가 더욱 강력해졌습니다.

## Concurrent Features

새로운 concurrent 기능들로 더 부드러운 사용자 경험을 제공할 수 있습니다.

이러한 새로운 기능들을 통해 더 나은 React 애플리케이션을 구축할 수 있습니다.""",
                "summary": "React 18의 주요 새로운 기능들과 개선사항을 살펴봅니다.",
                "category": "기술",
                "tags": ["React", "JavaScript", "프론트엔드"],
                "published": True
            },
            {
                "title": "FastAPI로 REST API 구축하기",
                "content": """# FastAPI로 REST API 구축하기

FastAPI는 Python으로 빠르고 현대적인 웹 API를 구축할 수 있는 프레임워크입니다.

## 특징

- **빠른 성능**: Starlette과 Pydantic 기반
- **자동 문서화**: OpenAPI 및 JSON Schema 자동 생성
- **타입 힌트 지원**: Python 3.6+ 타입 힌트 완전 지원

## 기본 예제

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

## 설치

```bash
pip install fastapi uvicorn
```

FastAPI를 사용하면 빠르고 안정적인 API를 쉽게 구축할 수 있습니다.""",
                "summary": "FastAPI 프레임워크를 사용하여 Python REST API를 구축하는 방법을 설명합니다.",
                "category": "튜토리얼",
                "tags": ["Python", "FastAPI", "API", "백엔드"],
                "published": True
            },
            {
                "title": "MongoDB 기초 가이드",
                "content": """# MongoDB 기초 가이드

MongoDB는 NoSQL 문서 지향 데이터베이스입니다. JSON과 유사한 BSON 형태로 데이터를 저장합니다.

## 주요 특징

- **문서 기반**: JSON-like 문서로 데이터 저장
- **스키마 유연성**: 동적 스키마 지원
- **확장성**: 수평적 확장 지원
- **인덱싱**: 다양한 인덱스 타입 지원

## 기본 명령어

### 데이터베이스 선택
```javascript
use mydb
```

### 문서 삽입
```javascript
db.users.insertOne({
  name: "김철수",
  age: 30,
  email: "kim@example.com"
})
```

### 문서 조회
```javascript
db.users.find({ age: { $gte: 18 } })
```

### 문서 업데이트
```javascript
db.users.updateOne(
  { name: "김철수" },
  { $set: { age: 31 } }
)
```

MongoDB는 현대적인 애플리케이션 개발에 매우 유용한 데이터베이스입니다.""",
                "summary": "MongoDB NoSQL 데이터베이스의 기초 개념과 기본 사용법을 학습합니다.",
                "category": "튜토리얼",
                "tags": ["MongoDB", "데이터베이스", "NoSQL"],
                "published": True
            },
            {
                "title": "풀스택 개발자가 되는 방법",
                "content": """# 풀스택 개발자가 되는 방법

풀스택 개발자는 프론트엔드와 백엔드 모두를 다룰 수 있는 개발자입니다.

## 필요한 기술 스택

### 프론트엔드
- **HTML/CSS**: 웹의 기초
- **JavaScript**: 동적 웹페이지 구현
- **React/Vue/Angular**: 모던 프런트엔드 프레임워크
- **반응형 디자인**: 모바일 친화적 웹사이트

### 백엔드
- **서버 언어**: Python, JavaScript (Node.js), Java, C# 등
- **데이터베이스**: SQL (MySQL, PostgreSQL), NoSQL (MongoDB)
- **API 설계**: RESTful API, GraphQL
- **서버 관리**: Linux, Docker, 클라우드 서비스

### 개발 도구
- **버전 관리**: Git, GitHub
- **개발 환경**: VS Code, IDE
- **테스팅**: 단위 테스트, 통합 테스트
- **배포**: CI/CD, AWS, Heroku

## 학습 경로

1. **기초 다지기**: HTML, CSS, JavaScript
2. **프론트엔드 심화**: React 또는 다른 프레임워크
3. **백엔드 입문**: Node.js 또는 Python
4. **데이터베이스**: SQL과 NoSQL 기초
5. **프로젝트 실습**: 토이 프로젝트부터 시작
6. **배포와 운영**: 실제 서비스 경험

꾸준한 학습과 실습이 풀스택 개발자가 되는 지름길입니다.""",
                "summary": "풀스택 개발자가 되기 위해 필요한 기술 스택과 학습 방법을 안내합니다.",
                "category": "기술",
                "tags": ["풀스택", "웹개발", "프론트엔드", "백엔드"],
                "published": True
            },
            {
                "title": "개발자를 위한 생산성 도구 추천",
                "content": """# 개발자를 위한 생산성 도구 추천

개발 효율성을 높여주는 유용한 도구들을 소개합니다.

## 코드 에디터 & IDE

### Visual Studio Code
- **무료**: Microsoft에서 제공하는 무료 에디터
- **확장성**: 풍부한 확장 프로그램
- **통합 터미널**: 내장 터미널 지원
- **Git 통합**: 버전 관리 기능 내장

### JetBrains IDE
- **IntelliJ IDEA**: Java 개발
- **PyCharm**: Python 개발
- **WebStorm**: JavaScript/TypeScript 개발

## 터미널 도구

### Oh My Zsh
```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### iTerm2 (macOS)
- 탭 지원
- 분할 화면
- 검색 기능

## 버전 관리

### Git + GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <repository-url>
git push -u origin main
```

## API 테스트

### Postman
- REST API 테스트
- 컬렉션 관리
- 환경 변수 지원

### Thunder Client (VS Code 확장)
- VS Code 내장 API 클라이언트
- 가벼운 대안

## 데이터베이스 관리

### MongoDB Compass
- MongoDB GUI 도구
- 쿼리 작성 도구
- 성능 모니터링

### DBeaver
- 범용 데이터베이스 도구
- SQL과 NoSQL 지원

이러한 도구들을 활용하면 개발 생산성을 크게 향상시킬 수 있습니다.""",
                "summary": "개발 생산성을 높여주는 다양한 도구들과 사용법을 소개합니다.",
                "category": "리뷰",
                "tags": ["생산성", "도구", "개발환경"],
                "published": True
            }
        ]
        
        for post in posts:
            category_id = categories.get(post["category"])
            if not category_id:
                print(f"❌ 카테고리를 찾을 수 없음: {post['category']}")
                continue
                
            post_data = {
                "title": post["title"],
                "content": post["content"],
                "summary": post["summary"],
                "category_id": category_id,
                "tags": post["tags"],
                "published": post["published"]
            }
            
            response = requests.post(
                f"{API_BASE_URL}/posts/",
                json=post_data,
                headers=self.headers
            )
            
            if response.status_code == 200:
                print(f"✅ 포스트 생성: {post['title']}")
            else:
                print(f"❌ 포스트 생성 실패: {post['title']} - {response.text}")
    
    def seed_data(self):
        """전체 샘플 데이터 생성"""
        print("🌱 샘플 데이터 생성을 시작합니다...")
        
        if not self.login():
            return False
        
        print("\n📁 카테고리 생성 중...")
        categories = self.create_categories()
        
        print("\n🏷️ 태그 생성 중...")
        tags = self.create_tags()
        
        print("\n📝 포스트 생성 중...")
        self.create_posts(categories, tags)
        
        print("\n✅ 샘플 데이터 생성 완료!")
        print(f"🌐 블로그 확인: http://localhost:3000")
        print(f"⚙️ 관리자 페이지: http://localhost:3000/admin")
        
        return True

if __name__ == "__main__":
    seeder = BlogDataSeeder()
    
    try:
        seeder.seed_data()
    except requests.exceptions.ConnectionError:
        print("❌ 백엔드 서버에 연결할 수 없습니다.")
        print("   백엔드 서버가 실행 중인지 확인해주세요: http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
