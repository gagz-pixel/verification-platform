import { createContext, useState } from "react";
import { loginUser } from "../services/authService";
import { saveToken, removeToken } from "../utils/tokenStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ FIX: Initialise from localStorage so state survives page refresh
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const [faceVerified, setFaceVerified] = useState(false);
  const [voiceVerified, setVoiceVerified] = useState(false);

  const login = async (credentials) => {
    try {
      const data = await loginUser(credentials);

      saveToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    localStorage.removeItem("face_enrolled");
    localStorage.removeItem("voice_enrolled");
    setUser(null);
    setToken(null);
    setFaceVerified(false);
    setVoiceVerified(false);
  };

  const verifyFaceSuccess = () => {
    setFaceVerified(true);
  };

  // ✅ FIX: Added missing verifyVoiceSuccess
  const verifyVoiceSuccess = () => {
    setVoiceVerified(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        faceVerified,
        voiceVerified,
        login,
        logout,
        verifyFaceSuccess,
        verifyVoiceSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};