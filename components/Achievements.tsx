import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, MessageCircle, Clock, Target, Award, Flame, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
}

interface AchievementsProps {
  isVisible: boolean;
  onClose: () => void;
  stats: {
    totalConversations: number;
    totalDuration: number;
    scenariosCompleted: number;
    confidenceScore: number;
  };
}

export const Achievements: React.FC<AchievementsProps> = ({
  isVisible,
  onClose,
  stats
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([
    // Communication Basics
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first conversation',
      icon: <MessageCircle className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1,
      rarity: 'common',
      category: 'Communication'
    },
    {
      id: 'chatty',
      name: 'Chatty',
      description: 'Have 10 conversations',
      icon: <MessageCircle className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      rarity: 'common',
      category: 'Communication'
    },
    {
      id: 'conversationalist',
      name: 'Conversationalist',
      description: 'Complete 50 conversations',
      icon: <Star className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 50,
      rarity: 'rare',
      category: 'Communication'
    },

    // Time-based
    {
      id: 'time-waster',
      name: 'Time Well Spent',
      description: 'Spend 1 hour practicing',
      icon: <Clock className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3600000, // 1 hour in ms
      rarity: 'common',
      category: 'Time'
    },
    {
      id: 'dedicated',
      name: 'Dedicated Learner',
      description: 'Practice for 5 hours total',
      icon: <Clock className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 18000000, // 5 hours in ms
      rarity: 'rare',
      category: 'Time'
    },

    // Scenarios
    {
      id: 'scenario-explorer',
      name: 'Scenario Explorer',
      description: 'Try 5 different conversation scenarios',
      icon: <Target className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 5,
      rarity: 'common',
      category: 'Scenarios'
    },
    {
      id: 'scenario-master',
      name: 'Scenario Master',
      description: 'Complete 20 different scenarios',
      icon: <Award className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 20,
      rarity: 'epic',
      category: 'Scenarios'
    },

    // Confidence & Skills
    {
      id: 'confident-speaker',
      name: 'Confident Speaker',
      description: 'Achieve 80% confidence score',
      icon: <Zap className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 80,
      rarity: 'rare',
      category: 'Skills'
    },
    {
      id: 'communication-legend',
      name: 'Communication Legend',
      description: 'Reach 95% confidence score',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 95,
      rarity: 'legendary',
      category: 'Skills'
    },

    // Streaks
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Practice for 3 days in a row',
      icon: <Flame className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 3,
      rarity: 'common',
      category: 'Streaks'
    },
    {
      id: 'consistency-king',
      name: 'Consistency King',
      description: 'Practice for 7 days straight',
      icon: <Flame className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 7,
      rarity: 'epic',
      category: 'Streaks'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Update achievements based on stats
  useEffect(() => {
    setAchievements(prev =>
      prev.map(achievement => {
        let newProgress = achievement.progress;

        switch (achievement.id) {
          case 'first-steps':
          case 'chatty':
          case 'conversationalist':
            newProgress = Math.min(stats.totalConversations, achievement.maxProgress);
            break;
          case 'time-waster':
          case 'dedicated':
            newProgress = Math.min(stats.totalDuration, achievement.maxProgress);
            break;
          case 'scenario-explorer':
          case 'scenario-master':
            newProgress = Math.min(stats.scenariosCompleted, achievement.maxProgress);
            break;
          case 'confident-speaker':
          case 'communication-legend':
            newProgress = Math.min(stats.confidenceScore, achievement.maxProgress);
            break;
          // Streak achievements would need actual streak tracking
          default:
            newProgress = achievement.progress;
        }

        return {
          ...achievement,
          progress: newProgress,
          unlocked: newProgress >= achievement.maxProgress
        };
      })
    );
  }, [stats]);

  const categories = [
    { id: 'all', name: 'All Achievements', icon: '🏆' },
    { id: 'Communication', name: 'Communication', icon: '💬' },
    { id: 'Time', name: 'Time', icon: '⏰' },
    { id: 'Scenarios', name: 'Scenarios', icon: '🎭' },
    { id: 'Skills', name: 'Skills', icon: '⚡' },
    { id: 'Streaks', name: 'Streaks', icon: '🔥' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
      case 'rare': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
      case 'epic': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20';
      case 'legendary': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪';
      case 'rare': return '🔵';
      case 'epic': return '🟣';
      case 'legendary': return '🟡';
      default: return '⚪';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Achievements
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {unlockedCount} of {totalCount} unlocked
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  {category.id !== 'all' && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {achievements.filter(a => a.category === category.id && a.unlocked).length}/
                      {achievements.filter(a => a.category === category.id).length}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    achievement.unlocked
                      ? `${getRarityColor(achievement.rarity)} shadow-lg`
                      : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${
                          achievement.unlocked
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <span className="text-sm" title={achievement.rarity}>
                          {getRarityIcon(achievement.rarity)}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${
                        achievement.unlocked
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>
                            {achievement.id.includes('time')
                              ? `${Math.floor(achievement.progress / 60000)}m`
                              : achievement.progress
                            } / {
                              achievement.id.includes('time')
                                ? `${Math.floor(achievement.maxProgress / 60000)}m`
                                : achievement.maxProgress
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`
                            }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`h-2 rounded-full ${
                              achievement.unlocked
                                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                                : 'bg-gray-400 dark:bg-gray-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Unlocked Badge */}
                      {achievement.unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-3 flex items-center space-x-1 text-green-600 dark:text-green-400"
                        >
                          <Trophy className="w-4 h-4" />
                          <span className="text-xs font-medium">Unlocked!</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
