import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const defaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=ec4899&color=fff&size=100&bold=true`;

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/matches", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setMatches(data.filter((u) => u !== null));
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen text-white px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">💕 Your Matches</h1>

      {loading && (
        <div className="flex justify-center mt-20">
          <svg className="animate-spin h-8 w-8 text-pink-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center mt-20">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-xl font-semibold">No matches yet</h2>
          <p className="text-gray-400 mt-2">Keep swiping on Discover!</p>
          <button
            onClick={() => navigate("/discover")}
            className="mt-6 bg-pink-500 hover:bg-pink-600 transition px-8 py-3 rounded-full font-semibold"
          >
            Go Discover ❤️
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {matches.map((user) => (
          <div
            key={user._id}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4"
          >
            {/* ← defaultAvatar with initials */}
            <img
              src={user.profileImage || defaultAvatar(user.name)}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-bold">
                {user.name}{user.age ? `, ${user.age}` : ""}
              </h2>
              <p className="text-sm text-gray-300">{user.bio || "No bio"}</p>
            </div>
            <div className="ml-auto text-2xl">💕</div>
          </div>
        ))}
      </div>
    </div>
  );
}