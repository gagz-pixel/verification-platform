require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes         = require('./routes/authRoutes');
const protectedRoutes    = require('./routes/protectedRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const voiceRoutes        = require('./routes/voiceRoutes');
const errorMiddleware    = require('./middleware/errorMiddleware');

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

const voiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // was 30, raised to 100
  message: { success: false, message: "Too many voice requests. Please slow down." },
});

// Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth',         authRoutes);
app.use('/api/protected',    protectedRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/voice', voiceLimiter, voiceRoutes);

// ML service health check proxy
app.get('/api/ml-health', async (req, res) => {
  try {
    const axios = require('axios');
    const result = await axios.get(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/health`, { timeout: 3000 });
    res.json({ online: true, ...result.data });
  } catch {
    res.json({ online: false });
  }
});

app.get('/api/health', (req, res) => res.status(200).json({ status: "OK" }));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
