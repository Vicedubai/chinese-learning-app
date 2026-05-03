# Requirements Document: Server-Side PDF Processing

## Introduction

This document specifies the requirements for implementing server-side PDF processing in the Chinese learning app. Currently, the system processes PDFs entirely on the frontend using RapidOCR and Gemini Vision, which is slow (5-10 minutes per book), risky (data loss on browser crash), and requires multiple API calls. The new system will move all PDF extraction and data processing to the backend, improving performance, reliability, and user experience.

The server-side processing system will handle PDF upload, text extraction via OCR, AI-powered text correction and translation, structured data generation, and persistent storage—allowing the frontend to focus on presentation and learning interactions.

---

## Glossary

- **PDF_Processor**: The backend service responsible for receiving PDFs and orchestrating the extraction pipeline
- **OCR_Engine**: RapidOCR component that extracts text from PDF images
- **AI_Translator**: Gemini Vision API integration for text correction, translation, and vocabulary extraction
- **Chapter**: A logical section of a textbook, typically corresponding to a lesson or unit
- **Vocabulary_Item**: A single Chinese word/phrase with pinyin, Vietnamese translation, and example sentences
- **Processing_Job**: A long-running PDF processing task with status tracking and progress updates
- **Structured_Output**: The final processed data (chapters, vocabulary, exercises) ready for frontend consumption
- **Text_Layer**: Native text embedded in a PDF (as opposed to scanned images)
- **OCR_Text**: Text extracted from PDF images using optical character recognition
- **Raw_Text**: Unprocessed text extracted from a PDF before AI correction
- **Corrected_Text**: Text that has been processed by AI for accuracy and formatting
- **Vocabulary_Section**: The portion of a chapter containing new vocabulary (marked by 生词)
- **Exercise_Set**: Generated practice exercises (multiple choice, fill-in-the-blank, etc.)
- **Frontend**: The HTML/CSS/JavaScript SPA running in the browser
- **Backend**: The Python FastAPI server handling PDF processing and data storage
- **Storage**: SQLite database for persisting processed data
- **API_Key**: Authentication credential for external services (Gemini, MyMemory)

---

## Requirements

### Requirement 1: PDF Upload and Server Reception

**User Story:** As a user, I want to upload a PDF file to the server, so that the backend can process it without blocking my browser.

#### Acceptance Criteria

1. WHEN a user selects a PDF file from the frontend, THE Frontend SHALL send the file to the Backend via HTTP POST to `/api/pdf/upload`
2. WHEN the Backend receives a PDF file, THE PDF_Processor SHALL validate that the file is a valid PDF format
3. IF the file is not a valid PDF, THEN THE Backend SHALL return a 400 error with a descriptive message
4. WHEN a valid PDF is received, THE Backend SHALL store the file temporarily and return a unique `job_id` to the Frontend
5. WHEN the Frontend receives a `job_id`, THE Frontend SHALL display a progress indicator and poll the Backend for status updates
6. THE Backend SHALL accept PDF files up to 50MB in size
7. WHEN a PDF upload is initiated, THE Backend SHALL create a Processing_Job record with status "pending"

### Requirement 2: PDF Text Extraction Strategy

**User Story:** As a developer, I want the system to intelligently extract text from PDFs, so that processing is fast and accurate regardless of PDF type.

#### Acceptance Criteria

1. WHEN a PDF is received, THE PDF_Processor SHALL first attempt to extract the native Text_Layer from the PDF
2. IF the PDF contains sufficient native text (>30 characters per page on average), THEN THE PDF_Processor SHALL use the native text and skip OCR
3. IF the PDF contains insufficient native text, THEN THE PDF_Processor SHALL convert PDF pages to images and apply OCR_Engine
4. WHEN converting PDF pages to images, THE PDF_Processor SHALL use a scale factor of 1.2x for improved OCR accuracy
5. WHEN applying OCR, THE PDF_Processor SHALL use RapidOCR with Chinese language model (chi_sim)
6. THE PDF_Processor SHALL extract text from all pages specified by the user (or all pages if not specified)
7. WHEN text extraction is complete, THE PDF_Processor SHALL store the Raw_Text for each page in the Processing_Job

### Requirement 3: Chapter Detection and Segmentation

**User Story:** As a user, I want the system to automatically detect and segment chapters from the PDF, so that I don't have to manually specify chapter boundaries.

#### Acceptance Criteria

1. WHEN Raw_Text is extracted, THE PDF_Processor SHALL attempt to detect chapter boundaries using multiple strategies
2. STRATEGY A: IF the PDF contains a Table of Contents (目录), THEN THE PDF_Processor SHALL parse it to identify chapter titles and page numbers
3. STRATEGY B: IF no Table of Contents is found, THEN THE PDF_Processor SHALL scan the text for chapter headers matching patterns like "第X课" or "Lesson X"
4. STRATEGY C: IF neither strategy succeeds, THEN THE PDF_Processor SHALL treat the entire PDF as a single chapter
5. WHEN chapters are detected, THE PDF_Processor SHALL create Chapter records with title, page range, and Raw_Text
6. THE PDF_Processor SHALL preserve the original page numbers for each chapter
7. WHEN chapter detection is complete, THE Backend SHALL update the Processing_Job status to "chapters_detected"

### Requirement 4: Multi-Content Extraction Strategy (On-Demand)

**User Story:** As a user, I want the system to extract different types of content (vocabulary, lesson text, grammar, exercises) on-demand, so that I can choose what to process and avoid wasting time on unnecessary extraction.

#### Acceptance Criteria

