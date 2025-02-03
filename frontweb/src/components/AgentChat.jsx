import { useState, useEffect, useCallback } from 'react';
import { FaHeadset } from 'react-icons/fa';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import { AiOutlineRobot } from 'react-icons/ai';
import PropTypes from 'prop-types';
import aiBackground from '/AI-background.jpg';

function AgentChat({
  messages,
  username,
  sendMessage,
  message,
  setMessage,
  formatTimestamp,
  messagesEndRef,
  isPrivate,
  setIsPrivate,
  language,
  role,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMessage = useCallback(
    async (text) => {
      if (role !== 'agent') return;

      setIsAnalyzing(true);
      try {
        const response = await fetch(
          'https://translatortree.onrender.com/api/analyze',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept-Language': language,
            },
            body: JSON.stringify({ text }),
          }
        );
        const data = await response.json();

        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Analysis error:', error);
        setSuggestions([]);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [language, role]
  );

  useEffect(() => {
    if (messages.length > 0 && role === 'agent') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        analyzeMessage(lastMessage.text);
      }
    }
  }, [messages, analyzeMessage, role]);

  const getMessageStyle = (msg) => {
    const baseStyle =
      'mb-3 p-3 rounded-lg shadow-md max-w-[85%] break-words text-white ';
    if (msg.type === 'private') return baseStyle + 'bg-gray-600 ml-auto';
    if (msg.type === 'system') return baseStyle + 'bg-gray-500 mx-auto';
    if (msg.username === username) return baseStyle + 'bg-gray-700 ml-auto';
    if (msg.role === 'user') return baseStyle + 'bg-gray-400';
    return baseStyle + 'bg-[#4b4bf9]';
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  const knowledgeBase = [
    {
      title: 'Product Returns',
      content: 'Process for handling product returns and refunds',
      solutions: ['Return policy', 'Refund timelines', 'Shipping labels'],
    },
    {
      title: 'Technical Support',
      content: 'Common technical issues and troubleshooting steps',
      solutions: [
        'Basic troubleshooting',
        'System requirements',
        'Network issues',
      ],
    },
    {
      title: 'Billing Issues',
      content: 'Payment and billing-related problems',
      solutions: ['Payment methods', 'Invoice queries', 'Subscription issues'],
    },
    {
      title: 'Account Management',
      content: 'Account-related assistance and settings',
      solutions: ['Password reset', 'Account security', 'Profile updates'],
    },
    {
      title: 'Service Status',
      content: 'Current system status and known issues',
      solutions: ['Service updates', 'Maintenance schedules', 'Known issues'],
    },
  ];

  return (
    <div className="flex-grow relative min-h-screen md:h-[calc(100vh-64px)] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{ backgroundImage: `url(${aiBackground})` }}
      />

      <div className="relative z-10 flex flex-col md:flex-row h-full">
        {/* Left Sidebar - Hidden on Mobile */}
        <div className="hidden md:block md:w-1/4 bg-gray-800 bg-opacity-80 p-4 rounded-lg overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">My conversations</h2>
          <div className="space-y-2">
            {[
              'Ashley Allen',
              'Marco Carelli',
              'Ginevera Romano',
              'Gina LoCascio',
              'Tony Rossi',
              'Christina Ricci',
              'May Line',
            ].map((name, index) => (
              <div
                key={index}
                className="bg-[#1a1a4a] p-3 rounded-lg flex items-center"
              >
                <div
                  className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-white ${
                    [
                      'bg-purple-500',
                      'bg-blue-500',
                      'bg-orange-500',
                      'bg-pink-500',
                      'bg-green-500',
                      'bg-indigo-500',
                      'bg-yellow-500',
                    ][index]
                  }`}
                >
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-400">Last text in the chat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-grow bg-gray-800 bg-opacity-80 p-4 rounded-lg flex flex-col h-full">
          {/* Chat Header */}
          <h2 className="text-xl font-semibold mb-3 px-2 flex items-center">
            <FaHeadset className="text-lg mr-1" />
            <span>{username}</span>
          </h2>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 px-2">
            {messages.map((msg, index) => (
              <div key={index} className={getMessageStyle(msg)}>
                <div className="flex justify-between items-start mb-1">
                  <strong className="font-medium text-sm flex items-center">
                    {msg.role === 'user' && (
                      <FaHeadset className="text-lg mr-1" />
                    )}
                    <span>{msg.username}</span>
                  </strong>
                  <span className="text-xs text-gray-300">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                {msg.type === 'private' && (
                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                    PRIVATE ({msg.senderRole} to {msg.targetRole})
                  </span>
                )}
                {msg.type === 'system' && (
                  <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full mb-1">
                    SYSTEM
                  </span>
                )}
                <div className="text-sm">{msg.text}</div>
                {msg.isTranslated && (
                  <div className="text-xs text-gray-300 mt-1 italic">
                    Original: {msg.originalText}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-2">
            <form onSubmit={sendMessage} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm transition duration-150 ease-in-out"
              >
                Send
              </button>
            </form>
            <div className="flex items-center justify-end mt-2">
              <span className="mr-2 text-sm">Private</span>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className="focus:outline-none"
              >
                {isPrivate ? (
                  <BsToggleOn className="text-indigo-500 text-2xl" />
                ) : (
                  <BsToggleOff className="text-gray-500 text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Digital Assistant Sidebar - Only visible for agents */}
        {role === 'agent' && (
          <div className="hidden md:block md:w-1/4 bg-gray-800 bg-opacity-80 p-4 rounded-lg overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <AiOutlineRobot className="text-lg mr-2" />
                Digital Assistant
              </h2>
              <div className="bg-[#1a1a4a] p-4 rounded-lg">
                {isAnalyzing ? (
                  <div className="text-sm text-gray-400">
                    Analyzing message...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full bg-[#2a2a5a] p-3 rounded text-left hover:bg-[#3a3a6a] transition-colors duration-200"
                      >
                        <p className="text-sm">{suggestion}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3">Knowledge Base</h3>
              <div className="space-y-2">
                {knowledgeBase.map((article, index) => (
                  <div key={index} className="bg-[#1a1a4a] p-3 rounded-lg">
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-gray-400">{article.content}</p>
                    <div className="mt-2 space-y-1">
                      {article.solutions.map((solution, sIndex) => (
                        <button
                          key={sIndex}
                          onClick={() => handleSuggestionClick(solution)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 block"
                        >
                          • {solution}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AgentChat.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      type: PropTypes.string,
      isTranslated: PropTypes.bool,
      originalText: PropTypes.string,
      senderRole: PropTypes.string,
      targetRole: PropTypes.string,
    })
  ).isRequired,
  username: PropTypes.string.isRequired,
  sendMessage: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  setMessage: PropTypes.func.isRequired,
  formatTimestamp: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  isPrivate: PropTypes.bool.isRequired,
  setIsPrivate: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
};

export default AgentChat;
