# Implementation Plan: Server-Side PDF Processing & Learning Progress Tracking

## Overview

This implementation plan breaks down the server-side PDF processing feature into discrete, sequential tasks. The system will move PDF extraction and AI processing from the frontend to a Python FastAPI backend, enabling faster processing, better reliability, and persistent storage. The frontend will be updated to upload PDFs, monitor progress, and display results. Learning progress tracking will be implemented to save user sessions and calculate statistics using the SM2 spaced repetition algorithm.

The implementation follows a layered approach:
1. **Phase 1**: Core infrastructure (database, API setup, PDF upload)
2. **Phase 2**: Text extraction pipeline (native + OCR)
3. **Phase 3**: Content section detection (vocabulary, lesson, grammar, exercises)
4. **Phase 4**: On-demand AI processing (Gemini, MyMemory)
5. **Phase 5**: Learning progress tracking (sessions, SM2, statistics)
6. **Phase 6**: Frontend integration and UI updates

---

## Tasks

### Phase 1: Core Infrastructure & Database Setup

- [ ] 1. Set up FastAPI project structure and database schema
  - Create FastAPI application with proper project structure (app/, models/, services/, routes/)
  - Create SQLite database schema with all tables (books, chapters, content_sections, vocabulary_items, grammar_items, exercise_items, processing_jobs)
  - Create database connection and session management utilities
  - Set up environment configuration (.env file handling)
  - _Requirements: 1, 9, 15_

- [ ] 2. Implement core data models and database utilities
  - Create SQLAlchemy ORM models for all database tables
  - Implement database initialization and migration utilities
  - Create helper functions for CRUD operations on books, chapters, and content sections
  - Set up database indexes for performance optimization
  - _Requirements: 9, 14_

- [ ] 3. Create PDF upload endpoint and file handling
  - Implement `POST /api/pdf/upload` endpoint
  - Add PDF file validation (MIME type, file size, PDF format validation)
  - Create temporary file storage with secure permissions
  - Generate unique job_id and create Processing_Job record
  - Return job_id to frontend
  - _Requirements: 1, 15_

- [ ] 4. Implement job status tracking and progress updates
  - Create `GET /api/pdf/status/{job_id}` endpoint
  - Implement status update mechanism (pending → extracting_text → sections_detected → extraction_complete)
  - Add progress percentage calculation
  - Add current_step description and estimated_time_remaining
  - Return section status information
  - _Requirements: 11, 13_

- [ ]* 4.1 Write property test for job status tracking
  - **Property 1: Status progression invariant**
  - **Validates: Requirements 11**

- [ ] 5. Create book and chapter retrieval endpoints
  - Implement `GET /api/books` endpoint to list all imported books
  - Implement `GET /api/books/{book_id}/chapters` endpoint
  - Implement `GET /api/chapters/{chapter_id}/sections` endpoint
  - Return proper JSON response format with section metadata
  - _Requirements: 9, 13_

### Phase 2: Text Extraction Pipeline

- [ ] 6. Implement native PDF text extraction
  - Create TextExtractionService class
  - Implement native text extraction using PyPDF2 or pdfplumber
  - Calculate text density (characters per page)
  - Determine if native text is sufficient (>30 chars/page threshold)
  - Store raw_text for each page
  - _Requirements: 2, 14_

- [ ] 7. Implement OCR pipeline with RapidOCR
  - Create OCR service wrapper for RapidOCR
  - Implement PDF to image conversion (scale factor 1.2x)
  - Implement parallel OCR processing (4-8 pages simultaneously)
  - Handle OCR failures gracefully (log and continue)
  - Store OCR results with confidence scores
  - _Requirements: 2, 8, 14_

- [ ] 8. Implement intelligent text extraction strategy
  - Create extraction orchestrator that chooses native vs OCR
  - Implement fallback logic (native → OCR if insufficient text)
  - Update Processing_Job status during extraction
  - Handle extraction errors and update job status to "error"
  - _Requirements: 2, 10, 16_

- [ ]* 8.1 Write property test for text extraction idempotence
  - **Property 2: Idempotence property**
  - **Validates: Requirements 2, 14**

- [ ] 9. Implement chapter detection from Table of Contents
  - Create ChapterDetectionService class
  - Implement TOC parsing (Strategy A: 目录 detection)
  - Extract chapter titles and page numbers from TOC
  - Create Chapter records with title and page_range
  - _Requirements: 3, 13_

