const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'music.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Không thể mở database:', error);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      src TEXT NOT NULL
    )`
  );

  db.get('SELECT COUNT(*) AS count FROM tracks', (error, row) => {
    if (error) {
      console.error('Lỗi kiểm tra tracks:', error);
      return;
    }

    if (row.count === 0) {
      const sampleTracks = [
        {
          name: 'Sample Chill Beat',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        },
        {
          name: 'Sample Piano Loop',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        },
        {
          name: 'Sample Acoustic',
          src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        },
      ];

      const stmt = db.prepare('INSERT INTO tracks (name, src) VALUES (?, ?)');
      sampleTracks.forEach((track) => {
        stmt.run(track.name, track.src);
      });
      stmt.finalize();
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/tracks', (req, res) => {
  db.all('SELECT id, name, src FROM tracks ORDER BY id ASC', (error, rows) => {
    if (error) {
      return res.status(500).json({ error: 'Lỗi khi tải danh sách bài hát.' });
    }
    res.json(rows);
  });
});

app.post('/api/tracks', (req, res) => {
  const { name, src } = req.body;
  if (!name || !src) {
    return res.status(400).json({ error: 'Tên và đường dẫn audio là bắt buộc.' });
  }

  const sql = 'INSERT INTO tracks (name, src) VALUES (?, ?)';
  db.run(sql, [name, src], function (error) {
    if (error) {
      return res.status(500).json({ error: 'Không thể thêm bài hát mới.' });
    }
    res.status(201).json({ id: this.lastID, name, src });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: dbPath });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
