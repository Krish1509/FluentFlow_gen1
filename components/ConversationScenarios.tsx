import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSATION_SCENARIOS, generatePersonalizedScenarios } from '@/app/lib/constants';
import { Clock, Users, Star, Play } from 'lucide-react';

interface ConversationScenariosProps {
  onScenarioSelect: (scenario: any) => void;
  currentScenario: any;
  userProfile?: any;
}

export const ConversationScenarios: React.FC<ConversationScenariosProps> = ({
  onScenarioSelect,
  currentScenario,
  userProfile
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const personalizedScenarios = userProfile ? generatePersonalizedScenarios(userProfile) : [];
  const allScenarios = [...CONVERSATION_SCENARIOS, ...personalizedScenarios];

  const categories = [
    { id: 'all', name: 'All Scenarios', emoji: '🎭' },
    { id: 'Professional', name: 'Professional', emoji: '💼' },
    { id: 'Personal', name: 'Personal', emoji: '🌟' },
    { id: 'Health', name: 'Health', emoji: '🏥' },
    { id: 'Cultural', name: 'Cultural', emoji: '🌍' },
    ...(personalizedScenarios.length > 0 ? [{ id: 'Goals', name: 'Your Goals', emoji: '🎯' }] : []),
    ...(personalizedScenarios.length > 0 ? [{ id: 'Language Practice', name: 'Language Practice', emoji: '🌍' }] : []),
  ];

  const filteredScenarios = selectedCategory === 'all'
    ? allScenarios
    : allScenarios.filter(scenario => scenario.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Conversation Scenarios</h3>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scenarios List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <AnimatePresence>
          {filteredScenarios.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                currentScenario?.id === scenario.id
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30'
                  : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => onScenarioSelect(scenario)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{scenario.emoji}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {scenario.name}
                  </h4>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScenarioSelect(scenario);
                  }}
                >
                  <Play className="w-4 h-4" />
                </motion.button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {scenario.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    <Star className="w-3 h-3 inline mr-1" />
                    {scenario.difficulty}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {scenario.duration}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {scenario.category}
                </div>
              </div>

              {/* Sample Prompts Preview */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sample prompts:</div>
                <div className="space-y-1">
                  {scenario.prompts.slice(0, 2).map((prompt, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 italic">
                      "{prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}"
                    </div>
                  ))}
                  {scenario.prompts.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{scenario.prompts.length - 2} more prompts
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredScenarios.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No scenarios found</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Try selecting a different category
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
