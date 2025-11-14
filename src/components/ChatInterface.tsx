import { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';
import { Response, ClassificationResult } from '../types';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  response?: Response;
  classification?: ClassificationResult;
  timestamp: Date;
}

interface ChatInterfaceProps {
  studentId: string;
}

export function ChatInterface({ studentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Namaste! 👋 Main tumhara AI Learning Buddy hoon! Tum mujhse kuch bhi pooch sakte ho - concepts, stories, doubts, ya phir kuch fun learning! Kaise help kar sakta hoon? 😊',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = inputValue;
    setInputValue('');
    setIsLoading(true);
    startTimeRef.current = Date.now();

    try {
      const result = await aiService.processQuery(studentId, queryText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: result.response.response_text,
        response: result.response,
        classification: result.classification,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'Oops! Kuch gadbad ho gayi. Please thoda baad mein try karo! 😅',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (responseId: string, isPositive: boolean) => {
    if (feedbackGiven.has(responseId)) return;

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await aiService.submitFeedback(responseId, {
        thumbsUp: isPositive,
        rating: isPositive ? 5 : 3,
        timeSpent
      });

      setFeedbackGiven(prev => new Set(prev).add(responseId));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🧠 EduTech AI Buddy
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Your Smart Learning Companion
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white shadow-lg border border-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>

                {message.type === 'bot' && message.classification && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 px-2 py-1 rounded text-blue-700">
                      <span className="font-medium">Intent:</span> {message.classification.intent.replace(/_/g, ' ')}
                    </div>
                    <div className="bg-green-50 px-2 py-1 rounded text-green-700">
                      <span className="font-medium">Language:</span> {message.classification.language}
                    </div>
                    <div className="bg-purple-50 px-2 py-1 rounded text-purple-700">
                      <span className="font-medium">Age:</span> {message.classification.ageGroup}
                    </div>
                    <div className="bg-orange-50 px-2 py-1 rounded text-orange-700">
                      <span className="font-medium">Subject:</span> {message.classification.subject}
                    </div>
                  </div>
                )}

                {message.type === 'bot' && message.response && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleFeedback(message.response!.id, true)}
                      disabled={feedbackGiven.has(message.response.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
                        feedbackGiven.has(message.response.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">Helpful</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(message.response!.id, false)}
                      disabled={feedbackGiven.has(message.response.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
                        feedbackGiven.has(message.response.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="font-medium">Not helpful</span>
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Apna sawal yahan likho... (Hinglish, English, ya Hindi mein!)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Send</span>
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'Photosynthesis kya hai?',
              'Tell me a story about friendship',
              'Why is sky blue?',
              'Maths problem solve karna hai'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
