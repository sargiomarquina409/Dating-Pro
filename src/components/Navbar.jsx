import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/discover", icon: "🔥", label: "Discover" },
    { path: "/matches",  icon: "💕", label: "Matches"  },
    { path: "/chat",     icon: "💬", label: "Chat"     },
    { path: "/profile",  icon: "👤", label: "Profile"  },
  ];

  return (
    <div className="w-full bg-gray-950/90 backdrop-blur-md text-white flex justify-between items-center px-6 py-3 border-b border-pink-500/20 sticky top-0 z-50">

      {/* Logo */}
      <h1
        onClick={() => navigate("/discover")}
        className="text-xl font-extrabold cursor-pointer bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
      >
        DatingPro ❤️
      </h1>

      {/* Desktop Nav */}
      <div className="hidden sm:flex gap-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Nav — bottom fixed bar */}
      <div className="flex sm:hidden gap-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-3 py-1 rounded-xl text-xs transition-all ${
              isActive(item.path) ? "text-pink-400" : "text-gray-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
          </button>
        ))}
      </div>

    </div>
  );
}