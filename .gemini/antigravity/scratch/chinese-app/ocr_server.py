import io
import uvicorn
import sqlite3
import json
import os
import hashlib
import uuid
import requests
import re
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
# RapidOCR is lazy-loaded to avoid OOM on startup (Railway free tier has 512MB RAM)
_ocr_engine = None

def get_ocr_engine():
    """Lazy-load OCR engine to avoid OOM crash on startup."""
    global _ocr_engine
    if _ocr_engine is None:
        from rapidocr_onnxruntime import RapidOCR
        print("Initializing RapidOCR engine...")
        _ocr_engine = RapidOCR()
        print("RapidOCR engine ready.")
    return _ocr_engine

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialize Database
DB_FILE = "app_data.db"
PDF_CACHE_DIR = "pdf_cache"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS storage (key TEXT PRIMARY KEY, value TEXT)")
    c.execute("""CREATE TABLE IF NOT EXISTS pdf_cache (
        file_id TEXT PRIMARY KEY,
        file_name TEXT,
        file_hash TEXT UNIQUE,
        file_path TEXT,
        file_size INTEGER,
        upload_date TIMESTAMP,
        last_accessed TIMESTAMP
    )""")
    
    # Progress tracking tables
    c.execute("""CREATE TABLE IF NOT EXISTS progress_sessions (
        id TEXT PRIMARY KEY,
        activity_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        status TEXT DEFAULT 'in_progress',
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS flashcard_progress (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        current_card_index INTEGER DEFAULT 0,
        cards_studied TEXT,
        card_responses TEXT,
        study_time_per_card TEXT,
        sm2_data TEXT,
        completion_percentage INTEGER DEFAULT 0,
        accuracy_rate REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS dictation_progress (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        youtube_url TEXT,
        current_sentence_index INTEGER DEFAULT 0,
        current_timestamp REAL DEFAULT 0,
        sentences_completed TEXT,
        user_answers TEXT,
        accuracy_scores TEXT,
        completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS exercise_progress (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        current_question_index INTEGER DEFAULT 0,
        questions_answered TEXT,
        user_answers TEXT,
        correct_answers TEXT,
        accuracy_scores TEXT,
        time_per_question TEXT,
        completion_percentage INTEGER DEFAULT 0,
        overall_accuracy_rate REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE
    )""")
    
    c.execute("""CREATE TABLE IF NOT EXISTS reading_progress (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        current_paragraph_index INTEGER DEFAULT 0,
        current_scroll_position INTEGER DEFAULT 0,
        paragraphs_read TEXT,
        vocabulary_lookups TEXT,
        notes TEXT,
        completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES progress_sessions(id) ON DELETE CASCADE
    )""")
    
    # Create indexes for performance
    c.execute("CREATE INDEX IF NOT EXISTS idx_progress_activity ON progress_sessions(activity_type, resource_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_progress_status ON progress_sessions(status)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_flashcard_session ON flashcard_progress(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_dictation_session ON dictation_progress(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_exercise_session ON exercise_progress(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_reading_session ON reading_progress(session_id)")
    
    conn.commit()
    conn.close()

init_db()

# Create PDF cache directory
if not os.path.exists(PDF_CACHE_DIR):
    os.makedirs(PDF_CACHE_DIR)

# Serve app static files
APP_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=APP_DIR), name="static")

@app.get("/")
async def root():
    return FileResponse(os.path.join(APP_DIR, "index.html"))

print("=" * 50)
print("Backend Server Ready! (OCR engine loads on first use)")
print("> Mo ung dung tai: http://127.0.0.1:8000")
print("=" * 50)

@app.post("/ocr")
async def process_ocr(file: UploadFile = File(...)):
    try:
        engine = get_ocr_engine()
    except Exception as e:
        return {"status": "error", "text": "", "message": f"OCR engine unavailable: {str(e)}"}
    contents = await file.read()
    result, elapse = engine(contents)
    if not result: return {"text": ""}
    # Extract text from OCR results
    # result is a list of [bbox, text, confidence] tuples
    texts = [line[1] for line in result if line and len(line) > 1]
    # Join with newlines to preserve line structure
    full_text = "\n".join(texts)
    return {
        "text": full_text,
        "line_count": len(texts),
        "total_chars": len(full_text)
    }

