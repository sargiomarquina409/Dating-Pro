import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://dating-pro-backend.onrender.com");

const defaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=ec4899&color=fff&size=100&bold=true`;

export default function Chat() {
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/me", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setCurrentUser(data);
      socket.emit("join", data._id);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/matches", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setMatches(data.filter((u) => u !== null));
      } catch (error) {
        console.log(error);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://dating-pro-backend.onrender.com/api/messages/unread/counts", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setUnreadCounts(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { fetchUnreadCounts(); }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://dating-pro-backend.onrender.com/api/messages/${selectedUser._id}`,
        { headers: { Authorization: token } }
      );
      const data = await res.json();
      setMessages(data);

      await fetch(`https://dating-pro-backend.onrender.com/api/messages/read/${selectedUser._id}`, {
        method: "PUT",
        headers: { Authorization: token },
      });
      setUnreadCounts((prev) => ({ ...prev, [selectedUser._id]: 0 }));
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!selectedUser || selectedUser._id !== msg.senderId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
      }
    });
    return () => socket.off("receiveMessage");
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser || !currentUser) return;
    setSending(true);
    const token = localStorage.getItem("token");
    const msgData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      text: input,
    };
    await fetch("https://dating-pro-backend.onrender.com/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({ receiverId: selectedUser._id, text: input }),
    });
    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setInput("");
    setSending(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  const Spinner = ({ size = 6 }) => (
    <svg className={`animate-spin h-${size} w-${size} text-pink-500`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );

  return (
    <div className="flex h-[90vh] text-white">

      {/* LEFT */}
      <div className="w-[30%] border-r border-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Matches 💕</h2>

        {matchesLoading ? (
          <div className="flex flex-col items-center justify-center mt-10 gap-3">
            <Spinner size={8} />
            <p className="text-gray-400 text-sm">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">No matches yet 💔</p>
        ) : (
          <div className="space-y-3">
            {matches.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? "bg-pink-500/30 border border-pink-500"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <div className="relative">
                  {/* ← defaultAvatar with initials */}
                  <img
                    src={user.profileImage || defaultAvatar(user.name)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {unreadCounts[user._id] > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCounts[user._id]}
                    </span>
                  )}
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex flex-col w-[70%]">
        <div className="p-4 border-b border-gray-800 font-bold text-lg">
          {selectedUser ? `💬 ${selectedUser.name}` : "Select a match to chat"}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!selectedUser && (
            <p className="text-gray-500 text-center mt-10">👈 Select someone from matches</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`w-fit max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                msg.senderId === currentUser?._id || msg.senderId?._id === currentUser?._id
                  ? "bg-pink-500 ml-auto rounded-br-none"
                  : "bg-white/10 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {selectedUser && (
          <div className="flex gap-3 p-4 border-t border-gray-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-3 rounded-xl bg-white/10 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-pink-500 hover:bg-pink-600 transition px-6 rounded-xl font-semibold flex items-center gap-2"
            >
              {sending ? <Spinner size={4} /> : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
