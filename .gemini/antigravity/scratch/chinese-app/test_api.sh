#!/bin/bash
# Test script for session persistence and sentence analysis endpoints

BASE_URL="http://127.0.0.1:8000"

echo "=========================================="
echo "API Test Suite - Session Persistence"
echo "=========================================="
echo "Testing: $BASE_URL"
echo ""

# Test 1: Save flashcard progress
echo "=== Test 1: Save Flashcard Progress ==="
curl -X POST "$BASE_URL/api/progress/flashcard/save" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' | python -m json.tool
echo ""

# Test 2: Get flashcard progress
echo "=== Test 2: Get Flashcard Progress ==="
curl -X GET "$BASE_URL/api/progress/flashcard/test_sess_001" | python -m json.tool
echo ""

# Test 3: Analyze sentence
echo "=== Test 3: Analyze Sentence ==="
curl -X POST "$BASE_URL/ai/analyze-sentence" \
  -H "Content-Type: application/json" \
  -d '{
    "sentence": "我喜欢学习中文。",
    "keyword": "学习"
  }' | python -m json.tool
echo ""

# Test 4: Generate examples
echo "=== Test 4: Generate Examples ==="
curl -X POST "$BASE_URL/ai/generate-example" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "学习",
    "word_type": "动"
  }' | python -m json.tool
echo ""

# Test 5: Get statistics
echo "=== Test 5: Get Statistics ==="
curl -X GET "$BASE_URL/api/progress/statistics" | python -m json.tool
echo ""

# Test 6: Get timeline
echo "=== Test 6: Get Timeline ==="
curl -X GET "$BASE_URL/api/progress/timeline" | python -m json.tool
echo ""

echo "=========================================="
echo "Tests completed!"
echo "=========================================="
