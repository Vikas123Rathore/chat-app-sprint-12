const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// store uploads temporarily
const upload = multer({ dest: path.join(__dirname, '..', 'uploads/') });

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

      // If cloudinary not configured, skip upload but keep local path
      if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
        req.fileUrl = '';
        // remove file
        try { fs.unlinkSync(filePath); } catch (e) { }
        return next();
      }

      try {
        const result = await cloudinary.uploader.upload(filePath, { folder: 'chatflow' });
        req.fileUrl = result.secure_url || '';
      } catch (uploadErr) {
        console.error('Cloudinary upload error', uploadErr);
        req.fileUrl = '';
      }

      // remove temp file
      try { fs.unlinkSync(filePath); } catch (e) { }

      next();
    });
  };
};

module.exports = uploadMiddleware;
