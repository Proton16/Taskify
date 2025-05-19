import React, { useEffect, useState } from "react";

export default function SessionInfo({ sessionId }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch your session data by ID
    fetch(`http://localhost:5001/api/sessions/${sessionId}`)
      .then(res => res.json())
      .then(data => setSession(data));
  }, [sessionId]);

  if (!session) return <div>Loading session...</div>;

  return (
    <div className="p-6 rounded bg-muted dark:bg-dark-muted shadow">
      <h2 className="text-xl font-bold mb-2">{session.title}</h2>
      <p className="mb-2"><span className="font-semibold">Duration:</span> {session.duration}</p>
      <p className="mb-2"><span className="font-semibold">Started:</span> {new Date(session.createdAt).toLocaleString()}</p>
      <div className="mb-2">
        <span className="font-semibold">Blocked Websites:</span>
        <ul className="list-disc pl-5">
          {session.websites.map((site, i) => <li key={i}>{site}</li>)}
        </ul>
      </div>
      {/* If you add chats or tasks, display them here */}
      {session.chats && session.chats.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Chats:</span>
          <ul className="list-disc pl-5">
            {session.chats.map((chat, i) => <li key={i}>{chat}</li>)}
          </ul>
        </div>
      )}
      {session.tasks && session.tasks.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold">Tasks:</span>
          <ul className="list-disc pl-5">
            {session.tasks.map((task, i) => <li key={i}>{task}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}