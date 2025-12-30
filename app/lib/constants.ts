export const AVATARS = [
  // Professional & Therapeutic
  {
    avatar_id: "Ann_Therapist_public",
    name: "Ann Therapist",
    description: "Professional therapist for counseling practice",
    category: "Therapy",
    emoji: "👩‍⚕️",
  },
  {
    avatar_id: "Shawn_Therapist_public",
    name: "Shawn Therapist",
    description: "Supportive therapist for mental health discussions",
    category: "Therapy",
    emoji: "👨‍⚕️",
  },

  // Health & Fitness
  {
    avatar_id: "Bryan_FitnessCoach_public",
    name: "Bryan Fitness Coach",
    description: "Motivational fitness coach for wellness conversations",
    category: "Fitness",
    emoji: "💪",
  },
  {
    avatar_id: "Dexter_Doctor_Standing2_public",
    name: "Dexter Doctor",
    description: "Medical professional for healthcare discussions",
    category: "Medical",
    emoji: "👨‍⚕️",
  },

  // Technology & Business
  {
    avatar_id: "Elenora_IT_Sitting_public",
    name: "Elenora Tech Expert",
    description: "IT specialist for technical and analytical discussions",
    category: "Technology",
    emoji: "👩‍💻",
  },

  // Communication & Education
  {
    avatar_id: "Anna_public",
    name: "Anna Presenter",
    description: "Professional presenter for public speaking practice",
    category: "Communication",
    emoji: "🎤",
  },
  {
    avatar_id: "Emma_public",
    name: "Emma Interviewer",
    description: "HR professional for job interview practice",
    category: "Business",
    emoji: "👩‍💼",
  },

  // Customer Service & Sales
  {
    avatar_id: "David_public",
    name: "David Sales Pro",
    description: "Sales expert for negotiation and persuasion practice",
    category: "Sales",
    emoji: "🤝",
  },
  {
    avatar_id: "Sarah_public",
    name: "Sarah Customer Care",
    description: "Customer service specialist for support role-play",
    category: "Customer Service",
    emoji: "💬",
  },

  // Education & Training
  {
    avatar_id: "Michael_public",
    name: "Michael Professor",
    description: "Academic professor for educational discussions",
    category: "Education",
    emoji: "👨‍🏫",
  },
  {
    avatar_id: "Lisa_public",
    name: "Lisa Coach",
    description: "Life coach for personal development conversations",
    category: "Coaching",
    emoji: "🌟",
  },

  // International & Cultural
  {
    avatar_id: "Carlos_public",
    name: "Carlos Cultural Guide",
    description: "Cultural ambassador for international communication",
    category: "Cultural",
    emoji: "🌍",
  },
  {
    avatar_id: "Priya_public",
    name: "Priya Mentor",
    description: "Mentor for career and personal guidance",
    category: "Mentorship",
    emoji: "🎓",
  },
];

export const STT_LANGUAGE_LIST = [
  { label: "Bulgarian", value: "bg", key: "bg" },
  { label: "Chinese", value: "zh", key: "zh" },
  { label: "Czech", value: "cs", key: "cs" },
  { label: "Danish", value: "da", key: "da" },
  { label: "Dutch", value: "nl", key: "nl" },
  { label: "English", value: "en", key: "en" },
  { label: "Finnish", value: "fi", key: "fi" },
  { label: "French", value: "fr", key: "fr" },
  { label: "German", value: "de", key: "de" },
  { label: "Greek", value: "el", key: "el" },
  { label: "Hindi", value: "hi", key: "hi" },
  { label: "Hungarian", value: "hu", key: "hu" },
  { label: "Indonesian", value: "id", key: "id" },
  { label: "Italian", value: "it", key: "it" },
  { label: "Japanese", value: "ja", key: "ja" },
  { label: "Korean", value: "ko", key: "ko" },
  { label: "Malay", value: "ms", key: "ms" },
  { label: "Norwegian", value: "no", key: "no" },
  { label: "Polish", value: "pl", key: "pl" },
  { label: "Portuguese", value: "pt", key: "pt" },
  { label: "Romanian", value: "ro", key: "ro" },
  { label: "Russian", value: "ru", key: "ru" },
  { label: "Slovak", value: "sk", key: "sk" },
  { label: "Spanish", value: "es", key: "es" },
  { label: "Swedish", value: "sv", key: "sv" },
  { label: "Turkish", value: "tr", key: "tr" },
  { label: "Ukrainian", value: "uk", key: "uk" },
  { label: "Vietnamese", value: "vi", key: "vi" },
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
      avatar: "Anna_public",
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
    'Spanish': 'Anna_public',
    'French': 'Emma_public',
    'German': 'Michael_public',
    'Chinese': 'Lisa_public',
    'Japanese': 'Priya_public',
    'Korean': 'Carlos_public',
    'English': 'Anna_public'
  };
  return avatarMap[language] || 'Anna_public';
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
    'Business Communication': 'David_public',
    'Job Interviews': 'Emma_public',
    'Presentations': 'Anna_public',
    'Customer Service': 'Sarah_public',
    'Travel': 'Carlos_public'
  };
  return avatarMap[goal] || 'Lisa_public';
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
    avatar: "Elenora_IT_Sitting_public",
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
    avatar: "David_public",
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
    avatar: "Anna_public",
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
    avatar: "Sarah_public",
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
    avatar: "Ann_Therapist_public",
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
    avatar: "Lisa_public",
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
    avatar: "Michael_public",
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
    avatar: "Bryan_FitnessCoach_public",
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
    avatar: "Dexter_Doctor_Standing2_public",
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
    avatar: "Carlos_public",
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
    avatar: "Priya_public",
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