1. WHEN a Chapter is processed, THE PDF_Processor SHALL identify and extract the following content sections:
   - **Vocabulary Section** (生词) - New words with pinyin and definitions
   - **Lesson Content** (课文/正文) - Main reading material and dialogues
   - **Grammar Section** (语法) - Grammar explanations and examples
   - **Exercise Section** (练习/习题) - Practice questions and activities

2. WHEN extracting content, THE PDF_Processor SHALL store metadata for each section:
   - Section type (vocabulary, lesson, grammar, exercise)
   - Page range
   - Raw extracted text
   - Extraction confidence score
   - Processing status (pending, extracted, processed, error)

3. THE Backend SHALL NOT automatically process all sections during initial PDF upload
4. INSTEAD, THE Backend SHALL only extract and store the Raw_Text for all sections during initial processing
5. WHEN the user requests a specific section (e.g., "create flashcards from vocabulary"), THE Backend SHALL process ONLY that section on-demand
6. THE Backend SHALL cache processed sections to avoid re-processing the same content

### Requirement 4.1: Vocabulary Extraction from Chapters

**User Story:** As a user, I want the system to automatically extract vocabulary from the 生词 section of each chapter, so that I can build flashcards without manual data entry.

#### Acceptance Criteria

1. WHEN a Chapter is processed, THE PDF_Processor SHALL locate the Vocabulary_Section marked by "生词" or similar markers
2. IF a Vocabulary_Section is found, THEN THE PDF_Processor SHALL extract individual vocabulary items (Chinese characters, pinyin, and any existing translations)
3. IF no Vocabulary_Section is found, THEN THE PDF_Processor SHALL return an empty vocabulary list for that chapter
4. WHEN extracting vocabulary items, THE PDF_Processor SHALL parse lines matching patterns like "1. 汉字 pīnyīn (definition)"
5. THE PDF_Processor SHALL deduplicate vocabulary items within a chapter
6. WHEN vocabulary extraction is complete, THE Backend SHALL store the Raw_Text vocabulary items (before AI correction)
7. THE PDF_Processor SHALL extract up to 500 vocabulary items per chapter
8. WHEN the user requests vocabulary processing, THE Backend SHALL trigger on-demand AI translation and correction (see Requirement 5)

### Requirement 5: AI-Powered Text Correction and Translation (On-Demand, API-Independent)

**User Story:** As a user, I want the system to correct OCR errors and translate content to Vietnamese using free/local methods, so that I can use the system without expensive API costs or external dependencies.

#### Acceptance Criteria

1. WHEN the user requests processing of a specific section (vocabulary, lesson, grammar, or exercises), THE Backend SHALL trigger on-demand processing for ONLY that section
2. WHEN processing vocabulary items, THE Backend SHALL:
   - Use local regex patterns to standardize pinyin format
   - Validate Chinese characters using Unicode ranges (U+4E00-U+9FFF)
   - Deduplicate and clean vocabulary items
3. WHEN translating vocabulary, THE Backend SHALL use LibreTranslate API (free, no API key required) to translate Chinese to Vietnamese
4. IF LibreTranslate translation fails, THEN THE Backend SHALL:
   - Mark content as "translation_pending"
   - Allow manual correction later
   - Continue processing other items
5. WHEN translating, THE Backend SHALL batch requests to minimize API calls (batch size: 5-10 items per request)
6. THE Backend SHALL add a rate limit of 300ms between requests to respect API quotas
7. WHEN processing lesson content, THE Backend SHALL:
   - Clean OCR errors using local regex patterns
   - Segment content into sentences using Chinese punctuation markers (。，！？；：)
   - Provide Vietnamese translation via LibreTranslate if requested
8. WHEN processing grammar sections, THE Backend SHALL:
   - Clean OCR errors in grammar explanations
   - Translate grammar rules to Vietnamese via LibreTranslate
   - Extract and format grammar examples
9. WHEN processing exercise sections, THE Backend SHALL:
   - Clean OCR errors in questions and answers
   - Translate exercise instructions to Vietnamese via LibreTranslate
   - Validate exercise format and structure
10. WHEN processing is complete, THE Backend SHALL store the Corrected_Text for that section
11. THE Backend SHALL update the section's processing status to "processed"
12. THE Backend SHALL cache processed sections to avoid re-processing the same content
13. WHEN the user requests the same section again, THE Backend SHALL return the cached result without re-processing
14. THE Backend SHALL provide a manual override option to skip translation and use raw extracted text

### Requirement 6: Lesson Content Extraction and Processing

**User Story:** As a user, I want the system to extract and process lesson content (课文), so that I can use it for reading exercises and comprehension practice.

#### Acceptance Criteria

1. WHEN a Chapter is processed, THE PDF_Processor SHALL locate the Lesson_Content section (typically marked by 课文, 正文, or 课程内容)
2. IF a Lesson_Content section is found, THEN THE PDF_Processor SHALL extract the full text including:
   - Main dialogue or narrative text
   - Character names (if applicable)
   - Punctuation and formatting
3. IF no Lesson_Content section is found, THEN THE PDF_Processor SHALL return an empty lesson content for that chapter
4. WHEN extracting lesson content, THE PDF_Processor SHALL preserve line breaks and paragraph structure
5. THE PDF_Processor SHALL store the Raw_Text lesson content without processing
6. WHEN the user requests lesson content processing, THE Backend SHALL trigger on-demand AI processing (see Requirement 5)
7. WHEN processing lesson content, THE Backend SHALL:
   - Correct OCR errors
   - Provide Vietnamese translation (if requested)
   - Segment content into sentences for easier reading
   - Extract key phrases and idioms
8. THE Backend SHALL store processed lesson content with metadata (word count, sentence count, difficulty level)

### Requirement 7: Grammar Section Extraction and Processing

