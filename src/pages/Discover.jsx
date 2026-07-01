import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=ec4899&color=fff&size=400&bold=true`;

export default function Discover() {
  const [allProfiles, setAllProfiles] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [index, setIndex] = useState(0);
  const [liking, setLiking] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  // Filter state
  const [filterGender, setFilterGender] = useState("all");
  const [filterMinAge, setFilterMinAge] = useState("");
  const [filterMaxAge, setFilterMaxAge] = useState("");

  const currentUserRef = useRef(null);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/me", {
        headers: { Authorization: token },
      });
      const data = await res.json();
      currentUserRef.current = data;
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/users", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setAllProfiles(list);
        setProfiles(list);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  // Apply filters
  const applyFilter = () => {
    let filtered = [...allProfiles];

    if (filterGender !== "all") {
      filtered = filtered.filter(
        (u) => u.gender?.toLowerCase() === filterGender
      );
    }

    if (filterMinAge) {
      filtered = filtered.filter((u) => u.age >= Number(filterMinAge));
    }

    if (filterMaxAge) {
      filtered = filtered.filter((u) => u.age <= Number(filterMaxAge));
    }

    setProfiles(filtered);
    setIndex(0);
    setShowFilter(false);
  };

  const resetFilter = () => {
    setFilterGender("all");
    setFilterMinAge("");
    setFilterMaxAge("");
    setProfiles(allProfiles);
    setIndex(0);
    setShowFilter(false);
  };

  const handleSwipe = (event, info) => {
    if (info.offset.x > 100) handleLike();
    if (info.offset.x < -100) nextCard();
  };

  const nextCard = () => {
    setIndex((prev) => (prev + 1) % profiles.length);
  };

  const handleLike = async () => {
    const profile = profiles[index % profiles.length];
    if (!profile || !currentUserRef.current || liking) return;

    setLiking(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          likedBy: currentUserRef.current._id,
          likedTo: profile._id,
        }),
      });
      const data = await res.json();
      nextCard();
      if (data.matched) setMatchedUser(profile);
    } catch (error) {
      console.log(error);
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <svg className="animate-spin h-12 w-12 text-pink-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  const profile = profiles.length > 0 ? profiles[index % profiles.length] : null;

  return (
    <div className="flex items-center justify-center min-h-[90vh] relative text-white px-4">

      {/* ── Filter Button (top right) ── */}
      <button
        onClick={() => setShowFilter(true)}
        className="fixed top-20 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
      >
        🔍 Filter
        {(filterGender !== "all" || filterMinAge || filterMaxAge) && (
          <span className="bg-pink-500 text-white text-xs rounded-full w-2 h-2 inline-block" />
        )}
      </button>

      {/* ── Filter Panel ── */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 flex items-end sm:items-center justify-center"
            onClick={() => setShowFilter(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm"
            >
              <h2 className="text-xl font-bold mb-5 text-center">🔍 Filter People</h2>

              {/* Gender */}
              <label className="text-sm text-gray-400 mb-2 block">Gender</label>
              <div className="flex gap-2 mb-4">
                {["all", "male", "female", "other"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFilterGender(g)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition ${
                      filterGender === g
                        ? "bg-pink-500 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {g === "all" ? "All" : g}
                  </button>
                ))}
              </div>

              {/* Age Range */}
              <label className="text-sm text-gray-400 mb-2 block">Age Range</label>
              <div className="flex gap-3 mb-6">
                <input
                  type="number"
                  placeholder="Min"
                  value={filterMinAge}
                  onChange={(e) => setFilterMinAge(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-white/10 outline-none placeholder-gray-500 text-center"
                />
                <span className="self-center text-gray-500">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filterMaxAge}
                  onChange={(e) => setFilterMaxAge(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-white/10 outline-none placeholder-gray-500 text-center"
                />
              </div>

              <button
                onClick={applyFilter}
                className="w-full bg-pink-500 hover:bg-pink-600 p-3 rounded-xl font-semibold mb-2 transition"
              >
                Apply Filter
              </button>
              <button
                onClick={resetFilter}
                className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-xl text-sm transition"
              >
                Reset
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Match Popup ── */}
      <AnimatePresence>
        {matchedUser && (
          <motion.div
            key="match-popup"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-30 bg-black/80"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-10 text-center shadow-2xl max-w-[320px] mx-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl mb-4"
              >
                💕
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">It's a Match!</h2>
              <p className="text-lg mb-6 opacity-90">
                You and <span className="font-bold">{matchedUser.name}</span> liked each other!
              </p>
              <button
                onClick={() => setMatchedUser(null)}
                className="w-full bg-white text-pink-600 font-semibold py-3 rounded-xl hover:bg-pink-50 transition"
              >
                Keep Swiping 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No Profiles ── */}
      {!profile ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="text-6xl mb-4">👀</div>
          <h2 className="text-2xl font-bold">
            {profiles.length === 0 && allProfiles.length > 0
              ? "No matches for this filter"
              : "No users yet"}
          </h2>
          <p className="text-gray-400 mt-2">
            {profiles.length === 0 && allProfiles.length > 0
              ? "Try changing the filters"
              : "Ask your friends to join!"}
          </p>
          {profiles.length === 0 && allProfiles.length > 0 && (
            <button
              onClick={resetFilter}
              className="mt-4 bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full transition"
            >
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={profile._id + index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleSwipe}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, x: 300, rotate: 10 }}
            transition={{ duration: 0.3 }}
            whileDrag={{ scale: 1.03 }}
            className="w-full max-w-[340px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div className="relative">
              <img
                src={profile.profileImage || defaultAvatar(profile.name)}
                alt="profile"
                className="w-full h-[420px] object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-2xl font-bold">
                  {profile.name}{profile.age ? `, ${profile.age}` : ""}
                </h2>
                {profile.gender && (
                  <span className="text-xs bg-pink-500/80 px-2 py-0.5 rounded-full capitalize">
                    {profile.gender}
                  </span>
                )}
              </div>
            </div>

            <div className="px-5 py-3">
              <p className="text-sm text-gray-300 line-clamp-2">
                {profile.bio || "No bio added"}
              </p>
              <p className="text-xs text-gray-600 mt-1 text-right">
                {(index % profiles.length) + 1} / {profiles.length}
              </p>
            </div>

            <div className="flex justify-around px-5 pb-5 pt-1 gap-4">
              <button
                onClick={nextCard}
                className="flex-1 bg-white/10 hover:bg-red-500/80 border border-white/10 transition py-3 rounded-2xl text-lg font-medium"
              >
                ❌ Skip
              </button>
              <button
                onClick={handleLike}
                disabled={liking}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition py-3 rounded-2xl text-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30"
              >
                {liking ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : "❤️ Like"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
