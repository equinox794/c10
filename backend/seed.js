const sqlite3 = require('sqlite3').verbose();

// Veritabanı bağlantısı
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
    return;
  }
  console.log('Veritabanına bağlandı.');

  // Örnek müşteriler
  const customers = [
    {
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '0532 111 2233',
      address: 'İstanbul, Türkiye',
      balance: 1500
    },
    {
      name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      phone: '0533 222 3344',
      address: 'Ankara, Türkiye',
      balance: 2500
    },
    {
      name: 'Ayşe Kaya',
      email: 'ayse@example.com',
      phone: '0534 333 4455',
      address: 'İzmir, Türkiye',
      balance: 3500
    }
  ];

  // Örnek stok ürünleri
  const stock = [
    {
      name: 'NPK 15-15-15',
      code: 'NPK001',
      quantity: 1000,
      min_quantity: 100,
      unit_price: 150,
      unit: 'kg',
      category: 'Gübre'
    },
    {
      name: 'NPK 20-20-0',
      code: 'NPK002',
      quantity: 800,
      min_quantity: 100,
      unit_price: 160,
      unit: 'kg',
      category: 'Gübre'
    },
    {
      name: 'Üre',
      code: 'URE001',
      quantity: 50,
      min_quantity: 100,
      unit_price: 120,
      unit: 'kg',
      category: 'Hammadde'
    }
  ];

  // Örnek reçeteler
  const recipes = [
    {
      name: 'Standart NPK 15-15-15',
      code: 'REC001',
      description: 'Dengeli NPK formülü',
      category: 'NPK'
    },
    {
      name: 'Özel NPK 20-20-0',
      code: 'REC002',
      description: 'Fosfor ağırlıklı formül',
      category: 'NPK'
    },
    {
      name: 'Mikro Element Karışımı',
      code: 'REC003',
      description: 'Demir, çinko ve mangan içerikli formül',
      category: 'Mikro'
    },
    {
      name: 'Organik Gübre Formülü',
      code: 'REC004',
      description: 'Organik madde ve humik asit karışımı',
      category: 'Organik'
    }
  ];

  // Örnek siparişler
  const orders = [
    {
      customer_id: 1,
      total: 2250,
      status: 'Beklemede'
    },
    {
      customer_id: 2,
      total: 1600,
      status: 'Onaylandı'
    },
    {
      customer_id: 3,
      total: 1800,
      status: 'Beklemede'
    }
  ];

  // Verileri ekle
  db.serialize(() => {
    // Müşterileri ekle
    const customerStmt = db.prepare('INSERT OR IGNORE INTO customers (name, email, phone, address, balance) VALUES (?, ?, ?, ?, ?)');
    customers.forEach(customer => {
      customerStmt.run([customer.name, customer.email, customer.phone, customer.address, customer.balance]);
    });
    customerStmt.finalize();

    // Stok ürünlerini ekle
    const stockStmt = db.prepare('INSERT OR IGNORE INTO stock (name, code, quantity, min_quantity, unit_price, unit, category) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stock.forEach(item => {
      stockStmt.run([item.name, item.code, item.quantity, item.min_quantity, item.unit_price, item.unit, item.category]);
    });
    stockStmt.finalize();

    // Reçeteleri ekle
    const recipeStmt = db.prepare('INSERT OR IGNORE INTO recipes (name, code, description, category) VALUES (?, ?, ?, ?)');
    recipes.forEach(recipe => {
      recipeStmt.run([recipe.name, recipe.code, recipe.description, recipe.category]);
    });
    recipeStmt.finalize();

    // Siparişleri ekle
    const orderStmt = db.prepare('INSERT OR IGNORE INTO orders (customer_id, total, status) VALUES (?, ?, ?)');
    orders.forEach(order => {
      orderStmt.run([order.customer_id, order.total, order.status]);
    });
    orderStmt.finalize();

    console.log('Örnek veriler eklendi.');
  });
});

// İşlem tamamlandığında bağlantıyı kapat
process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('Veritabanı kapatma hatası:', err.message);
    } else {
      console.log('Veritabanı bağlantısı kapatıldı.');
    }
  });
}); 