**User Story:** As a user, I want the system to extract and process grammar explanations, so that I can understand grammar rules and use them in exercises.

#### Acceptance Criteria

1. WHEN a Chapter is processed, THE PDF_Processor SHALL locate the Grammar_Section (typically marked by 语法, 语法点, or 语法讲解)
2. IF a Grammar_Section is found, THEN THE PDF_Processor SHALL extract:
   - Grammar rule explanations
   - Grammar examples with translations
   - Usage notes and exceptions
3. IF no Grammar_Section is found, THEN THE PDF_Processor SHALL return an empty grammar section for that chapter
4. WHEN extracting grammar sections, THE PDF_Processor SHALL parse structured content (numbered rules, bullet points, etc.)
5. THE PDF_Processor SHALL store the Raw_Text grammar content without processing
6. WHEN the user requests grammar processing, THE Backend SHALL trigger on-demand AI processing (see Requirement 5)
7. WHEN processing grammar sections, THE Backend SHALL:
   - Correct OCR errors in explanations and examples
   - Translate grammar rules to Vietnamese
   - Extract and format grammar examples
   - Identify grammar categories (verb tenses, sentence structures, particles, etc.)
   - Generate additional examples if needed
8. THE Backend SHALL store processed grammar with metadata (grammar_type, difficulty_level, example_count)

### Requirement 8: Exercise Section Extraction and Processing

**User Story:** As a user, I want the system to extract and process exercises, so that I can generate practice questions and track my learning progress.

#### Acceptance Criteria

1. WHEN a Chapter is processed, THE PDF_Processor SHALL locate the Exercise_Section (typically marked by 练习, 习题, 练习题, or 活动)
2. IF an Exercise_Section is found, THEN THE PDF_Processor SHALL extract:
   - Exercise questions and prompts
   - Answer options (for multiple choice)
   - Expected answers or answer keys
   - Exercise instructions
3. IF no Exercise_Section is found, THEN THE PDF_Processor SHALL return an empty exercise section for that chapter
4. WHEN extracting exercises, THE PDF_Processor SHALL identify exercise types:
   - Multiple choice (选择题)
   - Fill-in-the-blank (填空题)
   - True/False (判断题)
   - Short answer (简答题)
   - Translation (翻译题)
   - Dialogue completion (对话完成)
   - Reading comprehension (阅读理解)
5. THE PDF_Processor SHALL store the Raw_Text exercises without processing
6. WHEN the user requests exercise processing, THE Backend SHALL trigger on-demand AI processing (see Requirement 5)
7. WHEN processing exercises, THE Backend SHALL:
   - Correct OCR errors in questions and answers
   - Translate exercise instructions to Vietnamese
   - Validate exercise format and structure
   - Extract answer keys and explanations
   - Categorize exercises by type and difficulty
8. THE Backend SHALL store processed exercises with metadata (exercise_type, difficulty_level, answer_key, explanation)
9. WHEN exercises are processed, THE Backend SHALL make them available for the Exercise Generator feature (for creating practice questions)

### Requirement 9: Data Persistence and Retrieval

**User Story:** As a user, I want the system to persist processed data in the database, so that I can access my imported books and content at any time.

#### Acceptance Criteria

1. WHEN a Processing_Job completes successfully, THE Backend SHALL store the extracted content sections in the SQLite database
2. WHEN storing data, THE Backend SHALL create records for:
   - Book (title, total_pages, import_date, processing_time)
   - Chapter (book_id, title, page_range, section_metadata)
   - Content_Section (chapter_id, section_type, raw_text, processing_status, processed_text, metadata)
   - Vocabulary_Item (chapter_id, chinese, pinyin, vietnamese, example_sentence, processing_status)
   - Grammar_Item (chapter_id, grammar_rule, explanation, examples, processing_status)
   - Exercise_Item (chapter_id, exercise_type, question, options, answer_key, processing_status)
3. WHEN a user requests their imported books, THE Backend SHALL return a list of all books via `/api/books`
4. WHEN a user requests chapters for a book, THE Backend SHALL return a list of chapters via `/api/books/{book_id}/chapters`
5. WHEN a user requests content sections for a chapter, THE Backend SHALL return available sections via `/api/chapters/{chapter_id}/sections`
6. WHEN a user requests specific content (vocabulary, lesson, grammar, exercises), THE Backend SHALL return it via:
   - `/api/chapters/{chapter_id}/vocabulary`
   - `/api/chapters/{chapter_id}/lesson`
   - `/api/chapters/{chapter_id}/grammar`
   - `/api/chapters/{chapter_id}/exercises`
7. THE Backend SHALL support filtering content by chapter, book, section type, or search term
8. WHEN data is retrieved, THE Backend SHALL return it in JSON format compatible with the Frontend's State object
9. THE Backend SHALL include processing status for each section (pending, extracted, processed, error)

### Requirement 10: Error Handling and Validation

**User Story:** As a user, I want the system to handle errors gracefully and provide clear feedback, so that I can understand what went wrong and how to fix it.

#### Acceptance Criteria

1. IF a PDF file is corrupted or unreadable, THEN THE Backend SHALL return a 400 error with message "Invalid PDF file"
2. IF OCR fails on a page, THEN THE Backend SHALL log the error and continue processing other pages
3. IF content section detection fails (e.g., cannot find vocabulary section), THEN THE Backend SHALL mark that section as "not_found" and continue processing other sections
4. IF AI translation fails for a section, THEN THE Backend SHALL mark it as "translation_pending" and allow manual correction later
5. IF the user cancels a Processing_Job, THEN THE Backend SHALL stop processing and clean up temporary files
6. WHEN an error occurs, THE Backend SHALL update the Processing_Job status to "error" and include an error_message
7. THE Backend SHALL validate that all required fields are present before storing content sections
8. IF validation fails, THEN THE Backend SHALL return a 422 error with details about missing fields
9. WHEN processing a section on-demand, IF the section has not been extracted yet, THE Backend SHALL return a 404 error with message "Section not found in chapter"

