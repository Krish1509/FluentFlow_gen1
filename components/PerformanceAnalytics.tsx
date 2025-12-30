import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, MessageSquare, Clock, Star, Award, Target } from 'lucide-react';

interface ConversationMetrics {
  totalConversations: number;
  totalDuration: number;
  averageResponseTime: number;
  confidenceScore: number;
  scenariosCompleted: number;
  improvementAreas: string[];
  strengths: string[];
}

interface PerformanceAnalyticsProps {
  isVisible: boolean;
  onClose: () => void;
  currentSession?: {
    startTime: Date;
    messages: Array<{ type: string; text: string; timestamp: Date }>;
    scenario?: any;
  };
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  isVisible,
  onClose,
  currentSession
}) => {
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 0,
    totalDuration: 0,
    averageResponseTime: 0,
    confidenceScore: 0,
    scenariosCompleted: 0,
    improvementAreas: [],
    strengths: []
  });

  // Calculate metrics from current session and stored data
  useEffect(() => {
    if (currentSession) {
      const duration = Date.now() - currentSession.startTime.getTime();
      const messageCount = currentSession.messages.length;
      const userMessages = currentSession.messages.filter(m => m.type === 'user');

      // Simulate AI analysis (in real app, this would come from actual analysis)
      const confidenceScore = Math.min(95, 60 + (userMessages.length * 3) + Math.random() * 20);
      const avgResponseTime = 1200 + Math.random() * 800; // Simulated response time

      const improvementAreas = [
        messageCount < 5 ? "Try more detailed responses" : null,
        userMessages.some(m => m.text.length < 10) ? "Expand on your answers" : null,
        duration < 300000 ? "Practice longer conversations" : null,
      ].filter(Boolean) as string[];

      const strengths = [
        confidenceScore > 80 ? "Great confidence level!" : null,
        messageCount > 10 ? "Excellent engagement" : null,
        userMessages.some(m => m.text.includes('?')) ? "Good questioning skills" : null,
        "Clear communication style"
      ].filter(Boolean) as string[];

      setMetrics(prev => ({
        totalConversations: prev.totalConversations + 1,
        totalDuration: prev.totalDuration + duration,
        averageResponseTime: avgResponseTime,
        confidenceScore: Math.round(confidenceScore),
        scenariosCompleted: prev.scenariosCompleted + (currentSession.scenario ? 1 : 0),
        improvementAreas,
        strengths
      }));
    }
  }, [currentSession]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

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
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Performance Analytics
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your communication skills breakdown
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center"
              >
                <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalConversations}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Conversations
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center"
              >
                <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(metrics.totalDuration)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Time
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center"
              >
                <Target className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.scenariosCompleted}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Scenarios Done
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`rounded-xl p-4 text-center ${getScoreBg(metrics.confidenceScore)}`}
              >
                <Star className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(metrics.confidenceScore)}`} />
                <div className={`text-2xl font-bold ${getScoreColor(metrics.confidenceScore)}`}>
                  {metrics.confidenceScore}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Confidence
                </div>
              </motion.div>
            </div>

            {/* Strengths */}
            {metrics.strengths.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-green-800 dark:text-green-400">
                    Your Strengths
                  </h3>
                </div>
                <div className="space-y-2">
                  {metrics.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Areas for Improvement */}
            {metrics.improvementAreas.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                    Areas for Growth
                  </h3>
                </div>
                <div className="space-y-2">
                  {metrics.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Progress Tips */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
            >
              <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">
                💡 Quick Tips for Better Communication
              </h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>• Practice active listening by asking follow-up questions</li>
                <li>• Use positive body language and maintain eye contact</li>
                <li>• Be concise yet thorough in your responses</li>
                <li>• Show empathy and understanding in conversations</li>
                <li>• Take your time to think before responding</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
