const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const serviceAccount = require('./serviceAccountKey.json');
const app = express();
const port = 3000;

// Inisialisasi Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const dbFirebase = admin.firestore();
console.log('Firebase Admin SDK initialized!');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// SQLite
const dbLocal = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening local database:', err);
  } else {
    console.log('Local SQLite database connected!');
  }
});

// Buat tabel kalau belum ada
dbLocal.serialize(() => {
  dbLocal.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    synced INTEGER DEFAULT 0
  )`);
});

// Fungsi sinkronisasi offline → online
async function syncUnsyncedUsers() {
  dbLocal.all('SELECT * FROM users WHERE synced = 0', async (err, rows) => {
    if (err) {
      console.error('Gagal ambil data belum sinkron:', err.message);
      return;
    }
    for (const row of rows) {
      try {
        await dbFirebase.collection('users_firebase').add({
          name: row.name,
          email: row.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        dbLocal.run('UPDATE users SET synced = 1 WHERE id = ?', [row.id]);
        console.log(`Disinkronkan ke Firebase: ${row.name}`);
      } catch (error) {
        console.error('Gagal sinkron ke Firebase:', error.message);
      }
    }
  });
}

// Jalankan sinkronisasi saat server nyala
syncUnsyncedUsers();

// Template tabel
const renderTable = (title, users, source) => `
  <h3>${title}</h3>
  <table border="1" cellpadding="5" cellspacing="0">
    <tr><th>No</th><th>Nama</th><th>Email</th><th>Aksi</th></tr>
    ${users.map((u, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <button onclick="confirmDelete('${source}', '${u.id}')">🗑️ Hapus</button>
          <a href="/edit/${source}/${u.id}">✏️ Edit</a>
        </td>
      </tr>
    `).join('')}
  </table>
`;

// Halaman utama
app.get('/', async (req, res) => {
  let localUsers = [];
  await new Promise(resolve => {
    dbLocal.all('SELECT * FROM users', (err, rows) => {
      if (!err) localUsers = rows;
      resolve();
    });
  });

  let firebaseUsers = [];
  try {
    const snapshot = await dbFirebase.collection('users_firebase').get();
    firebaseUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Gagal ambil dari Firebase:', error);
  }

  res.send(`
    <html>
    <head>
      <title>User Manager API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        }
        h1, h3 {
          color: #4CAF50;
        }
        form {
          background-color: #fff;
          padding: 15px;
          border-radius: 8px;
          width: 300px;
          margin-bottom: 20px;
          box-shadow: 0 0 5px rgba(0,0,0,0.1);
        }
        input[type="text"], input[type="email"] {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
        table {
          width: 100%;
          background-color: white;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
        }
        tr:hover {
          background-color: #f1f1f1;
        }
        a {
          color: #2196F3;
          text-decoration: none;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <h1>User Manager API</h1>
      <form method="POST" action="/api/users">
        <label>Nama:</label><br>
        <input type="text" name="name" required><br>
        <label>Email:</label><br>
        <input type="email" name="email" required><br>
        <button type="submit">Tambah User</button>
      </form>
      <hr>
      ${renderTable('SQLite Users', localUsers, 'local')}
      <br>
      ${renderTable('Firebase Users', firebaseUsers, 'firebase')}
      <hr>
      <p>Endpoint API:</p>
      <ul>
        <li><a href="/api/users/local">GET /api/users/local</a></li>
        <li><a href="/api/users/firebase">GET /api/users/firebase</a></li>
      </ul>
      <script>
        function confirmDelete(source, id) {
          if (confirm('Yakin ingin menghapus user ini?')) {
            window.location.href = '/delete/' + source + '/' + id;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// API Local GET
app.get('/api/users/local', (req, res) => {
  dbLocal.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ users: rows });
  });
});

// API Firebase GET
app.get('/api/users/firebase', async (req, res) => {
  try {
    const snapshot = await dbFirebase.collection('users_firebase').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Firebase' });
  }
});

// POST ke SQLite dan langsung sinkronisasi
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  dbLocal.run('INSERT INTO users (name, email, synced) VALUES (?, ?, 0)', [name, email], function (err) {
    if (err) return res.status(500).send('Gagal simpan ke SQLite');
    syncUnsyncedUsers(); // langsung sinkronisasi ke Firebase
    res.redirect('/');
  });
});

// DELETE Local
app.get('/delete/local/:id', (req, res) => {
  const id = req.params.id;
  dbLocal.run('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) console.error(err.message);
    res.redirect('/');
  });
});

// DELETE Firebase
app.get('/delete/firebase/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await dbFirebase.collection('users_firebase').doc(id).delete();
  } catch (err) {
    console.error(err.message);
  }
  res.redirect('/');
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
