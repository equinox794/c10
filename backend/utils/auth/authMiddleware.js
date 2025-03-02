const jwt = require('jsonwebtoken');
const logger = require('../logger');

// JWT Secret Key - Üretim ortamında process.env veya ayrı bir config dosyasından alınmalı
const JWT_SECRET = process.env.JWT_SECRET || 'bioplant-secret-key-change-in-production';

// JWT token doğrulama middleware'i
const authenticateToken = (req, res, next) => {
  // Header'dan token'ı al
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" formatı

  if (!token) {
    logger.warn('Erişim token\'ı eksik');
    return res.status(401).json({ error: 'Yetkilendirme başarısız', message: 'Erişim token\'ı gerekli' });
  }

  // Token'ı doğrula
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Geçersiz token:', err.message);
      return res.status(403).json({ error: 'Yetkilendirme başarısız', message: 'Geçersiz veya süresi dolmuş token' });
    }

    // Token doğruysa, user bilgisini request'e ekle
    req.user = user;
    next();
  });
};

// Token oluşturan yardımcı fonksiyon
const generateToken = (user) => {
  // Token'a dahil edilecek kullanıcı bilgileri
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'user'
  };

  // Token oluştur - 24 saat geçerli
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET
}; 