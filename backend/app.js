const express = require('express');
const path = require('path');
const multer = require('multer');
const { validateCode } = require('./db');
const { importExcel } = require('./excellImporter');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/upload', upload.single('excel'), async (req, res) => {
  try {
    await importExcel(req.file.path);
    res.json({ success: true, batchId: Date.now() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to process Excel' });
  }
});

app.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const result = await validateCode(code);
    res.json({ message: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
