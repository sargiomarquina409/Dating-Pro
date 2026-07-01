import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profiles] = useState([
    {
      id: 1,
      name: "Ananya",
      age: 23,
      bio: "Loves travel ✈️ Coffee ☕ Music 🎧",
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    },
    {
      id: 2,
      name: "Riya",
      age: 25,
      bio: "Gym 🏋️‍♀️ Foodie 🍔 Movies 🎬",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    },
    {
      id: 3,
      name: "Priya",
      age: 22,
      bio: "Coding 💻 Anime 🎌 Night drives 🌙",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    },
  ]);

  const [matches, setMatches] = useState([]);

  const addMatch = (profile) => {
    setMatches((prev) => [...prev, profile]);
  };

  return (
    <UserContext.Provider value={{ profiles, matches, addMatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);