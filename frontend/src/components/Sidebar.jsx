import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Sidebar() {
  const [sessions, setSessions] = useState({});
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [menuOpenSessionId, setMenuOpenSessionId] = useState(null);
  const { token, refreshTrigger } = useAuth();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) {
        setSessions({});
        return;
      }

      try {
        const response = await fetch('http://localhost:5001/api/sessions', {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Fixed template literal
          },
        });

        if (!response.ok) throw new Error('Failed to fetch sessions');

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err.message);
        setSessions({});
      }
    };

    fetchSessions();
  }, [token, refreshTrigger]);

  const handleNewChat = () => {
    console.log('New chat initiated');
  };

  const handleRename = (sessionId) => {
    console.log(`Rename session ${sessionId}`); // ✅ Corrected
  };

  const handleDelete = (sessionId) => {
    console.log(`Delete session ${sessionId}`); // ✅ Corrected
  };

  return (
    <div className="p-4">
      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="flex items-center gap-2 px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600 w-full"
      >
        <Plus size={16} />
        New Chat
      </button>

      {/* Sessions Grouped by Date */}
      {Object.entries(sessions).length === 0 ? (
        <div className="text-sm text-gray-500">No conversations found.</div>
      ) : (
        Object.entries(sessions).map(([date, sessionList]) => (
          <div key={date} className="mb-6">
            <div className="text-xs text-gray-500 mb-2">{date}</div>
            <ul className="space-y-1">
              {Array.isArray(sessionList) &&
                sessionList.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isHovered = session.id === hoveredSessionId;
                  const showMenu = isActive || session.id === menuOpenSessionId;

                  return (
                    <li
                      key={session.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        isActive
                          ? 'bg-green-200'
                          : isHovered
                          ? 'bg-gray-200'
                          : 'bg-white'
                      }`}
                      onClick={() => setActiveSessionId(session.id)}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{session.icon}</span>
                        <span className="truncate">{session.title}</span>
                      </div>
                      <div className="relative">
                        {(isHovered || isActive) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenSessionId(
                                menuOpenSessionId === session.id ? null : session.id
                              );
                            }}
                            className="p-1 rounded hover:bg-gray-300"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(session.id);
                                setMenuOpenSessionId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                            >
                              <Edit2 size={14} />
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                                setMenuOpenSessionId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
