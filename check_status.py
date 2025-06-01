#!/usr/bin/env python3
"""
블로그 애플리케이션 상태 확인 스크립트
프론트엔드, 백엔드, 데이터베이스 상태를 확인합니다.
"""

import requests
import json
from datetime import datetime

def check_backend():
    """백엔드 서버 상태 확인"""
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ 백엔드 서버: 정상 작동")
            return True
        else:
            print(f"❌ 백엔드 서버: 응답 오류 ({response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 백엔드 서버: 연결 실패")
        return False
    except Exception as e:
        print(f"❌ 백엔드 서버: 오류 - {e}")
        return False

def check_frontend():
    """프론트엔드 서버 상태 확인"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ 프론트엔드 서버: 정상 작동")
            return True
        else:
            print(f"❌ 프론트엔드 서버: 응답 오류 ({response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 프론트엔드 서버: 연결 실패")
        return False
    except Exception as e:
        print(f"❌ 프론트엔드 서버: 오류 - {e}")
        return False

def check_api():
    """API 엔드포인트 확인"""
    try:
        # 포스트 목록 확인
        response = requests.get("http://127.0.0.1:8000/api/v1/posts/", timeout=5)
        if response.status_code == 200:
            posts = response.json()
            print(f"✅ API 엔드포인트: 정상 작동 (포스트 {len(posts)}개)")
            
            # 카테고리 확인
            response = requests.get("http://127.0.0.1:8000/api/v1/categories/", timeout=5)
            if response.status_code == 200:
                categories = response.json()
                print(f"✅ 카테고리: {len(categories)}개 등록됨")
            
            # 태그 확인
            response = requests.get("http://127.0.0.1:8000/api/v1/tags/", timeout=5)
            if response.status_code == 200:
                tags = response.json()
                print(f"✅ 태그: {len(tags)}개 등록됨")
            
            return True
        else:
            print(f"❌ API 엔드포인트: 응답 오류 ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API 엔드포인트: 오류 - {e}")
        return False

def check_auth():
    """인증 시스템 확인"""
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/v1/auth/login",
            json={"username": "admin", "password": "admin123"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print("✅ 인증 시스템: 정상 작동")
                return True
        print("❌ 인증 시스템: 토큰 생성 실패")
        return False
    except Exception as e:
        print(f"❌ 인증 시스템: 오류 - {e}")
        return False

def main():
    print("🔍 블로그 애플리케이션 상태 확인")
    print("=" * 50)
    print(f"📅 검사 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 각 구성 요소 상태 확인
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    api_ok = check_api()
    auth_ok = check_auth()
    
    print()
    print("📊 전체 상태 요약")
    print("=" * 50)
    
    if all([backend_ok, frontend_ok, api_ok, auth_ok]):
        print("🎉 모든 시스템이 정상적으로 작동하고 있습니다!")
        print()
        print("🌐 접속 정보:")
        print("   - 블로그 홈페이지: http://localhost:3000")
        print("   - 관리자 페이지: http://localhost:3000/admin/login")
        print("   - API 문서: http://127.0.0.1:8000/docs")
        print("   - 기본 관리자 계정: admin / admin123")
    else:
        print("⚠️ 일부 시스템에 문제가 있습니다.")
        print()
        print("🔧 문제 해결 가이드:")
        if not backend_ok:
            print("   - 백엔드: uvicorn main:app --reload --host 127.0.0.1 --port 8000")
        if not frontend_ok:
            print("   - 프론트엔드: npm run dev")
        if not api_ok:
            print("   - MongoDB가 실행 중인지 확인하세요")
        if not auth_ok:
            print("   - 환경 변수 설정을 확인하세요")

if __name__ == "__main__":
    main()
