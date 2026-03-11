const pool = require('../config/db');

const VerificationLog = {
  async create(userId, similarityScore, livenessScore, status) {
    const result = await pool.query(
      `INSERT INTO verification_logs 
       (user_id, similarity_score, liveness_score, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, similarityScore, livenessScore, status]
    );
    return result.rows[0];
  },

  async getByUser(userId) {
    const result = await pool.query(
      `SELECT * FROM verification_logs
       WHERE user_id = $1
       ORDER BY created_at DESC`,  // FIX: added missing comma here
      [userId]
    );
    return result.rows;
  }
};

module.exports = VerificationLog;