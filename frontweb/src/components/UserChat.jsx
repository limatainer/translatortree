/* eslint-disable react/prop-types */
import { AiOutlineUser } from 'react-icons/ai';
import aiBackground from '/AI-background.jpg';

function UserChat({
  messages,
  username,
  sendMessage,
  message,
  setMessage,
  formatTimestamp,
  messagesEndRef,
}) {
  const getMessageStyle = (msg) => {
    const baseStyle =
      'mb-3 p-3 rounded-lg shadow-md max-w-[85%] break-words text-white ';
    return msg.username === username
      ? baseStyle + 'bg-gray-700 ml-auto'
      : baseStyle + 'bg-[#4b4bf9]';
  };

  return (
    <div className="flex-grow flex items-center justify-center relative">
      {/* Background image with opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{ backgroundImage: `url(${aiBackground})` }}
      ></div>

      {/* Chat Window */}
      <div className="bg-gray-800 bg-opacity-80 p-4 rounded-lg shadow-lg w-full max-w-2xl h-[calc(100vh-12rem)] flex flex-col z-10">
        <h2 className="text-xl font-semibold mb-3 px-2 flex items-center">
          <AiOutlineUser className="text-lg mr-1" />
          <span>{username}</span>
        </h2>
        <div className="flex-grow overflow-y-auto mb-4 px-2">
          {messages.map((msg, index) => (
            <div key={index} className={getMessageStyle(msg)}>
              <div className="flex justify-between items-start mb-1">
                <strong className="font-medium text-sm">{msg.username}</strong>
                <span className="text-xs text-gray-300">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
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
        <form onSubmit={sendMessage} className="flex gap-2">
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
      </div>
    </div>
  );
}

export default UserChat;