### Requirement 11: Progress Tracking and Status Updates

**User Story:** As a user, I want to see real-time progress updates while the PDF is being processed, so that I know the system is working and how long it will take.

#### Acceptance Criteria

1. WHEN a Processing_Job is created, THE Backend SHALL initialize a status field with value "pending"
2. WHEN processing begins, THE Backend SHALL update the status to "extracting_text"
3. WHEN text extraction is complete, THE Backend SHALL update the status to "sections_detected"
4. WHEN all sections are extracted, THE Backend SHALL update the status to "extraction_complete"
5. WHEN the user requests on-demand processing of a section, THE Backend SHALL create a sub-job with status "processing_{section_type}"
6. WHEN section processing is complete, THE Backend SHALL update the sub-job status to "{section_type}_processed"
7. WHEN the Frontend polls `/api/pdf/status/{job_id}`, THE Backend SHALL return:
   - Current status
   - Progress percentage (0-100)
   - Current step description
   - Estimated time remaining (if available)
   - Error message (if status is "error")
   - List of available sections and their processing status
8. THE Frontend SHALL poll for status updates every 2 seconds during processing
9. WHEN processing is complete, THE Frontend SHALL stop polling and display the results
10. WHEN a section is processed on-demand, THE Backend SHALL update the section's processing status in real-time

### Requirement 12: Integration with Existing Frontend

**User Story:** As a user, I want the new server-side processing to work seamlessly with the existing frontend, so that my workflow doesn't change.

#### Acceptance Criteria

1. WHEN the user uploads a PDF via the existing upload interface, THE Frontend SHALL send it to the new `/api/pdf/upload` endpoint instead of processing locally
2. WHEN the Backend returns a `job_id`, THE Frontend SHALL display a progress modal with real-time status updates
3. WHEN extraction is complete, THE Frontend SHALL display available sections (vocabulary, lesson, grammar, exercises) with their extraction status
4. WHEN the user requests processing of a specific section, THE Frontend SHALL send a request to `/api/chapters/{chapter_id}/process/{section_type}`
5. WHEN section processing is complete, THE Frontend SHALL automatically fetch the processed content and update the State object
6. WHEN the processed content is received, THE Frontend SHALL update the appropriate data structure (cards for vocabulary, lessons for lesson content, etc.)
7. THE Frontend SHALL maintain backward compatibility with existing localStorage data (books/chapters imported before this feature)
8. WHEN the user navigates to the Library page, THE Frontend SHALL display both legacy chapters and newly imported chapters
9. THE Frontend SHALL allow users to merge, rename, and delete chapters (existing functionality) for both legacy and new chapters
10. THE Frontend SHALL show processing status for each section (pending, extracted, processed, error)

### Requirement 13: API Endpoints Specification

**User Story:** As a developer, I want clear API endpoint specifications, so that I can implement the backend correctly and the frontend can integrate properly.

#### Acceptance Criteria

1. THE Backend SHALL provide the following endpoints:
   
   **PDF Processing Endpoints:**
   - `POST /api/pdf/upload` - Upload a PDF file and start extraction
   - `GET /api/pdf/status/{job_id}` - Get the current status of a processing job
   - `GET /api/books` - List all imported books
   - `GET /api/books/{book_id}/chapters` - List chapters for a book
   - `GET /api/chapters/{chapter_id}/sections` - List available sections for a chapter
   - `GET /api/chapters/{chapter_id}/vocabulary` - Get vocabulary for a chapter (requires processing)
   - `GET /api/chapters/{chapter_id}/lesson` - Get lesson content for a chapter (requires processing)
   - `GET /api/chapters/{chapter_id}/grammar` - Get grammar for a chapter (requires processing)
   - `GET /api/chapters/{chapter_id}/exercises` - Get exercises for a chapter (requires processing)
   - `POST /api/chapters/{chapter_id}/process/{section_type}` - Trigger on-demand processing of a section
   - `DELETE /api/books/{book_id}` - Delete a book and all associated data
   - `DELETE /api/chapters/{chapter_id}` - Delete a chapter and all associated content

   **Learning Progress Endpoints:**
   - `POST /api/progress/save` - Save a generic progress session
   - `GET /api/progress/sessions/{activity_type}/{resource_id}` - Get last progress session for an activity
   - `POST /api/progress/dictation/save` - Save dictation progress
   - `GET /api/progress/dictation/{session_id}` - Get dictation progress
   - `POST /api/progress/flashcard/save` - Save flashcard progress
   - `GET /api/progress/flashcard/{session_id}` - Get flashcard progress
   - `POST /api/progress/exercise/save` - Save exercise progress
   - `GET /api/progress/exercise/{session_id}` - Get exercise progress
   - `POST /api/progress/reading/save` - Save reading progress
   - `GET /api/progress/reading/{session_id}` - Get reading progress
   - `GET /api/progress/statistics` - Get overall learning statistics
   - `GET /api/progress/statistics/{activity_type}` - Get statistics by activity type
   - `GET /api/progress/timeline` - Get timeline of all sessions
   - `GET /api/progress/vocabulary/learned` - Get list of learned vocabulary

2. WHEN a request is made to any endpoint, THE Backend SHALL validate the request and return appropriate HTTP status codes:
   - 200 OK - Request successful
   - 400 Bad Request - Invalid input
   - 404 Not Found - Resource not found
   - 422 Unprocessable Entity - Validation error
   - 500 Internal Server Error - Server error

