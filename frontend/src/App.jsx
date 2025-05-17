// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import { useAuth } from './components/AuthContext';

export default function App() {
  const { isAuthenticated, email, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    alert('Logged out');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
              className={`fixed top-0 left-0 h-full bg-green-100 shadow-lg transition-all duration-300 z-40 ${
                sidebarOpen ? 'w-[90%]' : 'w-0 overflow-hidden'
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu className="text-green-600 w-6 h-6" />
                </button>
                <div className="text-green-700 font-bold text-xl text-center flex-1">Taskify</div>
              </div>
              <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between bg-gray-200 p-4 shadow-md relative z-10">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="z-50">
                  <Menu className="text-green-600 w-6 h-6" />
                </button>

                <div className="text-center absolute left-1/2 transform -translate-x-1/2">
                  <button className="bg-green-200 text-green-800 px-4 py-1 rounded-full shadow">
                    Mode
                  </button>
                </div>

                {/* Profile Section */}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown((prev) => !prev)}
                      className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-green-600"
                    >
                      {email?.charAt(0).toUpperCase() || <User size={18} />}
                    </button>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow z-50">
                        <div className="p-3 text-gray-700 border-b">{email}</div>

                        <button
                          onClick={() => alert('Settings coming soon!')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                        >
                          <Settings size={16} /> Settings
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => navigate('/auth')}>
                    <User className="text-green-600 w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-gray-500 text-center">Start chatting with Taskify...</div>
              </div>

              {/* Input Box */}
              <div className="p-4 bg-white border-t border-gray-300">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none"
                />
              </div>
            </div>
          </div>
        }
      />

      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}