- [ ] 10. Implement chapter detection from headers
  - Implement header pattern matching (Strategy B: 第X课, Lesson X patterns)
  - Scan extracted text for chapter headers
  - Create Chapter records from detected headers
  - _Requirements: 3_

- [ ] 11. Implement fallback chapter detection
  - Implement single-chapter fallback (Strategy C)
  - Treat entire PDF as one chapter if no TOC or headers found
  - Create Chapter record with full page range
  - _Requirements: 3_

- [ ]* 11.1 Write property test for chapter detection consistency
  - **Property 3: Chapter boundary consistency**
  - **Validates: Requirements 3**

- [ ] 12. Checkpoint - Ensure text extraction and chapter detection work
  - Test PDF upload with various PDF types (native text, scanned, mixed)
  - Verify chapter detection with different PDF structures
  - Verify Processing_Job status updates correctly
  - Ask the user if questions arise.

### Phase 3: Content Section Detection

- [ ] 13. Implement vocabulary section detection and extraction
  - Create ContentSectionService class
  - Implement vocabulary section detection (生词 markers)
  - Parse vocabulary items (Chinese, pinyin, definitions)
  - Deduplicate vocabulary within chapter
  - Store raw_text vocabulary items with processing_status="pending"
  - _Requirements: 4, 4.1_

- [ ] 14. Implement lesson content section detection
  - Implement lesson section detection (课文, 正文, 课程内容 markers)
  - Extract lesson text preserving structure (line breaks, paragraphs)
  - Store raw_text lesson content with processing_status="pending"
  - _Requirements: 6_

- [ ] 15. Implement grammar section detection and extraction
  - Implement grammar section detection (语法, 语法点, 语法讲解 markers)
  - Parse grammar rules, explanations, and examples
  - Store raw_text grammar content with processing_status="pending"
  - _Requirements: 7_

- [ ] 16. Implement exercise section detection and extraction
  - Implement exercise section detection (练习, 习题, 练习题, 活动 markers)
  - Identify exercise types (multiple choice, fill-blank, true/false, etc.)
  - Extract questions, options, and answer keys
  - Store raw_text exercises with processing_status="pending"
  - _Requirements: 8_

- [ ]* 16.1 Write property test for section detection invariant
  - **Property 4: Section count invariant**
  - **Validates: Requirements 4, 4.1, 6, 7, 8**

- [ ] 17. Create content section retrieval endpoints
  - Implement `GET /api/chapters/{chapter_id}/vocabulary` endpoint
  - Implement `GET /api/chapters/{chapter_id}/lesson` endpoint
  - Implement `GET /api/chapters/{chapter_id}/grammar` endpoint
  - Implement `GET /api/chapters/{chapter_id}/exercises` endpoint
  - Return processed or raw content based on processing_status
  - _Requirements: 9, 13_

- [ ] 18. Checkpoint - Ensure content section detection works
  - Test section detection with various chapter structures
  - Verify all section types are detected correctly
  - Verify raw_text is stored properly
  - Ask the user if questions arise.

### Phase 4: On-Demand AI Processing

- [ ] 19. Implement Gemini Vision API integration
  - Create AIProcessingService class
  - Implement Gemini Vision API client
  - Implement vocabulary validation (pinyin correction)
  - Implement text correction for OCR errors
  - Add error handling and retry logic with exponential backoff
  - _Requirements: 5, 16_

- [ ] 20. Implement MyMemory translation API integration
  - Implement MyMemory API client for Chinese→Vietnamese translation
  - Add batching logic (5-10 items per request)
  - Add rate limiting (300ms between requests)
  - Add timeout handling (30 seconds per request)
  - _Requirements: 5_

- [ ] 21. Implement translation fallback logic
  - Implement fallback from MyMemory to Gemini if translation fails
  - Mark failed translations as "translation_pending"
  - Allow manual correction later
  - _Requirements: 5, 16_

- [ ] 22. Implement caching system for translations
  - Create cache storage (in-memory or Redis)
  - Implement cache key generation (chinese_word → vietnamese_translation)
  - Implement cache invalidation (30-day TTL)
  - Implement cache hit/miss tracking for metrics
  - _Requirements: 5, 14_

- [ ] 23. Implement on-demand vocabulary processing endpoint
  - Create `POST /api/chapters/{chapter_id}/process/vocabulary` endpoint
  - Orchestrate vocabulary extraction → validation → translation → storage
  - Update section processing_status to "processed"
  - Return processed vocabulary items
  - _Requirements: 5, 4.1_

