import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { token, faceVerified } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" />;
  }

  // ✅ FIX: Corrected path from "/verify-face" to "/face-verify"
  if (!faceVerified) {
    return <Navigate to="/face-verify" />;
  }

  return children;
}

export default ProtectedRoute;