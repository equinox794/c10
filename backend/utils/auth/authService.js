const bcrypt = require('bcrypt');
const { generateToken } = require('./authMiddleware');
const logger = require('../logger');

// SQLite veritabanı bağlantısı
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Test için hard-coded admin kullanıcısı
const DEFAULT_ADMIN = {
  id: 1,
  username: 'admin',
  password: '$2b$10$3euPcmQFCiblsZeEu5s7p.9wVzLxP6.k9FgS4HUyVdyZbZjr.tCgC', // admin123
  role: 'admin'
};

// Kullanıcı giriş işlemini gerçekleştiren fonksiyon
const login = async (username, password) => {
  try {
    // İlk aşamada hard-coded kullanıcı kontrolü
    if (username === DEFAULT_ADMIN.username) {
      const isPasswordValid = await bcrypt.compare(password, DEFAULT_ADMIN.password);
      
      if (isPasswordValid) {
        const token = generateToken(DEFAULT_ADMIN);
        logger.info(`Kullanıcı giriş yaptı: ${username}`);
        return { success: true, token, user: { id: DEFAULT_ADMIN.id, username, role: DEFAULT_ADMIN.role } };
      }
    }
    
    // Gelecekte: Veritabanından kullanıcı kontrolü yapılabilir
    // Şu anda sadece hard-coded kullanıcı için kontrol yapıyoruz

    logger.warn(`Başarısız giriş denemesi: ${username}`);
    return { success: false, message: 'Geçersiz kullanıcı adı veya şifre' };
  } catch (error) {
    logger.error('Giriş sırasında hata:', error);
    throw new Error('Giriş işlemi sırasında bir hata oluştu');
  }
};

// Hard-coded admin parolası oluşturma yardımcı fonksiyonu (geliştirme amaçlı)
const generateAdminPasswordHash = async () => {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash('admin123', saltRounds);
    return hash;
  } catch (error) {
    logger.error('Şifre hash oluşturma hatası:', error);
    throw error;
  }
};

module.exports = {
  login,
  generateAdminPasswordHash
}; 