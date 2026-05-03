# 🈶 Học Tiếng Trung - Interactive Chinese Learning Platform

An interactive web application for learning Chinese with OCR, flashcards, exercises, and AI assistance.

## Features

### 📚 Core Features
- **📖 Library (Giáo Trình)** - Import PDF textbooks and manage chapters
- **🃏 Flashcards** - SM-2 spaced repetition algorithm for efficient learning
- **✏️ Exercises** - 6 types of exercises (Multiple Choice, Translation, Fill-in-the-blank, Rearrange, Error Detection, Position)
- **🎧 Dictation** - Listening comprehension practice
- **📊 Diagnostics** - Track progress and identify weak areas
- **🤖 AI Assistant** - Chat helper and sentence checking with free APIs

### 🔧 Technical Features
- **OCR Processing** - Extract text from PDF using RapidOCR
- **Session Persistence** - Auto-save progress every 30 seconds
- **Keyboard Navigation** - Efficient shortcuts for flashcards and exercises
- **Free APIs** - No Gemini API required, uses LibreTranslate and MyMemory
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- PDF.js for PDF rendering
- Marked.js for Markdown parsing

### Backend
- Python 3.11+
- FastAPI for REST API
- RapidOCR for text extraction
- SQLite for data storage

### Deployment
- Vercel for frontend hosting
- Python backend for OCR and AI features

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ (for Vercel deployment)
- Git

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chinese-learning-app.git
cd chinese-learning-app
```

2. **Install Python dependencies**
```bash
pip install fastapi uvicorn rapidocr-onnxruntime requests pillow
```

3. **Start the backend server**
```bash
python ocr_server.py
```

4. **Open the application**
- Navigate to `http://127.0.0.1:8000` in your browser
- Or double-click `open-app.bat` (Windows)

## Project Structure

```
chinese-learning-app/
├── index.html              # Main application
├── css/
│   └── style.css          # Application styling
├── js/
│   ├── core.js            # Core functionality
│   ├── flashcards.js      # Flashcard system
│   ├── library.js         # Library management
│   ├── exercises.js       # Exercise system
│   ├── dictation.js       # Dictation practice
│   ├── ai-fix.js          # AI features
│   ├── export.js          # Export functionality
│   ├── backup.js          # Backup system
│   └── chat.js            # AI chat
├── ocr_server.py          # FastAPI backend
├── app_data.db            # SQLite database
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## Usage

### Adding Vocabulary
1. Go to **📚 Giáo Trình** (Library)
2. Choose one of:
   - Upload PDF for automatic extraction
   - Create manual chapter and add vocabulary
   - Import CSV/Excel file

### Studying with Flashcards
1. Go to **🃏 Flashcard**
2. Select a chapter or study all vocabulary
3. Use keyboard shortcuts:
   - **Enter** - Flip card / Submit answer
   - **←/A** - Previous card
   - **→/D** - Next card
   - **Space** - Mark as correct
   - **X** - Mark as incorrect
   - **S** - Skip card
   - **H** - Show keyboard help

### Practicing Exercises
1. Go to **✏️ Bài tập** (Exercises)
2. Choose exercise type or comprehensive exercises
3. Answer questions and get detailed feedback
4. Use keyboard shortcuts:
   - **Enter** (1st) - Submit answer
   - **Enter** (2nd) - Next question
   - **←/A** - Previous question
   - **→/D** - Next question

### Checking Sentences
1. In Flashcard, write a sentence with the vocabulary
2. Click **🤖 Nhờ AI kiểm tra** (Ask AI to check)
3. Get feedback on:
   - Keyword usage
   - Translation
   - Grammar patterns
   - Suggestions for improvement

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit: Chinese learning app"
git push origin main
```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework: Other
     - Root Directory: ./
     - Build Command: (leave empty)
     - Output Directory: ./

3. **Set Environment Variables** (if needed)
   - Add any API keys or configuration

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Backend Deployment

For full functionality with OCR, you'll need to deploy the Python backend separately:

**Option 1: Railway.app**
```bash
# Create railway.json
{
  "build": {
    "builder": "nixpacks"
  }
}

# Deploy
railway up
```

**Option 2: Render.com**
- Connect GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn ocr_server:app --host 0.0.0.0 --port $PORT`

**Option 3: Heroku**
```bash
heroku create your-app-name
git push heroku main
```

## API Endpoints

### Flashcard
- `GET /api/progress/flashcard/{sessionId}` - Get session progress
- `POST /api/progress/flashcard` - Save progress

### OCR
- `POST /api/ocr/extract` - Extract text from PDF
- `POST /api/pdf/upload` - Upload PDF file
- `GET /api/pdf/list` - List cached PDFs

### AI
- `POST /api/ai/analyze-sentence` - Analyze sentence

## Features in Development

- [ ] Audio pronunciation with TTS
- [ ] Spaced repetition optimization
- [ ] Community vocabulary sharing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Gamification system

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: your-email@example.com

## Acknowledgments

- RapidOCR for text extraction
- FastAPI for backend framework
- Vercel for hosting
- LibreTranslate and MyMemory for free translation APIs

---

**Made with ❤️ for Chinese learners**
