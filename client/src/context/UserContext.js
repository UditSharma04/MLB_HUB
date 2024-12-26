import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [preferences, setPreferences] = useState({
    language: 'en',
    favoriteTeams: [],
    favoritePlayers: [],
    notifications: {
      gameAlerts: true,
      highlights: true,
      predictions: true
    }
  });

  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };

  return (
    <UserContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 