- [ ] 24. Implement on-demand lesson processing endpoint
  - Create `POST /api/chapters/{chapter_id}/process/lesson` endpoint
  - Orchestrate lesson extraction → correction → translation
  - Segment content into sentences
  - Extract key phrases and idioms
  - Store processed lesson with metadata (word count, sentence count, difficulty)
  - _Requirements: 5, 6_

- [ ] 25. Implement on-demand grammar processing endpoint
  - Create `POST /api/chapters/{chapter_id}/process/grammar` endpoint
  - Orchestrate grammar extraction → correction → translation
  - Identify grammar categories (verb tenses, sentence structures, particles)
  - Generate additional examples if needed
  - Store processed grammar with metadata (grammar_type, difficulty_level, example_count)
  - _Requirements: 5, 7_

- [ ] 26. Implement on-demand exercise processing endpoint
  - Create `POST /api/chapters/{chapter_id}/process/exercise` endpoint
  - Orchestrate exercise extraction → correction → translation
  - Validate exercise format and structure
  - Extract answer keys and explanations
  - Categorize exercises by type and difficulty
  - Store processed exercises with metadata
  - _Requirements: 5, 8_

- [ ]* 26.1 Write property test for round-trip consistency
  - **Property 5: Round-trip consistency**
  - **Validates: Requirements 5, 4.1, 6, 7, 8**

- [ ] 27. Implement processing job sub-tasks for on-demand processing
  - Create sub-job tracking for section processing
  - Update sub-job status (processing_{section_type} → {section_type}_processed)
  - Track progress for long-running AI processing
  - _Requirements: 11_

- [ ] 28. Checkpoint - Ensure AI processing works
  - Test vocabulary processing with various vocabulary formats
  - Test lesson processing with OCR text
  - Test grammar and exercise processing
  - Verify caching works correctly
  - Ask the user if questions arise.

### Phase 5: Learning Progress Tracking

- [ ] 29. Implement progress session management
  - Create ProgressSessionService class
  - Implement `POST /api/progress/save` endpoint for generic sessions
  - Create progress_sessions table records
  - Support activity types: dictation, flashcard, exercise, reading
  - _Requirements: 18_

- [ ] 30. Implement flashcard progress tracking
  - Create `POST /api/progress/flashcard/save` endpoint
  - Create `GET /api/progress/flashcard/{session_id}` endpoint
  - Store flashcard_progress records with all required fields
  - Support resuming from last card_index
  - _Requirements: 18.2_

- [ ] 31. Implement SM2 spaced repetition algorithm
  - Create SM2Service class
  - Implement SM2 algorithm (interval, ease_factor, next_review_date calculation)
  - Handle three response types: correct (2), skip (1), incorrect (0)
  - Update SM2 data for each card based on response
  - _Requirements: 18.2_

- [ ]* 31.1 Write property test for SM2 algorithm correctness
  - **Property 6: SM2 interval invariant**
  - **Validates: Requirements 18.2**

- [ ] 32. Implement dictation progress tracking
  - Create `POST /api/progress/dictation/save` endpoint
  - Create `GET /api/progress/dictation/{session_id}` endpoint
  - Store dictation_progress records with sentence tracking
  - Support resuming from last sentence and timestamp
  - _Requirements: 18.1_

- [ ] 33. Implement exercise progress tracking
  - Create `POST /api/progress/exercise/save` endpoint
  - Create `GET /api/progress/exercise/{session_id}` endpoint
  - Store exercise_progress records with question tracking
  - Calculate accuracy scores for each question
  - _Requirements: 18.3_

- [ ] 34. Implement reading progress tracking
  - Create `POST /api/progress/reading/save` endpoint
  - Create `GET /api/progress/reading/{session_id}` endpoint
  - Store reading_progress records with scroll position and vocabulary lookups
  - Support resuming from last paragraph and scroll position
  - _Requirements: 18.4_

- [ ] 35. Implement learning statistics calculation
  - Create StatisticsService class
  - Implement `GET /api/progress/statistics` endpoint
  - Calculate total_study_time, sessions_completed, average_accuracy
  - Calculate vocabulary_learned, flashcards_due_today
  - _Requirements: 18.5_

- [ ] 36. Implement activity-specific statistics endpoints
  - Implement `GET /api/progress/statistics/{activity_type}` endpoint
  - Calculate completion_rate, average_time_per_session, accuracy_trend
  - Identify most difficult and most reviewed items
  - _Requirements: 18.5_