3. ALL responses SHALL be in JSON format with consistent structure:
   ```json
   {
     "status": "success|error",
     "data": {},
     "error": "error message (if applicable)"
   }
   ```

4. THE `/api/chapters/{chapter_id}/sections` endpoint SHALL return:
   ```json
   {
     "status": "success",
     "data": {
       "chapter_id": "...",
       "sections": [
         {
           "type": "vocabulary|lesson|grammar|exercise",
           "status": "pending|extracted|processed|error",
           "item_count": 0,
           "extracted_at": "2024-01-01T00:00:00Z",
           "processed_at": null
         }
       ]
     }
   }
   ```

5. THE `/api/chapters/{chapter_id}/vocabulary` endpoint SHALL return:
   ```json
   {
     "status": "success",
     "data": [
       {
         "id": "...",
         "chinese": "汉字",
         "pinyin": "hànzì",
         "vietnamese": "chữ Hán",
         "example_sentence": "...",
         "processing_status": "processed"
       }
     ]
   }
   ```

6. THE `/api/progress/flashcard/save` endpoint SHALL accept:
   ```json
   {
     "session_id": "...",
     "chapter_id": "...",
     "current_card_index": 5,
     "cards_studied": [0, 1, 2, 3, 4, 5],
     "card_responses": ["correct", "correct", "incorrect", "skip", "correct", "correct"],
     "study_time_per_card": [30, 25, 45, 10, 35, 40],
     "sm2_data": {
       "0": {"interval": 1, "ease_factor": 2.5, "next_review_date": "2024-01-02"},
       "1": {"interval": 3, "ease_factor": 2.6, "next_review_date": "2024-01-04"}
     }
   }
   ```

7. THE `/api/progress/dictation/save` endpoint SHALL accept:
   ```json
   {
     "session_id": "...",
     "chapter_id": "...",
     "youtube_url": "https://youtube.com/...",
     "current_sentence_index": 5,
     "current_timestamp": 125.5,
     "sentences_completed": [0, 1, 2, 3, 4, 5],
     "user_answers": ["...", "...", "..."],
     "accuracy_scores": [0.95, 0.88, 0.92, 0.85, 0.90, 0.93]
   }
   ```

8. THE `/api/progress/statistics` endpoint SHALL return:
   ```json
   {
     "status": "success",
     "data": {
       "total_study_time": 3600,
       "sessions_completed": 15,
       "average_accuracy": 0.88,
       "vocabulary_learned": 150,
       "flashcards_due_today": 10,
       "recent_activity": [...]
     }
   }
   ```

### Requirement 14: Performance and Optimization

**User Story:** As a user, I want PDF processing to be fast and efficient, so that I can import books quickly without waiting too long.

#### Acceptance Criteria

1. WHEN processing a 100-page PDF with OCR, THE Backend SHALL complete initial extraction within 5 minutes
2. WHEN processing a 100-page PDF with native text layer, THE Backend SHALL complete initial extraction within 1 minute
3. WHEN processing a section on-demand (vocabulary, lesson, grammar, exercises), THE Backend SHALL complete processing within 2 minutes
4. THE Backend SHALL use parallel processing for OCR (multiple pages simultaneously) to improve speed
5. WHEN translating vocabulary, THE Backend SHALL batch requests to minimize API calls and latency
6. THE Backend SHALL cache translation results to avoid re-translating the same words
7. THE Backend SHALL cache processed sections to avoid re-processing the same content
8. THE Backend SHALL implement request timeouts (30 seconds per API call) to prevent hanging requests
9. WHEN a Processing_Job completes, THE Backend SHALL clean up temporary files (PDF copies, image files)
10. THE Backend SHALL prioritize initial extraction speed over processing speed (extract all sections quickly, process on-demand)

### Requirement 15: Security and Data Privacy

**User Story:** As a user, I want my data to be secure and private, so that I can trust the system with my learning materials.

#### Acceptance Criteria

1. WHEN a PDF is uploaded, THE Backend SHALL validate the file type (must be application/pdf)
2. THE Backend SHALL store uploaded PDFs in a secure temporary directory with restricted permissions
3. WHEN processing is complete, THE Backend SHALL delete the original PDF file from temporary storage
4. THE Backend SHALL not share user data with third-party services except for translation APIs (MyMemory, Gemini)
5. WHEN using Gemini API, THE Backend SHALL only send vocabulary items, grammar rules, and exercise content (not personal data)
6. THE Backend SHALL implement rate limiting to prevent abuse (max 10 uploads per user per hour)
7. WHEN storing API keys, THE Backend SHALL use environment variables and never log them
8. THE Backend SHALL encrypt sensitive data in the database (API keys, user credentials)

### Requirement 16: Fallback and Graceful Degradation

**User Story:** As a user, I want the system to work even if some services are unavailable, so that I can still import books.

#### Acceptance Criteria

1. IF Gemini API is unavailable, THEN THE Backend SHALL use MyMemory API for translation
2. IF MyMemory API is unavailable, THEN THE Backend SHALL mark content as "translation_pending" and allow manual correction
3. IF local RapidOCR server is unavailable, THEN THE Backend SHALL attempt to use Gemini Vision for OCR
4. IF both OCR methods fail, THEN THE Backend SHALL return an error and allow the user to retry
5. WHEN a service is unavailable, THE Backend SHALL log the error and notify the user via the Processing_Job status
6. THE Backend SHALL provide a manual override option to skip AI translation and use raw extracted text
7. WHEN a section fails to process on-demand, THE Backend SHALL allow the user to retry without re-extracting the section

### Requirement 17: Logging and Monitoring

