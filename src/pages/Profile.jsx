import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const defaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=ec4899&color=fff&size=400&bold=true`;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/me", {
          headers: { Authorization: token },
        });
        const data = await res.json();
        setUser(data);
        setForm({
          name: data.name,
          age: data.age || "",
          bio: data.bio || "",
          gender: data.gender || "",
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://dating-pro-backend.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          ...form,
          profileImage: previewImage || user.profileImage,
        }),
      });
      const updated = await res.json();
      setUser(updated);
      setPreviewImage(null);
      setEditMode(false);
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-pink-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    );
  }

  // ← default avatar with name initials
  const displayImage = previewImage || user.profileImage || defaultAvatar(user.name);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-center items-center h-[90vh]">
        <div className="w-[350px] bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 text-center">

          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={displayImage}
              alt="profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-pink-400"
            />
            {editMode && (
              <>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 bg-pink-500 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg"
                >
                  📷
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {!editMode ? (
            <>
              <h2 className="text-2xl font-bold">
                {user.name}, {user.age || "N/A"}
              </h2>
              <p className="text-gray-300 mt-2">{user.bio || "No bio added"}</p>
              {user.gender && (
                <p className="text-pink-300 text-sm mt-1 capitalize">{user.gender}</p>
              )}
              <button
                onClick={() => setEditMode(true)}
                className="mt-6 w-full bg-pink-500 hover:bg-pink-600 p-3 rounded-lg"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="mt-3 w-full bg-red-500 hover:bg-red-600 p-3 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 mb-3 rounded-lg bg-white/20 outline-none placeholder-gray-300"
              />
              <input
                type="number"
                placeholder="Age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full p-3 mb-3 rounded-lg bg-white/20 outline-none placeholder-gray-300"
              />
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-3 mb-3 rounded-lg bg-white/20 outline-none text-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full p-3 mb-3 rounded-lg bg-white/20 outline-none placeholder-gray-300 resize-none"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Saving...
                  </>
                ) : "✅ Save"}
              </button>
              <button
                onClick={() => { setEditMode(false); setPreviewImage(null); }}
                className="mt-3 w-full bg-gray-600 hover:bg-gray-700 p-3 rounded-lg"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
