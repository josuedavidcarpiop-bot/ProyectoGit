const multer = require('multer');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, unique + '-' + safe);
  }
});

module.exports = multer({ storage });