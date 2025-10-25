                        SELECT 1 FROM packages WHERE size = ? AND unit = ? AND deleted_at IS NULL
                    )
                `, [pkg.size, pkg.unit, pkg.price, pkg.size, pkg.unit]);
            }
            console.log('Varsayılan ambalaj verileri eklendi');
        }
        // Settings tablosunu oluştur
        await dbRun(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dolar_kuru REAL DEFAULT 0,
                liste_a_kar_orani REAL DEFAULT 20,
                liste_b_kar_orani REAL DEFAULT 35,
                liste_c_kar_orani REAL DEFAULT 50,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // İlk ayarları ekle (eğer yoksa)
        await dbRun(`
            INSERT OR IGNORE INTO settings (id, dolar_kuru, liste_a_kar_orani, liste_b_kar_orani, liste_c_kar_orani)
            VALUES (1, 36.0, 20.0, 35.0, 50.0)
        `);
    } catch (error) {
        console.error('Veritabanı başlatma hatası:', error);
        throw error;
    }
};
// Veritabanını başlat
initializeDatabase().catch(err => {
    logger.error('Database initialization failed:', err);
    process.exit(1);
});
// Önbellek yönetimi
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika
function withCache(key, getData) {
    return async (req, res, next) => {
        try {
            const cached = cache.get(key);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return res.json(cached.data);
            }
            
            const data = await getData();
            cache.set(key, {
                data,
                timestamp: Date.now()
            });
            
            res.json(data);
        } catch (error) {
            next(error);
        }
    };
}
// API Endpoint'leri

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Backend API çalışıyor!', endpoints: ['/api/customers','/api/stock','/api/recipes','/api/orders'] });
});

// Müşteriler
app.get('/api/customers', async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const type = req.query.type || '';
        
        let query = 'SELECT * FROM customers WHERE 1=1';
        const params = [];
        
        if (searchTerm) {
            query += ' AND LOWER(name) LIKE LOWER(?)';
            params.push(`%${searchTerm}%`);
        }
        
        if (type && type !== 'Tümü') {
            query += ' AND type = ?';
            params.push(type);
        }
        
        query += ' ORDER BY id DESC';
        
        const customers = await dbAll(query, params);
        res.json(customers);
    } catch (error) {
        console.error('Müşteri listesi alınamadı:', error);
        res.status(500).json({ error: 'Müşteri listesi alınamadı' });
    }
});
