const VerificationLog = require("../models/VerificationLog");
const User = require("../models/User");

const {
  generateEmbedding,
  generateLivenessScore,
  cosineSimilarity
} = require("../services/biometricService");


// ===============================
// FACE REGISTRATION
// ===============================
exports.registerFace = async (req, res) => {
  console.log("FILE RECEIVED:", req.file);

  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const imageBuffer = req.file.buffer;
    const result = await generateEmbedding(imageBuffer);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "No face detected. Please try again."
      });
    }
    
    const embedding = result.embedding;
    
    console.log("Embedding length:", embedding.length);
    console.log("Saving embedding for user:", userId);
    
    await User.saveEmbedding(userId, embedding);

    console.log("Embedding saved to DB");

    return res.status(200).json({
      success: true,
      message: "Face registered successfully"
    });

  } catch (error) {
    console.error("Register Face Error:", error);
    return res.status(500).json({
      success: false,
      message: "Face registration failed"
    });
  }
};


// ===============================
// FACE VERIFICATION
// ===============================
exports.verifyFace = async (req, res) => {
  console.log("VerifyFace endpoint hit");
  try {
    const userId = req.user.id;
    console.log("Verifying for user:", userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded"
      });
    }

    const storedEmbeddingRaw = await User.getEmbedding(userId);
    console.log("User DB data:", storedEmbeddingRaw);

    if (!storedEmbeddingRaw) {
      return res.status(400).json({
        success: false,
        message: "Face not registered. Please register first."
      });
    }

    let storedEmbedding;
    try {
      storedEmbedding =
        typeof storedEmbeddingRaw === "string"
          ? JSON.parse(storedEmbeddingRaw)
          : storedEmbeddingRaw;
    } catch (parseErr) {
      return res.status(500).json({
        success: false,
        message: "Invalid stored face data. Please re-register your face."
      });
    }

    const imageBuffer = req.file.buffer;

    // ✅ NEW
const result = await generateEmbedding(imageBuffer);

if (!result) {
  return res.status(400).json({
    success: false,
    message: "Face not detected. Please look at the camera and try again."
  });
}

const newEmbedding = result.embedding;
    if (!Array.isArray(storedEmbedding) || !Array.isArray(newEmbedding)) {
      return res.status(500).json({
        success: false,
        message: "Embedding format invalid"
      });
    }

    if (storedEmbedding.length !== newEmbedding.length) {
      return res.status(500).json({
        success: false,
        message: "Embedding size mismatch"
      });
    }

    console.log("Stored embedding length:", storedEmbedding.length);
    console.log("New embedding length:", newEmbedding.length);

    const similarityScore = cosineSimilarity(storedEmbedding, newEmbedding);

    console.log("Stored embedding sample:", storedEmbedding.slice(0, 5));
    console.log("New embedding sample:", newEmbedding.slice(0, 5));
    console.log("Similarity Score:", similarityScore);

    const livenessScore = generateLivenessScore();

    let status = "FAILED";

    // InsightFace buffalo_l cosine similarity: same person typically 0.3–0.6
    if (similarityScore >= 0.40) {
      status = "SUCCESS";
    }

    const log = await VerificationLog.create(
      userId,
      similarityScore,
      livenessScore,
      status
    );

    return res.json({
      success: true,
      message: "Verification completed",
      data: {
        similarityScore: Number(similarityScore.toFixed(4)),
        livenessScore: Number(livenessScore.toFixed(4)),
        status,
        logId: log.id
      }
    });

  } catch (error) {
    console.error("Verify Face Error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed. Please try again." // FIX: no longer leaks raw error.message
    });
  }
};


// ===============================
// VERIFICATION HISTORY
// ===============================
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await VerificationLog.getByUser(userId);
    return res.json({
      success: true,
      message: "Verification history fetched",
      data: logs
    });
  } catch (error) {
    console.error("History Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch history"
    });
  }
};