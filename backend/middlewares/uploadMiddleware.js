const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads/');

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (!file || !file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const uploadMiddleware = (fieldName = 'image') => {
  const single = upload.single(fieldName);

  return async (req, res, next) => {
    single(req, res, async (err) => {
      if (err) return next(err);

      if (!req.file) {
        req.fileUrl = '';
        return next();
      }

      const filePath = req.file.path;
      const localFileUrl = `/uploads/${req.file.filename}`;

      if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
        req.fileUrl = localFileUrl;
        return next();
      }

      try {
        const result = await cloudinary.uploader.upload(filePath, { folder: 'chatflow' });
        req.fileUrl = result?.secure_url || localFileUrl;
      } catch (uploadErr) {
        console.error('Cloudinary upload error', uploadErr);
        req.fileUrl = localFileUrl;
      }

      try { fs.unlinkSync(filePath); } catch (e) { }

      next();
    });
  };
};

module.exports = uploadMiddleware;
