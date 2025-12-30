import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Globe, Target, Book, Star, Save, X } from 'lucide-react';

export interface UserProfile {
  name: string;
  age: string;
  occupation: string;
  nativeLanguage: string;
  currentLanguages: string[];
  targetLanguages: string[];
  learningGoals: string[];
  proficiencyLevel: string;
  interests: string[];
  personalityTraits: string[];
  communicationStyle: string;
  challenges: string[];
}

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile | null;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Hindi',
  'Italian', 'Portuguese', 'Russian', 'Arabic', 'Dutch', 'Swedish', 'Turkish', 'Thai'
];

const LEARNING_GOALS = [
  'Business Communication', 'Casual Conversation', 'Public Speaking', 'Job Interviews',
  'Academic Writing', 'Travel Communication', 'Customer Service', 'Social Networking',
  'Presentation Skills', 'Negotiation', 'Cultural Understanding', 'Accent Reduction'
];

const PROFICIENCY_LEVELS = [
  'Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)', 'Native/Fluent'
];

const PERSONALITY_TRAITS = [
  'Introverted', 'Extroverted', 'Analytical', 'Creative', 'Patient', 'Ambitious',
  'Detail-oriented', 'Big-picture thinker', 'Confident', 'Reserved'
];

const COMMUNICATION_STYLES = [
  'Direct', 'Diplomatic', 'Formal', 'Casual', 'Humorous', 'Serious',
  'Collaborative', 'Assertive', 'Supportive', 'Analytical'
];

