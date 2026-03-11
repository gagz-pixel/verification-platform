const axios = require("axios");
const FormData = require("form-data");
const User = require("../models/User");
const VerificationLog = require("../models/VerificationLog");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ════════════════════════════════════════════════════════
// GET CHALLENGE PHRASE
// ════════════════════════════════════════════════════════
exports.getChallenge = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/voice/challenge`);
    return res.json(response.data);
  } catch (error) {
    console.error("getChallenge error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get challenge phrase",
    });
  }
};

// ════════════════════════════════════════════════════════
// ENROLL VOICE
// ════════════════════════════════════════════════════════
exports.enrollVoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const sampleNumber = parseInt(req.body.sample_number) || 1;
    const sessionToken = req.body.session_token;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file uploaded" });
    }

    if (!sessionToken) {
      return res.status(400).json({ success: false, message: "Missing session_token" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "audio.wav",
      contentType: req.file.mimetype || "audio/wav",
    });

    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/voice/enroll?user_id=${userId}&sample_number=${sampleNumber}&session_token=${sessionToken}`,
      formData,
      { headers: formData.getHeaders() }
    );

    const data = mlResponse.data;

    if (!data.success) {
      return res.status(400).json({ success: false, message: data.message || "Voice sample rejected" });
    }

    if (data.done && data.embedding) {
      await User.saveVoiceEmbedding(userId, data.embedding);
      return res.json({ success: true, done: true, message: "Voice enrolled successfully", sample_number: sampleNumber });
    }

    return res.json({ success: true, done: false, message: data.message, sample_number: sampleNumber });

  } catch (error) {
    console.error("enrollVoice error:", error.message);
    return res.status(500).json({ success: false, message: "Voice enrollment failed" });
  }
};

// ════════════════════════════════════════════════════════
// VERIFY VOICE
// ════════════════════════════════════════════════════════
exports.verifyVoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_token } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file uploaded" });
    }

    if (!session_token) {
      return res.status(400).json({ success: false, message: "Missing session_token" });
    }

    const storedEmbeddingRaw = await User.getVoiceEmbedding(userId);

    if (!storedEmbeddingRaw) {
      return res.status(400).json({ success: false, message: "Voice not enrolled. Please enroll first." });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: "audio.wav",
      contentType: req.file.mimetype || "audio/wav",
    });

    // ✅ FIX: embedding sent as POST body field, not URL query param
    formData.append("stored_embedding", storedEmbeddingRaw);

    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/voice/verify?user_id=${userId}&session_token=${session_token}`,
      formData,
      { headers: formData.getHeaders() }
    );

    const data = mlResponse.data;

    // ✅ Log voice verification attempt to DB
    try {
      await VerificationLog.create(
        userId,
        data.confidence || 0,
        null,
        data.match ? "SUCCESS" : "FAILED"
      );
    } catch (logErr) {
      console.error("Voice log error (non-fatal):", logErr.message);
    }

    return res.json({
      success: true,
      match: data.match,
      confidence: data.confidence,
      phrase_match: data.phrase_match,
      transcript: data.transcript,
      status: data.status,
      message: data.message,
    });

  } catch (error) {
    console.error("verifyVoice error:", error.message);
    return res.status(500).json({ success: false, message: "Voice verification failed" });
  }
};