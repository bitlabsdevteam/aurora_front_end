'use client';

import React, { useState } from 'react';
import { Input } from 'antd';
import { AlertCircle, Info, Send, ChevronRight, MessageSquare } from 'lucide-react';

// Mock insights data
const insights = [
  {
    id: 1,
    message: 'Reorder Denim Jackets by Nov 10',
    confidence: 95,
    type: 'warning',
  },
  {
    id: 2,
    message: 'Sales of Wireless Earbuds increasing due to social media trend',
    confidence: 88,
    type: 'info',
  },
  {
    id: 3,
    message: 'Consider increasing marketing spend in East Region',
    confidence: 82,
    type: 'info',
  },
];

interface ChatMessage {
  id: number;
  text: string;
  isAi: boolean;
}

const AiInsights = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. Ask me anything about your data!",
      isAi: true,
    },
  ]);

  const handleSendQuestion = () => {
    if (!question.trim()) return;

    // Add user message
    setChatHistory((prev) => [
      ...prev,
      { id: Date.now(), text: question, isAi: false },
    ]);

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Based on the data, ${question.toLowerCase()} shows interesting patterns. Would you like me to generate a detailed report?`,
          isAi: true,
        },
      ]);
    }, 1000);

    setQuestion('');
  };

  return (
    <div
      className={`bg-white shadow-sm rounded-xl transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isCollapsed ? 'hidden' : 'block'}`}>
            AI Insights
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          <div className="space-y-4 mb-6">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start space-x-3 text-sm"
              >
                {insight.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-gray-900">{insight.message}</p>
                  <p className="text-gray-500">{insight.confidence}% confidence</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default AiInsights; 