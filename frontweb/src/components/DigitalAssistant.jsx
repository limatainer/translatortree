import { useState, useEffect, useCallback } from 'react';
import { AiOutlineRobot } from 'react-icons/ai';
import PropTypes from 'prop-types';

function DigitalAssistant({ messages, onSuggestionSelect, role }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMessage = useCallback(async (text) => {
    if (role !== 'agent') return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Analysis error:', error);
      setSuggestions([]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [role]);

  useEffect(() => {
    if (messages.length > 0 && role === 'agent') {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        analyzeMessage(lastMessage.text);
      }
    }
  }, [messages, analyzeMessage, role]);

  if (role !== 'agent') return null;

  return (
    <div className="bg-[#1a1a4a] p-4 rounded-lg mb-4">
      <div className="flex items-center mb-3">
        <AiOutlineRobot className="text-2xl mr-2" />
        <h3 className="text-lg font-semibold">Digital Assistant</h3>
      </div>
      <div className="space-y-2">
        {isAnalyzing ? (
          <div className="text-sm text-gray-400">Analyzing message...</div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionSelect(suggestion)}
              className="w-full bg-[#2a2a5a] p-3 rounded text-left hover:bg-[#3a3a6a] transition-colors duration-200"
            >
              <p className="text-sm">{suggestion}</p>
            </button>
          ))
        ) : (
          <div className="text-sm text-gray-400">No suggestions available</div>
        )}
      </div>
    </div>
  );
}

DigitalAssistant.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired,
  onSuggestionSelect: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired
};

export default DigitalAssistant;
