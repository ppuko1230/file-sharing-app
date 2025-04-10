// app.js - メインサーバーファイル
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// アップロードされたファイルの保存先と名前の設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // オリジナルのファイル名を保持
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// 静的ファイルの提供
app.use(express.static('public'));
// アップロードしたファイルへのアクセス
app.use('/uploads', express.static('uploads'));

// ルートページを提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ファイル一覧を取得するAPI
app.get('/api/files', (req, res) => {
  fs.readdir('uploads/', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'ファイル一覧の取得に失敗しました' });
    }
    res.json({ files });
  });
});

// ファイルをアップロードするAPI（単一ファイル）
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ファイルがアップロードされていません' });
  }
  res.json({ 
    success: true, 
    file: req.file.originalname 
  });
});

// 複数ファイルをアップロードするAPI
app.post('/api/upload-multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'ファイルがアップロードされていません' });
  }
  const fileNames = req.files.map(file => file.originalname);
  res.json({ 
    success: true, 
    files: fileNames 
  });
});

// ファイルを削除するAPI
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'ファイルの削除に失敗しました' });
    }
    res.json({ success: true, message: `${filename} を削除しました` });
  });
});

// サーバーを起動
app.listen(port, () => {
  // uploads ディレクトリが存在しない場合は作成
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  // public ディレクトリが存在しない場合は作成
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  console.log(`ファイル共有サーバーが http://localhost:${port} で起動しました`);
});