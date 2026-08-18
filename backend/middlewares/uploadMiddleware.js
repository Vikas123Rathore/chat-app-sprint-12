
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

const upload = multer({
  dest: uploadDir,

  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }

    cb(null, true);
  },
});

const uploadMiddleware = (fieldName = 'image') => {
  const single = upload.single(fieldName);

  return async (req, res, next) => {
    single(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      // No image
      if (!req.file) {
        req.fileUrl = '';
        return next();
      }

      const filePath = req.file.path;

      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'chatflow',
        });

        // Cloudinary URL
        req.fileUrl = result.secure_url;

        // Delete temporary local file
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.log('Temporary file delete error:', error.message);
        }

        next();
      } catch (error) {
        console.error('Cloudinary upload error:', error);

        // Delete temporary file
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}

        return res.status(500).json({
          message: 'Image upload failed',
        });
      }
    });
  };
};

module.exports = uploadMiddleware;
