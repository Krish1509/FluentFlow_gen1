export const AVATARS = [
  // Professional & Therapeutic
  {
    avatar_id: "fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046",
    name: "Ann Therapist",
    description: "Professional therapist for counseling practice",
    category: "Therapy",
    emoji: "👩‍⚕️",
  },
  {
    avatar_id: "7b888024-f8c9-4205-95e1-78ce01497bda",
    name: "Shawn Therapist",
    description: "Supportive therapist for mental health discussions",
    category: "Therapy",
    emoji: "👨‍⚕️",
  },

  // Health & Fitness
  {
    avatar_id: "55eec60c-d665-4972-a529-bbdcaf665ab8",
    name: "Bryan Fitness Coach",
    description: "Motivational fitness coach for wellness conversations",
    category: "Fitness",
    emoji: "💪",
  },

  // Technology & Business
  {
    avatar_id: "8175dfc2-7858-49d6-b5fa-0c135d1c4bad",
    name: "Elenora Tech Expert",
    description: "IT specialist for technical and analytical discussions",
    category: "Technology",
    emoji: "👩‍💻",
  },

  // Communication & Education
  {
    avatar_id: "c72a9099-84b9-4d5d-98f4-a19ba131e654",
    name: "Anna Presenter",
    description: "Professional presenter for public speaking practice",
    category: "Communication",
    emoji: "🎤",
  },

  // Customer Service & Sales
  {
    avatar_id: "dc2935cf-5863-4f08-943b-c7478aea59fb",
    name: "David Sales Pro",
    description: "Sales expert for negotiation and persuasion practice",
    category: "Sales",
    emoji: "🤝",
  },
  {
    avatar_id: "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0",
    name: "Sarah Customer Care",
    description: "Customer service specialist for support role-play",
    category: "Customer Service",
    emoji: "💬",
  },

  // Education & Training
  {
    avatar_id: "0930fd59-c8ad-434d-ad53-b391a1768720",
    name: "Michael Professor",
    description: "Academic professor for educational discussions",
    category: "Education",
    emoji: "👨‍🏫",
  },
  {
    avatar_id: "864eb535-71eb-47ec-9f2d-054083431165",
    name: "Lisa Coach",
    description: "Life coach for personal development conversations",
    category: "Coaching",
    emoji: "🌟",
  },

  // International & Cultural
  {
    avatar_id: "64b526e4-741c-43b6-a918-4e40f3261c7a",
    name: "Carlos Cultural Guide",
    description: "Cultural ambassador for international communication",
    category: "Cultural",
    emoji: "🌍",
  },
  {
    avatar_id: "7299c55d-1f45-482d-915c-e5efdc9dd266",
    name: "Priya Mentor",
    description: "Mentor for career and personal guidance",
    category: "Mentorship",
    emoji: "🎓",
  },
];

export const STT_LANGUAGE_LIST = [
  { label: "🇺🇸 English", value: "en", key: "en" },
  { label: "🇮🇳 Hindi", value: "hi", key: "hi" },
  { label: "🇪🇸 Spanish", value: "es", key: "es" },
  { label: "🇫🇷 French", value: "fr", key: "fr" },
  { label: "🇩🇪 German", value: "de", key: "de" },
  { label: "🇨🇳 Chinese", value: "zh", key: "zh" },
  { label: "🇯🇵 Japanese", value: "ja", key: "ja" },
  { label: "🇰🇷 Korean", value: "ko", key: "ko" },
  { label: "🇮🇹 Italian", value: "it", key: "it" },
  { label: "🇵🇹 Portuguese", value: "pt", key: "pt" },
  { label: "🇷🇺 Russian", value: "ru", key: "ru" },
  { label: "🇳🇱 Dutch", value: "nl", key: "nl" },
  { label: "🇹🇷 Turkish", value: "tr", key: "tr" },
  { label: "🇻🇳 Vietnamese", value: "vi", key: "vi" },
  { label: "🇵🇱 Polish", value: "pl", key: "pl" },
  { label: "🇮🇩 Indonesian", value: "id", key: "id" },
  { label: "🇲🇾 Malay", value: "ms", key: "ms" },
  { label: "🇸🇦 Arabic", value: "ar", key: "ar" },
  { label: "🇧🇬 Bulgarian", value: "bg", key: "bg" },
  { label: "🇨🇿 Czech", value: "cs", key: "cs" },
  { label: "🇩🇰 Danish", value: "da", key: "da" },
  { label: "🇫🇮 Finnish", value: "fi", key: "fi" },
  { label: "🇬🇷 Greek", value: "el", key: "el" },
  { label: "🇭🇺 Hungarian", value: "hu", key: "hu" },
  { label: "🇳🇴 Norwegian", value: "no", key: "no" },
  { label: "🇷🇴 Romanian", value: "ro", key: "ro" },
  { label: "🇸🇰 Slovak", value: "sk", key: "sk" },
  { label: "🇸🇪 Swedish", value: "sv", key: "sv" },
  { label: "🇺🇦 Ukrainian", value: "uk", key: "uk" }
];

