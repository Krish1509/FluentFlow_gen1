# 🚀 FluentFlow - AI Communication Coach

[![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC)](https://tailwindcss.com/)
[![HeyGen](https://img.shields.io/badge/HeyGen-AI_Avatars-FF6B35)](https://heygen.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.0-4285F4)](https://gemini.google.com/)

<div align="center">
  <img src="./public/demo.png" alt="FluentFlow Demo" width="800"/>
  <p><em>Master communication skills with AI-powered avatars and real-time feedback</em></p>
</div>

## ✨ What is FluentFlow?

**FluentFlow** is a revolutionary AI-powered communication coaching platform that combines cutting-edge streaming avatars with advanced conversational AI to help you master communication skills. Whether you're preparing for job interviews, practicing presentations, improving customer service skills, or simply building confidence in conversations, FluentFlow provides an immersive, interactive learning experience.

### 🎯 Key Features

#### 🤖 Dual AI Interaction Modes
- **Avatar Chat Mode**: Real-time video conversations with lifelike AI avatars
- **Gemini Text Chat**: Intelligent text-based conversations with Google Gemini AI

#### 🎭 Multiple Avatar Personalities
- 👩‍⚕️ **Ann Therapist** - Professional counseling and coaching
- 👨‍⚕️ **Shawn Therapist** - Supportive therapeutic guidance
- 💪 **Bryan Fitness Coach** - Motivational coaching and encouragement
- 👨‍⚕️ **Dexter Doctor** - Medical and professional expertise
- 👩‍💻 **Elenora Tech Expert** - Technical and analytical discussions

#### 🌍 Multilingual Support
- 🇺🇸 English (default)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇨🇳 Chinese
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇮🇳 Hindi

#### 🎨 Modern UI/UX
- 🌙 **Dark/Light Mode** - Adaptive theme system
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Framer Motion powered interactions
- 🎯 **Intuitive Controls** - Easy-to-use interface

#### 🔊 Voice & Video Features
- 🎤 **Voice Recognition** - Real-time speech-to-text
- 📹 **Video Streaming** - High-quality avatar video
- 🔇 **Mute Controls** - Audio management
- 📸 **Picture-in-Picture** - User video overlay

#### 💾 Smart Caching & Performance
- ⚡ **Response Caching** - Faster subsequent interactions
- 🔄 **Real-time Sync** - Live connection status
- 📊 **Connection Quality** - Network performance monitoring

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **HeyGen API Key** ([Get one here](https://app.heygen.com/settings?from=&nav=Subscriptions%20%26%20API))
- **Google Gemini API Key** (optional, [Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/FluentFlow.git
   cd FluentFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Required: HeyGen API Key for avatar functionality
   HEYGEN_API_KEY=your_heygen_api_key_here

   # Optional: Google Gemini API for enhanced AI conversations
   GOOGLE_GENERATIVE_API_KEY=your_gemini_api_key_here

   # Optional: Base API URL (defaults to HeyGen production)
   NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) and start practicing!

## 🎮 How to Use

### Getting Started with Avatar Chat

1. **Choose Your Mode**: Select "Live Call with Avatar" from the sidebar
2. **Configure Avatar**: Pick your preferred avatar and language
3. **Start Session**: Click "Start Session" to begin your conversation
4. **Practice**: Use voice commands or text input to communicate
5. **Monitor Performance**: Watch connection quality and interaction feedback

### Text Chat Mode

1. **Select Gemini Chat**: Choose "FluentFlow Chat" from the sidebar
2. **Start Conversing**: Type your message and get instant AI responses
3. **Explore Topics**: Practice various conversation scenarios

### Voice Controls

- 🎤 **Voice Recognition**: Click the microphone to start voice input
- 🔇 **Mute/Unmute**: Control audio output with the volume button
- 📹 **Video Toggle**: Show/hide your camera feed
- 📱 **Mobile Mode**: Access all controls on mobile devices

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible UI components

### AI & APIs
- **HeyGen Streaming Avatars** - Lifelike AI video avatars
- **Google Gemini 2.0** - Advanced conversational AI
- **Web Speech API** - Voice recognition and synthesis

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🎯 Use Cases

### 💼 Professional Development
- **Job Interview Practice** - Prepare for interviews with realistic scenarios
- **Presentation Skills** - Practice public speaking with immediate feedback
- **Customer Service Training** - Role-play customer interactions

### 🌍 Language Learning
- **Accent Training** - Practice pronunciation with native speakers
- **Vocabulary Building** - Contextual learning through conversations
- **Cultural Communication** - Learn appropriate communication styles

### 🧠 Personal Growth
- **Confidence Building** - Practice social interactions safely
- **Active Listening** - Improve communication skills
- **Emotional Intelligence** - Learn empathetic communication

## 🔮 Future Features (Roadmap)

### 🚀 Planned Enhancements
- **📊 Performance Analytics** - Detailed conversation analysis and improvement tracking
- **🎬 Conversation Recording** - Save and review your practice sessions
- **🏆 Achievement System** - Gamified learning with badges and milestones
- **👥 Group Practice** - Collaborative learning sessions
- **📚 Scenario Library** - Pre-built conversation scenarios
- **🌐 Advanced Multilingual** - More languages and regional accents
- **🔄 Offline Mode** - Practice without internet connection
- **📈 Progress Tracking** - Long-term improvement monitoring

### 🎨 UI/UX Improvements
- **🎭 Custom Avatar Creation** - Design your own AI coaches
- **📱 Enhanced Mobile Experience** - Native mobile app
- **♿ Accessibility** - Full screen reader and keyboard navigation support
- **🎨 Theme Customization** - Personalized color schemes and layouts

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **HeyGen** for their incredible streaming avatar technology
- **Google** for the powerful Gemini AI models
- **Vercel** for hosting and deployment infrastructure
- **Open source community** for amazing tools and libraries

## 📞 Support

- 📧 **Email**: support@fluentflow.ai
- 💬 **Discord**: [Join our community](https://discord.gg/fluentflow)
- 📖 **Documentation**: [Full docs](https://docs.fluentflow.ai)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/FluentFlow/issues)

---

<div align="center">
  <p><strong>Built with ❤️ for better communication worldwide</strong></p>
  <p>
    <a href="#-fluentflow---ai-communication-coach">Back to Top</a> •
    <a href="https://fluentflow.ai">Website</a> •
    <a href="https://demo.fluentflow.ai">Live Demo</a>
  </p>
</div>