**User Story:** As a developer, I want comprehensive logging and monitoring, so that I can debug issues and track system performance.

#### Acceptance Criteria

1. WHEN a Processing_Job is created, THE Backend SHALL log the job_id, file_name, and start_time
2. WHEN each processing step completes, THE Backend SHALL log the step_name, duration, and status
3. WHEN a section is processed on-demand, THE Backend SHALL log the section_type, duration, and status
4. WHEN an error occurs, THE Backend SHALL log the error_type, error_message, and stack_trace
5. WHEN an API call is made, THE Backend SHALL log the api_name, request_size, response_time, and status_code
6. THE Backend SHALL maintain a log file for each Processing_Job for debugging purposes
7. THE Backend SHALL implement metrics tracking for:
   - Total PDFs processed
   - Average processing time (extraction vs on-demand processing)
   - Success rate by section type
   - API call counts and latencies
   - Error rates by type
   - Cache hit rates

### Requirement 18: Learning Progress Tracking

**User Story:** As a user, I want the system to save all my learning progress, so that I can resume my learning sessions exactly where I left off.

#### Acceptance Criteria

1. WHEN a user starts a learning activity (dictation, flashcard, exercise, etc.), THE Frontend SHALL create a Progress_Session record with:
   - session_id (unique identifier)
   - activity_type (dictation, flashcard, exercise, reading, etc.)
   - resource_id (chapter_id, vocabulary_id, exercise_id, etc.)
   - start_time
   - current_position (page, sentence, card number, etc.)
   - status (in_progress, paused, completed)

2. WHEN the user interacts with the activity (moves to next item, answers question, etc.), THE Frontend SHALL update the Progress_Session with:
   - current_position (updated position)
   - last_updated_time
   - interaction_count (number of interactions)

3. WHEN the user closes or navigates away from an activity, THE Frontend SHALL save the current Progress_Session to the Backend via `POST /api/progress/save`

4. WHEN the user returns to a previously started activity, THE Frontend SHALL:
   - Fetch the last Progress_Session via `GET /api/progress/sessions/{activity_type}/{resource_id}`
   - Restore the user to the exact position they left off
   - Display a "Resume from [position]" option

5. THE Backend SHALL store Progress_Session records in the database with:
   - session_id, user_id, activity_type, resource_id
   - start_time, last_updated_time, end_time
   - current_position, total_items, completed_items
   - status, metadata (JSON for activity-specific data)

6. WHEN a user completes an activity, THE Frontend SHALL mark the Progress_Session as "completed" and calculate:
   - completion_percentage
   - time_spent
   - accuracy_score (if applicable)
   - performance_metrics (activity-specific)

### Requirement 18.1: Dictation Progress Tracking

**User Story:** As a user, I want my dictation progress to be saved, so that I can continue from the exact sentence I left off.

#### Acceptance Criteria

