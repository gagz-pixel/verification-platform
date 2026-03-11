const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await pool.query(`SELECT COUNT(*) FROM users`);
    const totalVerifications = await pool.query(`SELECT COUNT(*) FROM verification_logs`);
    const successCount = await pool.query(`SELECT COUNT(*) FROM verification_logs WHERE status = 'SUCCESS'`);
    const failureCount = await pool.query(`SELECT COUNT(*) FROM verification_logs WHERE status = 'FAILED'`);

    const total = parseInt(totalVerifications.rows[0].count);
    const success = parseInt(successCount.rows[0].count);

    const successRate = total > 0 ? ((success / total) * 100).toFixed(2) : 0;

    res.json({
      totalUsers: totalUsers.rows[0].count,
      totalVerifications: total,
      successCount: successCount.rows[0].count,
      failureCount: failureCount.rows[0].count,
      successRate: successRate + "%"
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};