#!/usr/bin/env python3
"""
Test script for session persistence and sentence analysis endpoints
Run: python test_api.py
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_flashcard_save():
    """Test saving flashcard progress"""
    print("\n=== Testing Flashcard Save ===")
    
    payload = {
        "session_id": "test_sess_001",
        "chapter_id": "ch_1",
        "current_card_index": 5,
        "cards_studied": [0, 1, 2, 3, 4, 5],
        "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
        "study_time_per_card": [30, 25, 45, 10, 35, 40],
        "sm2_data": {
            "0": {"interval": 1, "ease_factor": 2.5, "next_review_date": "2024-01-16"},
            "1": {"interval": 3, "ease_factor": 2.6, "next_review_date": "2024-01-18"}
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/progress/flashcard/save", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Flashcard save successful")
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Current card: {result.get('current_card_index')}")
            return True
        else:
            print(f"❌ Flashcard save failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_flashcard_get():
    """Test retrieving flashcard progress"""
    print("\n=== Testing Flashcard Get ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/progress/flashcard/test_sess_001")
        result = response.json()
        
        if result.get("status") == "success":
            data = result.get("data", {})
            print("✅ Flashcard get successful")
            print(f"   Session ID: {data.get('session_id')}")
            print(f"   Chapter ID: {data.get('chapter_id')}")
            print(f"   Current card: {data.get('current_card_index')}")
            print(f"   Cards studied: {len(data.get('cards_studied', []))} cards")
            print(f"   Completion: {data.get('completion_percentage')}%")
            return True
        else:
            print(f"❌ Flashcard get failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_dictation_save():
    """Test saving dictation progress"""
    print("\n=== Testing Dictation Save ===")
    
    payload = {
        "session_id": "test_dict_001",
        "chapter_id": "ch_1",
        "youtube_url": "https://youtube.com/watch?v=test",
        "current_sentence_index": 3,
        "current_timestamp": 125.5,
        "sentences_completed": [0, 1, 2, 3],
        "user_answers": ["Tôi là học sinh", "Bạn tên gì", "Anh ơi", "Xin chào"],
        "accuracy_scores": [0.95, 0.88, 0.92, 0.85]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/progress/dictation/save", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Dictation save successful")
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Current sentence: {result.get('current_sentence_index')}")
            return True
        else:
            print(f"❌ Dictation save failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_dictation_get():
    """Test retrieving dictation progress"""
    print("\n=== Testing Dictation Get ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/progress/dictation/test_dict_001")
        result = response.json()
        
        if result.get("status") == "success":
            data = result.get("data", {})
            print("✅ Dictation get successful")
            print(f"   Session ID: {data.get('session_id')}")
            print(f"   Current sentence: {data.get('current_sentence_index')}")
            print(f"   Timestamp: {data.get('current_timestamp')}")
            print(f"   Completion: {data.get('completion_percentage')}%")
            return True
        else:
            print(f"❌ Dictation get failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_exercise_save():
    """Test saving exercise progress"""
    print("\n=== Testing Exercise Save ===")
    
    payload = {
        "session_id": "test_ex_001",
        "exercise_id": "ex_1",
        "chapter_id": "ch_1",
        "current_question_index": 3,
        "questions_answered": [0, 1, 2, 3],
        "user_answers": ["A", "B", "C", "D"],
        "correct_answers": ["A", "B", "C", "D"],
        "accuracy_scores": [1.0, 1.0, 0.5, 1.0],
        "time_per_question": [30, 25, 45, 35]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/progress/exercise/save", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Exercise save successful")
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Current question: {result.get('current_question_index')}")
            return True
        else:
            print(f"❌ Exercise save failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_reading_save():
    """Test saving reading progress"""
    print("\n=== Testing Reading Save ===")
    
    payload = {
        "session_id": "test_read_001",
        "chapter_id": "ch_1",
        "current_paragraph_index": 5,
        "current_scroll_position": 250,
        "paragraphs_read": [0, 1, 2, 3, 4, 5],
        "vocabulary_lookups": [
            {"vocab_id": "v_1", "timestamp": "2024-01-15T10:00:00Z"},
            {"vocab_id": "v_2", "timestamp": "2024-01-15T10:05:00Z"}
        ],
        "notes": "Test notes"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/progress/reading/save", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Reading save successful")
            print(f"   Session ID: {result.get('session_id')}")
            print(f"   Current paragraph: {result.get('current_paragraph_index')}")
            return True
        else:
            print(f"❌ Reading save failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_analyze_sentence():
    """Test sentence analysis"""
    print("\n=== Testing Sentence Analysis ===")
    
    payload = {
        "sentence": "我喜欢学习中文。",
        "keyword": "学习"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ai/analyze-sentence", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Sentence analysis successful")
            print(f"   Sentence: {result.get('sentence')}")
            print(f"   Keyword: {result.get('keyword')}")
            analysis = result.get("analysis", {})
            print(f"   Has keyword: {analysis.get('has_keyword')}")
            print(f"   Structure: {analysis.get('structure')}")
            print(f"   Chinese chars: {analysis.get('chinese_chars')}")
            if result.get('vietnamese'):
                print(f"   Vietnamese: {result.get('vietnamese')}")
            return True
        else:
            print(f"❌ Sentence analysis failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_example():
    """Test example generation"""
    print("\n=== Testing Example Generation ===")
    
    payload = {
        "keyword": "学习",
        "word_type": "动"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ai/generate-example", json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print("✅ Example generation successful")
            print(f"   Keyword: {result.get('keyword')}")
            print(f"   Word type: {result.get('word_type')}")
            examples = result.get("examples", [])
            print(f"   Generated {len(examples)} examples:")
            for i, ex in enumerate(examples[:3], 1):
                print(f"     {i}. {ex.get('chinese')}")
                if ex.get('vietnamese'):
                    print(f"        → {ex.get('vietnamese')}")
            return True
        else:
            print(f"❌ Example generation failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_statistics():
    """Test statistics endpoints"""
    print("\n=== Testing Statistics ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/progress/statistics")
        result = response.json()
        
        if result.get("status") == "success":
            data = result.get("data", {})
            print("✅ Statistics retrieved successfully")
            print(f"   Total study time: {data.get('total_study_time')} seconds")
            print(f"   Sessions completed: {data.get('sessions_completed')}")
            print(f"   Average accuracy: {data.get('average_accuracy')}")
            return True
        else:
            print(f"❌ Statistics failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_timeline():
    """Test timeline endpoint"""
    print("\n=== Testing Timeline ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/progress/timeline")
        result = response.json()
        
        if result.get("status") == "success":
            data = result.get("data", [])
            print("✅ Timeline retrieved successfully")
            print(f"   Total sessions: {len(data)}")
            if data:
                print(f"   Latest session: {data[0].get('activity_type')} - {data[0].get('status')}")
            return True
        else:
            print(f"❌ Timeline failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("API Test Suite - Session Persistence & Sentence Analysis")
    print("=" * 60)
    print(f"Testing: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Test flashcard endpoints
    results.append(("Flashcard Save", test_flashcard_save()))
    time.sleep(0.5)
    results.append(("Flashcard Get", test_flashcard_get()))
    
    # Test dictation endpoints
    results.append(("Dictation Save", test_dictation_save()))
    time.sleep(0.5)
    results.append(("Dictation Get", test_dictation_get()))
    
    # Test exercise endpoints
    results.append(("Exercise Save", test_exercise_save()))
    
    # Test reading endpoints
    results.append(("Reading Save", test_reading_save()))
    
    # Test analysis endpoints
    results.append(("Sentence Analysis", test_analyze_sentence()))
    results.append(("Example Generation", test_generate_example()))
    
    # Test statistics endpoints
    results.append(("Statistics", test_statistics()))
    results.append(("Timeline", test_timeline()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("=" * 60)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print(f"⚠️  {total - passed} test(s) failed")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
