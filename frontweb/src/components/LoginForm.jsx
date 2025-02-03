/* eslint-disable react/prop-types */
import { useState } from 'react';
function LoginForm({
  room,
  setRoom,
  username,
  setUsername,
  language,
  setLanguage,
  role,
  setRole,
  joinRoom,
}) {
  const [agentCode, setAgentCode] = useState('');
  const [supervisorCode, setSupervisorCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setErrorMessage('');
  };

  const handleJoinRoom = () => {
    if (role === 'agent' && agentCode !== 'FoundeverAgentRole') {
      setErrorMessage('Invalid code for Agent role');
      return;
    }

    if (role === 'supervisor' && supervisorCode !== 'FoundeverSupRole') {
      setErrorMessage('Invalid code for Supervisor role');
      return;
    }

    if (!room || !username || !language || !role) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    joinRoom();
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-[#09092d]">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="mb-4">
          <label
            htmlFor="room"
            className="block text-sm font-medium mb-1 text-white"
          >
            Conversation Code:
          </label>
          <input
            id="room"
            type="text"
            placeholder="Enter conversation code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium mb-1 text-white"
          >
            Your Name:
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="language"
            className="block text-sm font-medium mb-1 text-white"
          >
            Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            required
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt-pt">Portuguese</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium mb-1 text-white"
          >
            Role:
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            required
          >
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        {role === 'agent' && (
          <div className="mb-4">
            <label
              htmlFor="agentCode"
              className="block text-sm font-medium mb-1 text-white"
            >
              Agent Code:
            </label>
            <input
              id="agentCode"
              type="text"
              placeholder="Enter agent code"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
          </div>
        )}

        {role === 'supervisor' && (
          <div className="mb-4">
            <label
              htmlFor="supervisorCode"
              className="block text-sm font-medium mb-1 text-white"
            >
              Supervisor Code:
            </label>
            <input
              id="supervisorCode"
              type="text"
              placeholder="Enter supervisor code"
              value={supervisorCode}
              onChange={(e) => setSupervisorCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              required
            />
          </div>
        )}

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <button
          onClick={handleJoinRoom}
          disabled={!room || !username || !language || !role}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out`}
        >
          Join Conversation
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
