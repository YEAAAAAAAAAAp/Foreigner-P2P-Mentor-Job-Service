#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

# JavaScript 파일의 깨진 한국어 텍스트를 올바른 텍스트로 변경하는 매핑
korean_fixes_js = {
    # 에러 메시지와 알림
    '감사?�니?? 24?�간 ?�에 ?�메?�로 ?�락?�리겠습?�다.': '감사합니다! 24시간 내에 이메일로 연락드리겠습니다.',
    
    # 주석
    '?�공 모달 ?�시': '성공 모달 표시',
    '?�공 메시지 ?�시': '성공 메시지 표시',
    '?�효??검??': '유효성 검증',
    
    # 이미 수정된 것들 확인
    # 이미 정상적으로 수정된 텍스트들은 그대로 유지
}

def fix_korean_in_js(file_path):
    """JavaScript 파일의 깨진 한국어를 수정합니다."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 각 매핑에 대해 치환 수행
        for broken, fixed in korean_fixes_js.items():
            content = content.replace(broken, fixed)
        
        # 변경사항이 있는 경우에만 파일 저장
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ JavaScript 한국어 텍스트가 수정되었습니다: {file_path}")
            return True
        else:
            print(f"ℹ️  JavaScript 파일에 수정할 내용이 없습니다: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return False

if __name__ == "__main__":
    # JavaScript 파일 수정
    success = fix_korean_in_js("script.js")
    
    if success:
        print("\n🎉 JavaScript 한국어 텍스트 수정이 완료되었습니다!")
    else:
        print("\n✅ JavaScript 파일은 이미 모든 한국어가 정상적으로 처리되어 있습니다.")