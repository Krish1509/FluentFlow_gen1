"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, MessageSquare, Zap, Globe, CheckCircle2, Shield, Rocket, PlayCircle, SlidersHorizontal, ImagePlus, MonitorPlay } from "lucide-react";
import liveCallImage from "@/images/image.png";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-black relative selection:bg-purple-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] bg-teal-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      <div className="animated-lines" />

      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-black/75 backdrop-blur-md border-b border-white/10 py-3 shadow-lg shadow-black/20" 
          : "bg-transparent border-b border-transparent py-5"
      }`}>
        <nav className="flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              FluentFlow
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors px-5 py-2.5 rounded-full shadow-lg shadow-white/10">
              Sign up
            </Link>
          </motion.div>
        </nav>
      </header>

      <main className="relative z-10 px-4 pb-24">
        <section className="max-w-6xl mx-auto text-center pt-16 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Professional AI communication coaching</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.05] text-white"
          >
            Speak with clarity.
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400">
              Grow with FluentFlow AI
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300/90 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Build confidence in interviews, meetings, and daily conversations with real-time practice, pronunciation feedback, and smart learning paths.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition-transform hover:scale-105 active:scale-95">
              <span>Start Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/10 text-white hover:bg-white/20 border border-white/10 px-8 py-4 rounded-full font-semibold backdrop-blur-md transition-all">
              <span>Open Dashboard</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left max-w-4xl mx-auto"
          >
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="text-2xl font-bold text-white tracking-tight">{item.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          >
            {features.map((feature) => (
              <div key={feature.title} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 text-left hover:bg-white/10 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-tr ${feature.color}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
              <div className="inline-flex p-3 rounded-xl bg-white/10 mb-4">
                <item.icon className="w-5 h-5 text-teal-300" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="max-w-6xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-white/10">
                <MonitorPlay className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Live AI Call Experience</h2>
                <p className="text-sm md:text-base text-gray-400">A preview-style section that feels like a real video coaching call.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-black to-cyan-500/20 min-h-[260px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
                <Image
                  src={liveCallImage}
                  alt="FluentFlow live AI video call preview"
                  fill
                  className="object-cover opacity-45"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/40 border border-white/10 px-3 py-1 text-xs text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Session
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <p className="text-white font-semibold">AI Coach: Ann</p>
                    <p className="text-gray-300 text-sm">"Let’s practice your introduction naturally."</p>
                  </div>
                  <button className="rounded-full bg-white/15 border border-white/25 p-3 hover:bg-white/25 transition-colors">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
                <h3 className="text-white font-semibold">Session Controls</h3>
                {controlItems.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
                    {item}
                  </div>
                ))}
                <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
                  Designed for quick scenario switching and voice control.
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto mt-20">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Image Showcase Slots</h2>
              <p className="text-gray-400">Drop your own screenshots/images here later.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300 border border-white/10 bg-white/5 px-3 py-2 rounded-xl">
              <ImagePlus className="w-4 h-4" />
              Replace placeholders anytime
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {imageSlots.map((slot) => (
              <motion.div
                key={slot.title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-5 min-h-[180px] transition-all duration-300 hover:border-violet-400/40 hover:bg-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <ImagePlus className="w-5 h-5 text-violet-300" />
                </div>
                <h3 className="text-white font-semibold mb-1">{slot.title}</h3>
                <p className="text-sm text-gray-400">{slot.description}</p>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ y: -4 }}
              className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="relative h-[260px] md:h-[300px]">
                <Image
                  src={liveCallImage}
                  alt="Uploaded live call screenshot"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 rounded-full bg-black/55 border border-white/20 px-3 py-1 text-xs text-white">
                  Your Uploaded Image
                </div>
              </div>
              <div className="p-4 border-t border-white/10">
                <h3 className="text-white font-semibold">Real AI Video Call Experience</h3>
                <p className="text-sm text-gray-400 mt-1">
                  This section now uses your `images/image.png` directly for a real product preview.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickBenefits.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500/30 to-cyan-500/30 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-20">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Ready to level up your fluency?</h2>
              <p className="text-gray-400">Join FluentFlow and make every conversation count.</p>
            </div>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-7 py-3.5 font-semibold text-white hover:opacity-90 transition-opacity">
              Create account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

const features = [
  {
    title: "Real-time Feedback",
    description: "Get instant corrections on your pronunciation and grammar as you speak.",
    icon: Zap,
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Immersive Conversations",
    description: "Practice with AI avatars that respond naturally in thousands of scenarios.",
    icon: MessageSquare,
    color: "from-purple-500 to-blue-500"
  },
  {
    title: "Global Languages",
    description: "Master over 40 languages with native-sounding text-to-speech models.",
    icon: Globe,
    color: "from-teal-500 to-emerald-500"
  },
  {
    title: "Guided Speaking Paths",
    description: "Follow structured practice flows for interviews, travel, and workplace conversations.",
    icon: CheckCircle2,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Private & Secure",
    description: "Your sessions and profile settings stay protected with secure authentication.",
    icon: Shield,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Fast Session Launch",
    description: "Start a coaching session in seconds with one-click avatar or text practice.",
    icon: Rocket,
    color: "from-fuchsia-500 to-purple-500"
  }
];

const stats = [
  { value: "40+", label: "Languages supported" },
  { value: "24/7", label: "AI practice availability" },
  { value: "Real-time", label: "Pronunciation feedback" },
  { value: "1-click", label: "Session launch" }
];

const highlights = [
  {
    title: "Designed for daily learning",
    description: "Compact, focused sessions keep your progress consistent and measurable, even with a busy schedule.",
    icon: MessageSquare
  },
  {
    title: "Professional conversation training",
    description: "Practice role-based scenarios so your communication improves for real-world moments that matter.",
    icon: Globe
  }
];

const controlItems = [
  "Voice sensitivity: Auto",
  "Avatar quality: High",
  "Language mode: English",
  "Noise suppression: On"
];

const imageSlots = [
  {
    title: "Live Call Screenshot",
    description: "Add a real FluentFlow call preview image."
  },
  {
    title: "Dashboard Analytics",
    description: "Show progress, confidence score, and session insights."
  },
  {
    title: "Avatar Personalization",
    description: "Display avatar, language, and conversation style settings."
  }
];

const quickBenefits = [
  {
    title: "Smooth Onboarding",
    description: "Users can start practicing in under a minute.",
    icon: Rocket
  },
  {
    title: "Visual Clarity",
    description: "Cleaner information hierarchy for better conversion.",
    icon: SlidersHorizontal
  },
  {
    title: "Session Immersion",
    description: "Motion and ambient effects make practice feel alive.",
    icon: Zap
  }
];