- [ ] 37. Implement timeline and learned vocabulary endpoints
  - Implement `GET /api/progress/timeline` endpoint
  - Implement `GET /api/progress/vocabulary/learned` endpoint
  - Return recent activity and learned vocabulary list
  - _Requirements: 18.5_

- [ ]* 37.1 Write property test for statistics invariant
  - **Property 7: Statistics aggregation invariant**
  - **Validates: Requirements 18.5**

- [ ] 38. Checkpoint - Ensure progress tracking works
  - Test flashcard progress save and resume
  - Test SM2 algorithm with various responses
  - Test dictation progress with timestamps
  - Test statistics calculation
  - Ask the user if questions arise.

### Phase 6: Frontend Integration & UI Updates

- [ ] 39. Update frontend state management for server-side processing
  - Add state.books array for imported books
  - Add state.currentProcessingJob for upload progress
  - Add state.progressSessions for active learning sessions
  - Add state.learningStatistics for dashboard data
  - _Requirements: 12_

- [ ] 40. Implement PDF upload modal with progress tracking
  - Create PDFUploadModal component
  - Implement file input and validation
  - Implement progress bar with status updates
  - Poll `/api/pdf/status/{job_id}` every 2 seconds
  - Display section status (vocabulary, lesson, grammar, exercises)
  - _Requirements: 1, 11, 12_

- [ ] 41. Implement section processing UI
  - Add buttons to trigger on-demand processing for each section
  - Display processing status for each section
  - Show "Process Vocabulary", "Process Lesson", etc. buttons
  - Update UI when processing completes
  - _Requirements: 4, 12_

- [ ] 42. Update flashcard study component with keyboard navigation
  - Implement keyboard shortcuts (RIGHT/D, LEFT/A, SPACE/ENTER, X/DELETE, S)
  - Implement arrow key navigation
  - Display keyboard shortcuts help
  - Auto-save progress every 30 seconds
  - _Requirements: 18.2_

- [ ] 43. Implement flashcard resume functionality
  - Fetch last flashcard_progress session on component load
  - Restore to current_card_index
  - Display "Resume from card X" option
  - Allow user to start fresh or resume
  - _Requirements: 18.2_

- [ ] 44. Update dictation component with progress tracking
  - Implement progress save on audio timestamp changes
  - Implement resume from last sentence and timestamp
  - Display sentence counter and progress
  - Auto-save progress every 30 seconds
  - _Requirements: 18.1_

- [ ] 45. Update exercise component with progress tracking
  - Implement progress save after each question
  - Implement resume from last question
  - Display question counter and accuracy
  - Auto-save progress every 30 seconds
  - _Requirements: 18.3_

- [ ] 46. Update reading component with progress tracking
  - Implement scroll position tracking
  - Implement vocabulary lookup tracking
  - Implement resume from last scroll position
  - Auto-save progress every 30 seconds
  - _Requirements: 18.4_

- [ ] 47. Create learning dashboard component
  - Display total study time (today, week, month, all-time)
  - Display sessions completed by activity type
  - Display average accuracy rate
  - Display vocabulary learned count
  - Display flashcards due today
  - _Requirements: 18.5_

- [ ] 48. Implement learning statistics display
  - Fetch `/api/progress/statistics` on dashboard load
  - Display completion rates by activity type
  - Display accuracy trends
  - Display most difficult and most reviewed items
  - _Requirements: 18.5_

- [ ] 49. Implement activity timeline view
  - Fetch `/api/progress/timeline` endpoint
  - Display recent sessions in chronological order
  - Show activity type, duration, accuracy for each session
  - _Requirements: 18.5_

- [ ] 50. Update library page to display imported books
  - Fetch `/api/books` endpoint
  - Display list of imported books with chapter counts
  - Show processing status for each book
  - Allow users to delete books via `DELETE /api/books/{book_id}`
  - _Requirements: 9, 12_

- [ ] 51. Implement chapter detail view
  - Fetch `/api/chapters/{chapter_id}/sections` endpoint
  - Display available sections with processing status
  - Show "Process" buttons for pending sections
  - Display processed content when available
  - _Requirements: 9, 12_

- [ ] 52. Checkpoint - Ensure frontend integration works
  - Test PDF upload flow end-to-end
  - Test section processing from UI
  - Test flashcard keyboard navigation and resume
  - Test progress tracking for all activity types
  - Test learning dashboard and statistics
  - Ask the user if questions arise.

