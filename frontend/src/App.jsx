import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import { useAuth } from './components/AuthContext';
import "./App.css";

export default function App() {
  const { isAuthenticated, email, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dark, setDark] = useState(
    () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

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
          <div className="w-screen h-screen flex bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground transition-colors duration-300 overflow-hidden">
            {/* Sidebar */}
            <div
              className={`fixed top-0 left-0 h-full bg-muted dark:bg-dark-muted shadow-lg transition-all duration-300 z-40 ${
                sidebarOpen ? 'w-[90vw]' : 'w-0 overflow-hidden'
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu className="text-accent dark:text-dark-accent w-6 h-6" />
                </button>
                <div className="text-accent dark:text-dark-accent font-bold text-xl text-center flex-1">Taskify</div>
              </div>
              <Sidebar />
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between bg-muted dark:bg-dark-muted p-4 shadow-md relative z-10">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="z-50">
                  <Menu className="text-accent dark:text-dark-accent w-6 h-6" />
                </button>
                {/* Mode Toggle Button (Center) */}
                <div className="text-center absolute left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={() => setDark((d) => !d)}
                    className="bg-accent dark:bg-dark-accent text-white dark:text-dark-foreground px-4 py-1 rounded-full shadow transition-colors duration-300"
                  >
                    {dark ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
                {/* Profile Section */}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown((prev) => !prev)}
                      className="bg-accent dark:bg-dark-accent w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-dark-accent"
                    >
                      {email?.charAt(0).toUpperCase() || <User size={18} />}
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-muted border border-gray-300 rounded shadow z-50">
                        <div className="p-3 text-gray-700 dark:text-dark-foreground border-b">{email}</div>
                        <button
                          onClick={() => alert('Settings coming soon!')}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:dark:bg-dark-background flex items-center gap-2 text-sm text-gray-700 dark:text-dark-foreground"
                        >
                          <Settings size={16} /> Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:dark:bg-dark-background flex items-center gap-2 text-sm text-gray-700 dark:text-dark-foreground"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => navigate('/auth')}>
                    <User className="text-accent dark:text-dark-accent w-6 h-6" />
                  </button>
                )}
              </div>
              {/* Chat Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-gray-500 dark:text-dark-foreground/70 text-center">
                  Start chatting with Taskify...
                </div>
              </div>
              {/* Input Box */}
              <div className="p-4 bg-white dark:bg-dark-muted border-t border-gray-300 dark:border-dark-background">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 dark:border-dark-background rounded px-4 py-2 focus:outline-none bg-background dark:bg-dark-background text-foreground dark:text-dark-foreground"
                />
              </div>
            </div>
          </div>
        }
      />
      <Route path="/auth" element={<AuthPage dark={dark} setDark={setDark} />} />
    </Routes>
  );
}

