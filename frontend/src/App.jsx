import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FaceEnroll from "./pages/FaceEnroll";
import FaceVerify from "./pages/FaceVerify";
import VoiceEnroll from "./pages/VoiceEnroll";
import VoiceVerify from "./pages/VoiceVerify";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/register-face" element={<FaceEnroll />} />
        <Route path="/voice-enroll"  element={<VoiceEnroll />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/face-verify"   element={<FaceVerify />} />
        <Route path="/voice-verify"  element={<VoiceVerify />} />
        <Route path="/dashboard"     element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;