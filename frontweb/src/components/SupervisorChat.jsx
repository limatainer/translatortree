/* eslint-disable react/prop-types */
import { MdSupervisorAccount } from 'react-icons/md';
import { BsToggleOn, BsToggleOff } from 'react-icons/bs';
import { FaHeadset } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
import aiBackground from '/AI-background.jpg';

function SupervisorChat({
  messages,
  username,
  sendMessage,
  message,
  setMessage,
  formatTimestamp,
  messagesEndRef,
  isPrivate,
  setIsPrivate,
}) {
  const getMessageStyle = (msg) => {
    const baseStyle =
      'mb-3 p-3 rounded-lg shadow-md max-w-[85%] break-words text-white ';
    if (msg.type === 'private') {
      return baseStyle + 'bg-gray-600 ml-auto';
    } else if (msg.type === 'system') {
      return baseStyle + 'bg-gray-500 mx-auto';
    } else if (msg.role === 'user') {
      return baseStyle + 'bg-gray-400';
    } else {
      return baseStyle + 'bg-[#4b4bf9] ml-auto';
    }
  };

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

  return (
    <div className="flex-grow flex relative min-h-screen">
      {/* Background image with opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{ backgroundImage: `url(${aiBackground})` }}
      />

      {/* Content */}
      <div className="flex-grow flex z-10 relative flex-col md:flex-row">
        {/* Left Sidebar - Hidden on Mobile */}
        <div className="hidden md:block md:w-1/4 bg-[#0f0f3d] bg-opacity-80 p-4 overflow-y-auto">
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
        <div className="flex-grow bg-[#0f0f3d] bg-opacity-80 p-4 flex flex-col">
          <div className="bg-[#1a1a4a] p-4 rounded-lg flex-grow overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-3 px-2 flex items-center">
              <MdSupervisorAccount className="text-lg mr-1" />
              <span>{username}</span>
            </h2>
            <div className="flex-grow overflow-y-auto mb-4 px-2">
              {messages.map((msg, index) => (
                <div key={index} className={getMessageStyle(msg)}>
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
            <div className="px-2">
              <form onSubmit={sendMessage} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow px-3 py-2 bg-[#3a3a6a] border border-[#4a4a7a] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
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
        </div>

        {/* Right Sidebar - Hidden on Mobile */}
        <div className="hidden md:block md:w-1/4 bg-[#0f0f3d] bg-opacity-80 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
          <div className="space-y-2">
            {[
              'Article 1',
              'Article 2',
              'Article 3',
              'Article 4',
              'Article 5',
            ].map((article, index) => (
              <div key={index} className="bg-[#1a1a4a] p-3 rounded-lg">
                <h3 className="font-medium">{article}</h3>
                <p className="text-sm text-gray-400">
                  Brief description of the article...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupervisorChat;