### Phase 7: Error Handling, Logging & Optimization

- [ ] 53. Implement comprehensive error handling
  - Add try-catch blocks to all API endpoints
  - Return appropriate HTTP status codes (400, 404, 422, 500)
  - Return consistent error response format
  - Log all errors with context
  - _Requirements: 10, 17_

- [ ] 54. Implement logging and monitoring
  - Create logging configuration
  - Log Processing_Job lifecycle (create, start, complete, error)
  - Log API call metrics (duration, status, error)
  - Log AI API calls (request size, response time, status)
  - Create log files for each Processing_Job
  - _Requirements: 17_

- [ ] 55. Implement metrics tracking
  - Track total PDFs processed
  - Track average processing time (extraction vs on-demand)
  - Track success rate by section type
  - Track API call counts and latencies
  - Track error rates by type
  - Track cache hit rates
  - _Requirements: 17_

- [ ] 56. Implement request validation and sanitization
  - Validate all API request inputs
  - Sanitize file names and user inputs
  - Implement rate limiting (max 10 uploads per user per hour)
  - _Requirements: 10, 15_

- [ ] 57. Implement API key security
  - Store API keys in environment variables
  - Never log API keys
  - Implement key rotation mechanism
  - _Requirements: 15_

- [ ] 58. Optimize database queries
  - Add indexes for frequently queried columns
  - Implement query result caching
  - Optimize JOIN queries for related data
  - _Requirements: 14_

- [ ] 59. Optimize API response times
  - Implement response pagination for large result sets
  - Implement lazy loading for related data
  - Compress JSON responses
  - _Requirements: 14_

- [ ] 60. Implement cleanup and maintenance tasks
  - Create background task to delete temporary PDF files after processing
  - Create background task to clean up old processing jobs
  - Create background task to invalidate expired cache entries
  - _Requirements: 15_

- [ ] 61. Checkpoint - Ensure error handling and optimization complete
  - Test error scenarios (corrupted PDF, missing API keys, network failures)
  - Verify logging captures all important events
  - Verify metrics are tracked correctly
  - Verify performance meets requirements (extraction <5 min, API <500ms)
  - Ask the user if questions arise.

### Phase 8: Testing & Verification

- [ ] 62. Write unit tests for text extraction functions
  - Test native text extraction with various PDF types
  - Test OCR with scanned images
  - Test text density calculation
  - Test extraction strategy selection
  - _Requirements: 2, 14_

- [ ] 63. Write unit tests for chapter detection
  - Test TOC parsing
  - Test header pattern matching
  - Test single-chapter fallback
  - _Requirements: 3_

- [ ] 64. Write unit tests for content section detection
  - Test vocabulary section detection
  - Test lesson section detection
  - Test grammar section detection
  - Test exercise section detection
  - _Requirements: 4, 4.1, 6, 7, 8_

- [ ] 65. Write unit tests for SM2 algorithm
  - Test correct response handling
  - Test incorrect response handling
  - Test skip response handling
  - Test interval and ease_factor calculations
  - _Requirements: 18.2_

- [ ] 66. Write unit tests for statistics calculations
  - Test total_study_time calculation
  - Test average_accuracy calculation
  - Test completion_rate calculation
  - Test vocabulary_learned counting
  - _Requirements: 18.5_

- [ ] 67. Write integration tests for PDF processing pipeline
  - Test end-to-end PDF upload → extraction → section detection
  - Test on-demand processing workflow
  - Test database persistence and retrieval
  - _Requirements: 2, 3, 4, 9_

- [ ] 68. Write integration tests for API endpoints
  - Test all PDF processing endpoints
  - Test all progress tracking endpoints
  - Test all statistics endpoints
  - _Requirements: 13_

- [ ] 69. Write integration tests for progress tracking workflow
  - Test flashcard progress save and resume
  - Test dictation progress with timestamps
  - Test exercise progress with accuracy calculation
  - Test reading progress with scroll position
  - _Requirements: 18, 18.1, 18.2, 18.3, 18.4_

- [ ] 70. Final checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Verify code coverage >80%
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for course correction
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a layered approach: infrastructure → extraction → processing → tracking → integration
- Frontend and backend tasks can be parallelized after Phase 3 is complete
- All API endpoints should follow the consistent response format defined in Requirement 13
- All error scenarios should be handled gracefully with appropriate HTTP status codes and error messages
