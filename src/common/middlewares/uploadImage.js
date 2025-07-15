import { uploadSingle, uploadMultiple, uploadThumbnail } from '../configs/cloudinary.js';
import handleAsync from '../utils/handleAsync.js';
import createError  from '../utils/error.js';

// Middleware upload ảnh đơn
export const uploadSingleImage = handleAsync(async (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return next(createError(400, `Lỗi upload ảnh: ${err.message}`));
    }
    
    if (req.file) {
      // Thêm thông tin ảnh vào req để sử dụng trong controller
      req.uploadedImage = {
        secure_url: req.file.path,
        public_id: req.file.filename,
        original_filename: req.file.originalname,
        format: req.file.mimetype.split('/')[1],
        width: req.file.width || null,
        height: req.file.height || null,
        bytes: req.file.size || null
      };
    }
    
    next();
  });
});

// Middleware upload nhiều ảnh
export const uploadMultipleImages = handleAsync(async (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return next(createError(400, `Lỗi upload ảnh: ${err.message}`));
    }
    
    if (req.files && req.files.length > 0) {
      // Thêm thông tin ảnh vào req để sử dụng trong controller
      req.uploadedImages = req.files.map(file => ({
        secure_url: file.path,
        public_id: file.filename,
        original_filename: file.originalname,
        format: file.mimetype.split('/')[1],
        width: file.width || null,
        height: file.height || null,
        bytes: file.size || null
      }));
    }
    
    next();
  });
});

// Middleware upload thumbnail
export const uploadThumbnailImage = handleAsync(async (req, res, next) => {
  uploadThumbnail(req, res, (err) => {
    if (err) {
      return next(createError(400, `Lỗi upload thumbnail: ${err.message}`));
    }
    
    if (req.file) {
      // Thêm thông tin thumbnail vào req để sử dụng trong controller
      req.uploadedThumbnail = {
        secure_url: req.file.path,
        public_id: req.file.filename,
        original_filename: req.file.originalname,
        format: req.file.mimetype.split('/')[1],
        width: req.file.width || null,
        height: req.file.height || null,
        bytes: req.file.size || null
      };
    }
    
    next();
  });
});

// Middleware validate file type
export const validateImageType = (req, res, next) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (req.file && !allowedTypes.includes(req.file.mimetype)) {
    return next(createError(400, 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'));
  }
  
  if (req.files) {
    for (const file of req.files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return next(createError(400, 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)'));
      }
    }
  }
  
  next();
};
