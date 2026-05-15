# CampusOS Setup Guide

## 1. Install Dependencies
```bash
cd display
npm install
```

## 2. Firebase Setup

1. Go to https://console.firebase.google.com
2. Create a new project (e.g., "campusos")
3. Enable **Authentication** → Email/Password
4. Create **Firestore Database** (start in test mode, then apply rules)
5. Get your config from Project Settings → Your Apps → Web App

## 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OLLAMA_URL=http://localhost:11434
```

## 4. Apply Firebase Security Rules

In Firebase Console → Firestore → Rules, paste the content of `firestore.rules`

## 5. Set Up Admin Account

After registering your first account, go to Firebase Console → Firestore → users collection → find your user document → change `role` from `"student"` to `"admin"`

## 6. Run the App
```bash
npm run dev
```
Opens at http://localhost:5173

## 7. AI Study Buddy (Optional)

Install Ollama from https://ollama.ai, then:
```bash
ollama pull llama3
ollama serve
```
The AI buddy will automatically connect when Ollama is running.

## Project Structure

```
src/
  App.jsx              — Routes
  main.jsx             — React entry
  index.css            — Tailwind + global styles
  firebase/
    config.js          — Firebase init
  context/
    AuthContext.jsx    — Auth state + login/register/logout
  data/
    constants.js       — Branch options, skills, etc.
  layouts/
    MainLayout.jsx     — Sidebar + TopNav wrapper
  components/
    Sidebar.jsx        — Left navigation
    TopNav.jsx         — Top bar with search/notifications
    ui/                — Reusable components (Modal, Skeleton, EmptyState)
  pages/               — All 15 feature pages
  services/
    aiService.js       — Ollama streaming API
    firebaseService.js — All Firestore CRUD operations
```

## Features Implemented

- ✅ Firebase Auth (email/password)
- ✅ Registration with all PRD fields (no Year/College Email)
- ✅ Role-based access (admin/student)
- ✅ Multi-step onboarding flow
- ✅ Dashboard with live widgets
- ✅ Skill Directory with search/filter
- ✅ Problem Pool (anonymous questions, comments, upvotes)
- ✅ Real-time Direct Messaging (Firestore listeners)
- ✅ Study Group Finder (join/leave)
- ✅ Opportunity Feed (with admin posting)
- ✅ Achievement Wall (with likes)
- ✅ Project Showcase (GitHub/demo links)
- ✅ Challenges Board
- ✅ AI Study Buddy (Ollama streaming with markdown)
- ✅ Campus Polls (live vote tracking)
- ✅ Lost & Found
- ✅ Profile Page (editable)
- ✅ Admin Panel (user management, reports)
- ✅ Notifications system
- ✅ Dark mode first
- ✅ Responsive (mobile sidebar collapses)
- ✅ Framer Motion animations throughout
- ✅ Loading skeletons + empty states
- ✅ Firebase Security Rules (role-based)
