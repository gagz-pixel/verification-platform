const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// FACE REGISTRATION
router.post(
  "/register-face",
  authMiddleware,
  upload.single("file"),
  verificationController.registerFace
);

// FACE VERIFICATION
router.post(
  "/verify",
  authMiddleware,
  upload.single("file"),
  verificationController.verifyFace
);

// ✅ ADDED: Verification history
router.get(
  "/history",
  authMiddleware,
  verificationController.getHistory
);

module.exports = router;