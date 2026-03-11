const express = require("express");
const router = express.Router();
const voiceController = require("../controllers/voiceController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// GET challenge phrase (no file upload needed)
router.get("/challenge", authMiddleware, voiceController.getChallenge);

// POST enroll voice — accepts audio file + sample_number in body
router.post("/enroll", authMiddleware, upload.single("file"), voiceController.enrollVoice);

// POST verify voice — accepts audio file + session_token in body
router.post("/verify", authMiddleware, upload.single("file"), voiceController.verifyVoice);

module.exports = router;