export const UserProfileComponent: React.FC<UserProfileProps> = ({
  isVisible,
  onClose,
  onSave,
  currentProfile
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    occupation: '',
    nativeLanguage: 'English',
    currentLanguages: [],
    targetLanguages: [],
    learningGoals: [],
    proficiencyLevel: 'Beginner (A1-A2)',
    interests: [],
    personalityTraits: [],
    communicationStyle: 'Diplomatic',
    challenges: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [customInterest, setCustomInterest] = useState('');
  const [customChallenge, setCustomChallenge] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile);
    }
  }, [currentProfile]);

  const steps = [
    { title: 'Basic Info', icon: User },
    { title: 'Languages', icon: Globe },
    { title: 'Goals & Skills', icon: Target },
    { title: 'Personality', icon: Star },
    { title: 'Review', icon: Save }
  ];

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('fluentflow-user-profile', JSON.stringify(profile));
    onSave(profile);
    onClose();
  };

  const addToArray = (field: keyof UserProfile, value: string) => {
    if (Array.isArray(profile[field]) && !profile[field].includes(value)) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }));
    }
  };

  const removeFromArray = (field: keyof UserProfile, value: string) => {
    if (Array.isArray(profile[field])) {
      setProfile(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter(item => item !== value)
      }));
    }
  };

  const addCustomItem = (field: keyof UserProfile, customValue: string, setter: (value: string) => void) => {
    if (customValue.trim() && !profile[field].includes(customValue.trim())) {
      addToArray(field, customValue.trim());
      setter('');
    }
  };

  if (!isVisible) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your age"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Occupation/Role
              </label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Developer, Student, Teacher"
              />
            </div>
          </div>
        );

      case 1: // Languages
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Native Language *
              </label>
              <select
                value={profile.nativeLanguage}
                onChange={(e) => setProfile(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages You Know
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {LANGUAGES.filter(lang => lang !== profile.nativeLanguage).map(lang => (
                  <button
                    key={lang}
                    onClick={() => addToArray('currentLanguages', lang)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      profile.currentLanguages.includes(lang)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.currentLanguages.map(lang => (
                  <span key={lang} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {lang}
                    <button
                      onClick={() => removeFromArray('currentLanguages', lang)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages You Want to Learn *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => addToArray('targetLanguages', lang)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      profile.targetLanguages.includes(lang)
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.targetLanguages.map(lang => (
                  <span key={lang} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    {lang}
                    <button
                      onClick={() => removeFromArray('targetLanguages', lang)}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Proficiency Level
              </label>
              <select
                value={profile.proficiencyLevel}
                onChange={(e) => setProfile(prev => ({ ...prev, proficiencyLevel: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PROFICIENCY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2: // Goals & Skills
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Learning Goals *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {LEARNING_GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => addToArray('learningGoals', goal)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      profile.learningGoals.includes(goal)
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.learningGoals.map(goal => (
                  <span key={goal} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    {goal}
                    <button
                      onClick={() => removeFromArray('learningGoals', goal)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Interests (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('interests', customInterest, setCustomInterest)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add an interest..."
                />
                <button
                  onClick={() => addCustomItem('interests', customInterest, setCustomInterest)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span key={interest} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    {interest}
                    <button
                      onClick={() => removeFromArray('interests', interest)}
                      className="ml-1 text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Communication Challenges (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customChallenge}
                  onChange={(e) => setCustomChallenge(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem('challenges', customChallenge, setCustomChallenge)}
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Pronunciation, Grammar, Vocabulary..."
                />
                <button
                  onClick={() => addCustomItem('challenges', customChallenge, setCustomChallenge)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.challenges.map(challenge => (
                  <span key={challenge} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                    {challenge}
                    <button
                      onClick={() => removeFromArray('challenges', challenge)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Personality
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personality Traits (Select 2-4 that describe you)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {PERSONALITY_TRAITS.map(trait => (
                  <button
                    key={trait}
                    onClick={() => addToArray('personalityTraits', trait)}
                    disabled={profile.personalityTraits.length >= 4 && !profile.personalityTraits.includes(trait)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      profile.personalityTraits.includes(trait)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : profile.personalityTraits.length >= 4
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.personalityTraits.map(trait => (
                  <span key={trait} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {trait}
                    <button
                      onClick={() => removeFromArray('personalityTraits', trait)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Communication Style
              </label>
              <select
                value={profile.communicationStyle}
                onChange={(e) => setProfile(prev => ({ ...prev, communicationStyle: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COMMUNICATION_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {profile.name || 'Not set'}
                </div>
                <div>
                  <strong>Age:</strong> {profile.age || 'Not set'}
                </div>
                <div>
                  <strong>Occupation:</strong> {profile.occupation || 'Not set'}
                </div>
                <div>
                  <strong>Native Language:</strong> {profile.nativeLanguage}
                </div>
                <div>
                  <strong>Current Languages:</strong> {profile.currentLanguages.join(', ') || 'None'}
                </div>
                <div>
                  <strong>Target Languages:</strong> {profile.targetLanguages.join(', ') || 'None'}
                </div>
                <div>
                  <strong>Proficiency:</strong> {profile.proficiencyLevel}
                </div>
                <div>
                  <strong>Communication Style:</strong> {profile.communicationStyle}
                </div>
              </div>

              <div className="mt-4">
                <strong>Learning Goals:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.learningGoals.map(goal => (
                    <span key={goal} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {profile.interests.length > 0 && (
                <div className="mt-4">
                  <strong>Interests:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.interests.map(interest => (
                      <span key={interest} className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.challenges.length > 0 && (
                <div className="mt-4">
                  <strong>Challenges:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.challenges.map(challenge => (
                      <span key={challenge} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.personalityTraits.length > 0 && (
                <div className="mt-4">
                  <strong>Personality Traits:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.personalityTraits.map(trait => (
                      <span key={trait} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Personalized AI Experience
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your AI conversations will now be personalized based on your profile. The AI will address you by name,
                adapt to your proficiency level, focus on your learning goals, and communicate in your preferred style.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-800/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-pink-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl opacity-80 blur-lg"></div>
                  <User className="w-7 h-7 text-white relative z-10" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Personalize Your Experience
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                    Help us create the perfect AI communication coach for you
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-2xl transition-all duration-300 backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center justify-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentStep === index
                        ? 'bg-blue-500 text-white'
                        : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </motion.button>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center space-x-3">
              {currentStep === steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={!profile.name || profile.targetLanguages.length === 0 || profile.learningGoals.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Save Profile
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Next
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