export const generatePersonalizedScenarios = (userProfile: any) => {
  if (!userProfile) return [];

  const personalizedScenarios = [];

  // Personalized greeting scenario
  if (userProfile.name) {
    personalizedScenarios.push({
      id: `personal-greeting-${Date.now()}`,
      name: `Personal Introduction with ${userProfile.name}`,
      description: `Practice introducing yourself with your personal background and goals`,
      category: "Personal",
      difficulty: "Beginner",
      duration: "5-10 min",
      avatar: "c72a9099-84b9-4d5d-98f4-a19ba131e654",
      emoji: "👋",
      prompts: [
        `Hello! I'm ${userProfile.name}. Nice to meet you!`,
        `I'm ${userProfile.age || 'in my field'} and work as a ${userProfile.occupation || 'professional'}.`,
        `I'm learning ${userProfile.targetLanguages?.join(' and ') || 'new languages'} to ${userProfile.learningGoals?.[0] || 'improve my communication skills'}.`,
        `My interests include ${userProfile.interests?.slice(0, 2).join(' and ') || 'various topics'}.`,
        `I'm ${userProfile.communicationStyle?.toLowerCase() || 'friendly'} and enjoy ${userProfile.learningGoals?.[1] || 'meaningful conversations'}.`
      ]
    });
  }

  // Language-specific scenarios
  if (userProfile.targetLanguages?.length > 0) {
    userProfile.targetLanguages.forEach((language: string) => {
      personalizedScenarios.push({
        id: `language-practice-${language.toLowerCase()}-${Date.now()}`,
        name: `Daily ${language} Conversation`,
        description: `Practice everyday ${language} conversations tailored to your ${userProfile.proficiencyLevel} level`,
        category: "Language Practice",
        difficulty: userProfile.proficiencyLevel?.includes('Beginner') ? 'Beginner' : 'Intermediate',
        duration: "10-15 min",
        avatar: getLanguageAvatar(language),
        emoji: getLanguageEmoji(language),
        prompts: generateLanguagePrompts(language, userProfile)
      });
    });
  }

  // Goal-specific scenarios
  if (userProfile.learningGoals?.length > 0) {
    userProfile.learningGoals.forEach((goal: string) => {
      personalizedScenarios.push({
        id: `goal-practice-${goal.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: `${goal} Practice`,
        description: `Focused practice for ${goal.toLowerCase()} with personalized scenarios`,
        category: "Goals",
        difficulty: "Intermediate",
        duration: "15-20 min",
        avatar: getGoalAvatar(goal),
        emoji: getGoalEmoji(goal),
        prompts: generateGoalPrompts(goal, userProfile)
      });
    });
  }

  return personalizedScenarios;
};

const getLanguageAvatar = (language: string) => {
  const avatarMap: { [key: string]: string } = {
    'Spanish': 'c72a9099-84b9-4d5d-98f4-a19ba131e654',
    'French': 'cd1d101c-9273-431b-8069-63beef736bec',
    'German': '0930fd59-c8ad-434d-ad53-b391a1768720',
    'Chinese': '864eb535-71eb-47ec-9f2d-054083431165',
    'Japanese': '7299c55d-1f45-482d-915c-e5efdc9dd266',
    'Korean': '64b526e4-741c-43b6-a918-4e40f3261c7a',
    'English': 'c72a9099-84b9-4d5d-98f4-a19ba131e654'
  };
  return avatarMap[language] || 'c72a9099-84b9-4d5d-98f4-a19ba131e654';
};

const getLanguageEmoji = (language: string) => {
  const emojiMap: { [key: string]: string } = {
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'English': '🇺🇸'
  };
  return emojiMap[language] || '🌍';
};

const getGoalAvatar = (goal: string) => {
  const avatarMap: { [key: string]: string } = {
    'Business Communication': 'dc2935cf-5863-4f08-943b-c7478aea59fb',
    'Job Interviews': 'cd1d101c-9273-431b-8069-63beef736bec',
    'Presentations': 'c72a9099-84b9-4d5d-98f4-a19ba131e654',
    'Customer Service': '65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0',
    'Travel': '64b526e4-741c-43b6-a918-4e40f3261c7a'
  };
  return avatarMap[goal] || '864eb535-71eb-47ec-9f2d-054083431165';
};

const getGoalEmoji = (goal: string) => {
  const emojiMap: { [key: string]: string } = {
    'Business Communication': '💼',
    'Job Interviews': '🤝',
    'Presentations': '🎤',
    'Customer Service': '💬',
    'Travel': '✈️'
  };
  return emojiMap[goal] || '🎯';
};

const generateLanguagePrompts = (language: string, userProfile: any) => {
  const basePrompts = {
    'Spanish': [
      'Hola, ¿cómo estás?',
      'Me llamo ' + (userProfile.name || 'Alex') + '. ¿Y tú?',
      'Estoy aprendiendo español para ' + (userProfile.learningGoals?.[0] || 'mejorar mi comunicación'),
      '¿Puedes ayudarme con la pronunciación?',
      '¿Qué te gusta hacer en tu tiempo libre?'
    ],
    'French': [
      'Bonjour, comment allez-vous?',
      'Je m\'appelle ' + (userProfile.name || 'Alex') + '. Et vous?',
      'J\'apprends le français pour ' + (userProfile.learningGoals?.[0] || 'améliorer ma communication'),
      'Pouvez-vous m\'aider avec la prononciation?',
      'Qu\'est-ce que vous aimez faire pendant votre temps libre?'
    ],
    'German': [
      'Hallo, wie geht es Ihnen?',
      'Ich heiße ' + (userProfile.name || 'Alex') + '. Und Sie?',
      'Ich lerne Deutsch, um ' + (userProfile.learningGoals?.[0] || 'meine Kommunikation zu verbessern'),
      'Können Sie mir mit der Aussprache helfen?',
      'Was machen Sie gerne in Ihrer Freizeit?'
    ]
  };

  return basePrompts[language as keyof typeof basePrompts] || [
    `Hello! I'm ${userProfile.name || 'learning'} ${language}.`,
    'Can you help me practice this language?',
    'What would you like to talk about?',
    'How do you say this in ' + language + '?',
    'Tell me about yourself in ' + language + '.'
  ];
};

const generateGoalPrompts = (goal: string, userProfile: any) => {
  const goalPrompts = {
    'Business Communication': [
      `Hello, I'm ${userProfile.name || 'Alex'}, ${userProfile.occupation || 'a professional'}. Let's discuss business.`,
      'I need to improve my business presentation skills.',
      'Can you help me practice negotiation techniques?',
      'How do you handle difficult business conversations?',
      'What makes a good business email or call?'
    ],
    'Job Interviews': [
      `Hi, I'm ${userProfile.name || 'Alex'} interviewing for a ${userProfile.occupation || 'position'}.`,
      'Can you ask me some typical interview questions?',
      'How should I answer "What are your strengths?"',
      'Tell me about a challenge you overcame.',
      'Why do you want to work here?'
    ],
    'Presentations': [
      `Hello everyone, I'm ${userProfile.name || 'Alex'} presenting on ${userProfile.interests?.[0] || 'an important topic'}.`,
      'Can you help me practice my presentation?',
      'How do I engage the audience?',
      'What should I do if I forget what to say?',
      'How do I end a presentation effectively?'
    ]
  };

  return goalPrompts[goal as keyof typeof goalPrompts] || [
    `Hi, I'm ${userProfile.name || 'practicing'} ${goal}.`,
    'Can you help me with this skill?',
    'What are some tips for improvement?',
    'Let me practice this scenario.',
    'How would you handle this situation?'
  ];
};

export const CONVERSATION_SCENARIOS = [
  // Professional Scenarios
  {
    id: "job-interview-software-engineer",
    name: "Software Engineer Interview",
    description: "Practice technical interviews for software engineering roles",
    category: "Professional",
    difficulty: "Advanced",
    duration: "15-20 min",
    avatar: "8175dfc2-7858-49d6-b5fa-0c135d1c4bad",
    emoji: "👩‍💻",
    prompts: [
      "Tell me about yourself and your programming background.",
      "Explain a challenging project you worked on.",
      "How do you handle tight deadlines?",
      "What are your strengths and weaknesses?",
      "Why do you want to work here?"
    ]
  },
  {
    id: "job-interview-sales",
    name: "Sales Representative Interview",
    description: "Practice sales interviews and negotiation skills",
    category: "Professional",
    difficulty: "Intermediate",
    duration: "10-15 min",
    avatar: "dc2935cf-5863-4f08-943b-c7478aea59fb",
    emoji: "🤝",
    prompts: [
      "Why are you interested in sales?",
      "Tell me about a successful sale you made.",
      "How do you handle rejection?",
      "What's your approach to building client relationships?",
      "How do you stay motivated?"
    ]
  },
  {
    id: "presentation-tech-demo",
    name: "Technical Presentation",
    description: "Practice presenting technical concepts to non-technical audiences",
    category: "Professional",
    difficulty: "Advanced",
    duration: "10-15 min",
    avatar: "c72a9099-84b9-4d5d-98f4-a19ba131e654",
    emoji: "🎤",
    prompts: [
      "Present your latest project to the team.",
      "Explain a complex technical concept simply.",
      "Handle questions from stakeholders.",
      "Demonstrate your solution approach.",
      "Discuss project challenges and solutions."
    ]
  },
  {
    id: "customer-service-complaint",
    name: "Customer Service Complaint",
    description: "Handle customer complaints and difficult situations",
    category: "Professional",
    difficulty: "Intermediate",
    duration: "8-12 min",
    avatar: "65f9e3c9-d48b-4118-b73a-4ae2e3cbb8f0",
    emoji: "💬",
    prompts: [
      "I'm very disappointed with your service.",
      "Your product doesn't work as advertised.",
      "I need a refund for this purchase.",
      "This is unacceptable - fix it now.",
      "I've been waiting too long for support."
    ]
  },

  // Personal Development
  {
    id: "therapy-session",
    name: "Therapy Session",
    description: "Practice discussing personal challenges and emotions",
    category: "Personal",
    difficulty: "Intermediate",
    duration: "20-30 min",
    avatar: "fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046",
    emoji: "👩‍⚕️",
    prompts: [
      "I've been feeling really stressed lately.",
      "I'm having trouble with my relationships.",
      "I feel like I'm not achieving my goals.",
      "I'm dealing with anxiety about the future.",
      "I need help managing my emotions."
    ]
  },
  {
    id: "career-coaching",
    name: "Career Coaching",
    description: "Discuss career goals and professional development",
    category: "Personal",
    difficulty: "Intermediate",
    duration: "15-20 min",
    avatar: "864eb535-71eb-47ec-9f2d-054083431165",
    emoji: "🌟",
    prompts: [
      "I'm not sure what career path to choose.",
      "How can I advance in my current role?",
      "I want to change careers but I'm scared.",
      "How do I negotiate a better salary?",
      "I'm feeling burnt out at work."
    ]
  },
  {
    id: "public-speaking-practice",
    name: "Public Speaking Practice",
    description: "Build confidence in speaking to groups",
    category: "Personal",
    difficulty: "Beginner",
    duration: "5-10 min",
    avatar: "0930fd59-c8ad-434d-ad53-b391a1768720",
    emoji: "👨‍🏫",
    prompts: [
      "Introduce yourself to the group.",
      "Share your opinion on current events.",
      "Explain something you're passionate about.",
      "Practice your elevator pitch.",
      "Handle unexpected questions."
    ]
  },

  // Health & Wellness
  {
    id: "fitness-consultation",
    name: "Fitness Consultation",
    description: "Discuss health goals and fitness plans",
    category: "Health",
    difficulty: "Beginner",
    duration: "10-15 min",
    avatar: "55eec60c-d665-4972-a529-bbdcaf665ab8",
    emoji: "💪",
    prompts: [
      "I want to lose weight but don't know where to start.",
      "How can I build muscle effectively?",
      "I'm recovering from an injury.",
      "I need motivation to exercise regularly.",
      "What's a good diet for my goals?"
    ]
  },
  {
    id: "medical-consultation",
    name: "Medical Consultation",
    description: "Practice discussing health concerns with a doctor",
    category: "Health",
    difficulty: "Intermediate",
    duration: "8-12 min",
    avatar: "fc9c1f9f-bc99-4fd9-a6b2-8b4b5669a046",
    emoji: "👨‍⚕️",
    prompts: [
      "I've been having these symptoms...",
      "I'm concerned about my test results.",
      "What are the treatment options?",
      "How can I prevent this condition?",
      "I have questions about my medication."
    ]
  },

  // Cultural & Social
  {
    id: "cultural-exchange",
    name: "Cultural Exchange",
    description: "Practice conversations with different cultural perspectives",
    category: "Cultural",
    difficulty: "Intermediate",
    duration: "10-15 min",
    avatar: "64b526e4-741c-43b6-a918-4e40f3261c7a",
    emoji: "🌍",
    prompts: [
      "Tell me about your culture's traditions.",
      "How do you handle business meetings?",
      "What's considered polite in your culture?",
      "Share a cultural misunderstanding you've experienced.",
      "How do holidays differ in your culture?"
    ]
  },
  {
    id: "mentorship-session",
    name: "Mentorship Session",
    description: "Seek guidance and advice from an experienced mentor",
    category: "Personal",
    difficulty: "Beginner",
    duration: "12-18 min",
    avatar: "7299c55d-1f45-482d-915c-e5efdc9dd266",
    emoji: "🎓",
    prompts: [
      "I need advice about my career path.",
      "How did you overcome this challenge?",
      "What skills should I develop?",
      "Can you share your success story?",
      "How do you handle workplace politics?"
    ]
  }
];
