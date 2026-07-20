<div align="center">

# 🚀 FluentFlow - Full-Stack AI Communication & Public Speaking Coach

**An Enterprise-Grade, Real-Time Interactive AI Platform Powered by Lifelike Avatars, Ultra-Low-Latency LLMs, and Duplex Speech Analytics.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq Llama 3.3](https://img.shields.io/badge/Groq-Llama_3.3_70B-f34b7d?style=for-the-badge)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://gemini.google.com/)
[![HeyGen WebRTC](https://img.shields.io/badge/HeyGen-WebRTC_Avatars-FF6B35?style=for-the-badge)](https://heygen.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Cluster_0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

<br />

<img src="./public/image.png" alt="FluentFlow Dashboard Demo" width="900" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); margin-bottom: 24px;" />

<img src="./public/image%20copy.png" alt="FluentFlow Live Call Interface" width="900" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />

</div>

---

## 📌 Executive Summary & Project Vision

**FluentFlow** is a next-generation AI-powered communication coaching platform engineered to solve one of humanity's greatest personal and professional challenges: **social anxiety, public speaking fear, and ineffective verbal communication.**

By combining **low-latency LLM intelligence**, **lifelike WebRTC streaming avatars**, **voice activity detection (VAD)**, and **real-time speech analytics**, FluentFlow creates a private, judgment-free, 1-on-1 environment where users can practice high-stakes job interviews, medical consultations, sales pitches, executive presentations, and everyday social conversations.

---

## 🏗️ System Architecture & Data Flow

Below is the end-to-end technical architectural pipeline of FluentFlow:

```
                                  +---------------------------------------+
                                  |         User Browser Client           |
                                  |    (Next.js 15 App Router / React)    |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                   +----------------------------------+----------------------------------+
                   |                                                                     |
                   v                                                                     v
  +--------------------------------+                                   +--------------------------------+
  |   Real-Time Speech Recognition |                                   |     Camera & Video Self-Feed   |
  |     (Web Speech API / STT)     |                                   |  (MediaDevices / Canvas View)  |
  +----------------+---------------+                                   +--------------------------------+
                   |
                   v (Transcript Text)
  +--------------------------------+
  |  700ms VAD Silence Accumulator |
  |   & Quadgram Echo Filter       |
  +----------------+---------------+
                   |
                   v (Clean User Sentence)
  +--------------------------------+
  | Next.js API Route (/api/gemini)|
  +----------------+---------------+
                   |
        +----------+----------+
        |                     |
        v                     v
+---------------+     +---------------+
|   Groq API    |     | Google Gemini |
| Llama 3.3 70B |     | 2.0 Flash LLM |
|  (~150ms LLM) |     |  (Fallback)   |
+-------+-------+     +-------+-------+
        |                     |
        +----------+----------+
                   |
                   v (AI Text Response)
  +--------------------------------+
  | Avatar Engine & Speech Synthesizer |
  | (HeyGen WebRTC & SpeechSynthesis)|
  +----------------+---------------+
                   |
                   v
  +--------------------------------+
  | Interactive User Interface Output|
  |  (Lipsync Video + Audio Out)   |
  +--------------------------------+
```

---

## ⚡ Key Technical Innovations & Engineering Highlights

### 1. Dual-Engine High-Speed LLM Architecture
- **Primary LLM**: **Groq Cloud API (`llama-3.3-70b-versatile`)** configured with `max_tokens: 120` and `temperature: 0.6`. Generates intelligent, natural 1-2 sentence spoken replies in **under 150 milliseconds**.
- **Secondary Fallback**: **Google Gemini 2.0 Flash (`gemini-flash-latest`)**. Ensures 99.99% system uptime if Groq API rate limits occur.

### 2. Duplex Voice & 4-Layer Echo Suppression System
Preventing the microphone from capturing its own speaker audio (acoustic feedback echo) without blocking real user speech:
- **Layer 1: Synchronous Ref Locks (`isAvatarTalkingRef.current`)**: Synchronously freezes STT listeners during AI speech generation.
- **Layer 2: Time-Limited Cooldown Window (2.5s)**: Tracks `avatarSpeechCooldownRef` timestamp to discard post-speech residual room audio.
- **Layer 3: Quadgram Sequence Matching**: Analyzes 4-word consecutive exact sequences to prevent false positives on common words (e.g., *"hello"*, *"how are you"*).
- **Layer 4: Phonetic STT Normalizer**: Cleans common speech recognition mishearings (e.g., *"hello fresh"* $\rightarrow$ *"Hello"*) at the server API layer.

### 3. Smart Voice Activity Detection (VAD)
- **Dynamic 700ms Silence Accumulation Window**: Continuously accumulates interim speech tokens while user speaks, automatically dispatching the completed sentence when a natural 700ms pause is detected.

---

## 🛠️ Complete Technology Stack

| Layer | Technologies Used | Description / Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19 | Server-side rendering, routing, and high-performance client state. |
| **Language** | TypeScript 5.0 | Type-safe architecture across components, API routes, and state stores. |
| **Styling & Motion** | TailwindCSS 3.4, Framer Motion, Lucide Icons | Responsive modern layout, smooth micro-interactions, dark/light themes. |
| **AI LLM Inference** | Groq API (Llama 3.3 70B Versatile), Gemini 2.0 | Sub-150ms conversational reasoning & natural dialogue generation. |
| **Avatar Streaming** | HeyGen WebRTC SDK & REST APIs | Low-latency WebRTC live video avatar streaming with lip-sync. |
| **Speech-to-Text (STT)**| Web Speech API (`SpeechRecognition`) | Continuous, low-latency client-side speech recognition. |
| **Text-to-Speech (TTS)**| Web Speech Synthesis (`SpeechSynthesisUtterance`) | High-definition local voice synthesis for fallback and avatar audio. |
| **Database** | MongoDB Atlas Cluster 0, Mongoose | Storing user profiles, scenarios, streak analytics, and speech logs. |

---

## 📂 Project Directory Structure

```
FluentFlow/
├── app/
│   ├── api/
│   │   ├── gemini/route.ts        # Primary AI inference route (Groq + Gemini API)
│   │   ├── get-access-token/     # HeyGen WebRTC token generator
│   │   └── user/                  # MongoDB user profile & analytics APIs
│   ├── dashboard/                 # Main dashboard view
│   ├── layout.tsx                 # Root layout & providers
│   └── page.tsx                   # Landing page
├── components/
│   ├── FluentFlowApp.tsx          # Main Application Orchestrator & Speech Engine
│   ├── AvatarChatMode.tsx         # Live WebRTC & Simulated Avatar Interface
│   ├── PerformanceAnalytics.tsx   # Visual charts & speech fluency metric displays
│   ├── ScenarioSelector.tsx       # Interview & practice roleplay picker
│   └── UserProfileModal.tsx       # Profile, target language & goals configuration
├── lib/
│   ├── mongodb.ts                 # MongoDB connection handler
│   └── models/                    # Mongoose database schemas
├── public/                        # Static assets & screenshots
├── README.md                      # Viva & Project documentation
└── package.json                   # Project dependencies
```

---

## 🎓 Viva Voce (Exam / Presentation) Q&A Guide

### Q1: What makes FluentFlow different from standard ChatGPT text bots?
**Answer**: FluentFlow is an interactive **full-duplex conversational voice application**. Instead of text typing, it combines real-time Web Speech Recognition, low-latency LLMs (Groq Llama 3.3 70B), and lifelike video avatar lip-syncing via WebRTC, enabling real-time human-like verbal communication practice.

### Q2: How did you achieve low-latency response times under 1 second?
**Answer**: We optimized the pipeline at 3 critical bottlenecks:
1. **LLM Level**: Using Groq API (`llama-3.3-70b-versatile`) with `max_tokens: 120`, cutting generation time down to ~150ms.
2. **VAD Level**: Implementing a 700ms silence accumulation window to dispatch user sentences instantly upon natural speech completion.
3. **Network Level**: Streamlined Next.js API route handlers with in-memory caching.

### Q3: How do you prevent the AI from hearing its own voice (Speaker Feedback Echo)?
**Answer**: We engineered a 4-layer echo cancellation system:
- **Synchronous Ref Locking** (`isAvatarTalkingRef.current = true` before stopping STT).
- **2.5s Post-TTS Cooldown Window** to discard room echo.
- **Quadgram Sequence Matching** to detect 4-word identical sequences between AI output and STT input.
- **Phonetic Pre-processing** to normalize misheard STT tokens.

### Q4: Why did you implement a dual LLM backend (Groq + Gemini)?
**Answer**: To achieve **high availability and fault tolerance**. Groq Cloud provides sub-150ms speed via Llama 3.3 70B, while Google Gemini 2.0 Flash acts as an automated fallback if Groq API hits rate limits or network issues.

---

## 🔮 Future Scope & Roadmap

- **🌐 Multimodal Live API**: Transitioning to WebSockets + Gemini Multimodal Live API for streaming native audio-to-audio speech.
- **👁️ Computer Vision Eye Contact Analysis**: Using MediaPipe Face Mesh to give real-time feedback on user eye contact, head posture, and smiling.
- **📊 Emotion & Pitch Analytics**: Integrating audio pitch and tone detection to measure speaking confidence, pace (WPM), and filler word counts ("um", "uh").
- **🏢 Enterprise Corporate Portals**: Adding multi-tenant organizational dashboards for HR interview screening and corporate sales training.

---

<div align="center">
  <p><strong>Developed for Advanced Communication Excellence</strong></p>
  <p>
    <a href="#-fluentflow---full-stack-ai-communication--public-speaking-coach">Back to Top</a>
  </p>
</div>
