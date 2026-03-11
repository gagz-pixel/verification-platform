const axios = require("axios");
const FormData = require("form-data");

// ✅ Use env var instead of hardcoded URL
const ML_SERVICE_URL = `${process.env.ML_SERVICE_URL || "http://localhost:8000"}/extract-embedding`;

async function generateEmbedding(imageBuffer) {
  try {
    const formData = new FormData();
    formData.append("file", imageBuffer, { filename: "face.jpg" });

    const response = await axios.post(ML_SERVICE_URL, formData, {
      headers: formData.getHeaders()
    });

    if (!response.data.success || !response.data.embedding) {
      console.warn("ML service: face not detected");
      return null;
    }

    return {
      embedding: response.data.embedding,
      detectionScore: response.data.det_score ?? response.data.detection_score ?? null
    };

  } catch (error) {
    console.error("ML service error:", error.message);
    return null;
  }
}

function generateLivenessScore() {
  return 0.9;
}

function cosineSimilarity(vec1, vec2) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot   += vec1[i] * vec2[i];
    normA += vec1[i] * vec1[i];
    normB += vec2[i] * vec2[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { generateEmbedding, generateLivenessScore, cosineSimilarity };