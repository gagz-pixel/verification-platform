import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Register from "../pages/Register";
import FaceEnroll from "../pages/FaceEnroll";
import Login from "../pages/Login";
import FaceVerify from "../pages/FaceVerify";
import VoiceEnroll from "../pages/VoiceEnroll";
import VoiceVerify from "../pages/VoiceVerify";
import Dashboard from "../pages/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-face" element={<FaceEnroll />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ FIX: Correct path is /face-verify (not /verify-face) */}
      <Route path="/face-verify" element={<FaceVerify />} />

      <Route path="/voice-enroll" element={<VoiceEnroll />} />
      <Route path="/voice-verify" element={<VoiceVerify />} />

      {/* ✅ FIX: Removed duplicate /dashboard route — only one protected instance */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;