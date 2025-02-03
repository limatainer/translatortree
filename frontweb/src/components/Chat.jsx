import { useEffect } from 'react';
import { FaHeadset } from 'react-icons/fa';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import { MdSupervisorAccount } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import PropTypes from 'prop-types';
import aiBackground from '/AI-background.jpg';
import AgentChat from './AgentChat';

function Chat({
  messages,
  username,
  sendMessage,
  message,
  setMessage,
  formatTimestamp,
  messagesEndRef,
  isPrivate,
  setIsPrivate,
  role,
  language,
}) {
  useEffect(() => {
    if (role === 'supervisor') {
      setIsPrivate(true);
    }
  }, [role, setIsPrivate]);

  const getRoleIcon = (userRole) => {
    switch (userRole) {
      case 'user':
        return <AiOutlineUser className="text-lg mr-1" />;
      case 'agent':
        return <FaHeadset className="text-lg mr-1" />;
      case 'supervisor':
        return <MdSupervisorAccount className="text-lg mr-1" />;
      default:
        return null;
    }
  };

  if (role === 'agent') {
    return (
      <AgentChat
        messages={messages}
        username={username}
        sendMessage={sendMessage}
        message={message}
        setMessage={setMessage}
        formatTimestamp={formatTimestamp}
        messagesEndRef={messagesEndRef}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        language={language}
        role={role}
      />
    );
  }

  const bgColor = role === 'supervisor' ? '[#0f0f3d]' : 'gray-800';
  const inputBgColor = role === 'supervisor' ? '[#3a3a6a]' : 'gray-700';
  const inputBorderColor = role === 'supervisor' ? '[#4a4a7a]' : 'gray-600';

  return (
    <div className="flex-grow flex relative min-h-screen md:h-[calc(100vh-64px)] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{ backgroundImage: `url(${aiBackground})` }}
      />
      <div className="flex-grow flex z-10 relative p-2 md:p-4 w-full">
        {/* Main Chat Area - Responsive Width */}
        <div
          className={`
            w-full 
            ${role === 'user' ? 'md:w-[800px] md:mx-auto' : 'md:flex-grow'}
            bg-${bgColor} 
            bg-opacity-80 
            p-3 
            md:p-4 
            rounded-lg 
            flex 
            flex-col 
            h-full
        `}
        >
          {/* Chat Header */}
          <h2 className="text-xl font-semibold mb-3 px-2 flex items-center">
            {getRoleIcon(role)}
            <span>{username}</span>
          </h2>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 px-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`
                        mb-2 
                        p-2 
                        md:p-3 
                        rounded-lg 
                        shadow-md 
                        max-w-[85%] 
                        break-words 
                        text-white 
                        ${
                          msg.type === 'private'
                            ? 'bg-gray-600 ml-auto'
                            : msg.type === 'system'
                            ? 'bg-gray-500 mx-auto'
                            : msg.username === username
                            ? 'bg-gray-700 ml-auto'
                            : msg.role === 'user'
                            ? 'bg-gray-400'
                            : 'bg-[#4b4bf9]'
                        }
                    `}
              >
                <div className="flex justify-between items-start mb-1">
                  <strong className="font-medium text-sm flex items-center">
                    {getRoleIcon(msg.role)}
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
                className={`
                        flex-grow 
                        px-3 
                        py-2 
                        bg-${inputBgColor} 
                        border 
                        border-${inputBorderColor} 
                        rounded-md 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-indigo-500 
                        text-white 
                        text-sm
                    `}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm transition duration-150 ease-in-out"
              >
                Send
              </button>
            </form>

            {(role === 'supervisor' || role === 'agent') && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Chat.propTypes = {
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
  role: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
};

export default Chat;
