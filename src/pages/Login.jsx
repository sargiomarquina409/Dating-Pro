import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ← NEW

  const handleLogin = async () => {
    setLoading(true); // ← NEW
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/discover");
      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false); // ← NEW
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-[350px] text-white">

        <h1 className="text-3xl font-bold text-center mb-6">
          Dating Pro ❤️
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-white/20 outline-none placeholder-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 rounded-lg bg-white/20 outline-none placeholder-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 transition p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Logging in...
            </>
          ) : "Login"}
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="text-pink-300 cursor-pointer">
            Register
          </span>
        </p>

      </div>
    </div>
  );
}