@app.post("/pdf/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload PDF and cache it for future use"""
    contents = await file.read()
    
    # Calculate file hash
    file_hash = hashlib.md5(contents).hexdigest()
    
    # Check if file already cached
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT file_id, file_path FROM pdf_cache WHERE file_hash = ?", (file_hash,))
    existing = c.fetchone()
    
    if existing:
        # File already cached, just update last_accessed
        file_id, file_path = existing
        c.execute("UPDATE pdf_cache SET last_accessed = ? WHERE file_id = ?", 
                 (datetime.now().isoformat(), file_id))
        conn.commit()
        conn.close()
        return {
            "status": "cached",
            "file_id": file_id,
            "message": f"File đã được lưu trước đó. File ID: {file_id}"
        }
    
    # New file - save to cache
    file_id = str(uuid.uuid4())
    file_path = os.path.join(PDF_CACHE_DIR, f"{file_id}.pdf")
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    # Record in database
    c.execute("""INSERT INTO pdf_cache 
                (file_id, file_name, file_hash, file_path, file_size, upload_date, last_accessed)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
             (file_id, file.filename, file_hash, file_path, len(contents), 
              datetime.now().isoformat(), datetime.now().isoformat()))
    conn.commit()
    conn.close()
    
    return {
        "status": "uploaded",
        "file_id": file_id,
        "file_name": file.filename,
        "file_size": len(contents),
        "message": f"File đã được lưu. File ID: {file_id}"
    }

@app.get("/pdf/list")
async def list_cached_pdfs():
    """List all cached PDF files"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT file_id, file_name, file_size, upload_date, last_accessed FROM pdf_cache ORDER BY upload_date DESC")
    rows = c.fetchall()
    conn.close()
    
    files = []
    for row in rows:
        files.append({
            "file_id": row[0],
            "file_name": row[1],
            "file_size": row[2],
            "upload_date": row[3],
            "last_accessed": row[4],
            "file_size_mb": round(row[2] / (1024*1024), 2)
        })
    
    return {"files": files, "total": len(files)}

@app.delete("/pdf/{file_id}")
async def delete_cached_pdf(file_id: str):
    """Delete a cached PDF file"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT file_path FROM pdf_cache WHERE file_id = ?", (file_id,))
    result = c.fetchone()
    
    if not result:
        conn.close()
        return {"status": "error", "message": "File không tìm thấy"}
    
    file_path = result[0]
    
    # Delete file from disk
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    c.execute("DELETE FROM pdf_cache WHERE file_id = ?", (file_id,))
    conn.commit()
    conn.close()
    
    return {"status": "deleted", "message": f"Đã xóa file {file_id}"}

@app.post("/pdf/extract")
async def extract_from_cached_pdf(data: dict = Body(...)):
    """Extract content from cached PDF using file_id"""
    file_id = data.get("file_id")
    page_range = data.get("page_range", "all")  # "all" or "1-50"
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT file_path FROM pdf_cache WHERE file_id = ?", (file_id,))
    result = c.fetchone()
    conn.close()
    
    if not result:
        return {"status": "error", "message": "File không tìm thấy"}
    
    file_path = result[0]
    
    if not os.path.exists(file_path):
        return {"status": "error", "message": "File đã bị xóa"}
    
    # Read PDF and extract text (same as before)
    with open(file_path, 'rb') as f:
        contents = f.read()
    
    try:
        engine = get_ocr_engine()
    except Exception as e:
        return {"status": "error", "message": f"OCR engine unavailable: {str(e)}"}
    result, elapse = engine(contents)
    if not result: 
        return {"text": "", "status": "no_text"}
    
    texts = [line[1] for line in result]
    return {
        "status": "success",
        "file_id": file_id,
        "text": "\n".join(texts),
        "page_count": len(texts)
    }

@app.post("/sync")
async def sync_data(data: dict = Body(...)):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    for key in ["books", "chapters", "cards", "dictationPlaylist", "progress"]:
        if key in data:
            c.execute("INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)", (key, json.dumps(data[key])))
    conn.commit()
    conn.close()
    return {"status": "ok", "message": "Da luu vao Database (app_data.db)"}

@app.get("/load")
async def load_data():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT key, value FROM storage")
    rows = c.fetchall()
    conn.close()
    result = {row[0]: json.loads(row[1]) for row in rows}
    return result

@app.get("/{path:path}")
async def serve_file(path: str):
    full_path = os.path.join(APP_DIR, path)
    if os.path.isfile(full_path):
        return FileResponse(full_path)
    return FileResponse(os.path.join(APP_DIR, "index.html"))

# ===== PROGRESS TRACKING ENDPOINTS =====

@app.post("/api/progress/flashcard/save")
async def save_flashcard_progress(data: dict = Body(...)):
    """Save flashcard study progress"""
    try:
        session_id = data.get("session_id")
        chapter_id = data.get("chapter_id")
        current_card_index = data.get("current_card_index", 0)
        cards_studied = data.get("cards_studied", [])
        card_responses = data.get("card_responses", [])
        study_time_per_card = data.get("study_time_per_card", [])
        sm2_data = data.get("sm2_data", {})
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Check if session exists
        c.execute("SELECT id FROM progress_sessions WHERE id = ?", (session_id,))
        session_exists = c.fetchone()
        
        if not session_exists:
            # Create new session
            c.execute("""INSERT INTO progress_sessions 
                        (id, activity_type, resource_id, status, start_time, last_updated_time)
                        VALUES (?, ?, ?, ?, ?, ?)""",
                     (session_id, "flashcard", chapter_id, "in_progress", 
                      datetime.now().isoformat(), datetime.now().isoformat()))
        
        # Check if flashcard_progress exists
        c.execute("SELECT id FROM flashcard_progress WHERE session_id = ?", (session_id,))
        progress_exists = c.fetchone()
        
        if progress_exists:
            # Update existing progress
            c.execute("""UPDATE flashcard_progress 
                        SET current_card_index = ?, cards_studied = ?, card_responses = ?,
                            study_time_per_card = ?, sm2_data = ?,
                            completion_percentage = ?
                        WHERE session_id = ?""",
                     (current_card_index, json.dumps(cards_studied), json.dumps(card_responses),
                      json.dumps(study_time_per_card), json.dumps(sm2_data),
                      int((len(cards_studied) / max(1, len(cards_studied) + 5)) * 100),
                      session_id))
        else:
            # Create new flashcard_progress
            progress_id = str(uuid.uuid4())
            c.execute("""INSERT INTO flashcard_progress 
                        (id, session_id, chapter_id, current_card_index, cards_studied, 
                         card_responses, study_time_per_card, sm2_data, completion_percentage)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                     (progress_id, session_id, chapter_id, current_card_index,
                      json.dumps(cards_studied), json.dumps(card_responses),
                      json.dumps(study_time_per_card), json.dumps(sm2_data),
                      int((len(cards_studied) / max(1, len(cards_studied) + 5)) * 100)))
        
        # Update session last_updated_time
        c.execute("UPDATE progress_sessions SET last_updated_time = ? WHERE id = ?",
                 (datetime.now().isoformat(), session_id))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Flashcard progress saved",
            "session_id": session_id,
            "current_card_index": current_card_index
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/flashcard/{session_id}")
async def get_flashcard_progress(session_id: str):
    """Get flashcard study progress"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("""SELECT session_id, chapter_id, current_card_index, cards_studied, 
                            card_responses, study_time_per_card, sm2_data, completion_percentage
                     FROM flashcard_progress WHERE session_id = ?""", (session_id,))
        result = c.fetchone()
        conn.close()
        
        if not result:
            return {
                "status": "not_found",
                "message": "Session not found"
            }
        
        return {
            "status": "success",
            "data": {
                "session_id": result[0],
                "chapter_id": result[1],
                "current_card_index": result[2],
                "cards_studied": json.loads(result[3]),
                "card_responses": json.loads(result[4]),
                "study_time_per_card": json.loads(result[5]),
                "sm2_data": json.loads(result[6]),
                "completion_percentage": result[7]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/progress/dictation/save")
async def save_dictation_progress(data: dict = Body(...)):
    """Save dictation exercise progress"""
    try:
        session_id = data.get("session_id")
        chapter_id = data.get("chapter_id")
        youtube_url = data.get("youtube_url", "")
        current_sentence_index = data.get("current_sentence_index", 0)
        current_timestamp = data.get("current_timestamp", 0)
        sentences_completed = data.get("sentences_completed", [])
        user_answers = data.get("user_answers", [])
        accuracy_scores = data.get("accuracy_scores", [])
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Check if session exists
        c.execute("SELECT id FROM progress_sessions WHERE id = ?", (session_id,))
        session_exists = c.fetchone()
        
        if not session_exists:
            # Create new session
            c.execute("""INSERT INTO progress_sessions 
                        (id, activity_type, resource_id, status, start_time, last_updated_time)
                        VALUES (?, ?, ?, ?, ?, ?)""",
                     (session_id, "dictation", chapter_id, "in_progress",
                      datetime.now().isoformat(), datetime.now().isoformat()))
        
        # Check if dictation_progress exists
        c.execute("SELECT id FROM dictation_progress WHERE session_id = ?", (session_id,))
        progress_exists = c.fetchone()
        
        if progress_exists:
            # Update existing progress
            c.execute("""UPDATE dictation_progress 
                        SET current_sentence_index = ?, current_timestamp = ?,
                            sentences_completed = ?, user_answers = ?, accuracy_scores = ?,
                            completion_percentage = ?
                        WHERE session_id = ?""",
                     (current_sentence_index, current_timestamp,
                      json.dumps(sentences_completed), json.dumps(user_answers),
                      json.dumps(accuracy_scores),
                      int((len(sentences_completed) / max(1, len(sentences_completed) + 5)) * 100),
                      session_id))
        else:
            # Create new dictation_progress
            progress_id = str(uuid.uuid4())
            c.execute("""INSERT INTO dictation_progress 
                        (id, session_id, chapter_id, youtube_url, current_sentence_index,
                         current_timestamp, sentences_completed, user_answers, accuracy_scores,
                         completion_percentage)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                     (progress_id, session_id, chapter_id, youtube_url, current_sentence_index,
                      current_timestamp, json.dumps(sentences_completed), json.dumps(user_answers),
                      json.dumps(accuracy_scores),
                      int((len(sentences_completed) / max(1, len(sentences_completed) + 5)) * 100)))
        
        # Update session last_updated_time
        c.execute("UPDATE progress_sessions SET last_updated_time = ? WHERE id = ?",
                 (datetime.now().isoformat(), session_id))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Dictation progress saved",
            "session_id": session_id,
            "current_sentence_index": current_sentence_index
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/dictation/{session_id}")
async def get_dictation_progress(session_id: str):
    """Get dictation exercise progress"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("""SELECT session_id, chapter_id, youtube_url, current_sentence_index,
                            current_timestamp, sentences_completed, user_answers, accuracy_scores,
                            completion_percentage
                     FROM dictation_progress WHERE session_id = ?""", (session_id,))
        result = c.fetchone()
        conn.close()
        
        if not result:
            return {
                "status": "not_found",
                "message": "Session not found"
            }
        
        return {
            "status": "success",
            "data": {
                "session_id": result[0],
                "chapter_id": result[1],
                "youtube_url": result[2],
                "current_sentence_index": result[3],
                "current_timestamp": result[4],
                "sentences_completed": json.loads(result[5]),
                "user_answers": json.loads(result[6]),
                "accuracy_scores": json.loads(result[7]),
                "completion_percentage": result[8]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/progress/exercise/save")
async def save_exercise_progress(data: dict = Body(...)):
    """Save exercise progress"""
    try:
        session_id = data.get("session_id")
        exercise_id = data.get("exercise_id")
        chapter_id = data.get("chapter_id")
        current_question_index = data.get("current_question_index", 0)
        questions_answered = data.get("questions_answered", [])
        user_answers = data.get("user_answers", [])
        correct_answers = data.get("correct_answers", [])
        accuracy_scores = data.get("accuracy_scores", [])
        time_per_question = data.get("time_per_question", [])
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Check if session exists
        c.execute("SELECT id FROM progress_sessions WHERE id = ?", (session_id,))
        session_exists = c.fetchone()
        
        if not session_exists:
            # Create new session
            c.execute("""INSERT INTO progress_sessions 
                        (id, activity_type, resource_id, status, start_time, last_updated_time)
                        VALUES (?, ?, ?, ?, ?, ?)""",
                     (session_id, "exercise", exercise_id, "in_progress",
                      datetime.now().isoformat(), datetime.now().isoformat()))
        
        # Check if exercise_progress exists
        c.execute("SELECT id FROM exercise_progress WHERE session_id = ?", (session_id,))
        progress_exists = c.fetchone()
        
        overall_accuracy = sum(accuracy_scores) / len(accuracy_scores) if accuracy_scores else 0
        
        if progress_exists:
            # Update existing progress
            c.execute("""UPDATE exercise_progress 
                        SET current_question_index = ?, questions_answered = ?,
                            user_answers = ?, correct_answers = ?, accuracy_scores = ?,
                            time_per_question = ?, completion_percentage = ?,
                            overall_accuracy_rate = ?
                        WHERE session_id = ?""",
                     (current_question_index, json.dumps(questions_answered),
                      json.dumps(user_answers), json.dumps(correct_answers),
                      json.dumps(accuracy_scores), json.dumps(time_per_question),
                      int((len(questions_answered) / max(1, len(questions_answered) + 5)) * 100),
                      overall_accuracy, session_id))
        else:
            # Create new exercise_progress
            progress_id = str(uuid.uuid4())
            c.execute("""INSERT INTO exercise_progress 
                        (id, session_id, exercise_id, chapter_id, current_question_index,
                         questions_answered, user_answers, correct_answers, accuracy_scores,
                         time_per_question, completion_percentage, overall_accuracy_rate)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                     (progress_id, session_id, exercise_id, chapter_id, current_question_index,
                      json.dumps(questions_answered), json.dumps(user_answers),
                      json.dumps(correct_answers), json.dumps(accuracy_scores),
                      json.dumps(time_per_question),
                      int((len(questions_answered) / max(1, len(questions_answered) + 5)) * 100),
                      overall_accuracy))
        
        # Update session last_updated_time
        c.execute("UPDATE progress_sessions SET last_updated_time = ? WHERE id = ?",
                 (datetime.now().isoformat(), session_id))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Exercise progress saved",
            "session_id": session_id,
            "current_question_index": current_question_index
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/exercise/{session_id}")
async def get_exercise_progress(session_id: str):
    """Get exercise progress"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("""SELECT session_id, exercise_id, chapter_id, current_question_index,
                            questions_answered, user_answers, correct_answers, accuracy_scores,
                            time_per_question, completion_percentage, overall_accuracy_rate
                     FROM exercise_progress WHERE session_id = ?""", (session_id,))
        result = c.fetchone()
        conn.close()
        
        if not result:
            return {
                "status": "not_found",
                "message": "Session not found"
            }
        
        return {
            "status": "success",
            "data": {
                "session_id": result[0],
                "exercise_id": result[1],
                "chapter_id": result[2],
                "current_question_index": result[3],
                "questions_answered": json.loads(result[4]),
                "user_answers": json.loads(result[5]),
                "correct_answers": json.loads(result[6]),
                "accuracy_scores": json.loads(result[7]),
                "time_per_question": json.loads(result[8]),
                "completion_percentage": result[9],
                "overall_accuracy_rate": result[10]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/progress/reading/save")
async def save_reading_progress(data: dict = Body(...)):
    """Save reading progress"""
    try:
        session_id = data.get("session_id")
        chapter_id = data.get("chapter_id")
        current_paragraph_index = data.get("current_paragraph_index", 0)
        current_scroll_position = data.get("current_scroll_position", 0)
        paragraphs_read = data.get("paragraphs_read", [])
        vocabulary_lookups = data.get("vocabulary_lookups", [])
        notes = data.get("notes", "")
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Check if session exists
        c.execute("SELECT id FROM progress_sessions WHERE id = ?", (session_id,))
        session_exists = c.fetchone()
        
        if not session_exists:
            # Create new session
            c.execute("""INSERT INTO progress_sessions 
                        (id, activity_type, resource_id, status, start_time, last_updated_time)
                        VALUES (?, ?, ?, ?, ?, ?)""",
                     (session_id, "reading", chapter_id, "in_progress",
                      datetime.now().isoformat(), datetime.now().isoformat()))
        
        # Check if reading_progress exists
        c.execute("SELECT id FROM reading_progress WHERE session_id = ?", (session_id,))
        progress_exists = c.fetchone()
        
        if progress_exists:
            # Update existing progress
            c.execute("""UPDATE reading_progress 
                        SET current_paragraph_index = ?, current_scroll_position = ?,
                            paragraphs_read = ?, vocabulary_lookups = ?, notes = ?,
                            completion_percentage = ?
                        WHERE session_id = ?""",
                     (current_paragraph_index, current_scroll_position,
                      json.dumps(paragraphs_read), json.dumps(vocabulary_lookups), notes,
                      int((len(paragraphs_read) / max(1, len(paragraphs_read) + 5)) * 100),
                      session_id))
        else:
            # Create new reading_progress
            progress_id = str(uuid.uuid4())
            c.execute("""INSERT INTO reading_progress 
                        (id, session_id, chapter_id, current_paragraph_index,
                         current_scroll_position, paragraphs_read, vocabulary_lookups, notes,
                         completion_percentage)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                     (progress_id, session_id, chapter_id, current_paragraph_index,
                      current_scroll_position, json.dumps(paragraphs_read),
                      json.dumps(vocabulary_lookups), notes,
                      int((len(paragraphs_read) / max(1, len(paragraphs_read) + 5)) * 100)))
        
        # Update session last_updated_time
        c.execute("UPDATE progress_sessions SET last_updated_time = ? WHERE id = ?",
                 (datetime.now().isoformat(), session_id))
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "message": "Reading progress saved",
            "session_id": session_id,
            "current_paragraph_index": current_paragraph_index
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/reading/{session_id}")
async def get_reading_progress(session_id: str):
    """Get reading progress"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("""SELECT session_id, chapter_id, current_paragraph_index,
                            current_scroll_position, paragraphs_read, vocabulary_lookups,
                            notes, completion_percentage
                     FROM reading_progress WHERE session_id = ?""", (session_id,))
        result = c.fetchone()
        conn.close()
        
        if not result:
            return {
                "status": "not_found",
                "message": "Session not found"
            }
        
        return {
            "status": "success",
            "data": {
                "session_id": result[0],
                "chapter_id": result[1],
                "current_paragraph_index": result[2],
                "current_scroll_position": result[3],
                "paragraphs_read": json.loads(result[4]),
                "vocabulary_lookups": json.loads(result[5]),
                "notes": result[6],
                "completion_percentage": result[7]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# ===== AI ANALYSIS ENDPOINTS (No Gemini API needed) =====

def translate_to_vietnamese(text: str) -> str:
    """Translate text to Vietnamese using LibreTranslate (free, no API key)"""
    try:
        response = requests.post(
            'https://libretranslate.de/translate',
            json={
                'q': text,
                'source': 'en',
                'target': 'vi'
            },
            timeout=5
        )
        if response.status_code == 200:
            return response.json().get('translatedText', text)
    except Exception as e:
        print(f"Translation error: {e}")
    return text

def analyze_sentence_grammar(sentence: str, keyword: str) -> dict:
    """
    Analyze sentence grammar and usage without AI
    Returns: {has_keyword, length, structure_analysis, suggestions}
    """
    analysis = {
        "has_keyword": keyword in sentence,
        "length": len(sentence),
        "structure": "unknown"
    }
    
    # Simple structure analysis
    if '，' in sentence or '。' in sentence:
        analysis["structure"] = "complete"
    elif '、' in sentence:
        analysis["structure"] = "list"
    else:
        analysis["structure"] = "fragment"
    
    # Count Chinese characters
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', sentence))
    analysis["chinese_chars"] = chinese_chars
    
    return analysis

@app.post("/ai/translate-word")
async def translate_word(data: dict = Body(...)):
    """Translate a Chinese word to Vietnamese without Gemini API"""
    chinese = data.get("chinese", "")
    
    if not chinese:
        return {"status": "error", "message": "No Chinese word provided"}
    
    try:
        # Try to translate using LibreTranslate
        vietnamese = translate_to_vietnamese(chinese)
        
        return {
            "status": "success",
            "chinese": chinese,
            "vietnamese": vietnamese,
            "source": "libretranslate"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "chinese": chinese,
            "vietnamese": ""
        }

@app.post("/ai/analyze-sentence")
async def analyze_sentence(data: dict = Body(...)):
    """Analyze a sentence without Gemini API"""
    sentence = data.get("sentence", "")
    keyword = data.get("keyword", "")
    
    if not sentence or not keyword:
        return {"status": "error", "message": "Missing sentence or keyword"}
    
    try:
        # Get basic analysis
        analysis = analyze_sentence_grammar(sentence, keyword)
        
        # Detect common OCR errors
        ocr_errors = detect_ocr_errors(sentence)
        
        # Try to get translation using LibreTranslate
        try:
            vietnamese = translate_to_vietnamese(sentence)
        except:
            vietnamese = ""
        
        # Generate feedback
        feedback = generate_sentence_feedback(analysis, ocr_errors, keyword)
        
        return {
            "status": "success",
            "sentence": sentence,
            "keyword": keyword,
            "analysis": analysis,
            "ocr_errors": ocr_errors,
            "vietnamese": vietnamese,
            "feedback": feedback,
            "source": "local_analysis"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

def detect_ocr_errors(text: str) -> list:
    """Detect common OCR errors in text"""
    errors = []
    
    # Common OCR error patterns
    ocr_patterns = {
        '0': 'O',  # zero vs letter O
        '1': 'I',  # one vs letter I
        '8': 'B',  # eight vs letter B
        '人': '八',  # similar Chinese characters
        '口': '日',  # similar Chinese characters
        '云': '云',  # similar Chinese characters
    }
    
    for error, correct in ocr_patterns.items():
        if error in text:
            errors.append({
                "error": error,
                "suggestion": correct,
                "position": text.find(error)
            })
    
    return errors

def generate_sentence_feedback(analysis: dict, ocr_errors: list, keyword: str) -> str:
    """Generate feedback for a sentence"""
    feedback_parts = []
    
    # Keyword feedback
    if analysis.get("has_keyword"):
        feedback_parts.append(f"✓ Từ khóa '{keyword}' có trong câu")
    else:
        feedback_parts.append(f"✗ Từ khóa '{keyword}' không có trong câu")
    
    # Structure feedback
    structure = analysis.get("structure", "unknown")
    if structure == "complete":
        feedback_parts.append("✓ Câu hoàn chỉnh (có dấu câu)")
    elif structure == "fragment":
        feedback_parts.append("⚠ Câu không hoàn chỉnh (thiếu dấu câu)")
    
    # Character count feedback
    chinese_chars = analysis.get("chinese_chars", 0)
    if chinese_chars > 0:
        feedback_parts.append(f"• Số ký tự Hán: {chinese_chars}")
    
    # OCR error feedback
    if ocr_errors:
        feedback_parts.append(f"⚠ Phát hiện {len(ocr_errors)} lỗi OCR có thể")
        for error in ocr_errors[:3]:  # Show first 3 errors
            feedback_parts.append(f"  - '{error['error']}' → '{error['suggestion']}'")
    
    return "\n".join(feedback_parts)

@app.post("/ai/generate-example")
async def generate_example(data: dict = Body(...)):
    """Generate example sentences without AI (using templates)"""
    keyword = data.get("keyword", "")
    word_type = data.get("word_type", "")
    
    if not keyword:
        return {"status": "error", "message": "No keyword provided"}
    
    # Comprehensive template-based examples
    examples_templates = {
        "动": [
            f"我{keyword}了一个好主意。",
            f"他们{keyword}了很多时间。",
            f"请{keyword}这个问题。",
            f"我们需要{keyword}这个计划。",
            f"你能{keyword}我吗？"
        ],
        "名": [
            f"这是一个{keyword}。",
            f"我喜欢{keyword}。",
            f"{keyword}很重要。",
            f"他有一个{keyword}。",
            f"这个{keyword}很好。"
        ],
        "形": [
            f"这个{keyword}。",
            f"非常{keyword}。",
            f"很{keyword}的。",
            f"他很{keyword}。",
            f"这是{keyword}的。"
        ],
        "副": [
            f"我{keyword}喜欢。",
            f"{keyword}很好。",
            f"这{keyword}不对。",
            f"他{keyword}来了。",
            f"我们{keyword}完成了。"
        ]
    }
    
    # Get examples for this word type
    word_examples = examples_templates.get(word_type, examples_templates["动"])
    
    # Translate examples to Vietnamese
    translated_examples = []
    for example in word_examples[:5]:
        try:
            vietnamese = translate_to_vietnamese(example)
            translated_examples.append({
                "chinese": example,
                "vietnamese": vietnamese
            })
        except:
            translated_examples.append({
                "chinese": example,
                "vietnamese": ""
            })
    
    return {
        "status": "success",
        "keyword": keyword,
        "word_type": word_type,
        "examples": translated_examples,
        "source": "template"
    }

@app.get("/api/progress/statistics")
async def get_statistics():
    """Get overall learning statistics"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Total study time
        c.execute("""SELECT SUM(CAST(json_extract(study_time_per_card, '$[' || key || ']') AS REAL))
                     FROM flashcard_progress, json_each(study_time_per_card)""")
        total_flashcard_time = c.fetchone()[0] or 0
        
        # Sessions completed
        c.execute("SELECT COUNT(*) FROM progress_sessions WHERE status = 'completed'")
        sessions_completed = c.fetchone()[0]
        
        # Average accuracy
        c.execute("""SELECT AVG(overall_accuracy_rate) FROM exercise_progress 
                     WHERE overall_accuracy_rate > 0""")
        average_accuracy = c.fetchone()[0] or 0
        
        # Recent activity
        c.execute("""SELECT activity_type, resource_id, last_updated_time, status
                     FROM progress_sessions ORDER BY last_updated_time DESC LIMIT 10""")
        recent_activity = []
        for row in c.fetchall():
            recent_activity.append({
                "activity_type": row[0],
                "resource_id": row[1],
                "last_updated": row[2],
                "status": row[3]
            })
        
        conn.close()
        
        return {
            "status": "success",
            "data": {
                "total_study_time": int(total_flashcard_time),
                "sessions_completed": sessions_completed,
                "average_accuracy": round(average_accuracy, 2),
                "recent_activity": recent_activity
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/statistics/{activity_type}")
async def get_activity_statistics(activity_type: str):
    """Get statistics for a specific activity type"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        # Sessions for this activity
        c.execute("""SELECT COUNT(*) FROM progress_sessions 
                     WHERE activity_type = ? AND status = 'completed'""", (activity_type,))
        sessions_count = c.fetchone()[0]
        
        # Average completion rate
        if activity_type == "flashcard":
            c.execute("""SELECT AVG(completion_percentage) FROM flashcard_progress""")
        elif activity_type == "exercise":
            c.execute("""SELECT AVG(completion_percentage) FROM exercise_progress""")
        elif activity_type == "dictation":
            c.execute("""SELECT AVG(completion_percentage) FROM dictation_progress""")
        elif activity_type == "reading":
            c.execute("""SELECT AVG(completion_percentage) FROM reading_progress""")
        else:
            completion_rate = 0
        
        completion_rate = c.fetchone()[0] or 0
        
        conn.close()
        
        return {
            "status": "success",
            "data": {
                "activity_type": activity_type,
                "sessions_completed": sessions_count,
                "average_completion_rate": round(completion_rate, 2)
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/api/progress/timeline")
async def get_timeline():
    """Get timeline of all learning sessions"""
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("""SELECT id, activity_type, resource_id, status, start_time, 
                            last_updated_time, end_time
                     FROM progress_sessions ORDER BY last_updated_time DESC LIMIT 50""")
        
        timeline = []
        for row in c.fetchall():
            timeline.append({
                "session_id": row[0],
                "activity_type": row[1],
                "resource_id": row[2],
                "status": row[3],
                "start_time": row[4],
                "last_updated": row[5],
                "end_time": row[6]
            })
        
        conn.close()
        
        return {
            "status": "success",
            "data": timeline
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1"
    uvicorn.run(app, host=host, port=port)

