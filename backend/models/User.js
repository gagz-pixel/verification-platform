const pool = require('../config/db');

const User = {

  async create(name, email, hashedPassword) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
       RETURNING id, name, email, password`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, password FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  // ── FACE ──────────────────────────────────────────────────────────────────

  async getEmbedding(userId) {
    const result = await pool.query(
      `SELECT face_embedding FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rowCount === 0) throw new Error("User not found");
    return result.rows[0].face_embedding ?? null;
  },

  async saveEmbedding(userId, embedding) {
    const result = await pool.query(
      `UPDATE users SET face_embedding = $1 WHERE id = $2 RETURNING id`,
      [JSON.stringify(embedding), userId]
    );
    if (result.rowCount === 0) throw new Error("User not found while saving embedding");
    return result.rows[0];
  },

  // ── VOICE ──────────────────────────────────────────────────────────────────

  async getVoiceEmbedding(userId) {
    const result = await pool.query(
      `SELECT voice_embedding FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rowCount === 0) throw new Error("User not found");
    return result.rows[0].voice_embedding ?? null;
  },

  async saveVoiceEmbedding(userId, embedding) {
    const result = await pool.query(
      `UPDATE users SET voice_embedding = $1 WHERE id = $2 RETURNING id`,
      [JSON.stringify(embedding), userId]
    );
    if (result.rowCount === 0) throw new Error("User not found while saving voice embedding");
    return result.rows[0];
  },

};

module.exports = User;