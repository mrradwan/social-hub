import React, { createContext, useEffect, useState } from "react";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("userToken"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("userToken", token);
    } else {
      localStorage.removeItem("userToken");
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