1. WHEN a user starts a dictation exercise, THE Frontend SHALL create a Dictation_Progress record with:
   - session_id
   - youtube_url (or audio source)
   - current_sentence_index (which sentence they're on)
   - current_timestamp (audio timestamp)
   - sentences_completed (array of completed sentence indices)
   - user_answers (array of user's transcriptions for each sentence)
   - accuracy_scores (array of accuracy scores for each sentence)

2. WHEN the user plays/pauses/seeks in the audio, THE Frontend SHALL update:
   - current_timestamp
   - current_sentence_index (based on timestamp)

3. WHEN the user submits an answer for a sentence, THE Frontend SHALL:
   - Record the user_answer
   - Calculate accuracy_score (using Levenshtein distance or similar)
   - Mark the sentence as completed
   - Update the Dictation_Progress record

4. WHEN the user navigates away from dictation, THE Frontend SHALL save the Dictation_Progress via `POST /api/progress/dictation/save`

5. WHEN the user returns to the same dictation, THE Frontend SHALL:
   - Fetch the Dictation_Progress via `GET /api/progress/dictation/{session_id}`
   - Restore the audio to the last timestamp
   - Display completed sentences and user answers
   - Allow the user to continue from the next sentence

6. THE Backend SHALL store Dictation_Progress with:
   - session_id, chapter_id, youtube_url, current_sentence_index, current_timestamp
   - sentences_completed, user_answers, accuracy_scores
   - start_time, last_updated_time, completion_percentage

### Requirement 18.2: Flashcard Progress Tracking with Keyboard Navigation

**User Story:** As a user, I want to navigate flashcards using arrow keys and save my learning progress, so that I can study efficiently and resume where I left off.

#### Acceptance Criteria

1. WHEN a user starts a flashcard study session, THE Frontend SHALL create a Flashcard_Progress record with:
   - session_id
   - chapter_id or deck_id
   - current_card_index (which card they're viewing)
   - cards_studied (array of card indices studied)
   - card_responses (array of user responses: correct, incorrect, skip, etc.)
   - study_time_per_card (array of time spent on each card)
   - sm2_data (Spaced Repetition 2 algorithm data for each card)

2. WHEN the user presses the RIGHT ARROW key or clicks the RIGHT ARROW button, THE Frontend SHALL:
   - Move to the next flashcard
   - Update current_card_index
   - Record the time spent on the current card
   - Save the user's response (if they marked it as correct/incorrect/skip)

3. WHEN the user presses the LEFT ARROW key or clicks the LEFT ARROW button, THE Frontend SHALL:
   - Move to the previous flashcard
   - Update current_card_index
   - Allow the user to review or change their previous response

4. WHEN the user marks a card as "correct" or "incorrect", THE Frontend SHALL:
   - Record the response in card_responses
   - Update the SM2 algorithm data for that card (interval, ease factor, next_review_date)
   - Display the next card automatically (or wait for user to press arrow key)

5. WHEN the user navigates away from flashcard study, THE Frontend SHALL save the Flashcard_Progress via `POST /api/progress/flashcard/save`

6. WHEN the user returns to the same flashcard deck, THE Frontend SHALL:
   - Fetch the Flashcard_Progress via `GET /api/progress/flashcard/{session_id}`
   - Restore the user to the current_card_index
   - Display the card they were studying
   - Show their previous response (if any)
   - Allow them to continue studying

7. THE Frontend SHALL support keyboard shortcuts:
   - RIGHT ARROW or D key → Next card
   - LEFT ARROW or A key → Previous card
   - SPACE or ENTER → Mark as correct
   - X or DELETE → Mark as incorrect
   - S → Skip card
   - ESC → Exit study session

8. THE Backend SHALL store Flashcard_Progress with:
   - session_id, chapter_id, deck_id, current_card_index
   - cards_studied, card_responses, study_time_per_card
   - sm2_data (JSON with interval, ease_factor, next_review_date for each card)
   - start_time, last_updated_time, completion_percentage, accuracy_rate

9. WHEN calculating SM2 algorithm updates, THE Backend SHALL:
   - Update interval (days until next review)
   - Update ease_factor (difficulty multiplier)
   - Update next_review_date (when card should be reviewed again)
   - Store this data for spaced repetition scheduling

### Requirement 18.3: Exercise Progress Tracking

**User Story:** As a user, I want my exercise progress to be saved, so that I can resume and track my performance over time.

#### Acceptance Criteria

1. WHEN a user starts an exercise, THE Frontend SHALL create an Exercise_Progress record with:
   - session_id
   - exercise_id or chapter_id
   - current_question_index (which question they're on)
   - questions_answered (array of question indices answered)
   - user_answers (array of user's answers for each question)
   - correct_answers (array of correct answers)
   - accuracy_scores (array of accuracy scores for each question)
   - time_per_question (array of time spent on each question)

2. WHEN the user answers a question, THE Frontend SHALL:
   - Record the user_answer
   - Compare with correct_answer
   - Calculate accuracy_score
   - Mark the question as answered
   - Update the Exercise_Progress record

3. WHEN the user navigates away from an exercise, THE Frontend SHALL save the Exercise_Progress via `POST /api/progress/exercise/save`

4. WHEN the user returns to the same exercise, THE Frontend SHALL:
   - Fetch the Exercise_Progress via `GET /api/progress/exercise/{session_id}`
   - Restore the user to the current_question_index
   - Display their previous answers
   - Allow them to continue or review their answers

5. THE Backend SHALL store Exercise_Progress with:
   - session_id, exercise_id, chapter_id, current_question_index
   - questions_answered, user_answers, correct_answers, accuracy_scores
   - time_per_question, start_time, last_updated_time
   - completion_percentage, overall_accuracy_rate

### Requirement 18.4: Reading Progress Tracking

**User Story:** As a user, I want my reading progress to be saved, so that I can continue reading from where I left off.

#### Acceptance Criteria

1. WHEN a user starts reading a lesson, THE Frontend SHALL create a Reading_Progress record with:
   - session_id
   - chapter_id
   - current_paragraph_index (which paragraph they're reading)
   - current_scroll_position (scroll position in pixels)
   - paragraphs_read (array of paragraph indices read)
   - vocabulary_lookups (array of vocabulary items looked up during reading)
   - notes (user's notes or highlights)

2. WHEN the user scrolls or navigates through the text, THE Frontend SHALL update:
   - current_paragraph_index
   - current_scroll_position

3. WHEN the user looks up a vocabulary item while reading, THE Frontend SHALL:
   - Record the vocabulary_id and lookup_timestamp
   - Store this in vocabulary_lookups for learning analytics

4. WHEN the user navigates away from reading, THE Frontend SHALL save the Reading_Progress via `POST /api/progress/reading/save`

5. WHEN the user returns to the same lesson, THE Frontend SHALL:
   - Fetch the Reading_Progress via `GET /api/progress/reading/{session_id}`
   - Restore the scroll position
   - Display the paragraph they were reading
   - Show their notes and highlights

6. THE Backend SHALL store Reading_Progress with:
   - session_id, chapter_id, current_paragraph_index, current_scroll_position
   - paragraphs_read, vocabulary_lookups, notes
   - start_time, last_updated_time, completion_percentage

### Requirement 18.5: Learning Analytics and Statistics

**User Story:** As a user, I want to see my learning statistics and progress over time, so that I can track my improvement and stay motivated.

#### Acceptance Criteria

1. WHEN the user views their learning dashboard, THE Frontend SHALL display:
   - Total study time (today, this week, this month, all time)
   - Number of sessions completed (by activity type)
   - Average accuracy rate (by activity type)
   - Vocabulary learned (total, this week, this month)
   - Flashcard review schedule (cards due for review today)
   - Recent activity (last 10 sessions)

2. WHEN the user views statistics for a specific activity, THE Frontend SHALL display:
   - Completion rate (percentage of activities completed)
   - Average time per session
   - Accuracy trend (over time)
   - Most difficult items (lowest accuracy scores)
   - Most reviewed items (highest review count)

3. THE Backend SHALL provide endpoints for learning analytics:
   - `GET /api/progress/statistics` - Overall statistics
   - `GET /api/progress/statistics/{activity_type}` - Statistics by activity type
   - `GET /api/progress/timeline` - Timeline of all sessions
   - `GET /api/progress/vocabulary/learned` - List of learned vocabulary

4. WHEN calculating statistics, THE Backend SHALL:
   - Aggregate data from all Progress_Session records
   - Calculate trends and patterns
   - Identify areas for improvement
   - Generate recommendations for the user

---

## Non-Functional Requirements

### Performance
- PDF processing should complete within 5 minutes for typical 100-page textbooks
- API response times should be <500ms for status queries
- The system should support concurrent processing of up to 5 PDFs simultaneously

### Reliability
- Processing jobs should have a 99% success rate for valid PDFs
- Failed jobs should be retryable without data loss
- The system should gracefully handle API rate limits and timeouts

### Scalability
- The system should support processing PDFs up to 50MB in size
- The database should efficiently store and retrieve data for 100+ imported books
- The system should handle 10+ concurrent users without performance degradation

### Maintainability
- Code should be well-documented with clear function signatures and docstrings
- Processing pipeline should be modular and easy to extend with new steps
- Configuration should be externalized (environment variables, config files)

---

## Acceptance Criteria Testing Strategy

This section outlines how each acceptance criterion will be tested:

### Unit Tests
- PDF validation logic
- Text extraction from native text layer
- Chapter detection algorithms (TOC parsing, header detection)
- Vocabulary extraction and deduplication
- Data structure generation

### Integration Tests
- End-to-end PDF processing pipeline
- API endpoint functionality
- Database persistence and retrieval
- Error handling and recovery

### Property-Based Tests
- **Round-trip property**: Extracted vocabulary → stored in DB → retrieved from DB → matches original (with translations added)
- **Idempotence property**: Processing the same PDF twice produces identical results
- **Invariant property**: Total vocabulary count = sum of vocabulary counts across all chapters

### Manual Tests
- User workflow: Upload PDF → Monitor progress → View results in frontend
- Error scenarios: Corrupted PDF, missing API keys, network failures
- Performance: Processing time for various PDF sizes and types


### Requirement 18: Flashcard Example Analysis and Feedback (Local, No Gemini API)

**User Story:** As a user, I want to get feedback on my example sentences in flashcards without relying on expensive AI APIs, so that I can practice freely without worrying about API costs.

#### Acceptance Criteria

1. WHEN a user enters an example sentence in a flashcard, THE Backend SHALL provide analysis and feedback using local methods (no Gemini API required)
2. WHEN analyzing an example sentence, THE Backend SHALL:
   - Check if the keyword is present in the sentence
   - Analyze sentence structure (complete, fragment, list)
   - Count Chinese characters
   - Identify Chinese punctuation marks
   - Validate Chinese character encoding
3. WHEN providing feedback, THE Backend SHALL:
   - Confirm keyword presence
   - Suggest corrections for common OCR errors (similar-looking characters)
   - Provide grammar suggestions based on patterns
   - Translate the sentence to Vietnamese using LibreTranslate
4. WHEN a user requests example generation, THE Backend SHALL:
   - Use template-based examples for common word types (verb, noun, adjective, adverb)
   - Generate 3-5 example sentences using the keyword
   - Provide Vietnamese translations for each example
5. THE Backend SHALL NOT require Gemini API for example analysis or generation
6. WHEN LibreTranslate is unavailable, THE Backend SHALL still provide local analysis (structure, character count, keyword presence)
7. THE Backend SHALL cache example analysis results to avoid re-analyzing the same sentence
8. WHEN a user saves an example sentence, THE Backend SHALL store it with analysis metadata for future reference

### Requirement 19: Session Persistence and Resume Functionality

**User Story:** As a user, I want my learning sessions to be saved automatically, so that I can exit the app and resume from where I left off without losing progress.

#### Acceptance Criteria

1. WHEN a user starts a flashcard study session, THE Backend SHALL create a progress_session record with status "in_progress"
2. WHEN a user studies flashcards, THE Frontend SHALL auto-save progress every 30 seconds to `/api/progress/flashcard/save`
3. WHEN a user exits the flashcard study, THE Frontend SHALL save the final progress state
4. WHEN a user returns to flashcard study, THE Frontend SHALL fetch the last session via `/api/progress/flashcard/{session_id}`
5. IF a session exists, THE Frontend SHALL display "Resume from card X" option
6. WHEN the user clicks "Resume", THE Frontend SHALL restore the session to the last card_index and SM2 data
7. THE Backend SHALL support resuming from any activity type (flashcard, dictation, exercise, reading)
8. WHEN a user resumes a session, THE Backend SHALL update the session status to "in_progress" and last_updated_time
9. WHEN a user completes a session, THE Backend SHALL update the session status to "completed" and end_time
10. THE Backend SHALL preserve all session data (cards studied, responses, SM2 data) for historical analysis
11. WHEN a user requests their learning history, THE Backend SHALL return all completed sessions with statistics

### Requirement 20: Flashcard Keyboard Navigation and Shortcuts

**User Story:** As a user, I want to navigate flashcards using keyboard shortcuts, so that I can study efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN a user is studying flashcards, THE Frontend SHALL support the following keyboard shortcuts:
   - RIGHT ARROW or D → Next card
   - LEFT ARROW or A → Previous card
   - SPACE or ENTER → Mark as correct
   - X or DELETE → Mark as incorrect
   - S → Skip card
2. WHEN a user presses a navigation key, THE Frontend SHALL immediately move to the next/previous card
3. WHEN a user presses a response key (correct/incorrect/skip), THE Frontend SHALL:
   - Record the response
   - Update SM2 data
   - Move to the next card
   - Auto-save progress
4. THE Frontend SHALL display keyboard shortcuts in a help panel
5. WHEN a user presses H or ?, THE Frontend SHALL toggle the keyboard shortcuts display
6. THE Frontend SHALL support both uppercase and lowercase key presses
7. WHEN a user is in a text input field (example sentence), THE Frontend SHALL disable keyboard shortcuts to allow typing
