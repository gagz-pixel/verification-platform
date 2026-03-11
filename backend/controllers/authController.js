const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const existingUser = await User.findByEmail(email);
  if (existingUser)
    return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create(name, email, hashedPassword);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.status(201).json({ message: 'User registered successfully', token, user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);
  if (!user) return res.status(400).json({ message: 'Invalid email' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  // ✅ Check both biometrics are enrolled before allowing login
  const faceEmbedding  = await User.getEmbedding(user.id).catch(() => null);
  const voiceEmbedding = await User.getVoiceEmbedding(user.id).catch(() => null);

  if (!faceEmbedding || !voiceEmbedding) {
    return res.status(403).json({
      message: "Please complete biometric enrollment (face + voice) before logging in.",
      enrollmentRequired: true,
      faceEnrolled:  !!faceEmbedding,
      voiceEnrolled: !!voiceEmbedding,
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // ✅ Random biometric challenge — only after both are confirmed enrolled
  const biometricChallenge = Math.random() < 0.5 ? "face" : "voice";

  res.json({
    message: 'Login successful',
    token,
    biometricChallenge,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

module.exports = { register, login };