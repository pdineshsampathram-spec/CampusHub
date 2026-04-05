# 🚀 CampusHub 2.0 – Smart Campus Platform

CampusHub 2.0 is a **full-stack smart campus ecosystem** designed to simplify student life by combining campus services with intelligent features like **AI-powered StudySync, group collaboration, and smart assistants**.

---

## 🌟 Key Features

### 🧠 StudySync (Core Feature)

* AI-based study group matching
* Matches students based on:

  * Subjects
  * Availability
  * Skill level
* Generates:

  * Study groups (2–4 members)
  * Compatibility score
  * Suggested meeting time

---

### 💬 Group Collaboration

* Real-time group chat
* Context-aware AI assistant (CampusBot)
* Persistent chat (stored in MongoDB)

---

### 🤖 AI Assistant (CampusBot)

* Powered by Gemini AI
* Helps with:

  * Concept explanations (DSA, etc.)
  * Study guidance
  * Campus-related queries
* Context-aware responses using chat history

---

### 📂 File Sharing System

* Upload study materials (PDF, images, docs)
* Files stored and linked to study groups
* Accessible by all group members

---

### 📝 AI Quiz Generator

* Generate quizzes from topics
* Multiple-choice questions
* Helps reinforce learning

---

### 📚 Campus Services

* 🍔 Food ordering system
* 📖 Library seat booking
* 📄 Certificate requests
* 🔔 Exam alerts
* 🧾 Complaint system

---

## 🏗 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Vite

### Backend

* FastAPI
* Python

### Database

* MongoDB Atlas

### AI Integration

* Google Gemini API (`google-generativeai`)

---

## ⚙️ System Architecture

```
Frontend (React)
        ↓
FastAPI Backend
        ↓
MongoDB Atlas
        ↓
AI (Gemini API)
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/campushub.git
cd campushub
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_api_key
```

Run backend:

```bash
uvicorn main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on:

```
http://localhost:5173
```

---

## 📂 Project Structure

```
campushub/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── main.py
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
└── README.md
```

---

## 🔥 Unique Selling Points

* AI-driven study group matching
* Chat + AI + file sharing in one platform
* Smart campus services integration
* Clean modern UI (dark theme + neon style)

---

## 🧪 Future Improvements

* WebSocket real-time chat
* AI-based study recommendations
* Notification system
* Mobile app version

---

## 🎯 Hackathon Value

This project focuses on:

* Solving real student problems
* Combining AI with practical use-cases
* Delivering a complete, scalable system

---

## 👨‍💻 Author

**Dinesh**

---

## 📜 License

This project is for educational and hackathon purposes.
